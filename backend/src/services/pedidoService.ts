import { StatusPedido, TipoPedido } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface SaborItemInput {
  saborTamanhoId: number; // ID da tabela SaborTamanhoPreco
  fracao: number;         // Ex: 1.0 (Inteira), 0.5 (Meia), 0.33 (1/3)
}

export interface ItemPedidoInput {
  tamanhoId?: number;
  bordaTamanhoId?: number; // ID da tabela BordaTamanhoPreco (opcional)
  quantidade: number;
  observacoes?: string;
  sabores: SaborItemInput[];
}

export interface CriarPedidoInput {
  clienteNome: string;
  clienteTelefone?: string;
  enderecoEntrega?: string;
  tipoPedido: TipoPedido; // 'BALCAO', 'DELIVERY', 'MESA'
  itens: ItemPedidoInput[];
}

export class PedidoService {
  /**
   * Cria um novo pedido dentro de uma transação, calculando os preços
   * com base na regra do sabor mais caro + borda recheada.
   */
  async criar(data: CriarPedidoInput) {
    if (!data.itens || data.itens.length === 0) {
      throw new Error('O pedido deve conter pelo menos um item.');
    }

    return await prisma.$transaction(async (tx) => {
      let valorTotalPedido = 0;
      const itensParaCriar = [];

      for (const item of data.itens) {
        if (!item.sabores || item.sabores.length === 0) {
          throw new Error('Cada item de pizza precisa ter pelo menos um sabor.');
        }

        const saborTamanhoIds = item.sabores.map((s) => s.saborTamanhoId);

        // Busca todos os sabores do item de uma só vez
        const saboresEncontrados = await tx.saborTamanhoPreco.findMany({
          where: { id: { in: saborTamanhoIds } },
        });

        if (saboresEncontrados.length !== saborTamanhoIds.length) {
          throw new Error('Um ou mais sabores informados não foram encontrados.');
        }

        // 1. Aplica a Regra do Maior Preço entre os sabores do item
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

        // 2. Processar borda (se houver)
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

        // Regra do Maior Preço + Borda
        const precoUnitarioFinal = precoSaborMaisCaro + precoBorda;
        const subtotal = precoUnitarioFinal * item.quantidade;

        valorTotalPedido += subtotal;

        itensParaCriar.push({
          tamanhoId: item.tamanhoId,
          bordaTamanhoId: item.bordaTamanhoId,
          quantidade: item.quantidade,
          precoBordaAplicado: precoBorda,
          precoUnitarioFinal: precoUnitarioFinal,
          subtotal: subtotal,
          observacoes: item.observacoes,
          sabores: {
            create: saboresFormatados,
          },
        });
      }

      // 3. Persistir o Pedido
      return await tx.pedido.create({
        data: {
          clienteNome: data.clienteNome,
          clienteTelefone: data.clienteTelefone,
          enderecoEntrega: data.enderecoEntrega,
          tipoPedido: data.tipoPedido,
          valorTotal: valorTotalPedido,
          status: StatusPedido.RECEBIDO,
          itens: {
            create: itensParaCriar,
          },
        },
        include: {
          itens: {
            include: {
              tamanho: true,
              bordaTamanho: {
                include: {
                  borda: true,
                },
              },
              sabores: {
                include: {
                  saborTamanho: {
                    include: {
                      sabor: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });
  }

  /**
   * Lista todos os pedidos
   */
  async listar() {
    return await prisma.pedido.findMany({
      include: {
        itens: {
          include: {
            tamanho: true,
            bordaTamanho: {
              include: {
                borda: true,
              },
            },
            sabores: {
              include: {
                saborTamanho: {
                  include: {
                    sabor: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  /**
   * Atualiza o status do pedido e realiza baixa no estoque quando entra EM_PREPARO
   */
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
                    include: {
                      fichaTecnica: true,
                    },
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

      // Se o pedido está mudando para EM_PREPARO (e ainda não estava), abate os ingredientes
      if (novoStatus === StatusPedido.EM_PREPARO && pedido.status !== StatusPedido.EM_PREPARO) {
        for (const item of pedido.itens) {
          for (const saborItem of item.sabores) {
            const fichaTecnica = saborItem.saborTamanho.fichaTecnica || [];
            const fracaoSabor = Number(saborItem.fracao) || 1;
            const quantidadePizza = item.quantidade;

            for (const ingredienteFicha of fichaTecnica) {
              // Quantidade g/ml usada = (Qtd na Ficha Técnica) * (Fração da pizza) * (Qtd de pizzas)
              const quantidadeDeducao =
                Number(ingredienteFicha.quantidadeUsada) * fracaoSabor * quantidadePizza;

              await tx.ingrediente.update({
                where: { id: ingredienteFicha.ingredienteId },
                data: {
                  quantidadeEmbalagem: {
                    decrement: quantidadeDeducao,
                  },
                },
              });
            }
          }
        }
      }

      // Atualiza o status do pedido
      return await tx.pedido.update({
        where: { id },
        data: { status: novoStatus },
      });
    });
  }
}