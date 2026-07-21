import { prisma } from '../lib/prisma';

export class TamanhoBordaService {
  /**
   * Lista todos os tamanhos cadastrados
   */
  async listarTamanhos() {
    return await prisma.tamanho.findMany({
      orderBy: { id: 'asc' },
    });
  }

  /**
   * Lista todas as bordas com seus preços por tamanho e ficha técnica
   */
  async listarBordas() {
    const bordas = await prisma.borda.findMany({
      include: {
        bordaPrecos: {
          include: {
            tamanho: true,
            fichaTecnica: {
              include: {
                ingrediente: true,
              },
            },
          },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return bordas.map((borda) => {
      const precosETamanhos = borda.bordaPrecos.map((bp) => {
        // Cálculo do custo da borda com base nos ingredientes da ficha técnica
        const custoProducao = bp.fichaTecnica.reduce((acc, ft) => {
          const precoCompra = Number(ft.ingrediente.precoUltimaCompra) || 0;
          const qtdEmbalagem = Number(ft.ingrediente.quantidadeEmbalagem) || 1;
          const custoUnitario = precoCompra / qtdEmbalagem;
          const qtdUsada = Number(ft.quantidadeUsada) || 0;

          return acc + custoUnitario * qtdUsada;
        }, 0);

        return {
          bordaTamanhoId: bp.id,
          tamanhoId: bp.tamanhoId,
          tamanhoNome: bp.tamanho.nome,
          precoVenda: Number(bp.precoVenda),
          custoProducao: Number(custoProducao.toFixed(2)),
          margemLucroBruta: Number((Number(bp.precoVenda) - custoProducao).toFixed(2)),
          fichaTecnica: bp.fichaTecnica.map((ft) => ({
            ingrediente: ft.ingrediente.nome,
            quantidadeUsada: Number(ft.quantidadeUsada),
            unidadeMedida: ft.unidadeMedida,
          })),
        };
      });

      return {
        id: borda.id,
        nome: borda.nome,
        criadoEm: borda.criadoEm,
        precosETamanhos,
      };
    });
  }

  /**
   * Busca uma borda específica por ID
   */
  async buscarBordaPorId(id: number) {
    const borda = await prisma.borda.findUnique({
      where: { id },
      include: {
        bordaPrecos: {
          include: {
            tamanho: true,
            fichaTecnica: {
              include: {
                ingrediente: true,
              },
            },
          },
        },
      },
    });

    if (!borda) return null;

    const precosETamanhos = borda.bordaPrecos.map((bp) => {
      const custoProducao = bp.fichaTecnica.reduce((acc, ft) => {
        const precoCompra = Number(ft.ingrediente.precoUltimaCompra) || 0;
        const qtdEmbalagem = Number(ft.ingrediente.quantidadeEmbalagem) || 1;
        const custoUnitario = precoCompra / qtdEmbalagem;
        const qtdUsada = Number(ft.quantidadeUsada) || 0;

        return acc + custoUnitario * qtdUsada;
      }, 0);

      return {
        bordaTamanhoId: bp.id,
        tamanhoId: bp.tamanhoId,
        tamanhoNome: bp.tamanho.nome,
        precoVenda: Number(bp.precoVenda),
        custoProducao: Number(custoProducao.toFixed(2)),
        margemLucroBruta: Number((Number(bp.precoVenda) - custoProducao).toFixed(2)),
        fichaTecnica: bp.fichaTecnica.map((ft) => ({
          ingrediente: ft.ingrediente.nome,
          quantidadeUsada: Number(ft.quantidadeUsada),
          unidadeMedida: ft.unidadeMedida,
        })),
      };
    });

    return {
      id: borda.id,
      nome: borda.nome,
      criadoEm: borda.criadoEm,
      precosETamanhos,
    };
  }
}