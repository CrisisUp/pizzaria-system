import { z } from 'zod';

export const precoPorTamanhoSchema = z.object({
  tamanhoId: z.number().int().positive('ID do tamanho inválido'),
  precoVenda: z.number().positive('O preço de venda deve ser maior que zero'),
});

export const ingredienteFichaTecnicaSchema = z.object({
  tamanhoId: z.number().int().positive('ID do tamanho inválido'),
  ingredienteId: z.string().min(1, 'ID do ingrediente é obrigatório'),
  quantidadeUsada: z.number().positive('Quantidade deve ser maior que zero'),
  unidadeMedida: z.string().optional().default('g'),
});

export const criarSaborSchema = z.object({
  nome: z.string().min(2, 'O nome do sabor deve ter pelo menos 2 caracteres'),
  descricao: z.string().optional(),
  precos: z
    .array(precoPorTamanhoSchema)
    .min(1, 'O sabor deve ter preço cadastrado em pelo menos 1 tamanho'),
  fichaTecnica: z.array(ingredienteFichaTecnicaSchema).optional().default([]),
});

export const atualizarSaborSchema = z.object({
  nome: z.string().optional(),
  descricao: z.string().optional(),
  precos: z.array(precoPorTamanhoSchema).optional(),
});

export const atualizarFichaTecnicaSchema = z.object({
  fichaTecnica: z.array(ingredienteFichaTecnicaSchema),
});

export const saborParamsSchema = z.object({
  id: z.string().transform((val) => Number(val)).refine((val) => !isNaN(val), {
    message: 'ID do sabor deve ser um número válido',
  }),
});