import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  atualizarBordaSchema,
  atualizarTamanhoSchema,
  bordaParamsSchema,
  criarBordaSchema,
  criarTamanhoSchema,
  tamanhoParamsSchema,
} from '../schemas/tamanhoEBordaSchema';
import { TamanhoEBordaService } from '../services/tamanhoEBordaService';

const service = new TamanhoEBordaService();

// Função auxiliar para converter Decimais do Prisma em Numbers simples
function formatarTamanho(tamanho: any) {
  return {
    ...tamanho,
    fatorMultiplicador: Number(tamanho.fatorMultiplicador ?? 1),
    maxSabores: tamanho.maxSabores ?? 2,
    saborPrecos: tamanho.saborPrecos?.map((p: any) => ({
      ...p,
      precoVenda: Number(p.precoVenda),
    })),
    bordaPrecos: tamanho.bordaPrecos?.map((p: any) => ({
      ...p,
      precoVenda: Number(p.precoVenda),
    })),
  };
}

function formatarBorda(borda: any) {
  return {
    ...borda,
    bordaPrecos: borda.bordaPrecos?.map((p: any) => ({
      ...p,
      precoVenda: Number(p.precoVenda),
    })),
  };
}

export async function tamanhosEBordasRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // ==========================================
  // ROTA RAIZ (GET /api/tamanhos-e-bordas)
  // ==========================================
  typedApp.get('/', async (_request, reply) => {
    try {
      const [tamanhos, bordas] = await Promise.all([
        service.listarTamanhos(),
        service.listarBordas(),
      ]);
      return reply.send({
        tamanhos: tamanhos.map(formatarTamanho),
        bordas: bordas.map(formatarBorda),
      });
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao listar tamanhos e bordas.',
        detalhe: error.message,
      });
    }
  });

  // ==========================================
  // ROTAS DE TAMANHOS (GET /api/tamanhos-e-bordas/tamanhos E GET /api/tamanhos)
  // ==========================================

  const getTamanhosHandler = async (_request: any, reply: any) => {
    try {
      const tamanhos = await service.listarTamanhos();
      return reply.send(tamanhos.map(formatarTamanho));
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao listar tamanhos.',
        detalhe: error.message,
      });
    }
  };

  typedApp.get('/tamanhos', getTamanhosHandler);

  typedApp.post(
    '/tamanhos',
    { schema: { body: criarTamanhoSchema } },
    async (request, reply) => {
      try {
        const novoTamanho = await service.criarTamanho(request.body);
        return reply.status(201).send(formatarTamanho(novoTamanho));
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao criar tamanho.',
          detalhe: error.message,
        });
      }
    }
  );

  typedApp.put(
    '/tamanhos/:id',
    { schema: { params: tamanhoParamsSchema, body: atualizarTamanhoSchema } },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const tamanhoAtualizado = await service.atualizarTamanho(id, request.body);
        return reply.send(formatarTamanho(tamanhoAtualizado));
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao atualizar tamanho.',
          detalhe: error.message,
        });
      }
    }
  );

  typedApp.delete(
    '/tamanhos/:id',
    { schema: { params: tamanhoParamsSchema } },
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
  // ROTAS DE BORDAS (GET /api/tamanhos-e-bordas/bordas E GET /api/bordas)
  // ==========================================

  const getBordasHandler = async (_request: any, reply: any) => {
    try {
      const bordas = await service.listarBordas();
      return reply.send(bordas.map(formatarBorda));
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao listar bordas.',
        detalhe: error.message,
      });
    }
  };

  typedApp.get('/bordas', getBordasHandler);

  typedApp.post(
    '/bordas',
    { schema: { body: criarBordaSchema } },
    async (request, reply) => {
      try {
        const novaBorda = await service.criarBorda(request.body);
        return reply.status(201).send(formatarBorda(novaBorda));
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao criar borda.',
          detalhe: error.message,
        });
      }
    }
  );

  typedApp.put(
    '/bordas/:id',
    { schema: { params: bordaParamsSchema, body: atualizarBordaSchema } },
    async (request, reply) => {
      const { id } = request.params;
      try {
        const bordaAtualizada = await service.atualizarBorda(id, request.body);
        return reply.send(formatarBorda(bordaAtualizada));
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({
          mensagem: 'Erro ao atualizar borda.',
          detalhe: error.message,
        });
      }
    }
  );

  typedApp.delete(
    '/bordas/:id',
    { schema: { params: bordaParamsSchema } },
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