import { prisma } from '../../lib/prisma';
import { Prisma } from '@prisma/client';
import { IIngredienteRepository } from '../IIngredienteRepository';

export class PrismaIngredienteRepository implements IIngredienteRepository {
  async listarTodos() {
    return prisma.ingrediente.findMany({ orderBy: { nome: 'asc' } });
  }

  async buscarPorId(id: string) {
    return prisma.ingrediente.findUnique({ where: { id } });
  }

  async criar(data: { nome: string; unidadeCompra: string; precoUltimaCompra: number; quantidadeEmbalagem: number }) {
    const input: Prisma.IngredienteCreateInput = {
      nome: data.nome,
      unidadeCompra: data.unidadeCompra,
      precoUltimaCompra: data.precoUltimaCompra,
      quantidadeEmbalagem: data.quantidadeEmbalagem,
    };
    return prisma.ingrediente.create({ data: input });
  }

  async atualizar(id: string, data: Partial<{ nome: string; unidadeCompra: string; precoUltimaCompra: number; quantidadeEmbalagem: number }>) {
    const input: Prisma.IngredienteUpdateInput = {};
    if (data.nome !== undefined) input.nome = data.nome;
    if (data.unidadeCompra !== undefined) input.unidadeCompra = data.unidadeCompra;
    if (data.precoUltimaCompra !== undefined) input.precoUltimaCompra = data.precoUltimaCompra;
    if (data.quantidadeEmbalagem !== undefined) input.quantidadeEmbalagem = data.quantidadeEmbalagem;

    return prisma.ingrediente.update({ where: { id }, data: input });
  }

  async deletar(id: string) {
    const existe = await prisma.ingrediente.findUnique({
      where: { id },
      include: { fichaTecnica: true },
    });
    if (!existe) throw new Error(`Ingrediente com ID ${id} não encontrado`);
    if (existe.fichaTecnica.length > 0) {
      throw new Error(
        `Ingrediente está sendo usado em ${existe.fichaTecnica.length} ficha(s) técnica(s). Remova as associações antes de deletar.`,
      );
    }
    await prisma.ingrediente.delete({ where: { id } });
  }

  async buscarPorNome(nome: string) {
    return prisma.ingrediente.findMany({
      where: { nome: { contains: nome, mode: 'insensitive' } },
      orderBy: { nome: 'asc' },
    });
  }

  async buscarPorUnidadeCompra(unidade: string) {
    return prisma.ingrediente.findMany({
      where: { unidadeCompra: unidade },
      orderBy: { nome: 'asc' },
    });
  }

  async buscarComFichaTecnica() {
    return prisma.ingrediente.findMany({
      include: {
        fichaTecnica: { include: { saborTamanho: true, bordaTamanho: true } },
      },
      orderBy: { nome: 'asc' },
    });
  }
}
