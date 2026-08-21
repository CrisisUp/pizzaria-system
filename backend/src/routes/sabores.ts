import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ISaborRepository } from '../repositories/ISaborRepository';
import { PrismaSaborRepository } from '../repositories/prisma/PrismaSaborRepository';
import {
  atualizarFichaTecnicaSchema,
  atualizarSaborSchema,
  criarSaborSchema,
} from '../schemas/saborSchema';
import { SaborService } from '../services/saborService';

// Injeção via interface (não importa implementação concreta na route)
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
  server.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const saborId = Number(id);

      if (isNaN(saborId)) {
        return reply.status(400).send({ error: 'ID inválido.' });
      }

      const sabor = await service.buscarPorId(saborId);
      if (!sabor) {
        return reply.status(404).send({ error: 'Sabor não encontrado' });
      }
      return reply.send(sabor);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ mensagem: 'Erro ao buscar sabor.', detalhe: error.message });
    }
  });

  // 3. Criar Sabor
  server.post('/', { schema: criarSaborSchema }, async (request, reply) => {
    try {
      const sabor = await service.criar(request.body as any);
      return reply.status(201).send(sabor);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({ mensagem: 'Erro ao criar sabor.', detalhe: error.message });
    }
  });

  // 4. Atualizar Sabor
  server.put('/:id', { schema: atualizarSaborSchema }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const saborId = Number(id);

      if (isNaN(saborId)) {
        return reply.status(400).send({ error: 'ID inválido.' });
      }

      const sabor = await service.atualizar(saborId, request.body as any);
      return reply.send(sabor);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({ mensagem: 'Erro ao atualizar sabor.', detalhe: error.message });
    }
  });

  // 5. Atualizar Ficha Técnica
  server.put('/:id/ficha-tecnica', { schema: atualizarFichaTecnicaSchema }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const saborId = Number(id);

      if (isNaN(saborId)) {
        return reply.status(400).send({ error: 'ID inválido.' });
      }

      const resultado = await service.atualizarFichaTecnica(saborId, request.body as any);
      return reply.send(resultado);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({ mensagem: 'Erro ao atualizar ficha técnica.', detalhe: error.message });
    }
  });

  // 6. Deletar Sabor
  server.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const saborId = Number(id);

      if (isNaN(saborId)) {
        return reply.status(400).send({ error: 'ID inválido.' });
      }

      await service.deletar(saborId);
      return reply.status(204).send();
    } catch (error: any) {
      app.log.error(error);
      return reply.status(400).send({ mensagem: 'Erro ao deletar sabor.', detalhe: error.message });
    }
  });
}
