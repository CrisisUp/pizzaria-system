import { StatusPedido, TipoPedido } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface SaborItemInput {
  saborTamanhoId: number;
  fracao: number;
}

export interface ItemPedidoInput {
  tamanhoId?: number;
  bordaTamanhoId?: number;
  quantidade: number;
  observacoes?: string;
  sabores: SaborItemInput[];
}

export interface CriarPedidoInput {
  clienteNome: string;
  clienteTelefone?: string;
  enderecoEntrega?: string;
  tipoPedido: TipoPedido;
  itens: ItemPedidoInput[];
}

export class PedidoService {
  async criar(data: CriarPedidoInput) {
    if (!data.itens || data.itens.length === 0) {
      throw new Error('O pedido deve conter pelo menos um item.');
    }

    return await prisma.$transaction(async (tx) => {
      let valorTotalPedido = 0;
      const itensParaCriar: Array<{
        tamanhoId?: number | null;
        bordaTamanhoId?: number | null;
        quantidade: number;
        precoBordaAplicado: number;
        precoUnitarioFinal: number;
        subtotal: number;
        observacoes?: string | null;
        sabores: Array<{
          saborTamanhoId: number;
          fracao: number;
          precoSaborAplicado: number;
        }>;
      }> = [];

      for (const item of data.itens) {
        if (!item.sabores || item.sabores.length === 0) {
          throw new Error('Cada item de pizza precisa ter pelo menos um sabor.');
        }

        const saborTamanhoIds = item.sabores.map((s) => s.saborTamanhoId);

        const saboresEncontrados = await tx.saborTamanhoPreco.findMany({
          where: { id: { in: saborTamanhoIds } },
        });

        if (saboresEncontrados.length !== saborTamanhoIds.length) {
          throw new Error('Um ou mais sabores informados não foram encontrados.');
        }

        let precoSaborMaisCaro = 0;
        const saboresFormatados = item.sabores.map((saborInput) => {
          const saborBanco = saboresEncontrados.find((s) => s.id === saborInput.saborTamanhoId);
          const precoSabor = Number(saborBanco?.precoVenda || 0);

          if (precoSabor > precoSaborMaisCaro) {
            precoSaborMaisCaro = precoSabor;
          }

          return {
            saborTamanhoId: saborInput.saborTamanhoId,
            fracao: saborInput.fracao,
            precoSaborAplicado: precoSabor,
          };
        });

        let precoBorda = 0;
        if (item.bordaTamanhoId) {
          const bordaTamanho = await tx.bordaTamanhoPreco.findUnique({
            where: { id: item.bordaTamanhoId },
          });

          if (!bordaTamanho) {
            throw new Error(`Borda ID ${item.bordaTamanhoId} não encontrada.`);
          }

          precoBorda = Number(bordaTamanho.precoVenda);
        }

        const precoUnitarioFinal = precoSaborMaisCaro + precoBorda;
        const subtotal = precoUnitarioFinal * item.quantidade;

        valorTotalPedido += subtotal;

        itensParaCriar.push({
          tamanhoId: item.tamanhoId,
          bordaTamanhoId: item.bordaTamanhoId,
          quantidade: item.quantidade,
          precoBordaAplicado: precoBorda,
          precoUnitarioFinal,
          subtotal,
          observacoes: item.observacoes,
          sabores: {
            create: saboresFormatados,
          } as any,
        });
      }

      return await tx.pedido.create({
        data: {
          clienteNome: data.clienteNome,
          clienteTelefone: data.clienteTelefone,
          enderecoEntrega: data.enderecoEntrega,
          tipoPedido: data.tipoPedido,
          valorTotal: valorTotalPedido,
          status: StatusPedido.RECEBIDO,
          itens: {
            create: itensParaCriar.map((item) => ({
              tamanhoId: item.tamanhoId,
              bordaTamanhoId: item.bordaTamanhoId,
              quantidade: item.quantidade,
              precoBordaAplicado: item.precoBordaAplicado,
              precoUnitarioFinal: item.precoUnitarioFinal,
              subtotal: item.subtotal,
              observacoes: item.observacoes,
              sabores: item.sabores as any,
            })),
          },
        },
        include: {
          itens: {
            include: {
              tamanho: true,
              bordaTamanho: { include: { borda: true } },
              sabores: {
                include: {
                  saborTamanho: { include: { sabor: true } },
                },
              },
            },
          },
        },
      });
    });
  }

  async listar() {
    return prisma.pedido.findMany({
      include: {
        itens: {
          include: {
            tamanho: true,
            bordaTamanho: { include: { borda: true } },
            sabores: {
              include: {
                saborTamanho: { include: { sabor: true } },
              },
            },
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async atualizarStatus(id: number, novoStatus: StatusPedido) {
    return await prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({
        where: { id },
        include: {
          itens: {
            include: {
              sabores: {
                include: {
                  saborTamanho: {
                    include: { fichaTecnica: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!pedido) {
        throw new Error(`Pedido ID ${id} não encontrado.`);
      }

      if (novoStatus === StatusPedido.EM_PREPARO && pedido.status !== StatusPedido.EM_PREPARO) {
        for (const item of pedido.itens) {
          for (const saborItem of item.sabores) {
            const fichaTecnica = saborItem.saborTamanho.fichaTecnica || [];
            const fracaoSabor = Number(saborItem.fracao) || 1;
            const quantidadePizza = item.quantidade;

            for (const ingredienteFicha of fichaTecnica) {
              const quantidadeDeducao =
                Number(ingredienteFicha.quantidadeUsada) * fracaoSabor * quantidadePizza;

              const ingredienteAtual = await tx.ingrediente.findUnique({
                where: { id: ingredienteFicha.ingredienteId },
                select: { estoqueAtual: true },
              });

              if (ingredienteAtual) {
                const saldoAtual = Number(ingredienteAtual.estoqueAtual);

                if (saldoAtual < quantidadeDeducao) {
                  throw new Error(
                    `Estoque insuficiente de "${ingredienteFicha.ingredienteId}". ` +
                    `Disponível: ${saldoAtual.toFixed(3)}, necessário: ${quantidadeDeducao.toFixed(3)}`,
                  );
                }
              }

              await tx.ingrediente.update({
                where: { id: ingredienteFicha.ingredienteId },
                data: { estoqueAtual: { decrement: quantidadeDeducao } },
              });
            }
          }
        }
      }

      return await tx.pedido.update({
        where: { id },
        data: { status: novoStatus },
        include: {
          itens: {
            include: {
              tamanho: true,
              bordaTamanho: { include: { borda: true } },
              sabores: { include: { saborTamanho: { include: { sabor: true } } } },
            },
          },
        },
      });
    });
  }
}