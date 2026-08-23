import { z } from 'zod';

export const criarIngredienteBodySchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  unidadeCompra: z.string().min(1, 'A unidade de compra é obrigatória'), // Ex: "KG", "L", "UN"
  precoUltimaCompra: z.number().nonnegative('O preço da última compra não pode ser negativo'),
  quantidadeEmbalagem: z.number().positive('A quantidade por embalagem deve ser positiva'),
});

export const criarIngredienteSchema = z.object({
  body: criarIngredienteBodySchema,
});

// Params do URL são strings do path
export const ingredienteParamsSchema = z.object({
  id: z.string().min(1),
});

// Para uso com Fastify (params são always string no URL)

export const atualizarIngredienteBodySchema = criarIngredienteBodySchema.partial();

export const atualizarIngredienteSchema = z.object({
  body: atualizarIngredienteBodySchema,
});