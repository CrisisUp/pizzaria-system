import { prisma } from '../../lib/prisma';
import { IBordaRepository, BordaComPrecos } from '../ITamanhoEBordaRepository';

export class PrismaBordaRepository implements IBordaRepository {
  async listarTodas(): Promise<BordaComPrecos[]> {
    return prisma.borda.findMany({
      include: { bordaPrecos: true },
      orderBy: { nome: 'asc' },
    });
  }

  async buscarPorId(id: number) {
    return prisma.borda.findUnique({ where: { id } });
  }

  async criar(data: { nome: string; bordaPrecos?: Array<{ tamanhoId: number; precoVenda: number }> }) {
    const { nome, bordaPrecos } = data;
    return prisma.borda.create({
      data: {
        nome,
        ...(bordaPrecos && bordaPrecos.length > 0
          ? { bordaPrecos: { create: bordaPrecos.map((p) => ({ tamanhoId: p.tamanhoId, precoVenda: p.precoVenda })) } }
          : {}),
      },
      include: { bordaPrecos: true },
    });
  }

  async atualizar(id: number, data: { nome?: string }) {
    return prisma.borda.update({
      where: { id },
      data: { nome: data.nome },
      include: { bordaPrecos: true },
    });
  }

  async deletar(id: number) {
    await prisma.borda.delete({ where: { id } });
  }
}
