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
    const [broto, media, grande, gigante] = await Promise.all([
      prisma.tamanho.create({
        data: {
          nome: 'Broto',
          fatias: 4,
          maxSabores: 1,
          fatorMultiplicador: new Prisma.Decimal(0.75)
        }
      }),
      prisma.tamanho.create({
        data: {
          nome: 'Média',
          fatias: 6,
          maxSabores: 2,
          fatorMultiplicador: new Prisma.Decimal(1.0)
        }
      }),
      prisma.tamanho.create({
        data: {
          nome: 'Grande',
          fatias: 8,
          maxSabores: 2,
          fatorMultiplicador: new Prisma.Decimal(1.25)
        }
      }),
      prisma.tamanho.create({
        data: {
          nome: 'Gigante',
          fatias: 12,
          maxSabores: 3,
          fatorMultiplicador: new Prisma.Decimal(1.5)
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
      { tamanho: gigante, precoMargherita: 62.90, precoCalabresa: 66.90, precoPortuguesa: 69.90, precoCatupiry: 12.00, precoCheddar: 14.00 },
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

    // 6. FICHA TÉCNICA - Sabores
    console.log('Criando Ficha Técnica dos Sabores...')
    const saborTamanhos = await prisma.saborTamanhoPreco.findMany({
      include: { sabor: true, tamanho: true },
    })

    for (const st of saborTamanhos) {
      const fichaItems: Array<{
        saborTamanhoId: number;
        ingredienteId: string;
        quantidadeUsada: Prisma.Decimal;
        unidadeMedida: string;
      }> = []

      // Buscar ingredientes por nome
      const mussarela = await prisma.ingrediente.findUnique({ where: { nome: 'Muçarela' } })
      const presunto = await prisma.ingrediente.findUnique({ where: { nome: 'Presunto' } })
      const molho = await prisma.ingrediente.findUnique({ where: { nome: 'Molho de Tomate' } })

      if (st.sabor.nome === 'Margherita' && mussarela && molho) {
        fichaItems.push(
          { saborTamanhoId: st.id, ingredienteId: mussarela.id, quantidadeUsada: new Prisma.Decimal(150), unidadeMedida: 'g' },
          { saborTamanhoId: st.id, ingredienteId: molho.id, quantidadeUsada: new Prisma.Decimal(80), unidadeMedida: 'ml' },
        )
      } else if (st.sabor.nome === 'Calabresa' && mussarela && molho) {
        fichaItems.push(
          { saborTamanhoId: st.id, ingredienteId: mussarela.id, quantidadeUsada: new Prisma.Decimal(120), unidadeMedida: 'g' },
          { saborTamanhoId: st.id, ingredienteId: molho.id, quantidadeUsada: new Prisma.Decimal(80), unidadeMedida: 'ml' },
        )
      } else if (st.sabor.nome === 'Portuguesa' && mussarela && presunto && molho) {
        fichaItems.push(
          { saborTamanhoId: st.id, ingredienteId: mussarela.id, quantidadeUsada: new Prisma.Decimal(120), unidadeMedida: 'g' },
          { saborTamanhoId: st.id, ingredienteId: presunto.id, quantidadeUsada: new Prisma.Decimal(80), unidadeMedida: 'g' },
          { saborTamanhoId: st.id, ingredienteId: molho.id, quantidadeUsada: new Prisma.Decimal(80), unidadeMedida: 'ml' },
        )
      }

      if (fichaItems.length > 0) {
        await prisma.fichaTecnica.createMany({ data: fichaItems })
      }
    }

    // 7. FICHA TÉCNICA - Bordas
    console.log('Criando Ficha Técnica das Bordas...')
    const bordaTamanhos = await prisma.bordaTamanhoPreco.findMany({
      include: { borda: true, tamanho: true },
    })

    for (const bt of bordaTamanhos) {
      const catupiryIng = await prisma.ingrediente.findUnique({ where: { nome: 'Catupiry' } })
      const cheddarIng = await prisma.ingrediente.findUnique({ where: { nome: 'Cheddar' } })

      if (bt.borda.nome === 'Catupiry' && catupiryIng) {
        await prisma.fichaTecnica.create({
          data: {
            bordaTamanhoId: bt.id,
            ingredienteId: catupiryIng.id,
            quantidadeUsada: new Prisma.Decimal(100),
            unidadeMedida: 'g',
          },
        })
      } else if (bt.borda.nome === 'Cheddar' && cheddarIng) {
        await prisma.fichaTecnica.create({
          data: {
            bordaTamanhoId: bt.id,
            ingredienteId: cheddarIng.id,
            quantidadeUsada: new Prisma.Decimal(80),
            unidadeMedida: 'g',
          },
        })
      }
    }

    console.log('✅ Seed concluído com sucesso!')
    console.log(`📊 Resumo:
    - ${ingredientes.length} ingredientes criados
    - 3 sabores vinculados a 4 tamanhos
    - 2 bordas vinculadas a 4 tamanhos
    - 4 tamanhos criados
    - Fichas técnicas criadas para sabores e bordas`)

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