import { FastifyInstance } from 'fastify';
import { TamanhoBordaService } from '../services/tamanhoBordaService';

const service = new TamanhoBordaService();

export async function tamanhosEBordasRoutes(app: FastifyInstance) {
  // GET /api/tamanhos - Lista todos os tamanhos de pizza
  app.get('/tamanhos', async (request, reply) => {
    try {
      const tamanhos = await service.listarTamanhos();
      return reply.send(tamanhos);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao buscar tamanhos.',
        detalhe: error.message,
      });
    }
  });

  // GET /api/bordas - Lista todas as bordas com preços e custos por tamanho
  app.get('/bordas', async (request, reply) => {
    try {
      const bordas = await service.listarBordas();
      return reply.send(bordas);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao buscar bordas.',
        detalhe: error.message,
      });
    }
  });

  // GET /api/bordas/:id - Busca detalhada de uma borda por ID
  app.get<{ Params: { id: string } }>('/bordas/:id', async (request, reply) => {
    const id = Number(request.params.id);

    if (isNaN(id)) {
      return reply.status(400).send({ mensagem: 'ID inválido.' });
    }

    try {
      const borda = await service.buscarBordaPorId(id);
      if (!borda) {
        return reply.status(404).send({ mensagem: 'Borda não encontrada.' });
      }
      return reply.send(borda);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao buscar borda.',
        detalhe: error.message,
      });
    }
  });
}