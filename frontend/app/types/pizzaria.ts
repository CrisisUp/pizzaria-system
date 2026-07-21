export interface PrecoTamanhoItem {
  id?: number;
  saborTamanhoId?: number;
  tamanhoId: number;
  tamanhoNome?: string;
  precoVenda: number | string;
  custoProducao?: number;
  margemLucroBruta?: number;
}

export interface Sabor {
  id: number;
  nome: string;
  descricao: string;
  categoria?: string;
  imagemUrl?: string;
  precosETamanhos?: PrecoTamanhoItem[];
  saborPrecos?: PrecoTamanhoItem[];
}

export interface BordaPrecoItem {
  id?: number;
  bordaId?: number;
  tamanhoId: number;
  precoVenda: number | string;
}

export interface Tamanho {
  id: number;
  nome: string;
  fatias: number;
  maxSabores: number;
  fatorMultiplicador?: number;
  precoBase?: number;
}

export interface Borda {
  id: number;
  nome: string;
  precoAdicional?: number;
  bordaPrecos?: BordaPrecoItem[];
  precosETamanhos?: BordaPrecoItem[];
}

export interface ItemPedido {
  id?: number;
  tamanho: Tamanho;
  borda?: Borda | null;
  sabores: Sabor[];
  observacao?: string;
}

export type StatusPedido = 'RECEBIDO' | 'EM_PREPARO' | 'EM_TRANSPORTE' | 'CONCLUIDO' | 'CANCELADO';

export interface Pedido {
  id: number;
  clienteNome: string;
  status: StatusPedido;
  valorTotal: number;
  criadoEm: string;
  itens: ItemPedido[];
}

export interface ItemPizza {
  tamanho: Tamanho | null;
  borda: Borda | null;
  sabores: Sabor[];
  observacoes: string;
}