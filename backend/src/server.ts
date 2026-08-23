import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { authRoutes } from './routes/auth';
import { ingredientesRoutes } from './routes/ingredientes';
import { pedidosRoutes } from './routes/pedidos';
import { pushRoutes } from './routes/push';
import { saboresRoutes } from './routes/sabores';
import { tamanhosEBordasRoutes } from './routes/tamanhosEBordas';
import { initSocket } from './socket';
import { prisma } from './lib/prisma';
import { getCorsOrigins } from './lib/cors';

const app = Fastify({ logger: true }).withTypeProvider();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// 1. CORS com origens configuráveis via variável de ambiente
const corsOrigins = getCorsOrigins();

app.register(cors, {
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

// 2. Rate Limiting
app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
  keyGenerator: (request) => request.ip || request.socket.remoteAddress || '127.0.0.1',
  errorResponseBuilder: (_request, context) => ({
    statusCode: 429,
    error: 'Too Many Requests',
    mensagem: `Rate limit excedido. Tente novamente em ${Math.ceil(context.ttl / 1000)} segundos.`,
  }),
});

// 3. Swagger
app.register(swagger, {
  openapi: {
    info: {
      title: 'Sistema de Pizzaria API',
      description: 'Documentação interativa das rotas do backend com validação Zod',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3333', description: 'Servidor Local' }],
  },
});

app.register(swaggerUi, { routePrefix: '/docs' });

// 3. Rotas — ingredientesRoutes já define /ingredientes internamente
app.register(ingredientesRoutes, { prefix: '/api' });
app.register(saboresRoutes, { prefix: '/api/sabores' });
app.register(tamanhosEBordasRoutes, { prefix: '/api' });
app.register(pedidosRoutes, { prefix: '/api/pedidos' });
app.register(pushRoutes, { prefix: '/api/push' });
app.register(authRoutes, { prefix: '/api/auth' });

// 4. Healthcheck
app.get('/health', async () => ({ status: 'OK', timestamp: new Date().toISOString() }));

// 5. Desconexão limpa do Prisma
app.addHook('onClose', async () => {
  await prisma.$disconnect();
});

// 6. Start
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;
    await app.ready();
    initSocket(app.server);
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Servidor Fastify v5 rodando em http://localhost:${port}`);
    console.log(`📚 Swagger em http://localhost:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
