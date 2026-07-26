import { Prisma } from '@prisma/client';
import { IIngredienteRepository } from '../repositories/IIngredienteRepository';
import { PrismaIngredienteRepository } from '../repositories/prisma/PrismaIngredienteRepository';

export interface CreateIngredienteInput {
  nome: string;
  unidadeCompra: string;
  precoUltimaCompra: number | Prisma.Decimal;
  quantidadeEmbalagem: number | Prisma.Decimal;
}

export interface UpdateIngredienteInput extends Partial<CreateIngredienteInput> {}

export class IngredienteService {
  constructor(private readonly ingredienteRepository: IIngredienteRepository = new PrismaIngredienteRepository()) {}

  async listarTodos() {
    return this.ingredienteRepository.listarTodos();
  }

  async buscarPorId(id: string) {
    const ingrediente = await this.ingredienteRepository.buscarPorId(id);
    if (!ingrediente) {
      throw new Error(`Ingrediente com ID ${id} não encontrado`);
    }
    return ingrediente;
  }

  async criar(dados: CreateIngredienteInput) {
    const precoUltimaCompra = typeof dados.precoUltimaCompra === 'number'
      ? dados.precoUltimaCompra
      : Number(dados.precoUltimaCompra);
    const quantidadeEmbalagem = typeof dados.quantidadeEmbalagem === 'number'
      ? dados.quantidadeEmbalagem
      : Number(dados.quantidadeEmbalagem);

    return this.ingredienteRepository.criar({
      nome: dados.nome,
      unidadeCompra: dados.unidadeCompra,
      precoUltimaCompra,
      quantidadeEmbalagem,
    });
  }

  async atualizar(id: string, dados: UpdateIngredienteInput) {
    const updateData: Partial<{ nome: string; unidadeCompra: string; precoUltimaCompra: number; quantidadeEmbalagem: number }> = {};
    if (dados.nome !== undefined) updateData.nome = dados.nome;
    if (dados.unidadeCompra !== undefined) updateData.unidadeCompra = dados.unidadeCompra;
    if (dados.precoUltimaCompra !== undefined) {
      updateData.precoUltimaCompra = typeof dados.precoUltimaCompra === 'number'
        ? dados.precoUltimaCompra
        : Number(dados.precoUltimaCompra);
    }
    if (dados.quantidadeEmbalagem !== undefined) {
      updateData.quantidadeEmbalagem = typeof dados.quantidadeEmbalagem === 'number'
        ? dados.quantidadeEmbalagem
        : Number(dados.quantidadeEmbalagem);
    }

    return this.ingredienteRepository.atualizar(id, updateData);
  }

  async deletar(id: string) {
    return this.ingredienteRepository.deletar(id);
  }

  async buscarPorNome(nome: string) {
    return this.ingredienteRepository.buscarPorNome(nome);
  }

  async buscarPorUnidadeCompra(unidade: string) {
    return this.ingredienteRepository.buscarPorUnidadeCompra(unidade);
  }

  async buscarComFichaTecnica() {
    return this.ingredienteRepository.buscarComFichaTecnica();
  }
}