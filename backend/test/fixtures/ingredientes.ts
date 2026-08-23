import { PrismaClient } from '@prisma/client'

export async function seedIngredientes(prisma: PrismaClient) {
  const ingredientes = [
    { nome: 'Calabresa', unidadeCompra: 'KG', precoUltimaCompra: 40.0, quantidadeEmbalagem: 1, estoqueAtual: 10 },
    { nome: 'Cebola', unidadeCompra: 'KG', precoUltimaCompra: 8.0, quantidadeEmbalagem: 1, estoqueAtual: 20 },
    { nome: 'Orégano', unidadeCompra: 'KG', precoUltimaCompra: 80.0, quantidadeEmbalagem: 0.1, estoqueAtual: 2 },
    { nome: 'Mussarela', unidadeCompra: 'KG', precoUltimaCompra: 45.0, quantidadeEmbalagem: 1, estoqueAtual: 15 },
    { nome: 'Manjericão', unidadeCompra: 'KG', precoUltimaCompra: 60.0, quantidadeEmbalagem: 0.1, estoqueAtual: 1 },
    { nome: 'Frango', unidadeCompra: 'KG', precoUltimaCompra: 18.0, quantidadeEmbalagem: 1, estoqueAtual: 10 },
    { nome: 'Catupiry', unidadeCompra: 'KG', precoUltimaCompra: 35.0, quantidadeEmbalagem: 1, estoqueAtual: 8 },
    { nome: 'Presunto', unidadeCompra: 'KG', precoUltimaCompra: 30.0, quantidadeEmbalagem: 1, estoqueAtual: 10 },
    { nome: 'Ovos', unidadeCompra: 'UN', precoUltimaCompra: 0.8, quantidadeEmbalagem: 12, estoqueAtual: 60 },
    { nome: 'Azeitona', unidadeCompra: 'KG', precoUltimaCompra: 25.0, quantidadeEmbalagem: 1, estoqueAtual: 5 },
    { nome: 'Ervilha', unidadeCompra: 'KG', precoUltimaCompra: 12.0, quantidadeEmbalagem: 1, estoqueAtual: 10 },
  ]

  for (const ing of ingredientes) {
    await prisma.ingrediente.upsert({
      where: { nome: ing.nome },
      update: ing,
      create: ing,
    })
  }

  return prisma.ingrediente.findMany({ orderBy: { nome: 'asc' } })
}