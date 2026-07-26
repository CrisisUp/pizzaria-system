import { prisma } from '../../lib/prisma';
import { StatusPedido } from '@prisma/client';
import { IPedidoRepository } from '../IPedidoRepository';

export class PrismaPedidoRepository implements IPedidoRepository {
  async listar(): Promise<any[]> {
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
    const pedido = await prisma.pedido.findUnique({
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

    if (!pedido) return null;

    return {
      pedido: { id: pedido.id, status: pedido.status as StatusPedido },
      itens: pedido.itens.map((item) => ({
        id: item.id,
        quantidade: item.quantidade,
        sabores: item.sabores.map((saborItem) => ({
          fracao: Number(saborItem.fracao),
          saborTamanho: {
            fichaTecnica: saborItem.saborTamanho.fichaTecnica.map((ft) => ({
              ingredienteId: ft.ingredienteId,
              quantidadeUsada: Number(ft.quantidadeUsada),
            })),
          },
        })),
      })),
    };
  }

  async atualizarStatus(id: number, novoStatus: StatusPedido): Promise<void> {
    await prisma.pedido.update({
      where: { id },
      data: { status: novoStatus },
    });
  }

  async buscarPrecoSabores(ids: number[]): Promise<Array<{ id: number; precoVenda: number }>> {
    const resultados = await prisma.saborTamanhoPreco.findMany({
      where: { id: { in: ids } },
      select: { id: true, precoVenda: true },
    });
    return resultados.map((r) => ({ id: r.id, precoVenda: Number(r.precoVenda) }));
  }

  async buscarPrecoBorda(id: number): Promise<{ precoVenda: number } | null> {
    const borda = await prisma.bordaTamanhoPreco.findUnique({
      where: { id },
      select: { precoVenda: true },
    });
    if (!borda) return null;
    return { precoVenda: Number(borda.precoVenda) };
  }

  async abaterEstoque(ingredienteId: string, quantidade: number): Promise<void> {
    await prisma.ingrediente.update({
      where: { id: ingredienteId },
      data: { quantidadeEmbalagem: { decrement: quantidade } },
    });
  }

  async verificarEstoque(ingredienteId: string): Promise<number | null> {
    const ingrediente = await prisma.ingrediente.findUnique({
      where: { id: ingredienteId },
      select: { quantidadeEmbalagem: true },
    });
    if (!ingrediente) return null;
    return Number(ingrediente.quantidadeEmbalagem);
  }
}
