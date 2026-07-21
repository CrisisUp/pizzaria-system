import { prisma } from '../lib/prisma';

export interface CreateIngredienteInput {
  nome: string;
  unidadeMedida: string;
  precoUnitario: number;
  estoqueMinimo?: number;
}

export class IngredienteService {
  async listarTodos() {
    // 🚨 Se no schema.prisma for 'model Ingrediente', usa-se prisma.ingrediente
    // 🚨 Se for 'model Insumo', troque para prisma.insumo
    return await (prisma as any).ingrediente
      ? await (prisma as any).ingrediente.findMany({ orderBy: { nome: 'asc' } })
      : await (prisma as any).insumo.findMany({ orderBy: { nome: 'asc' } });
  }

  async buscarPorId(id: string) {
    const model = (prisma as any).ingrediente || (prisma as any).insumo;
    return await model.findUnique({ where: { id } });
  }

  async criar(dados: CreateIngredienteInput) {
    const model = (prisma as any).ingrediente || (prisma as any).insumo;
    return await model.create({ data: dados });
  }

  async atualizar(id: string, dados: Partial<CreateIngredienteInput>) {
    const model = (prisma as any).ingrediente || (prisma as any).insumo;
    return await model.update({ where: { id }, data: dados });
  }

  async deletar(id: string) {
    const model = (prisma as any).ingrediente || (prisma as any).insumo;
    return await model.delete({ where: { id } });
  }
}