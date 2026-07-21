import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { IngredienteService } from '../services/ingredienteService';
import {
  criarIngredienteSchema,
  atualizarIngredienteSchema,
  ingredienteParamsSchema,
} from '../schemas/ingredienteSchema';

const service = new IngredienteService();

export async function ingredientesRoutes(app: FastifyInstance) {
  // Habilita o type provider do Zod no Fastify v5
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/ingredientes - Listar todos os ingredientes
  typedApp.get('/ingredientes', async (_request, reply) => {
    const ingredientes = await service.listarTodos();
    return reply.send(ingredientes);
  });

  // GET /api/ingredientes/:id - Buscar por ID
  typedApp.get(
    '/ingredientes/:id',
    {
      schema: {
        params: ingredienteParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const ingrediente = await service.buscarPorId(id);

      if (!ingrediente) {
        return reply.status(404).send({ mensagem: 'Ingrediente não encontrado.' });
      }

      return reply.send(ingrediente);
    }
  );

  // POST /api/ingredientes - Criar ingrediente com validação do Zod
  typedApp.post(
    '/ingredientes',
    {
      schema: {
        body: criarIngredienteSchema,
      },
    },
    async (request, reply) => {
      // request.body já chega validado e tipado!
      const novo = await service.criar(request.body);
      return reply.status(201).send(novo);
    }
  );

  // PUT /api/ingredientes/:id - Atualizar ingrediente
  typedApp.put(
    '/ingredientes/:id',
    {
      schema: {
        params: ingredienteParamsSchema,
        body: atualizarIngredienteSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const atualizado = await service.atualizar(id, request.body);
        return reply.send(atualizado);
      } catch {
        return reply.status(404).send({ mensagem: 'Ingrediente não encontrado para atualização.' });
      }
    }
  );

  // DELETE /api/ingredientes/:id - Deletar ingrediente
  typedApp.delete(
    '/ingredientes/:id',
    {
      schema: {
        params: ingredienteParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        await service.deletar(id);
        return reply.status(204).send();
      } catch {
        return reply.status(404).send({ mensagem: 'Ingrediente não encontrado para exclusão.' });
      }
    }
  );
}