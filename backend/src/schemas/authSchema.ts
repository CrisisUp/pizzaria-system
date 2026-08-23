import { z } from 'zod';
import { TipoPedidoEnum, StatusPedidoEnum } from './enums';

export const registerBodySchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const loginBodySchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
  body: registerBodySchema,
});

export const loginSchema = z.object({
  body: loginBodySchema,
});

export const authParamsSchema = z.object({
  id: z.string().transform((val) => Number(val)).refine((val) => !isNaN(val), {
    message: 'ID deve ser um número válido',
  }),
});

// Re-export enums compartilhados
export { TipoPedidoEnum, StatusPedidoEnum };