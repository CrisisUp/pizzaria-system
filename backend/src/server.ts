import cors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { PrismaClient } from '@prisma/client';
import Fastify from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';

// Imports das rotas
import { ingredientesRoutes } from './routes/ingredientes';
import { pedidosRoutes } from './routes/pedidos';
import { saboresRoutes } from './routes/sabores';
import { tamanhosEBordasRoutes } from './routes/tamanhosEBordas';

// Import da inicialização do Socket.IO
import { initSocket } from './socket';

// 1. Instância do Fastify com Zod Type Provider
const app = Fastify({
  logger: true,
}).withTypeProvider<ZodTypeProvider>();

// 2. Compiladores Zod
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

const prisma = new PrismaClient();

// 3. Registre o CORS permitindo todos os métodos HTTP (incluindo PATCH)
app.register(cors, {
  origin: '*', // ou 'http://localhost:3000'
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // 👈 Adicione PATCH aqui!
});

// 4. OpenAPI / Swagger Documentation
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Sistema de Pizzaria API',
      description: 'Documentação interativa das rotas do backend com validação Zod',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Servidor Local',
      },
    ],
  },
  transform: jsonSchemaTransform,
});

// 5. Interface Swagger UI
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
});

// 6. Registro de Rotas (Prefixos Padronizados)
app.register(ingredientesRoutes, { prefix: '/api/ingredientes' });
app.register(saboresRoutes, { prefix: '/api/sabores' });
app.register(tamanhosEBordasRoutes, { prefix: '/api' });
app.register(pedidosRoutes, { prefix: '/api/pedidos' });

// 7. Healthcheck
app.get('/health', async () => {
  return { status: 'OK', timestamp: new Date().toISOString() };
});

// 8. Teste de Conexão com o Banco
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

// Desconexão limpa do Prisma
app.addHook('onClose', async () => {
  await prisma.$disconnect();
});

// Inicialização
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3333;

    // Aguarda todos os plugins do Fastify carregarem para preparar o servidor HTTP
    await app.ready();

    // Inicializa o Socket.IO acoplado ao servidor HTTP do Fastify
    initSocket(app.server);

    await app.listen({ port, host: '0.0.0.0' });
    
    console.log(`\n🚀 Servidor Fastify v5 rodando em http://localhost:${port}`);
    console.log(`🔌 WebSockets prontos para conexões`);
    console.log(`📚 Documentação Swagger disponível em http://localhost:${port}/docs\n`);
  } catch (err) {
    app.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();