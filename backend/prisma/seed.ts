// backend/prisma/seed.ts
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando o povoamento do banco de dados (Seed)...')
  
  try {
    // Limpar dados antigos (ordem correta para evitar violação de FK)
    console.log('Limpando dados antigos...')
    await prisma.$transaction([
      prisma.pedidoItemSabor.deleteMany(),
      prisma.pedidoItem.deleteMany(),
      prisma.pedido.deleteMany(),
      prisma.fichaTecnica.deleteMany(),
      prisma.ingrediente.deleteMany(),
      prisma.bordaTamanhoPreco.deleteMany(),
      prisma.saborTamanhoPreco.deleteMany(),
      prisma.sabor.deleteMany(),
      prisma.borda.deleteMany(),
      prisma.tamanho.deleteMany(),
    ])

    // 1. TAMANHOS
    console.log('Criando Tamanhos...')
    const [broto, media, grande] = await Promise.all([
      prisma.tamanho.create({
        data: {
          nome: 'Broto',
          fatias: 4,
          fatorMultiplicador: new Prisma.Decimal(0.6)
        }
      }),
      prisma.tamanho.create({
        data: {
          nome: 'Média',
          fatias: 8,
          fatorMultiplicador: new Prisma.Decimal(1.0)
        }
      }),
      prisma.tamanho.create({
        data: {
          nome: 'Grande',
          fatias: 10,
          fatorMultiplicador: new Prisma.Decimal(1.3)
        }
      })
    ])

    // 2. BORDAS
    console.log('Criando Bordas...')
    const [catupiry, cheddar] = await Promise.all([
      prisma.borda.create({
        data: { nome: 'Catupiry' }
      }),
      prisma.borda.create({
        data: { nome: 'Cheddar' }
      })
    ])

    // 3. INGREDIENTES - CORRIGIDO
    console.log('Criando Ingredientes...')
    const ingredientes = await Promise.all([
      prisma.ingrediente.create({
        data: {
          nome: 'Muçarela',
          unidadeCompra: 'KG',
          precoUltimaCompra: new Prisma.Decimal(35.90),
          quantidadeEmbalagem: new Prisma.Decimal(1.000)
        }
      }),
      prisma.ingrediente.create({
        data: {
          nome: 'Presunto',
          unidadeCompra: 'KG',
          precoUltimaCompra: new Prisma.Decimal(28.50),
          quantidadeEmbalagem: new Prisma.Decimal(1.000)
        }
      }),
      prisma.ingrediente.create({
        data: {
          nome: 'Molho de Tomate',
          unidadeCompra: 'L',
          precoUltimaCompra: new Prisma.Decimal(12.90),
          quantidadeEmbalagem: new Prisma.Decimal(1.000)
        }
      })
    ])

    // 4. SABORES
    console.log('Criando Sabores...')
    const sabores = await Promise.all([
      prisma.sabor.create({
        data: { nome: 'Margherita', descricao: 'Muçarela, molho e manjericão' }
      }),
      prisma.sabor.create({
        data: { nome: 'Calabresa', descricao: 'Calabresa, cebola e azeitonas' }
      }),
      prisma.sabor.create({
        data: { nome: 'Portuguesa', descricao: 'Presunto, ovo, cebola e azeitonas' }
      })
    ])

    // 5. PREÇOS DOS SABORES POR TAMANHO
    console.log('Criando Preços dos Sabores...')
    await Promise.all([
      prisma.saborTamanhoPreco.create({
        data: {
          saborId: sabores[0].id,
          tamanhoId: media.id,
          precoVenda: new Prisma.Decimal(45.90)
        }
      }),
      prisma.saborTamanhoPreco.create({
        data: {
          saborId: sabores[1].id,
          tamanhoId: media.id,
          precoVenda: new Prisma.Decimal(49.90)
        }
      })
    ])

    // 6. PREÇOS DAS BORDAS POR TAMANHO
    console.log('Criando Preços das Bordas...')
    await Promise.all([
      prisma.bordaTamanhoPreco.create({
        data: {
          bordaId: catupiry.id,
          tamanhoId: media.id,
          precoVenda: new Prisma.Decimal(8.00)
        }
      }),
      prisma.bordaTamanhoPreco.create({
        data: {
          bordaId: cheddar.id,
          tamanhoId: media.id,
          precoVenda: new Prisma.Decimal(10.00)
        }
      })
    ])

    console.log('✅ Seed concluído com sucesso!')
    console.log(`📊 Resumo:
    - ${ingredientes.length} ingredientes criados
    - ${sabores.length} sabores criados
    - 2 bordas criadas
    - 3 tamanhos criados`)

  } catch (error) {
    console.error('❌ Erro durante o povoamento do banco:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })