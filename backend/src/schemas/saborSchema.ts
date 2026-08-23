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

export const criarSaborBodySchema = z.object({
  nome: z.string().min(1, 'Nome do sabor é obrigatório'),
  descricao: z.string().optional(),
  precos: z.array(precoPorTamanhoSchema).min(1, 'Pelo menos um preço deve ser informado'),
  fichaTecnica: z.array(ingredienteFichaTecnicaSchema),
});

export const criarSaborSchema = z.object({
  body: criarSaborBodySchema,
});

export const atualizarSaborBodySchema = z.object({
  nome: z.string().optional(),
  descricao: z.string().optional(),
  precos: z.array(precoPorTamanhoSchema).optional(),
});

export const atualizarSaborSchema = z.object({
  body: atualizarSaborBodySchema,
});

export const atualizarFichaTecnicaBodySchema = z.object({
  fichaTecnica: z.array(ingredienteFichaTecnicaSchema),
});

export const atualizarFichaTecnicaSchema = z.object({
  body: atualizarFichaTecnicaBodySchema,
});

export const saborParamsSchema = z.object({
  id: z.string().transform((val) => Number(val)).refine((val) => !isNaN(val), {
    message: 'ID do sabor deve ser um número válido',
  }),
});