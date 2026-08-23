import { PrismaClient } from '@prisma/client'

export async function seedBordas(prisma: PrismaClient) {
  const bordas = [
    { nome: 'Catupiry' },
    { nome: 'Cheddar' },
    { nome: 'Chocolate' },
    { nome: 'Doce de Leite' },
  ]

  for (const borda of bordas) {
    await prisma.borda.upsert({
      where: { nome: borda.nome },
      update: borda,
      create: borda,
    })
  }

  return prisma.borda.findMany({ orderBy: { id: 'asc' } })
}