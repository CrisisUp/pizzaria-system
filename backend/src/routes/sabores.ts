import { FastifyInstance } from 'fastify';
import {
  AtualizarSaborInput,
  CriarSaborInput,
  FichaTecnicaInput,
  SaborService,
} from '../services/saborService';

const service = new SaborService();

export async function saboresRoutes(app: FastifyInstance) {
  // GET /api/sabores - Lista cardápio com custos e margem
  app.get('/sabores', async (request, reply) => {
    try {
      const sabores = await service.listar();
      return reply.send(sabores);
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao buscar sabores do cardápio.',
        detalhe: error.message,
      });
    }
  });

  // POST /api/sabores - Cadastra um novo sabor
  app.post<{ Body: CriarSaborInput }>('/sabores', async (request, reply) => {
    const { nome, precos } = request.body;

    if (!nome || !precos || precos.length === 0) {
      return reply.status(400).send({
        mensagem: 'Nome do sabor e ao menos 1 preço por tamanho são obrigatórios.',
      });
    }

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
  });

  // PUT /api/sabores/:id - Atualiza dados básicos e preços de venda
  app.put<{ Params: { id: string }; Body: AtualizarSaborInput }>(
    '/sabores/:id',
    async (request, reply) => {
      const id = Number(request.params.id);

      if (isNaN(id)) {
        return reply.status(400).send({ mensagem: 'ID inválido.' });
      }

      try {
        const saborAtualizado = await service.atualizar(id, request.body);
        return reply.send(saborAtualizado);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(500).send({
          mensagem: 'Erro ao atualizar sabor.',
          detalhe: error.message,
        });
      }
    }
  );

  // PUT /api/sabores/:id/ficha-tecnica - Atualiza a ficha técnica do sabor
  app.put<{ Params: { id: string }; Body: { fichaTecnica: FichaTecnicaInput[] } }>(
    '/sabores/:id/ficha-tecnica',
    async (request, reply) => {
      const saborId = Number(request.params.id);
      const { fichaTecnica } = request.body;

      if (isNaN(saborId) || !fichaTecnica) {
        return reply.status(400).send({
          mensagem: 'ID do sabor e lista de ficha técnica são obrigatórios.',
        });
      }

      try {
        const resultado = await service.atualizarFichaTecnica(saborId, fichaTecnica);
        return reply.send(resultado);
      } catch (error: any) {
        app.log.error(error);
        return reply.status(500).send({
          mensagem: 'Erro ao atualizar ficha técnica.',
          detalhe: error.message,
        });
      }
    }
  );

  // DELETE /api/sabores/:id - Remove um sabor
  app.delete<{ Params: { id: string } }>('/sabores/:id', async (request, reply) => {
    const id = Number(request.params.id);

    if (isNaN(id)) {
      return reply.status(400).send({ mensagem: 'ID inválido.' });
    }

    try {
      await service.deletar(id);
      return reply.send({ mensagem: 'Sabor removido com sucesso.' });
    } catch (error: any) {
      app.log.error(error);
      return reply.status(500).send({
        mensagem: 'Erro ao remover sabor.',
        detalhe: error.message,
      });
    }
  });
}