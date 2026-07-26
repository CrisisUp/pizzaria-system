import { prisma } from '../../lib/prisma';
import { ITamanhoRepository } from '../ITamanhoEBordaRepository';

export class PrismaTamanhoRepository implements ITamanhoRepository {
  async listarTodos() {
    return prisma.tamanho.findMany({ orderBy: { nome: 'asc' } });
  }

  async buscarPorId(id: number) {
    return prisma.tamanho.findUnique({ where: { id } });
  }

  async criar(data: { nome: string; maxSabores: number; fatias: number }) {
    return prisma.tamanho.create({ data });
  }

  async atualizar(id: number, data: Partial<{ nome: string; maxSabores: number; fatias: number }>) {
    return prisma.tamanho.update({ where: { id }, data });
  }

  async deletar(id: number) {
    await prisma.tamanho.delete({ where: { id } });
  }
}
