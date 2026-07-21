import { StatusPedido } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { CriarPedidoInput, PedidoService } from '../services/pedidoService';

const service = new PedidoService();

export async function pedidosRoutes(app: FastifyInstance) {
  // GET /api/pedidos - Lista todos os pedidos
  app.get('/pedidos', async (request, reply) => {
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

  // POST /api/pedidos - Registra um novo pedido com sabores e bordas
  app.post<{ Body: CriarPedidoInput }>('/pedidos', async (request, reply) => {
    const { clienteNome, tipoPedido, itens } = request.body;

    if (!clienteNome || !tipoPedido || !itens || itens.length === 0) {
      return reply.status(400).send({
        mensagem: 'Nome do cliente, tipo do pedido e ao menos 1 item são obrigatórios.',
      });
    }

    try {
      const novoPedido = await service.criar(request.body);
      return reply.status(201).send(novoPedido);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({
        mensagem: 'Erro ao criar pedido.',
        detalhe: error.message,
      });
    }
  });

  // PATCH /api/pedidos/:id/status - Atualiza o status do pedido (KDS / Cozinha / Entrega)
  app.patch<{ Params: { id: string }; Body: { status: StatusPedido } }>(
    '/pedidos/:id/status',
    async (request, reply) => {
      const id = Number(request.params.id);
      const { status } = request.body;

      if (isNaN(id) || !status) {
        return reply.status(400).send({ mensagem: 'ID inválido ou status não fornecido.' });
      }

      try {
        const pedidoAtualizado = await service.atualizarStatus(id, status);
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