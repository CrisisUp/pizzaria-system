import { Ingrediente } from '@prisma/client';

export interface IIngredienteRepository {
  listarTodos(): Promise<Ingrediente[]>;
  buscarPorId(id: string): Promise<Ingrediente | null>;
  criar(data: { nome: string; unidadeCompra: string; precoUltimaCompra: number; quantidadeEmbalagem: number }): Promise<Ingrediente>;
  atualizar(id: string, data: Partial<{ nome: string; unidadeCompra: string; precoUltimaCompra: number; quantidadeEmbalagem: number }>): Promise<Ingrediente>;
  deletar(id: string): Promise<void>;
  buscarPorNome(nome: string): Promise<Ingrediente[]>;
  buscarPorUnidadeCompra(unidade: string): Promise<Ingrediente[]>;
  buscarComFichaTecnica(): Promise<Ingrediente[]>;
}
