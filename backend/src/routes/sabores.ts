import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ISaborRepository } from '../repositories/ISaborRepository';
import { PrismaSaborRepository } from '../repositories/prisma/PrismaSaborRepository';
import {
  atualizarFichaTecnicaBodySchema,
  atualizarSaborBodySchema,
  criarSaborBodySchema,
  saborParamsSchema,
} from '../schemas/saborSchema';
import { SaborService } from '../services/saborService';
import { sanitizeText } from '../lib/sanitize';

const saborRepository: ISaborRepository = new PrismaSaborRepository();
const service = new SaborService(saborRepository);

export async function saboresRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // 1. Listar todos os sabores
  server.get('/', async (_request, reply) => {
    try {
      return reply.send(await service.listar());
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ mensagem: 'Erro ao listar sabores.', detalhe: error.message });
    }
  });

  // 2. Buscar por ID
  server.get('/:id', { schema: { params: saborParamsSchema } }, async (request, reply) => {
    try {
      const { id } = request.params as { id: number };
      const sabor = await service.buscarPorId(id);
      if (!sabor) {
        return reply.status(404).send({ mensagem: 'Sabor não encontrado.' });
      }
      return reply.send(sabor);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ mensagem: 'Erro ao buscar sabor.', detalhe: error.message });
    }
  });

  // 3. Criar Sabor
  server.post('/', { schema: { body: criarSaborBodySchema } }, async (request, reply) => {
    try {
      const body = request.body as { nome: string; descricao?: string; precos: { tamanhoId: number; precoVenda: number }[]; fichaTecnica: { tamanhoId: number; ingredienteId: string; quantidadeUsada: number; unidadeMedida?: string }[] };
      const sabor = await service.criar({
        ...body,
        nome: sanitizeText(body.nome),
        descricao: body.descricao ? sanitizeText(body.descricao) : body.descricao,
      });
      return reply.status(201).send(sabor);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({ mensagem: 'Erro ao criar sabor.', detalhe: error.message });
    }
  });

  // 4. Atualizar Sabor
  server.put('/:id', { schema: { params: saborParamsSchema, body: atualizarSaborBodySchema } }, async (request, reply) => {
    try {
      const { id } = request.params as { id: number };
      const body = request.body as { nome?: string; descricao?: string; precos?: any[] };
      const sabor = await service.atualizar(id, {
        ...body,
        nome: body.nome ? sanitizeText(body.nome) : body.nome,
        descricao: body.descricao ? sanitizeText(body.descricao) : body.descricao,
      });
      return reply.send(sabor);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({ mensagem: 'Erro ao atualizar sabor.', detalhe: error.message });
    }
  });

  // 5. Atualizar Ficha Técnica
  server.put('/:id/ficha-tecnica', { schema: { body: atualizarFichaTecnicaBodySchema } }, async (request, reply) => {
    try {
      const { id } = request.params as { id: number };
      const resultado = await service.atualizarFichaTecnica(id, request.body as any);
      return reply.send(resultado);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({ mensagem: 'Erro ao atualizar ficha técnica.', detalhe: error.message });
    }
  });

  // 6. Deletar Sabor
  server.delete('/:id', { schema: { params: saborParamsSchema } }, async (request, reply) => {
    try {
      const { id } = request.params as { id: number };
      await service.deletar(id);
      return reply.status(204).send();
    } catch (error: any) {
      if (error.message?.includes('não encontrado')) {
        return reply.status(404).send({ mensagem: error.message });
      }
      app.log.error(error);
      return reply.status(400).send({ mensagem: 'Erro ao deletar sabor.', detalhe: error.message });
    }
  });
}