import { z } from 'zod';

export const criarPedidoSchema = z.object({
  clienteNome: z.string().min(2, 'Nome do cliente deve ter no mínimo 2 caracteres'),
  clienteTelefone: z.string().optional(),
  enderecoEntrega: z.string().optional(),
  tipoPedido: z.enum(['BALCAO', 'DELIVERY', 'MESA'], {
    message: 'Tipo de pedido deve ser BALCAO, DELIVERY ou MESA', // 👈 Ajustado aqui
  }),
  itens: z.array(
    z.object({
      tamanhoId: z.number().int().positive('ID do tamanho inválido').optional(),
      bordaTamanhoId: z.number().int().positive().optional().nullable(),
      quantidade: z.number().int().min(1, 'Quantidade mínima é 1'),
      observacoes: z.string().optional(),
      sabores: z.array(
        z.object({
          saborTamanhoId: z.number().int().positive('ID do sabor inválido'),
          fracao: z.number().positive().max(1, 'A fração não pode ser maior que 1'),
        })
      ).min(1, 'Pelo menos um sabor deve ser informado'),
    })
  ).min(1, 'O pedido precisa ter pelo menos 1 item'),
});

export const atualizarStatusSchema = z.object({
  status: z.enum(['RECEBIDO', 'EM_PREPARO', 'EM_TRANSPORTE', 'CONCLUIDO', 'CANCELADO'], {
    message: 'Status do pedido inválido', // 👈 Ajustado aqui
  }),
});

export const pedidoParamsSchema = z.object({
  id: z.string().transform((val) => Number(val)).refine((val) => !isNaN(val), {
    message: 'ID do pedido deve ser um número válido',
  }),
});