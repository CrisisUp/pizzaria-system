import { z } from 'zod';

export const criarIngredienteSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  unidadeCompra: z.string().min(1, 'A unidade de compra é obrigatória'), // Ex: "KG", "L", "UN"
  precoUltimaCompra: z.number().nonnegative('O preço da última compra não pode ser negativo'),
  quantidadeEmbalagem: z.number().positive('A quantidade por embalagem deve ser positiva'),
});

// Força a conversão para string, aceitando string ou number de entrada
export const ingredienteParamsSchema = z.object({
  id: z.string(),
});

export const atualizarIngredienteSchema = criarIngredienteSchema.partial();
