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
export interface BordaPreco {
  id?: number;
  bordaTamanhoId?: number;
  tamanhoId: number;
  precoVenda?: number | string;
  precoAdicional?: number | string;
}

export interface BordaTamanho {
  id: number;
  bordaId: number;
  tamanhoId: number;
  precoVenda: number | string;
  borda?: {
    id: number;
    nome: string;
  };
}

export interface ItemPedidoSabor {
  id: number;
  pedidoItemId: number;
  saborTamanhoId: number;
  fracao: string | number;
  sabor?: {
    id: number;
    nome: string;
  };
  // Caso a API retorne diretamente o nome no objeto principal:
  nome?: string; 
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
  precoAdicional?: number | string;
  bordaPrecos?: BordaPreco[];
  precosETamanhos?: BordaPreco[];
}
export interface ItemPedido {
  id: number;
  quantidade: number;
  observacoes?: string | null;
  tamanhoId: number;
  tamanho?: Tamanho;
  
  // 🎯 Atualize estes dois campos:
  bordaTamanhoId?: number | null;
  bordaTamanho?: BordaTamanho | null;
  
  sabores?: ItemPedidoSabor[];
  subtotal?: number | string;
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