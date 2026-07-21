import { prisma } from '../lib/prisma';

export interface PrecoPorTamanhoInput {
  tamanhoId: number;
  precoVenda: number;
}

export interface FichaTecnicaInput {
  tamanhoId: number;
  ingredienteId: string;
  quantidadeUsada: number;
  unidadeMedida?: string;
}

export interface CriarSaborInput {
  nome: string;
  descricao?: string;
  precos: PrecoPorTamanhoInput[];
  fichaTecnica: FichaTecnicaInput[];
}

export interface AtualizarSaborInput {
  nome?: string;
  descricao?: string;
  precos?: PrecoPorTamanhoInput[];
}

export class SaborService {
  /**
   * Lista todos os sabores trazendo seus preços por tamanho 
   * e a ficha técnica correspondente a cada variação de tamanho.
   */
  async listar() {
    const sabores = await prisma.sabor.findMany({
      include: {
        saborPrecos: { // 👈 Nome exato do relacionamento no model Sabor
          include: {
            tamanho: true,
            fichaTecnica: { // 👈 A FichaTecnica se liga ao SaborTamanhoPreco no seu Schema
              include: {
                ingrediente: true,
              },
            },
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return sabores.map((sabor) => {
      const precosComCusto = (sabor.saborPrecos || []).map((sp) => {
        // Calcula o custo de produção para este tamanho específico
        const custoProducao = sp.fichaTecnica.reduce((acc, ft) => {
          const precoCompra = Number(ft.ingrediente.precoUltimaCompra) || 0;
          const qtdEmbalagem = Number(ft.ingrediente.quantidadeEmbalagem) || 1;
          const custoUnitario = precoCompra / qtdEmbalagem;
          const qtdUsada = Number(ft.quantidadeUsada) || 0;

          return acc + custoUnitario * qtdUsada;
        }, 0);

        return {
          saborTamanhoId: sp.id,
          tamanhoId: sp.tamanhoId,
          tamanhoNome: sp.tamanho.nome,
          precoVenda: Number(sp.precoVenda),
          custoProducao: Number(custoProducao.toFixed(2)),
          margemLucroBruta: Number((Number(sp.precoVenda) - custoProducao).toFixed(2)),
          fichaTecnica: sp.fichaTecnica.map((ft) => ({
            ingredienteId: ft.ingredienteId,
            ingrediente: ft.ingrediente.nome,
            quantidadeUsada: Number(ft.quantidadeUsada),
            unidadeMedida: ft.unidadeMedida,
          })),
        };
      });

      return {
        id: sabor.id,
        nome: sabor.nome,
        descricao: sabor.descricao,
        precosETamanhos: precosComCusto,
      };
    });
  }

  /**
   * Cadastra um novo sabor com seus preços e ficha técnica inicial
   */
  async criar(data: CriarSaborInput) {
    return await prisma.$transaction(async (tx) => {
      // 1. Criar o Sabor
      const novoSabor = await tx.sabor.create({
        data: {
          nome: data.nome,
          descricao: data.descricao,
        },
      });

      // 2. Criar os Preços e Fichas Técnicas para cada Tamanho
      if (data.precos && data.precos.length > 0) {
        for (const p of data.precos) {
          // Cria o preço do sabor para este tamanho
          const saborTamanho = await tx.saborTamanhoPreco.create({
            data: {
              saborId: novoSabor.id,
              tamanhoId: p.tamanhoId,
              precoVenda: p.precoVenda,
            },
          });

          // Filtra e cria os ingredientes da ficha técnica correspondentes a este tamanho
          const itensFicha = data.fichaTecnica?.filter((ft) => ft.tamanhoId === p.tamanhoId) || [];

          if (itensFicha.length > 0) {
            await tx.fichaTecnica.createMany({
              data: itensFicha.map((ft) => ({
                saborTamanhoId: saborTamanho.id, // Vincula ao SaborTamanhoPreco
                ingredienteId: ft.ingredienteId,
                quantidadeUsada: ft.quantidadeUsada,
                unidadeMedida: ft.unidadeMedida || 'g',
              })),
            });
          }
        }
      }

      return novoSabor;
    });
  }

  /**
   * Atualiza nome, descrição e/ou preços de venda de um sabor
   */
  async atualizar(id: number, data: AtualizarSaborInput) {
    return await prisma.$transaction(async (tx) => {
      const saborAtualizado = await tx.sabor.update({
        where: { id },
        data: {
          nome: data.nome,
          descricao: data.descricao,
        },
      });

      if (data.precos && data.precos.length > 0) {
        for (const p of data.precos) {
          await tx.saborTamanhoPreco.upsert({
            where: {
              saborId_tamanhoId: {
                saborId: id,
                tamanhoId: p.tamanhoId,
              },
            },
            update: { precoVenda: p.precoVenda },
            create: {
              saborId: id,
              tamanhoId: p.tamanhoId,
              precoVenda: p.precoVenda,
            },
          });
        }
      }

      return saborAtualizado;
    });
  }

  /**
   * Atualiza a Ficha Técnica completa do sabor para os tamanhos especificados
   */
  async atualizarFichaTecnica(saborId: number, fichaTecnica: FichaTecnicaInput[]) {
    return await prisma.$transaction(async (tx) => {
      // Busca todas as variações de tamanho cadastradas para o sabor
      const variacoesSabor = await tx.saborTamanhoPreco.findMany({
        where: { saborId },
      });

      const idsVariacoes = variacoesSabor.map((v) => v.id);

      // Remove as fichas técnicas antigas dessas variações
      if (idsVariacoes.length > 0) {
        await tx.fichaTecnica.deleteMany({
          where: { saborTamanhoId: { in: idsVariacoes } },
        });
      }

      // Cria as novas fichas vinculadas aos respectivos saborTamanhoId
      for (const item of fichaTecnica) {
        const variacao = variacoesSabor.find((v) => v.tamanhoId === item.tamanhoId);

        if (variacao) {
          await tx.fichaTecnica.create({
            data: {
              saborTamanhoId: variacao.id,
              ingredienteId: item.ingredienteId,
              quantidadeUsada: item.quantidadeUsada,
              unidadeMedida: item.unidadeMedida || 'g',
            },
          });
        }
      }

      return { mensagem: 'Ficha técnica atualizada com sucesso.' };
    });
  }

  /**
   * Deleta um sabor
   */
  async deletar(id: number) {
    return await prisma.sabor.delete({
      where: { id },
    });
  }
}