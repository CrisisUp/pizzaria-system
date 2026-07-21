import { StatusPedido } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';
import { CriarPedidoInput, PedidoService } from '../services/pedidoService';

const pedidoService = new PedidoService();

// Interface para o parâmetro :id na URL
interface PedidoParams {
  id: string;
}

// Interface para o corpo do PATCH /status
interface AtualizarStatusBody {
  status: StatusPedido;
}

export class PedidoController {
  /**
   * POST /api/pedidos
   * Cria um novo pedido aplicando as regras do sabor mais caro
   */
  async criar(req: FastifyRequest<{ Body: CriarPedidoInput }>, reply: FastifyReply) {
    try {
      const pedido = await pedidoService.criar(req.body);
      return reply.status(201).send(pedido);
    } catch (error: any) {
      return reply.status(400).send({
        error: 'Erro ao criar pedido',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/pedidos
   * Lista todos os pedidos cadastrados
   */
  async listar(_req: FastifyRequest, reply: FastifyReply) {
    try {
      const pedidos = await pedidoService.listar();
      return reply.status(200).send(pedidos);
    } catch (error: any) {
      return reply.status(500).send({
        error: 'Erro ao listar pedidos',
        message: error.message,
      });
    }
  }

  /**
   * PATCH /api/pedidos/:id/status
   * Atualiza o status do pedido (e abate o estoque se mudar para EM_PREPARO)
   */
  async atualizarStatus(
    req: FastifyRequest<{ Params: PedidoParams; Body: AtualizarStatusBody }>,
    reply: FastifyReply
  ) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      if (isNaN(id)) {
        return reply.status(400).send({ error: 'ID do pedido inválido.' });
      }

      if (!status || !Object.values(StatusPedido).includes(status)) {
        return reply.status(400).send({
          error: 'Status inválido.',
          statusValidos: Object.values(StatusPedido),
        });
      }

      const pedidoAtualizado = await pedidoService.atualizarStatus(id, status);
      return reply.status(200).send(pedidoAtualizado);
    } catch (error: any) {
      return reply.status(400).send({
        error: 'Erro ao atualizar status do pedido',
        message: error.message,
      });
    }
  }
}