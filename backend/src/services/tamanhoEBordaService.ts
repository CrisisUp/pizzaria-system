import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CriarTamanhoDTO {
  nome: string;
  maxSabores: number;
  fatias: number;
}

export interface CriarBordaDTO {
  nome: string;
  descricao?: string;
  precoAdicional: number;
}

export class TamanhoEBordaService {
  // ==========================================
  // METODOS DE TAMANHOS
  // ==========================================

  async listarTamanhos() {
    return prisma.tamanho.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async criarTamanho(data: CriarTamanhoDTO) {
    return prisma.tamanho.create({
      data,
    });
  }

  async atualizarTamanho(id: number, data: Partial<CriarTamanhoDTO>) {
    return prisma.tamanho.update({
      where: { id },
      data,
    });
  }

  async deletarTamanho(id: number) {
    return prisma.tamanho.delete({
      where: { id },
    });
  }

  // ==========================================
  // METODOS DE BORDAS
  // ==========================================

  async listarBordas() {
    return prisma.borda.findMany({
      orderBy: { nome: 'asc' },
    });
  }

  async criarBorda(data: CriarBordaDTO) {
    return prisma.borda.create({
      data,
    });
  }

  async atualizarBorda(id: number, data: Partial<CriarBordaDTO>) {
    return prisma.borda.update({
      where: { id },
      data,
    });
  }

  async deletarBorda(id: number) {
    return prisma.borda.delete({
      where: { id },
    });
  }
}