import { prisma } from '../../lib/prisma';
import { AtualizarSaborInput, CriarSaborInput, FichaTecnicaInput } from '../../services/saborService';
import { ISaborRepository, SaborComRelacionamentos } from '../ISaborRepository';

export class PrismaSaborRepository implements ISaborRepository {
  async listarTodos(): Promise<SaborComRelacionamentos[]> {
    return prisma.sabor.findMany({
      include: {
        saborPrecos: {
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
  }

  async buscarPorId(id: number): Promise<SaborComRelacionamentos | null> {
    if (!id || isNaN(id)) return null;
    return prisma.sabor.findUnique({
      where: { id },
      include: {
        saborPrecos: {
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
  }

  async criar(data: CriarSaborInput) {
    return await prisma.$transaction(async (tx) => {
      const novoSabor = await tx.sabor.create({
        data: {
          nome: data.nome,
          descricao: data.descricao,
        },
      });

      if (data.precos && data.precos.length > 0) {
        for (const p of data.precos) {
          const saborTamanho = await tx.saborTamanhoPreco.create({
            data: {
              saborId: novoSabor.id,
              tamanhoId: p.tamanhoId,
              precoVenda: p.precoVenda,
            },
          });

          const itensFicha = data.fichaTecnica?.filter((ft) => ft.tamanhoId === p.tamanhoId) || [];

          if (itensFicha.length > 0) {
            await tx.fichaTecnica.createMany({
              data: itensFicha.map((ft) => ({
                saborTamanhoId: saborTamanho.id,
                ingredienteId: ft.ingredienteId,
                quantidadeUsada: ft.quantidadeUsada,
                unidadeMedida: ft.unidadeMedida || 'g',
              })),
            });
          }
        }
      }

      return novoSabor;
    });
  }

  async atualizar(id: number, data: AtualizarSaborInput) {
    return await prisma.$transaction(async (tx) => {
      const saborAtualizado = await tx.sabor.update({
        where: { id },
        data: {
          nome: data.nome,
          descricao: data.descricao,
        },
      });

      if (data.precos && data.precos.length > 0) {
        for (const p of data.precos) {
          await tx.saborTamanhoPreco.upsert({
            where: {
              saborId_tamanhoId: {
                saborId: id,
                tamanhoId: p.tamanhoId,
              },
            },
            update: { precoVenda: p.precoVenda },
            create: {
              saborId: id,
              tamanhoId: p.tamanhoId,
              precoVenda: p.precoVenda,
            },
          });
        }
      }

      return saborAtualizado;
    });
  }

  async atualizarFichaTecnica(saborId: number, fichaTecnica: FichaTecnicaInput[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const variacoesSabor = await tx.saborTamanhoPreco.findMany({
        where: { saborId },
      });

      const idsVariacoes = variacoesSabor.map((v) => v.id);

      if (idsVariacoes.length > 0) {
        await tx.fichaTecnica.deleteMany({
          where: { saborTamanhoId: { in: idsVariacoes } },
        });
      }

      for (const item of fichaTecnica) {
        const variacao = variacoesSabor.find((v) => v.tamanhoId === item.tamanhoId);

        if (variacao) {
          await tx.fichaTecnica.create({
            data: {
              saborTamanhoId: variacao.id,
              ingredienteId: item.ingredienteId,
              quantidadeUsada: item.quantidadeUsada,
              unidadeMedida: item.unidadeMedida || 'g',
            },
          });
        }
      }
    });
  }

  async deletar(id: number): Promise<void> {
    await prisma.sabor.delete({
      where: { id },
    });
  }
}