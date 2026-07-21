import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import Fastify from 'fastify';
import { ingredientesRoutes } from './routes/ingredientes';
import { pedidosRoutes } from './routes/pedidos';
import { saboresRoutes } from './routes/sabores';
import { tamanhosEBordasRoutes } from './routes/tamanhosEBordas';

const app = Fastify({
  logger: true, // Logs detalhados no terminal
});

const prisma = new PrismaClient();

// Registrar CORS para permitir conexões do Frontend
app.register(cors, {
  origin: true, // Em desenvolvimento permite qualquer origem
});

// Registrar os módulos da API com o prefixo /api
app.register(ingredientesRoutes, { prefix: '/api' });
app.register(saboresRoutes, { prefix: '/api' });
app.register(tamanhosEBordasRoutes, { prefix: '/api' });
app.register(pedidosRoutes, { prefix: '/api' });

// 1. Rota de Healthcheck (Teste simples de API)
app.get('/health', async () => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// 2. Rota de Teste de Conexão com o Banco
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

// Hook para fechar a conexão do Prisma ao encerrar a aplicação
app.addHook('onClose', async () => {
  await prisma.$disconnect();
});

// Inicialização do Servidor
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`\n🚀 Servidor Fastify rodando em http://localhost:${port}\n`);
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();