import { prisma } from '../../lib/prisma';

// Repository mantido para compatibilidade, mas PedidoService usa prisma diretamente
// para operações transacionais complexas (criar, atualizarStatus)
export class PrismaPedidoRepository {
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

  async buscarPorId(id: number) {
    return prisma.pedido.findUnique({
      where: { id },
      include: {
        itens: {
          include: {
            tamanho: true,
            bordaTamanho: { include: { borda: true } },
            sabores: {
              include: {
                saborTamanho: {
                  include: { sabor: true, fichaTecnica: true },
                },
              },
            },
          },
        },
      },
    });
  }
}
