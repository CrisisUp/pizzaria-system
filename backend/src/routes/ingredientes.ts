import { FastifyInstance } from 'fastify';
import { CreateIngredienteInput, IngredienteService } from '../services/ingredienteService';

const service = new IngredienteService();

export async function ingredientesRoutes(app: FastifyInstance) {
  // Listar todos os ingredientes
  app.get('/ingredientes', async (request, reply) => {
    const ingredientes = await service.listarTodos();
    return reply.send(ingredientes);
  });

  // Buscar ingrediente por ID
  app.get<{ Params: { id: string } }>('/ingredientes/:id', async (request, reply) => {
    const { id } = request.params;
    const ingrediente = await service.buscarPorId(id);

    if (!ingrediente) {
      return reply.status(404).send({ mensagem: 'Ingrediente não encontrado.' });
    }

    return reply.send(ingrediente);
  });

  // Criar ingrediente
  app.post<{ Body: CreateIngredienteInput }>('/ingredientes', async (request, reply) => {
    const { nome, unidadeMedida, precoUnitario, estoqueMinimo } = request.body;

    if (!nome || !unidadeMedida || precoUnitario === undefined) {
      return reply.status(400).send({ mensagem: 'Campos nome, unidadeMedida e precoUnitario são obrigatórios.' });
    }

    const novo = await service.criar({ nome, unidadeMedida, precoUnitario, estoqueMinimo });
    return reply.status(201).send(novo);
  });

  // Atualizar ingrediente
  app.put<{ Params: { id: string }; Body: Partial<CreateIngredienteInput> }>('/ingredientes/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      const atualizado = await service.atualizar(id, request.body);
      return reply.send(atualizado);
    } catch {
      return reply.status(404).send({ mensagem: 'Ingrediente não encontrado para atualização.' });
    }
  });

  // Deletar ingrediente
  app.delete<{ Params: { id: string } }>('/ingredientes/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      await service.deletar(id);
      return reply.status(204).send();
    } catch {
      return reply.status(404).send({ mensagem: 'Ingrediente não encontrado para exclusão.' });
    }
  });
}