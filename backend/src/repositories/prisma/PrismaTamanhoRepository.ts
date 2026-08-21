import { prisma } from '../../lib/prisma';
import { ITamanhoRepository } from '../ITamanhoEBordaRepository';

export class PrismaTamanhoRepository implements ITamanhoRepository {
  async listarTodos() {
    return prisma.tamanho.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async criar(data: { nome: string; fatias: number; maxSabores: number; fatorMultiplicador: number }) {
    return prisma.tamanho.create({ data });
  }

  async atualizar(id: number, data: Partial<{ nome: string; fatias: number; maxSabores: number; fatorMultiplicador: number }>) {
    return prisma.tamanho.update({ where: { id }, data });
  }

  async deletar(id: number) {
    await prisma.tamanho.delete({ where: { id } });
  }
}
