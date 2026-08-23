import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../src/lib/auth'

export async function seedUsuarios(prisma: PrismaClient) {
  const senhaHash = await hashPassword('senha123')

  const usuarios = [
    { nome: 'João Silva', email: 'joao@test.com', senhaHash },
    { nome: 'Maria Santos', email: 'maria@test.com', senhaHash },
    { nome: 'Admin', email: 'admin@test.com', senhaHash },
  ]

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: usuario,
      create: usuario,
    })
  }

  return prisma.usuario.findMany({ orderBy: { id: 'asc' } })
}