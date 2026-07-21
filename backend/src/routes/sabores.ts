import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { PrismaSaborRepository } from '../repositories/prisma/PrismaSaborRepository';
import { SaborService } from '../services/saborService';
import {
  criarSaborSchema,
  atualizarSaborSchema,
  atualizarFichaTecnicaSchema,
} from '../schemas/saborSchema';

const saborRepository = new PrismaSaborRepository();
const service = new SaborService(saborRepository);

export async function saboresRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // 1. Listar todos os sabores (GET /api/sabores)
  // O Fastify lida nativamente com a presença ou ausência da barra final.
  server.get('/', async () => {
    return await service.listar();
  });

  // 2. Buscar por ID (GET /api/sabores/:id)
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const saborId = Number(id);

    if (!id || isNaN(saborId)) {
      return reply.status(400).send({ error: 'O ID informado deve ser um número válido.' });
    }

    const sabor = await service.buscarPorId(saborId);

    if (!sabor) {
      return reply.status(404).send({ error: 'Sabor não encontrado' });
    }

    return sabor;
  });

  // 3. Criar Sabor
  server.post('/', { schema: criarSaborSchema }, async (request, reply) => {
    const sabor = await service.criar(request.body as any);
    return reply.status(201).send(sabor);
  });

  // 4. Atualizar Sabor
  server.put('/:id', { schema: atualizarSaborSchema }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const saborId = Number(id);

    if (isNaN(saborId)) {
      return reply.status(400).send({ error: 'ID inválido.' });
    }

    const sabor = await service.atualizar(saborId, request.body as any);
    return sabor;
  });

  // 5. Atualizar Ficha Técnica
  server.put('/:id/ficha-tecnica', { schema: atualizarFichaTecnicaSchema }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const saborId = Number(id);

    if (isNaN(saborId)) {
      return reply.status(400).send({ error: 'ID inválido.' });
    }

    return await service.atualizarFichaTecnica(saborId, request.body as any);
  });

  // 6. Deletar Sabor
  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const saborId = Number(id);

    if (isNaN(saborId)) {
      return reply.status(400).send({ error: 'ID inválido.' });
    }

    await service.deletar(saborId);
    return reply.status(204).send();
  });
}