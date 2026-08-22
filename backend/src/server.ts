import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import Fastify from 'fastify';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { ingredientesRoutes } from './routes/ingredientes';
import { pedidosRoutes } from './routes/pedidos';
import { pushRoutes } from './routes/push';
import { saboresRoutes } from './routes/sabores';
import { tamanhosEBordasRoutes } from './routes/tamanhosEBordas';
import { initSocket } from './socket';
import { prisma } from './lib/prisma';

const app = Fastify({ logger: true }).withTypeProvider();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// 1. CORS com origens configuráveis via variável de ambiente
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const corsOrigins = corsOrigin.split(',').map((s) => s.trim());

app.register(cors, {
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

// 2. Swagger
app.register(swagger, {
  openapi: {
    info: {
      title: 'Sistema de Pizzaria API',
      description: 'Documentação interativa das rotas do backend com validação Zod',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:3333', description: 'Servidor Local' }],
  },
  transform: jsonSchemaTransform,
});

app.register(swaggerUi, { routePrefix: '/docs' });

// 3. Rotas — ingredientesRoutes já define /ingredientes internamente
app.register(ingredientesRoutes, { prefix: '/api' });
app.register(saboresRoutes, { prefix: '/api/sabores' });
app.register(tamanhosEBordasRoutes, { prefix: '/api' });
app.register(pedidosRoutes, { prefix: '/api/pedidos' });
app.register(pushRoutes, { prefix: '/api/push' });

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
