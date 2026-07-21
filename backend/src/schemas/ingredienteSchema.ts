import { z } from 'zod';

export const criarIngredienteSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  unidadeMedida: z.string().min(1, 'A unidade de medida é obrigatória'), // Ex: "KG", "G", "L", "UN"
  precoUnitario: z.number().nonnegative('O preço unitário não pode ser negativo'),
  estoqueMinimo: z.number().nonnegative('O estoque mínimo não pode ser negativo').optional().default(0),
});

export const atualizarIngredienteSchema = criarIngredienteSchema.partial();

export const ingredienteParamsSchema = z.object({
  id: z.string().uuid('O ID do ingrediente é inválido'), // Usando uuid para validar IDs no formato UUID
});