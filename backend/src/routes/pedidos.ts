import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  atualizarStatusSchema,
  criarPedidoSchema,
  pedidoParamsSchema,
} from '../schemas/pedidoSchema';
import { PedidoService } from '../services/pedidoService';
import { getIO } from '../socket';
import { sendPushToAll } from '../lib/push';
import { sanitizeText } from '../lib/sanitize';

const service = new PedidoService();

export async function pedidosRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/pedidos - Lista todos os pedidos
  typedApp.get('/', async (_request, reply) => {
    try {
      const pedidos = await service.listar();
      return reply.send(pedidos);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao listar pedidos.',
        detalhe: error.message,
      });
    }
  });

  // POST /api/pedidos - Registra um novo pedido
  typedApp.post(
    '/',
    {
      schema: {
        body: criarPedidoSchema,
      },
      config: {
        rateLimit: { max: 10, timeWindow: '1 minute' },
      },
    },
    async (request, reply) => {
      try {
        const payload = {
          ...request.body,
          clienteNome: sanitizeText(request.body.clienteNome),
          enderecoEntrega: request.body.enderecoEntrega
            ? sanitizeText(request.body.enderecoEntrega)
            : request.body.enderecoEntrega,
          itens: request.body.itens.map((item) => ({
            ...item,
            observacoes: item.observacoes ? sanitizeText(item.observacoes) : item.observacoes,
            bordaTamanhoId: item.bordaTamanhoId ?? undefined,
            tamanhoId: item.tamanhoId ?? undefined,
          })),
        };

        const novoPedido = await service.criar(payload);

        // 📢 WebSocket: notifica clientes conectados
        getIO().emit('pedido:criado', novoPedido);

        // 🔔 Push: notifica dispositivos com notificações ativadas
        const tipoLabel = { MESA: '🍽️ Mesa', DELIVERY: '🛵 Delivery', BALCAO: '🛍️ Balcão' }[novoPedido.tipoPedido] || novoPedido.tipoPedido;
        sendPushToAll({
          title: '🍕 Novo Pedido!',
          body: `${tipoLabel} - ${novoPedido.clienteNome} - R$ ${Number(novoPedido.valorTotal).toFixed(2)}`,
          tag: `pedido-${novoPedido.id}`,
          data: { url: '/cozinha', pedidoId: novoPedido.id },
        }).catch((err) => app.log.error({ err }, 'Erro ao enviar push de novo pedido'));

        return reply.status(201).send(novoPedido);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao criar pedido.',
          detalhe: error.message,
        });
      }
    }
  );

  // PATCH /api/pedidos/:id/status - Atualiza status
  typedApp.patch(
    '/:id/status',
    {
      schema: {
        params: pedidoParamsSchema,
        body: atualizarStatusSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { status } = request.body;

      try {
        const pedidoAtualizado = await service.atualizarStatus(id, status);

        // 📢 WebSocket
        getIO().emit('pedido:atualizado', pedidoAtualizado);

        // 🔔 Push: notifica mudança de status
        const statusLabels: Record<string, string> = {
          RECEBIDO: '📞 Pedido recebido',
          EM_PREPARO: '👨‍🍳 Em preparo',
          EM_TRANSPORTE: '🛵 Saiu para entrega',
          CONCLUIDO: '✅ Pedido pronto!',
          CANCELADO: '❌ Pedido cancelado',
        };

        const statusLabel = statusLabels[status] || status;
        if (statusLabel) {
          sendPushToAll({
            title: `Pedido #${id}`,
            body: `${statusLabel} - ${pedidoAtualizado.clienteNome}`,
            tag: `pedido-${id}-status`,
            data: { url: '/cozinha', pedidoId: id },
          }).catch((err) => app.log.error({ err }, 'Erro ao enviar push de status'));
        }

        return reply.send(pedidoAtualizado);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(500).send({
          mensagem: 'Erro ao atualizar status do pedido.',
          detalhe: error.message,
        });
      }
    }
  );
}
