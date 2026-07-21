import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CriarTamanhoDTO {
  nome: string;
  maxSabores: number;
  fatias: number;
}

export interface CriarBordaDTO {
  nome: string;
  bordaPrecos?: Array<{
    tamanhoId: number;
    precoVenda: number;
  }>;
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
      include: {
        bordaPrecos: true, // 👈 Inclui a relação de preços por tamanho
      },
      orderBy: { nome: 'asc' },
    });
  }

  async criarBorda(data: CriarBordaDTO) {
    const { nome, bordaPrecos } = data;

    return prisma.borda.create({
      data: {
        nome,
        ...(bordaPrecos && bordaPrecos.length > 0
          ? {
              bordaPrecos: {
                create: bordaPrecos.map((p) => ({
                  tamanhoId: p.tamanhoId,
                  precoVenda: p.precoVenda,
                })),
              },
            }
          : {}),
      },
      include: {
        bordaPrecos: true,
      },
    });
  }

  async atualizarBorda(id: number, data: Partial<CriarBordaDTO>) {
    return prisma.borda.update({
      where: { id },
      data: {
        nome: data.nome,
      },
      include: {
        bordaPrecos: true,
      },
    });
  }

  async deletarBorda(id: number) {
    return prisma.borda.delete({
      where: { id },
    });
  }
}