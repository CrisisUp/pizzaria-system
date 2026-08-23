import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../lib/auth';
import { loginSchema, registerSchema } from '../schemas/authSchema';

export async function authRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/auth/register
  server.post(
    '/register',
    { schema: registerSchema },
    async (request, reply) => {
      try {
        const { nome, email, senha } = request.body;

        // Verifica se email já existe
        const existingUser = await prisma.usuario.findUnique({ where: { email } });
        if (existingUser) {
          return reply.status(409).send({ mensagem: 'Email já cadastrado.' });
        }

        const senhaHash = await hashPassword(senha);

        const usuario = await prisma.usuario.create({
          data: { nome, email, senhaHash },
          select: { id: true, nome: true, email: true, criadoEm: true },
        });

        const token = generateToken({
          usuarioId: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
        });

        return reply.status(201).send({ usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email }, token });
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({ mensagem: 'Erro ao cadastrar usuário.', detalhe: error.message });
      }
    }
  );

  // POST /api/auth/login
  server.post(
    '/login',
    { schema: loginSchema },
    async (request, reply) => {
      try {
        const { email, senha } = request.body;

        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario) {
          return reply.status(401).send({ mensagem: 'Credenciais inválidas.' });
        }

        const senhaValida = await comparePassword(senha, usuario.senhaHash);
        if (!senhaValida) {
          return reply.status(401).send({ mensagem: 'Credenciais inválidas.' });
        }

        const token = generateToken({
          usuarioId: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
        });

        return reply.send({
          usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
          token,
        });
      } catch (error: any) {
        app.log.error(error);
        return reply.status(400).send({ mensagem: 'Erro ao fazer login.', detalhe: error.message });
      }
    }
  );

  // GET /api/auth/me
  server.get(
    '/me',
    async (request, reply) => {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return reply.status(401).send({ mensagem: 'Token não fornecido.' });
      }

      const token = authHeader.slice(7);
      const payload = verifyToken(token);
      if (!payload) {
        return reply.status(401).send({ mensagem: 'Token inválido ou expirado.' });
      }

      const usuario = await prisma.usuario.findUnique({
        where: { id: payload.usuarioId },
        select: { id: true, nome: true, email: true, criadoEm: true },
      });

      if (!usuario) {
        return reply.status(404).send({ mensagem: 'Usuário não encontrado.' });
      }

      return reply.send({ usuario });
    }
  );
}

export { verifyToken };