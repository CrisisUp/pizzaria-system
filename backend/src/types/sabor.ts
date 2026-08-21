export interface PrecoPorTamanhoInput {
  tamanhoId: number;
  precoVenda: number;
}

export interface FichaTecnicaInput {
  tamanhoId: number;
  ingredienteId: string;
  quantidadeUsada: number;
  unidadeMedida?: string;
}

export interface CriarSaborInput {
  nome: string;
  descricao?: string;
  precos: PrecoPorTamanhoInput[];
  fichaTecnica: FichaTecnicaInput[];
}

export interface AtualizarSaborInput {
  nome?: string;
  descricao?: string;
  precos?: PrecoPorTamanhoInput[];
}
