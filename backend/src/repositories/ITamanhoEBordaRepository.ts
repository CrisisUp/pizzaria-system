import { Borda, BordaTamanhoPreco, Tamanho } from '@prisma/client';

export type BordaComPrecos = Borda & {
  bordaPrecos: BordaTamanhoPreco[];
};

export interface ITamanhoRepository {
  listarTodos(): Promise<Tamanho[]>;
  criar(data: { nome: string; fatias: number; maxSabores: number; fatorMultiplicador: number }): Promise<Tamanho>;
  atualizar(id: number, data: Partial<{ nome: string; fatias: number; maxSabores: number; fatorMultiplicador: number }>): Promise<Tamanho>;
  deletar(id: number): Promise<void>;
}

export interface IBordaRepository {
  listarTodas(): Promise<BordaComPrecos[]>;
  criar(data: { nome: string; bordaPrecos?: Array<{ tamanhoId: number; precoVenda: number }> }): Promise<BordaComPrecos>;
  atualizar(id: number, data: { nome?: string }): Promise<BordaComPrecos>;
  deletar(id: number): Promise<void>;
}
