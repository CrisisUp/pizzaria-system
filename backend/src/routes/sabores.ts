import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  atualizarFichaTecnicaSchema,
  atualizarSaborSchema,
  criarSaborSchema,
  saborParamsSchema,
} from '../schemas/saborSchema';
import { SaborService } from '../services/saborService';

const service = new SaborService();

export async function saboresRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/sabores
  typedApp.get('/sabores', async (_request, reply) => {
    try {
      const sabores = await service.listar();
      return reply.send(sabores);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao listar sabores.',
        detalhe: error.message,
      });
    }
  });

  // GET /api/sabores/:id
  typedApp.get(
    '/sabores/:id',
    {
      schema: {
        params: saborParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const sabor = await service.buscarPorId(id);
        if (!sabor) {
          return reply.status(404).send({ mensagem: 'Sabor não encontrado.' });
        }
        return reply.send(sabor);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(500).send({
          mensagem: 'Erro ao buscar sabor.',
          detalhe: error.message,
        });
      }
    }
  );

  // POST /api/sabores
  typedApp.post(
    '/sabores',
    {
      schema: {
        body: criarSaborSchema,
      },
    },
    async (request, reply) => {
      try {
        const novoSabor = await service.criar(request.body);
        return reply.status(201).send(novoSabor);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao cadastrar sabor.',
          detalhe: error.message,
        });
      }
    }
  );

  // PUT /api/sabores/:id
  typedApp.put(
    '/sabores/:id',
    {
      schema: {
        params: saborParamsSchema,
        body: atualizarSaborSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const saborAtualizado = await service.atualizar(id, request.body);
        return reply.send(saborAtualizado);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao atualizar sabor.',
          detalhe: error.message,
        });
      }
    }
  );

  // PATCH /api/sabores/:id/ficha-tecnica - Atualizar apenas a ficha técnica
  typedApp.patch(
    '/sabores/:id/ficha-tecnica',
    {
      schema: {
        params: saborParamsSchema,
        body: atualizarFichaTecnicaSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { fichaTecnica } = request.body;

      try {
        const resultado = await service.atualizarFichaTecnica(id, fichaTecnica);
        return reply.send(resultado);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao atualizar ficha técnica.',
          detalhe: error.message,
        });
      }
    }
  );

  // DELETE /api/sabores/:id
  typedApp.delete(
    '/sabores/:id',
    {
      schema: {
        params: saborParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        await service.deletar(id);
        return reply.status(204).send();
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao remover sabor.',
          detalhe: error.message,
        });
      }
    }
  );
}