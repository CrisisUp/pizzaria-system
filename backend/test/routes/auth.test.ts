import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import Fastify from 'fastify'
import { validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod'
import { authRoutes } from '../../src/routes/auth'
import { prisma } from '../setup'

describe('routes/auth (Integration)', () => {
  let app: any
  let usuarioId: number

  beforeAll(async () => {
    app = Fastify()
    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)
    await app.register(authRoutes, { prefix: '/api/auth' })
    await app.ready()
  })

  beforeEach(async () => {
    // Limpar usuários antes de cada teste
    await prisma.usuario.deleteMany()
  })

  describe('POST /api/auth/register', () => {
    it('deve registrar novo usuário', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          nome: 'João Silva',
          email: 'joao@test.com',
          senha: 'senha123',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.usuario).toMatchObject({ nome: 'João Silva', email: 'joao@test.com' })
      expect(body.token).toBeDefined()
      usuarioId = body.usuario.id
    })

    it('deve rejeitar email duplicado', async () => {
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { nome: 'João', email: 'joao@test.com', senha: 'senha123' },
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { nome: 'João 2', email: 'joao@test.com', senha: 'senha123' },
      })

      expect(response.statusCode).toBe(409)
      const body = JSON.parse(response.body)
      expect(body.mensagem).toContain('Email já cadastrado')
    })

    it('deve validar dados de entrada', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { nome: 'J', email: 'invalido', senha: '123' },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { nome: 'João', email: 'joao@test.com', senha: 'senha123' },
      })
    })

    it('deve fazer login com credenciais válidas', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'joao@test.com', senha: 'senha123' },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.usuario.email).toBe('joao@test.com')
      expect(body.token).toBeDefined()
    })

    it('deve rejeitar senha incorreta', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'joao@test.com', senha: 'senhaerrada' },
      })

      expect(response.statusCode).toBe(401)
      const body = JSON.parse(response.body)
      expect(body.mensagem).toContain('Credenciais inválidas')
    })

    it('deve rejeitar usuário inexistente', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: { email: 'naoexiste@test.com', senha: 'senha123' },
      })

      expect(response.statusCode).toBe(401)
    })
  })

  describe('GET /api/auth/me', () => {
    let token: string

    beforeEach(async () => {
      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: { nome: 'João', email: 'joao@test.com', senha: 'senha123' },
      })
      token = JSON.parse(registerResponse.body).token
    })

    it('deve retornar dados do usuário autenticado', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.usuario.email).toBe('joao@test.com')
      expect(body.usuario.nome).toBe('João')
    })

    it('deve rejeitar sem token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
      })

      expect(response.statusCode).toBe(401)
    })

    it('deve rejeitar token inválido', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: { authorization: 'Bearer token_invalido' },
      })

      expect(response.statusCode).toBe(401)
    })
  })
})