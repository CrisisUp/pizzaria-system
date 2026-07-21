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

    // 3. INGREDIENTES
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
    const [margherita, calabresa, portuguesa] = await Promise.all([
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

    // 5. PREÇOS DOS SABORES E BORDAS PARA TODOS OS TAMANHOS
    console.log('Criando Preços dos Sabores e Bordas para todos os tamanhos...')
    
    // Lista com os tamanhos e seus preços base
    const configuracaoTamanhos = [
      { tamanho: broto, precoMargherita: 29.90, precoCalabresa: 32.90, precoPortuguesa: 34.90, precoCatupiry: 6.00, precoCheddar: 7.00 },
      { tamanho: media, precoMargherita: 42.90, precoCalabresa: 45.90, precoPortuguesa: 49.90, precoCatupiry: 8.00, precoCheddar: 10.00 },
      { tamanho: grande, precoMargherita: 52.90, precoCalabresa: 56.90, precoPortuguesa: 59.90, precoCatupiry: 10.00, precoCheddar: 12.00 },
    ]

    for (const cfg of configuracaoTamanhos) {
      // Preços dos Sabores
      await prisma.saborTamanhoPreco.createMany({
        data: [
          { saborId: margherita.id, tamanhoId: cfg.tamanho.id, precoVenda: new Prisma.Decimal(cfg.precoMargherita) },
          { saborId: calabresa.id, tamanhoId: cfg.tamanho.id, precoVenda: new Prisma.Decimal(cfg.precoCalabresa) },
          { saborId: portuguesa.id, tamanhoId: cfg.tamanho.id, precoVenda: new Prisma.Decimal(cfg.precoPortuguesa) },
        ]
      })

      // Preços das Bordas
      await prisma.bordaTamanhoPreco.createMany({
        data: [
          { bordaId: catupiry.id, tamanhoId: cfg.tamanho.id, precoVenda: new Prisma.Decimal(cfg.precoCatupiry) },
          { bordaId: cheddar.id, tamanhoId: cfg.tamanho.id, precoVenda: new Prisma.Decimal(cfg.precoCheddar) },
        ]
      })
    }

    console.log('✅ Seed concluído com sucesso!')
    console.log(`📊 Resumo:
    - ${ingredientes.length} ingredientes criados
    - 3 sabores vinculados a 3 tamanhos
    - 2 bordas vinculadas a 3 tamanhos
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