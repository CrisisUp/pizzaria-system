import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { PrismaSaborRepository } from '../repositories/prisma/PrismaSaborRepository';
import {
  atualizarFichaTecnicaSchema,
  atualizarSaborSchema,
  criarSaborSchema,
} from '../schemas/saborSchema';
import { SaborService } from '../services/saborService';

const saborRepository = new PrismaSaborRepository();
const service = new SaborService(saborRepository);

// Função auxiliar para converter os campos Decimal do Prisma para Number
function formatarSabor(sabor: any) {
  if (!sabor) return sabor;

  return {
    ...sabor,
    saborPrecos: sabor.saborPrecos?.map((p: any) => ({
      ...p,
      precoVenda: Number(p.precoVenda),
    })),
    fichaTecnica: sabor.fichaTecnica?.map((f: any) => ({
      ...f,
      quantidadeUsada: Number(f.quantidadeUsada),
    })),
  };
}

export async function saboresRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // 1. Listar todos os sabores (GET /api/sabores)
  server.get('/', async () => {
    const sabores = await service.listar();
    return sabores.map(formatarSabor);
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

    return formatarSabor(sabor);
  });

  // 3. Criar Sabor
  server.post('/', { schema: criarSaborSchema }, async (request, reply) => {
    const sabor = await service.criar(request.body as any);
    return reply.status(201).send(formatarSabor(sabor));
  });

  // 4. Atualizar Sabor
  server.put('/:id', { schema: atualizarSaborSchema }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const saborId = Number(id);

    if (isNaN(saborId)) {
      return reply.status(400).send({ error: 'ID inválido.' });
    }

    const sabor = await service.atualizar(saborId, request.body as any);
    return formatarSabor(sabor);
  });

  // 5. Atualizar Ficha Técnica
  server.put('/:id/ficha-tecnica', { schema: atualizarFichaTecnicaSchema }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const saborId = Number(id);

    if (isNaN(saborId)) {
      return reply.status(400).send({ error: 'ID inválido.' });
    }

    const resultado = await service.atualizarFichaTecnica(saborId, request.body as any);
    return resultado;
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