import { Tamanho, Borda, BordaTamanhoPreco } from '@prisma/client';

export type BordaComPrecos = Borda & {
  bordaPrecos: BordaTamanhoPreco[];
};

export interface ITamanhoRepository {
  listarTodos(): Promise<Tamanho[]>;
  buscarPorId(id: number): Promise<Tamanho | null>;
  criar(data: { nome: string; maxSabores: number; fatias: number }): Promise<Tamanho>;
  atualizar(id: number, data: Partial<{ nome: string; maxSabores: number; fatias: number }>): Promise<Tamanho>;
  deletar(id: number): Promise<void>;
}

export interface IBordaRepository {
  listarTodas(): Promise<BordaComPrecos[]>;
  buscarPorId(id: number): Promise<Borda | null>;
  criar(data: { nome: string; bordaPrecos?: Array<{ tamanhoId: number; precoVenda: number }> }): Promise<BordaComPrecos>;
  atualizar(id: number, data: { nome?: string }): Promise<BordaComPrecos>;
  deletar(id: number): Promise<void>;
}
