import { FichaTecnica, Ingrediente, Sabor, SaborTamanhoPreco, Tamanho } from '@prisma/client';
import { AtualizarSaborInput, CriarSaborInput, FichaTecnicaInput } from '../services/saborService';

// Tipo com os relacionamentos do Prisma necessários para os cálculos de custo
export type SaborComRelacionamentos = Sabor & {
  saborPrecos: (SaborTamanhoPreco & {
    tamanho: Tamanho;
    fichaTecnica: (FichaTecnica & {
      ingrediente: Ingrediente;
    })[];
  })[];
};

export interface ISaborRepository {
  listarTodos(): Promise<SaborComRelacionamentos[]>;
  buscarPorId(id: number): Promise<SaborComRelacionamentos | null>;
  criar(data: CriarSaborInput): Promise<Sabor>;
  atualizar(id: number, data: AtualizarSaborInput): Promise<Sabor>;
  atualizarFichaTecnica(saborId: number, fichaTecnica: FichaTecnicaInput[]): Promise<void>;
  deletar(id: number): Promise<void>;
}