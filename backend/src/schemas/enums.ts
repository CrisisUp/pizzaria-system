import { z } from 'zod';

export const TipoPedidoEnum = z.enum(['BALCAO', 'DELIVERY', 'MESA']);
export const StatusPedidoEnum = z.enum(['RECEBIDO', 'EM_PREPARO', 'EM_TRANSPORTE', 'CONCLUIDO', 'CANCELADO']);

export type TipoPedido = z.infer<typeof TipoPedidoEnum>;
export type StatusPedido = z.infer<typeof StatusPedidoEnum>;