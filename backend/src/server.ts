import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';

// Imports das suas rotas
import { ingredientesRoutes } from './routes/ingredientes';
import { pedidosRoutes } from './routes/pedidos';
import { saboresRoutes } from './routes/sabores';
import { tamanhosEBordasRoutes } from './routes/tamanhosEBordas';

// 1. Instância do Fastify configurada com o Type Provider do Zod
const app = Fastify({
  logger: true, // Logs detalhados no terminal
}).withTypeProvider<ZodTypeProvider>();

// 2. Registra os compiladores do Zod para o Fastify v5
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const prisma = new PrismaClient();

// 3. Registrar CORS atualizado para o Fastify v5
app.register(cors, {
  origin: true, // Permite conexões do Frontend em desenvolvimento
});

// 4. Registrar as rotas da API com o prefixo /api
app.register(ingredientesRoutes, { prefix: '/api' });
app.register(saboresRoutes, { prefix: '/api' });
app.register(tamanhosEBordasRoutes, { prefix: '/api' });
app.register(pedidosRoutes, { prefix: '/api' });

// 5. Rota de Healthcheck
app.get('/health', async () => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// 6. Rota de Teste de Conexão com o Banco
app.get('/test-db', async (_request, reply) => {
  try {
    const tamanhos = await prisma.tamanho.findMany();
    return {
      status: 'sucesso',
      mensagem: 'Conexão com PostgreSQL bem-sucedida!',
      totalTamanhos: tamanhos.length,
      dados: tamanhos,
    };
  } catch (error) {
    app.log.error(error);
    return reply.status(500).send({
      status: 'erro',
      mensagem: 'Falha ao conectar com o banco de dados.',
    });
  }
});

// Encerramento limpo das conexões com o banco ao desligar o servidor
app.addHook('onClose', async () => {
  await prisma.$disconnect();
});

// Inicialização do Servidor
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`\n🚀 Servidor Fastify v5 rodando em http://localhost:${port}\n`);
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();