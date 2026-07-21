import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

// Interface atualizada para corresponder ao schema.prisma
export interface CreateIngredienteInput {
  nome: string;
  unidadeCompra: string;  // 'KG', 'L', 'UN' - conforme schema
  precoUltimaCompra: number | Prisma.Decimal;
  quantidadeEmbalagem: number | Prisma.Decimal;
}

export interface UpdateIngredienteInput extends Partial<CreateIngredienteInput> {}

export class IngredienteService {
  
  async listarTodos() {
    try {
      return await prisma.ingrediente.findMany({
        orderBy: { nome: 'asc' }
      });
    } catch (error) {
      console.error('Erro ao listar ingredientes:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao listar ingredientes: ${mensagem}`);
    }
  }

  async buscarPorId(id: string) {
    try {
      const ingrediente = await prisma.ingrediente.findUnique({
        where: { id }
      });
      
      if (!ingrediente) {
        throw new Error(`Ingrediente com ID ${id} não encontrado`);
      }
      
      return ingrediente;
    } catch (error) {
      console.error('Erro ao buscar ingrediente:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao buscar ingrediente: ${mensagem}`);
    }
  }

  async criar(dados: CreateIngredienteInput) {
    try {
      // Preparar dados convertendo números para Decimal se necessário
      const data: Prisma.IngredienteCreateInput = {
        nome: dados.nome,
        unidadeCompra: dados.unidadeCompra,
        precoUltimaCompra: typeof dados.precoUltimaCompra === 'number' 
          ? new Prisma.Decimal(dados.precoUltimaCompra) 
          : dados.precoUltimaCompra,
        quantidadeEmbalagem: typeof dados.quantidadeEmbalagem === 'number'
          ? new Prisma.Decimal(dados.quantidadeEmbalagem)
          : dados.quantidadeEmbalagem
      };

      return await prisma.ingrediente.create({
        data
      });
    } catch (error) {
      console.error('Erro ao criar ingrediente:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao criar ingrediente: ${mensagem}`);
    }
  }

  async atualizar(id: string, dados: UpdateIngredienteInput) {
    try {
      // Verificar se o ingrediente existe
      const existe = await prisma.ingrediente.findUnique({
        where: { id }
      });

      if (!existe) {
        throw new Error(`Ingrediente com ID ${id} não encontrado`);
      }

      // Preparar dados para atualização
      const data: Prisma.IngredienteUpdateInput = {};

      if (dados.nome !== undefined) data.nome = dados.nome;
      if (dados.unidadeCompra !== undefined) data.unidadeCompra = dados.unidadeCompra;
      
      if (dados.precoUltimaCompra !== undefined) {
        data.precoUltimaCompra = typeof dados.precoUltimaCompra === 'number'
          ? new Prisma.Decimal(dados.precoUltimaCompra)
          : dados.precoUltimaCompra;
      }

      if (dados.quantidadeEmbalagem !== undefined) {
        data.quantidadeEmbalagem = typeof dados.quantidadeEmbalagem === 'number'
          ? new Prisma.Decimal(dados.quantidadeEmbalagem)
          : dados.quantidadeEmbalagem;
      }

      return await prisma.ingrediente.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error('Erro ao atualizar ingrediente:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao atualizar ingrediente: ${mensagem}`);
    }
  }

  async deletar(id: string) {
    try {
      // Verificar se o ingrediente existe e se está sendo usado
      const existe = await prisma.ingrediente.findUnique({
        where: { id },
        include: {
          fichaTecnica: true
        }
      });

      if (!existe) {
        throw new Error(`Ingrediente com ID ${id} não encontrado`);
      }

      // Verificar se está sendo usado em alguma ficha técnica
      if (existe.fichaTecnica.length > 0) {
        throw new Error(
          `Ingrediente está sendo usado em ${existe.fichaTecnica.length} ficha(s) técnica(s). ` +
          `Remova as associações antes de deletar.`
        );
      }

      return await prisma.ingrediente.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Erro ao deletar ingrediente:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao deletar ingrediente: ${mensagem}`);
    }
  }

  // Métodos adicionais úteis

  async buscarPorNome(nome: string) {
    try {
      return await prisma.ingrediente.findMany({
        where: {
          nome: {
            contains: nome,
            mode: 'insensitive' // Busca case insensitive
          }
        },
        orderBy: { nome: 'asc' }
      });
    } catch (error) {
      console.error('Erro ao buscar ingrediente por nome:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao buscar ingrediente por nome: ${mensagem}`);
    }
  }

  async buscarPorUnidadeCompra(unidade: string) {
    try {
      return await prisma.ingrediente.findMany({
        where: {
          unidadeCompra: unidade
        },
        orderBy: { nome: 'asc' }
      });
    } catch (error) {
      console.error('Erro ao buscar ingredientes por unidade:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao buscar ingredientes por unidade: ${mensagem}`);
    }
  }

  async buscarComFichaTecnica() {
    try {
      return await prisma.ingrediente.findMany({
        include: {
          fichaTecnica: {
            include: {
              saborTamanho: true,
              bordaTamanho: true
            }
          }
        },
        orderBy: { nome: 'asc' }
      });
    } catch (error) {
      console.error('Erro ao buscar ingredientes com ficha técnica:', error);
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(`Erro ao buscar ingredientes com ficha técnica: ${mensagem}`);
    }
  }
}