import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import Fastify from 'fastify'
import { pedidosRoutes } from '../../src/routes/pedidos'
import { saboresRoutes } from '../../src/routes/sabores'
import { tamanhosEBordasRoutes } from '../../src/routes/tamanhosEBordas'
import { ingredientesRoutes } from '../../src/routes/ingredientes'
import { prisma } from '../setup'
import { seedTamanhos } from '../fixtures/tamanhos'
import { seedBordas } from '../fixtures/bordas'
import { seedSabores } from '../fixtures/sabores'
import { seedIngredientes } from '../fixtures/ingredientes'

describe('routes/pedidos (Integration)', () => {
  let app: any
  let tamanhos: any[]
  let bordas: any[]
  let sabores: any[]
  let ingredientes: any[]
  let saborTamanhoIds: number[]

  beforeAll(async () => {
    app = Fastify()
    await app.register(ingredientesRoutes, { prefix: '/api' })
    await app.register(tamanhosEBordasRoutes, { prefix: '/api' })
    await app.register(saboresRoutes, { prefix: '/api/sabores' })
    await app.register(pedidosRoutes, { prefix: '/api/pedidos' })
    await app.ready()

    // Seed data
    ingredientes = await seedIngredientes(prisma)
    tamanhos = await seedTamanhos(prisma)
    bordas = await seedBordas(prisma)
    sabores = await seedSabores(prisma, tamanhos)

    // Get saborTamanhoIds for testing
    const saborTamanhos = await prisma.saborTamanhoPreco.findMany({
      include: { sabor: true, tamanho: true },
    })
    saborTamanhoIds = saborTamanhos.map((st) => st.id)
  })

  beforeEach(async () => {
    await prisma.pedido.deleteMany()
    await prisma.pedidoItem.deleteMany()
    await prisma.pedidoItemSabor.deleteMany()
  })

  describe('GET /api/pedidos', () => {
    it('deve listar pedidos vazios inicialmente', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pedidos',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toEqual([])
    })

    it('deve listar pedidos criados', async () => {
      // Criar um pedido
      await app.inject({
        method: 'POST',
        url: '/api/pedidos',
        payload: {
          clienteNome: 'João Silva',
          tipoPedido: 'BALCAO',
          itens: [
            {
              tamanhoId: tamanhos[0].id,
              quantidade: 1,
              sabores: [{ saborTamanhoId: saborTamanhoIds[0], fracao: 1 }],
            },
          ],
        },
      })

      const response = await app.inject({
        method: 'GET',
        url: '/api/pedidos',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body).toHaveLength(1)
      expect(body[0].clienteNome).toBe('João Silva')
    })
  })

  describe('POST /api/pedidos', () => {
    it('deve criar pedido balcão simples', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pedidos',
        payload: {
          clienteNome: 'João Silva',
          tipoPedido: 'BALCAO',
          itens: [
            {
              tamanhoId: tamanhos[0].id,
              quantidade: 1,
              sabores: [{ saborTamanhoId: saborTamanhoIds[0], fracao: 1 }],
            },
          ],
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.clienteNome).toBe('João Silva')
      expect(body.tipoPedido).toBe('BALCAO')
      expect(body.status).toBe('RECEBIDO')
      expect(body.valorTotal).toBeGreaterThan(0)
      expect(body.itens).toHaveLength(1)
    })

    it('deve criar pedido delivery com telefone e endereço', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pedidos',
        payload: {
          clienteNome: 'Maria Santos',
          clienteTelefone: '(11) 99999-9999',
          enderecoEntrega: 'Rua das Flores, 123',
          tipoPedido: 'DELIVERY',
          itens: [
            {
              tamanhoId: tamanhos[1].id,
              quantidade: 2,
              sabores: [
                { saborTamanhoId: saborTamanhoIds[0], fracao: 0.5 },
                { saborTamanhoId: saborTamanhoIds[1], fracao: 0.5 },
              ],
            },
          ],
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.tipoPedido).toBe('DELIVERY')
      expect(body.clienteTelefone).toBe('(11) 99999-9999')
      expect(body.enderecoEntrega).toBe('Rua das Flores, 123')
      expect(body.itens[0].quantidade).toBe(2)
      expect(body.itens[0].sabores).toHaveLength(2)
    })

    it('deve criar pedido com borda', async () => {
      const bordaTamanho = await prisma.bordaTamanhoPreco.findFirst({
        where: { bordaId: bordas[0].id, tamanhoId: tamanhos[0].id },
      })

      const response = await app.inject({
        method: 'POST',
        url: '/api/pedidos',
        payload: {
          clienteNome: 'Pedro',
          tipoPedido: 'MESA',
          itens: [
            {
              tamanhoId: tamanhos[0].id,
              bordaTamanhoId: bordaTamanho?.id,
              quantidade: 1,
              sabores: [{ saborTamanhoId: saborTamanhoIds[0], fracao: 1 }],
            },
          ],
        },
      })

      expect(response.statusCode).toBe(201)
      const body = JSON.parse(response.body)
      expect(body.itens[0].bordaTamanhoId).toBe(bordaTamanho?.id)
      expect(body.valorTotal).toBeGreaterThan(0)
    })

    it('deve rejeitar pedido sem itens', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pedidos',
        payload: {
          clienteNome: 'João',
          tipoPedido: 'BALCAO',
          itens: [],
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('deve rejeitar item sem sabores', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pedidos',
        payload: {
          clienteNome: 'João',
          tipoPedido: 'BALCAO',
          itens: [{ tamanhoId: tamanhos[0].id, quantidade: 1, sabores: [] }],
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('deve rejeitar tamanho inexistente', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pedidos',
        payload: {
          clienteNome: 'João',
          tipoPedido: 'BALCAO',
          itens: [{ tamanhoId: 999, quantidade: 1, sabores: [{ saborTamanhoId: saborTamanhoIds[0], fracao: 1 }] }],
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('deve aplicar rate limiting', async () => {
      // Make 11 requests (limit is 10 per minute)
      for (let i = 0; i < 11; i++) {
        await app.inject({
          method: 'POST',
          url: '/api/pedidos',
          payload: {
            clienteNome: `Cliente ${i}`,
            tipoPedido: 'BALCAO',
            itens: [{ tamanhoId: tamanhos[0].id, quantidade: 1, sabores: [{ saborTamanhoId: saborTamanhoIds[0], fracao: 1 }] }],
          },
        })
      }

      const response = await app.inject({
        method: 'POST',
        url: '/api/pedidos',
        payload: {
          clienteNome: 'Rate Limited',
          tipoPedido: 'BALCAO',
          itens: [{ tamanhoId: tamanhos[0].id, quantidade: 1, sabores: [{ saborTamanhoId: saborTamanhoIds[0], fracao: 1 }] }],
        },
      })

      expect(response.statusCode).toBe(429)
    })
  })

  describe('PATCH /api/pedidos/:id/status', () => {
    let pedidoId: number

    beforeEach(async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pedidos',
        payload: {
          clienteNome: 'Teste Status',
          tipoPedido: 'BALCAO',
          itens: [{ tamanhoId: tamanhos[0].id, quantidade: 1, sabores: [{ saborTamanhoId: saborTamanhoIds[0], fracao: 1 }] }],
        },
      })
      pedidoId = JSON.parse(response.body).id
    })

    it('deve atualizar status para EM_PREPARO', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/pedidos/${pedidoId}/status`,
        payload: { status: 'EM_PREPARO' },
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.body)
      expect(body.status).toBe('EM_PREPARO')
    })

    it('deve atualizar status sequencialmente', async () => {
      const statuses = ['EM_PREPARO', 'EM_TRANSPORTE', 'CONCLUIDO']
      for (const status of statuses) {
        const response = await app.inject({
          method: 'PATCH',
          url: `/api/pedidos/${pedidoId}/status`,
          payload: { status },
        })
        expect(response.statusCode).toBe(200)
        expect(JSON.parse(response.body).status).toBe(status)
      }
    })

    it('deve permitir cancelar pedido RECEBIDO', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/pedidos/${pedidoId}/status`,
        payload: { status: 'CANCELADO' },
      })

      expect(response.statusCode).toBe(200)
      expect(JSON.parse(response.body).status).toBe('CANCELADO')
    })

    it('deve bloquear cancelamento após EM_PREPARO', async () => {
      // Move to EM_PREPARO
      await app.inject({
        method: 'PATCH',
        url: `/api/pedidos/${pedidoId}/status`,
        payload: { status: 'EM_PREPARO' },
      })

      // Try to cancel
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/pedidos/${pedidoId}/status`,
        payload: { status: 'CANCELADO' },
      })

      expect(response.statusCode).toBe(500)
      const body = JSON.parse(response.body)
      expect(body.mensagem).toContain('Não é possível cancelar')
    })

    it('deve rejeitar status inválido', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: `/api/pedidos/${pedidoId}/status`,
        payload: { status: 'INVALIDO' },
      })

      expect(response.statusCode).toBe(400)
    })

    it('deve rejeitar pedido inexistente', async () => {
      const response = await app.inject({
        method: 'PATCH',
        url: '/api/pedidos/99999/status',
        payload: { status: 'EM_PREPARO' },
      })

      expect(response.statusCode).toBe(500)
    })
  })
})