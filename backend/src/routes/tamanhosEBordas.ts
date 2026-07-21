import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { TamanhoEBordaService } from '../services/tamanhoEBordaService';
import {
  criarTamanhoSchema,
  atualizarTamanhoSchema,
  tamanhoParamsSchema,
  criarBordaSchema,
  atualizarBordaSchema,
  bordaParamsSchema,
} from '../schemas/tamanhoEBordaSchema';

const service = new TamanhoEBordaService();

export async function tamanhosEBordasRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // ==========================================
  // ROTAS DE TAMANHOS
  // ==========================================

  // GET /api/tamanhos
  typedApp.get('/tamanhos', async (_request, reply) => {
    try {
      const tamanhos = await service.listarTamanhos();
      return reply.send(tamanhos);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao listar tamanhos.',
        detalhe: error.message,
      });
    }
  });

  // POST /api/tamanhos
  typedApp.post(
    '/tamanhos',
    {
      schema: {
        body: criarTamanhoSchema,
      },
    },
    async (request, reply) => {
      try {
        const novoTamanho = await service.criarTamanho(request.body);
        return reply.status(201).send(novoTamanho);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao criar tamanho.',
          detalhe: error.message,
        });
      }
    }
  );

  // PUT /api/tamanhos/:id
  typedApp.put(
    '/tamanhos/:id',
    {
      schema: {
        params: tamanhoParamsSchema,
        body: atualizarTamanhoSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const tamanhoAtualizado = await service.atualizarTamanho(id, request.body);
        return reply.send(tamanhoAtualizado);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao atualizar tamanho.',
          detalhe: error.message,
        });
      }
    }
  );

  // DELETE /api/tamanhos/:id
  typedApp.delete(
    '/tamanhos/:id',
    {
      schema: {
        params: tamanhoParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        await service.deletarTamanho(id);
        return reply.status(204).send();
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao remover tamanho.',
          detalhe: error.message,
        });
      }
    }
  );

  // ==========================================
  // ROTAS DE BORDAS
  // ==========================================

  // GET /api/bordas
  typedApp.get('/bordas', async (_request, reply) => {
    try {
      const bordas = await service.listarBordas();
      return reply.send(bordas);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao listar bordas.',
        detalhe: error.message,
      });
    }
  });

  // POST /api/bordas
  typedApp.post(
    '/bordas',
    {
      schema: {
        body: criarBordaSchema,
      },
    },
    async (request, reply) => {
      try {
        const novaBorda = await service.criarBorda(request.body);
        return reply.status(201).send(novaBorda);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao criar borda.',
          detalhe: error.message,
        });
      }
    }
  );

  // PUT /api/bordas/:id
  typedApp.put(
    '/bordas/:id',
    {
      schema: {
        params: bordaParamsSchema,
        body: atualizarBordaSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const bordaAtualizada = await service.atualizarBorda(id, request.body);
        return reply.send(bordaAtualizada);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao atualizar borda.',
          detalhe: error.message,
        });
      }
    }
  );

  // DELETE /api/bordas/:id
  typedApp.delete(
    '/bordas/:id',
    {
      schema: {
        params: bordaParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        await service.deletarBorda(id);
        return reply.status(204).send();
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao remover borda.',
          detalhe: error.message,
        });
      }
    }
  );
}