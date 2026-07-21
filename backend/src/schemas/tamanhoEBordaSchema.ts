import { z } from 'zod';

// ==========================================
// SCHEMAS DE TAMANHOS
// ==========================================
export const criarTamanhoSchema = z.object({
  nome: z.string().min(2, 'O nome do tamanho deve ter pelo menos 2 caracteres'), // Ex: "Broto", "Média", "Grande"
  maxSabores: z.number().int().positive('O número máximo de sabores deve ser pelo menos 1'),
  fatias: z.number().int().positive('O número de fatias deve ser maior que zero'),
});

export const atualizarTamanhoSchema = criarTamanhoSchema.partial();

export const tamanhoParamsSchema = z.object({
  id: z.string().transform((val) => Number(val)).refine((val) => !isNaN(val), {
    message: 'ID do tamanho deve ser um número válido',
  }),
});

// ==========================================
// SCHEMAS DE BORDAS
// ==========================================
export const criarBordaSchema = z.object({
  nome: z.string().min(2, 'O nome da borda deve ter pelo menos 2 caracteres'), // Ex: "Catupiry", "Cheddar"
  descricao: z.string().optional(),
  precoAdicional: z.number().nonnegative('O preço adicional não pode ser negativo'),
});

export const atualizarBordaSchema = criarBordaSchema.partial();

export const bordaParamsSchema = z.object({
  id: z.string().transform((val) => Number(val)).refine((val) => !isNaN(val), {
    message: 'ID da borda deve ser um número válido',
  }),
});