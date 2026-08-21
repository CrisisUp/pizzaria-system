import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  atualizarStatusSchema,
  criarPedidoSchema,
  pedidoParamsSchema,
} from '../schemas/pedidoSchema';
import { PedidoService } from '../services/pedidoService';
import { getIO } from '../socket'; // 👈 Import do Socket.IO

const service = new PedidoService();

export async function pedidosRoutes(app: FastifyInstance) {
  // Conecta o ZodTypeProvider ao Fastify v5
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

  // POST /api/pedidos - Registra um novo pedido com validação automática Zod
  typedApp.post(
    '/',
    {
      schema: {
        body: criarPedidoSchema,
      },
    },
    async (request, reply) => {
      try {
        // Converte bordaTamanhoId de null para undefined em cada item
        const payload = {
          ...request.body,
          itens: request.body.itens.map((item) => ({
            ...item,
            bordaTamanhoId: item.bordaTamanhoId ?? undefined,
            tamanhoId: item.tamanhoId ?? undefined,
          })),
        };

        const novoPedido = await service.criar(payload);

        // 📢 Emite evento de novo pedido em tempo real
        getIO().emit('pedido:criado', novoPedido);

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

  // PATCH /api/pedidos/:id/status - Atualiza status com validação de params e body
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

        // 📢 Dispara evento de atualização de status em tempo real
        getIO().emit('pedido:atualizado', pedidoAtualizado);

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