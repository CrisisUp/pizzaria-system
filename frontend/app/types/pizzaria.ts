export interface Sabor {
  id: number;
  nome: string;
  descricao: string;
  categoria?: string;
  imagemUrl?: string;
}

export interface Tamanho {
  id: number;
  nome: string;
  fatias: number;
  maxSabores: number;
  precoBase: number;
}

export interface Borda {
  id: number;
  nome: string;
  precoAdicional: number;
}

export interface ItemPedido {
  id: number;
  tamanho: Tamanho;
  borda?: Borda | null;
  sabores: Sabor[];
  observacao?: string;
}

export type StatusPedido = 'PENDENTE' | 'EM_PREPARO' | 'NO_FORNO' | 'PRONTO' | 'ENTREGUE';

export interface Pedido {
  id: number;
  clienteNome: string;
  status: StatusPedido;
  total: number | string;
  createdAt: string;
  itens: ItemPedido[];
}

export interface ItemPizza {
  tamanho: Tamanho | null;
  borda: Borda | null;
  sabores: Sabor[];
  observacoes: string;
}