import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PedidoService } from '../../services/pedidoService'
import { StatusPedido, TipoPedido } from '@prisma/client'

describe('services/pedidoService', () => {
  let service: PedidoService
  let mockTx: any

  beforeEach(() => {
    vi.clearAllMocks()
    service = new PedidoService()

    mockTx = {
      saborTamanhoPreco: { findMany: vi.fn() },
      bordaTamanhoPreco: { findUnique: vi.fn() },
      ingrediente: { findUnique: vi.fn(), update: vi.fn() },
      fichaTecnica: { findMany: vi.fn(), createMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
      pedido: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      pedidoItem: { create: vi.fn() },
    }
  })

  describe('criar', () => {
    const inputValido = {
      clienteNome: 'João Silva',
      clienteTelefone: '(11) 99999-9999',
      enderecoEntrega: 'Rua das Flores, 123',
      tipoPedido: TipoPedido.DELIVERY,
      itens: [
        {
          tamanhoId: 1,
          bordaTamanhoId: 2,
          quantidade: 1,
          observacoes: 'Sem cebola',
          sabores: [
            { saborTamanhoId: 1, fracao: 0.5 },
            { saborTamanhoId: 2, fracao: 0.5 },
          ],
        },
      ],
      usuarioId: 1,
    }

    it('deve lançar erro quando itens está vazio', async () => {
      const input = { ...inputValido, itens: [] }
      await expect(service.criar(input)).rejects.toThrow('O pedido deve conter pelo menos um item.')
    })

    it('deve lançar erro quando item não tem sabores', async () => {
      const input = { ...inputValido, itens: [{ ...inputValido.itens[0], sabores: [] }] }
      await expect(service.criar(input)).rejects.toThrow('Cada item de pizza precisa ter pelo menos um sabor.')
    })

    it('deve lançar erro quando sabor não encontrado', async () => {
      mockTx.saborTamanhoPreco.findMany.mockResolvedValue([])

      // Mock $transaction
      const { prisma } = await import('../../lib/prisma')
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))

      await expect(service.criar(inputValido)).rejects.toThrow('Um ou mais sabores informados não foram encontrados.')
    })

    it('deve lançar erro quando borda não encontrada', async () => {
      mockTx.saborTamanhoPreco.findMany.mockResolvedValue([
        { id: 1, precoVenda: 35.0 },
        { id: 2, precoVenda: 40.0 },
      ])
      mockTx.bordaTamanhoPreco.findUnique.mockResolvedValue(null)
      const input = { ...inputValido, itens: [{ ...inputValido.itens[0], bordaTamanhoId: 999 }] }

      // Mock $transaction
      const { prisma } = await import('../../lib/prisma')
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))

      await expect(service.criar(input)).rejects.toThrow('Borda ID 999 não encontrada.')
    })

    it('deve criar pedido com sucesso', async () => {
      mockTx.saborTamanhoPreco.findMany.mockResolvedValue([
        { id: 1, precoVenda: 35.0 },
        { id: 2, precoVenda: 40.0 },
      ])
      mockTx.bordaTamanhoPreco.findUnique.mockResolvedValue({ id: 2, precoVenda: 5.0 })
      mockTx.pedido.create.mockResolvedValue({
        id: 1,
        clienteNome: 'João Silva',
        valorTotal: 80.0,
        itens: [
          {
            id: 1,
            tamanhoId: 1,
            bordaTamanhoId: 2,
            quantidade: 1,
            precoBordaAplicado: 5.0,
            precoUnitarioFinal: 45.0,
            subtotal: 45.0,
            observacoes: 'Sem cebola',
            sabores: [
              { saborTamanhoId: 1, fracao: 0.5, precoSaborAplicado: 35.0 },
              { saborTamanhoId: 2, fracao: 0.5, precoSaborAplicado: 40.0 },
            ],
          },
        ],
      })

      // Mock $transaction
      const { prisma } = await import('../../lib/prisma')
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))

      const resultado = await service.criar(inputValido)

      expect(resultado).toBeDefined()
      expect(resultado.clienteNome).toBe('João Silva')
      expect(mockTx.pedido.create).toHaveBeenCalled()
    })
  })

  describe('listar', () => {
    it('deve listar pedidos com relacionamentos', async () => {
      const { prisma } = await import('../../lib/prisma')
      const pedidosMock = [
        {
          id: 1,
          clienteNome: 'João',
          valorTotal: 50.0,
          itens: [{ id: 1, tamanho: { nome: 'Grande' } }],
        },
      ]
      vi.mocked(prisma.pedido.findMany).mockResolvedValue(pedidosMock)

      const resultado = await service.listar()

      expect(resultado).toEqual(pedidosMock)
      expect(prisma.pedido.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            itens: expect.any(Object),
          }),
          orderBy: { criadoEm: 'desc' },
        })
      )
    })
  })

  describe('atualizarStatus', () => {
    const pedidoMock = {
      id: 1,
      status: StatusPedido.RECEBIDO,
      itens: [
        {
          id: 1,
          quantidade: 1,
          sabores: [
            {
              fracao: 1,
              saborTamanho: {
                fichaTecnica: [
                  { ingredienteId: 'ing-1', quantidadeUsada: 100 },
                ],
              },
            },
          ],
        },
      ],
    }

    it('deve lançar erro quando pedido não encontrado', async () => {
      const { prisma } = await import('../../lib/prisma')
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => {
        const mockTx = {
          pedido: { findUnique: vi.fn().mockResolvedValue(null) },
        }
        return fn(mockTx)
      })

      await expect(service.atualizarStatus(999, StatusPedido.EM_PREPARO)).rejects.toThrow('Pedido ID 999 não encontrado.')
    })

    it('deve permitir cancelamento de EM_PREPARO e restaurar estoque', async () => {
      const { prisma } = await import('../../lib/prisma')
      const pedidoEmPreparo = {
        ...pedidoMock,
        status: StatusPedido.EM_PREPARO,
      }
      const mockTx = {
        pedido: {
          findUnique: vi.fn().mockResolvedValue(pedidoEmPreparo),
          update: vi.fn().mockResolvedValue({ ...pedidoEmPreparo, status: StatusPedido.CANCELADO }),
        },
        ingrediente: {
          update: vi.fn().mockResolvedValue({ estoqueAtual: 1000 }),
        },
        fichaTecnica: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      }
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))

      const resultado = await service.atualizarStatus(1, StatusPedido.CANCELADO)

      expect(resultado.status).toBe(StatusPedido.CANCELADO)
      // Deve chamar increment para restaurar estoque
      expect(mockTx.ingrediente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ing-1' },
          data: { estoqueAtual: { increment: 100 } },
        })
      )
    })

    it('deve permitir cancelamento quando status é RECEBIDO', async () => {
      const { prisma } = await import('../../lib/prisma')
      const mockTx = {
        pedido: {
          findUnique: vi.fn().mockResolvedValue({ ...pedidoMock, status: StatusPedido.RECEBIDO }),
          update: vi.fn().mockResolvedValue({ ...pedidoMock, status: StatusPedido.CANCELADO }),
        },
      }
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))

      const resultado = await service.atualizarStatus(1, StatusPedido.CANCELADO)

      expect(resultado.status).toBe(StatusPedido.CANCELADO)
      expect(mockTx.pedido.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: { status: StatusPedido.CANCELADO },
        })
      )
    })

    it('deve baixar estoque ao entrar em EM_PREPARO', async () => {
      const { prisma } = await import('../../lib/prisma')
      const mockTx = {
        pedido: {
          findUnique: vi.fn().mockResolvedValue(pedidoMock),
          update: vi.fn().mockResolvedValue({ ...pedidoMock, status: StatusPedido.EM_PREPARO }),
        },
        ingrediente: {
          findUnique: vi.fn().mockResolvedValue({ estoqueAtual: 1000 }),
          update: vi.fn().mockResolvedValue({ estoqueAtual: 900 }),
        },
      }
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))

      await service.atualizarStatus(1, StatusPedido.EM_PREPARO)

      expect(mockTx.ingrediente.findUnique).toHaveBeenCalledWith({ where: { id: 'ing-1' }, select: { estoqueAtual: true } })
      expect(mockTx.ingrediente.update).toHaveBeenCalledWith({
        where: { id: 'ing-1' },
        data: { estoqueAtual: { decrement: 100 } },
      })
    })

    it('deve lançar erro se estoque insuficiente', async () => {
      const { prisma } = await import('../../lib/prisma')
      const mockTx = {
        pedido: {
          findUnique: vi.fn().mockResolvedValue(pedidoMock),
        },
        ingrediente: {
          findUnique: vi.fn().mockResolvedValue({ estoqueAtual: 50 }),
        },
      }
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))

      await expect(service.atualizarStatus(1, StatusPedido.EM_PREPARO)).rejects.toThrow('Estoque insuficiente')
    })

    it('deve restaurar estoque ao cancelar pedido que estava em EM_PREPARO', async () => {
      const { prisma } = await import('../../lib/prisma')
      const pedidoComEstoqueBaixado = {
        ...pedidoMock,
        status: StatusPedido.EM_PREPARO,
      }
      const mockTx = {
        pedido: {
          findUnique: vi.fn().mockResolvedValue(pedidoComEstoqueBaixado),
          update: vi.fn().mockResolvedValue({ ...pedidoComEstoqueBaixado, status: StatusPedido.CANCELADO }),
        },
        ingrediente: {
          update: vi.fn().mockResolvedValue({ estoqueAtual: 1000 }),
        },
        fichaTecnica: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      }
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))

      const resultado = await service.atualizarStatus(1, StatusPedido.CANCELADO)

      expect(resultado.status).toBe(StatusPedido.CANCELADO)
      // Deve chamar increment para restaurar estoque
      expect(mockTx.ingrediente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ing-1' },
          data: { estoqueAtual: { increment: 100 } },
        })
      )
    })

    it('deve baixar estoque da borda ao entrar em EM_PREPARO', async () => {
      const { prisma } = await import('../../lib/prisma')
      const pedidoComBorda = {
        ...pedidoMock,
        itens: [
          {
            id: 1,
            quantidade: 1,
            bordaTamanhoId: 2,
            sabores: [
              {
                fracao: 1,
                saborTamanho: {
                  fichaTecnica: [
                    { ingredienteId: 'ing-1', quantidadeUsada: 100 },
                  ],
                },
              },
            ],
          },
        ],
      }
      const mockTx = {
        pedido: {
          findUnique: vi.fn().mockResolvedValue(pedidoComBorda),
          update: vi.fn().mockResolvedValue({ ...pedidoComBorda, status: StatusPedido.EM_PREPARO }),
        },
        ingrediente: {
          findUnique: vi.fn().mockResolvedValue({ estoqueAtual: 1000 }),
          update: vi.fn().mockResolvedValue({ estoqueAtual: 900 }),
        },
        fichaTecnica: {
          findMany: vi.fn().mockResolvedValue([
            { ingredienteId: 'ing-borda-1', quantidadeUsada: 50 },
          ]),
        },
      }
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))

      await service.atualizarStatus(1, StatusPedido.EM_PREPARO)

      // Deve baixar estoque do ingrediente do sabor
      expect(mockTx.ingrediente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ing-1' },
          data: { estoqueAtual: { decrement: 100 } },
        })
      )
      // Deve baixar estoque do ingrediente da borda
      expect(mockTx.ingrediente.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'ing-borda-1' },
          data: { estoqueAtual: { decrement: 50 } },
        })
      )
    })

    it('deve restaurar estoque da borda ao cancelar pedido em EM_PREPARO', async () => {
      const { prisma } = await import('../../lib/prisma')
      const pedidoComBorda = {
        ...pedidoMock,
        status: StatusPedido.EM_PREPARO,
        itens: [
          {
            id: 1,
            quantidade: 1,
            bordaTamanhoId: 2,
            bordaTamanho: { id: 2, borda: { id: 1, nome: 'Catupiry' } },
            sabores: [
              {
                fracao: 1,
                saborTamanho: {
                  fichaTecnica: [
                    { ingredienteId: 'ing-1', quantidadeUsada: 100 },
                  ],
                },
              },
            ],
          },
        ],
      }
      const updateCalls: Array<{ where: { id: string }; data: { estoqueAtual: { increment: number } } }> = []
      const mockTx = {
        pedido: {
          findUnique: vi.fn().mockResolvedValue(pedidoComBorda),
          update: vi.fn().mockResolvedValue({ ...pedidoComBorda, status: StatusPedido.CANCELADO }),
        },
        ingrediente: {
          update: vi.fn().mockImplementation(async (args: any) => {
            updateCalls.push(args)
            return { estoqueAtual: 1000 }
          }),
        },
        fichaTecnica: {
          findMany: vi.fn()
            // Chamada única: fichas da borda (o sabor usa fichaTecnica pré-carregada)
            .mockResolvedValue([
              { ingredienteId: 'ing-borda-1', quantidadeUsada: 50 },
            ]),
        },
      }
      vi.mocked(prisma.$transaction).mockImplementation(async (fn: any) => fn(mockTx))

      const resultado = await service.atualizarStatus(1, StatusPedido.CANCELADO)

      expect(resultado.status).toBe(StatusPedido.CANCELADO)
      // Deve restaurar estoque do ingrediente do sabor
      expect(updateCalls).toContainEqual(
        expect.objectContaining({
          where: { id: 'ing-1' },
          data: { estoqueAtual: { increment: 100 } },
        })
      )
      // Deve restaurar estoque do ingrediente da borda
      expect(updateCalls).toContainEqual(
        expect.objectContaining({
          where: { id: 'ing-borda-1' },
          data: { estoqueAtual: { increment: 50 } },
        })
      )
    })
  })
})