import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  atualizarIngredienteBodySchema,
  criarIngredienteBodySchema,
} from '../schemas/ingredienteSchema';
import { IngredienteService } from '../services/ingredienteService';

const service = new IngredienteService();

export async function ingredientesRoutes(app: FastifyInstance) {
  // Habilita o type provider do Zod no Fastify v5
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/ingredientes - Listar todos os ingredientes
  typedApp.get('/ingredientes', async (_request, reply) => {
    try {
      const ingredientes = await service.listarTodos();
      return reply.send(ingredientes);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({ mensagem: 'Erro ao listar ingredientes.', detalhe: error.message });
    }
  });

  // GET /api/ingredientes/:id - Buscar por ID
  typedApp.get(
    '/ingredientes/:id',
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const ingrediente = await service.buscarPorId(id);

        if (!ingrediente) {
          return reply.status(404).send({ mensagem: 'Ingrediente não encontrado.' });
        }

        return reply.send(ingrediente);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(500).send({ mensagem: 'Erro ao buscar ingrediente.', detalhe: error.message });
      }
    }
  );

  // POST /api/ingredientes - Criar ingrediente com validação do Zod
  typedApp.post(
    '/ingredientes',
    {
      schema: {
        body: criarIngredienteBodySchema,
      },
    },
    async (request, reply) => {
      try {
        const novo = await service.criar(request.body);
        return reply.status(201).send(novo);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao criar ingrediente.',
          detalhe: error.message,
        });
      }
    }
  );

  // PUT /api/ingredientes/:id - Atualizar ingrediente
  typedApp.put(
    '/ingredientes/:id',
    {
      schema: {
        body: atualizarIngredienteBodySchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const atualizado = await service.atualizar(id, request.body);
        return reply.send(atualizado);
      } catch (error: any) {
        if (error.message?.includes('não encontrado')) {
          return reply.status(404).send({ mensagem: error.message });
        }
        app.log.error(error);
        return reply.status(400).send({ mensagem: 'Erro ao atualizar ingrediente.', detalhe: error.message });
      }
    }
  );

  // DELETE /api/ingredientes/:id - Deletar ingrediente
  typedApp.delete(
    '/ingredientes/:id',
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        await service.deletar(id);
        return reply.status(204).send();
      } catch (error: any) {
        if (error.message?.includes('não encontrado')) {
          return reply.status(404).send({ mensagem: error.message });
        }
        if (error.message?.includes('fichas técnicas') || error.message?.includes('associações')) {
          return reply.status(409).send({ mensagem: error.message });
        }
        app.log.error(error);
        return reply.status(400).send({ mensagem: 'Erro ao deletar ingrediente.', detalhe: error.message });
      }
    }
  );
}
