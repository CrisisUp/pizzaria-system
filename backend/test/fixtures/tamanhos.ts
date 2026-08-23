import { PrismaClient } from '@prisma/client'

export async function seedTamanhos(prisma: PrismaClient) {
  const tamanhos = [
    { nome: 'Broto', fatias: 4, maxSabores: 1, fatorMultiplicador: 0.75 },
    { nome: 'Média', fatias: 6, maxSabores: 2, fatorMultiplicador: 1.0 },
    { nome: 'Grande', fatias: 8, maxSabores: 2, fatorMultiplicador: 1.25 },
    { nome: 'Gigante', fatias: 12, maxSabores: 3, fatorMultiplicador: 1.5 },
  ]

  for (const tamanho of tamanhos) {
    await prisma.tamanho.upsert({
      where: { nome: tamanho.nome },
      update: tamanho,
      create: tamanho,
    })
  }

  return prisma.tamanho.findMany({ orderBy: { id: 'asc' } })
}