import { vi } from 'vitest'

// Mock global do Prisma Client para unit tests
vi.mock('@prisma/client', () => {
  const mockPrisma = {
    usuario: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    pedido: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    sabor: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    saborTamanhoPreco: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
      delete: vi.fn(),
    },
    bordaTamanhoPreco: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
      delete: vi.fn(),
    },
    ingrediente: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    fichaTecnica: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    pushSubscription: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(async (fn) => {
      if (typeof fn === 'function') {
        return fn(mockPrisma)
      }
      return fn
    }),
    $disconnect: vi.fn(),
  }

  return {
    PrismaClient: vi.fn(() => mockPrisma),
    StatusPedido: {
      RECEBIDO: 'RECEBIDO',
      EM_PREPARO: 'EM_PREPARO',
      EM_TRANSPORTE: 'EM_TRANSPORTE',
      CONCLUIDO: 'CONCLUIDO',
      CANCELADO: 'CANCELADO',
    },
    TipoPedido: {
      BALCAO: 'BALCAO',
      DELIVERY: 'DELIVERY',
      MESA: 'MESA',
    },
  }
})

// Mock do web-push para unit tests
vi.mock('web-push', () => ({
  setVapidDetails: vi.fn(),
  sendNotification: vi.fn().mockResolvedValue(undefined),
}))

// Mock do bcrypt - usar factory function
vi.mock('bcrypt', () => ({
  hash: vi.fn().mockResolvedValue('hashed_password'),
  compare: vi.fn().mockResolvedValue(true),
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}))

// Mock do jsonwebtoken - usar factory function
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn().mockReturnValue('mock_token'),
  verify: vi.fn().mockReturnValue({ usuarioId: 1, email: 'test@test.com', nome: 'Test User' }),
  default: {
    sign: vi.fn().mockReturnValue('mock_token'),
    verify: vi.fn().mockReturnValue({ usuarioId: 1, email: 'test@test.com', nome: 'Test User' }),
  },
}))

// Mock do socket.io
vi.mock('socket.io', () => ({
  Server: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    emit: vi.fn(),
  })),
}))

// Limpar todos os mocks antes de cada teste
beforeEach(() => {
  vi.clearAllMocks()
})