import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o povoamento do banco de dados (Seed)...');

  // ----------------------------------------------------------------
  // 1. TAMANHOS DE PIZZA
  // ----------------------------------------------------------------
  console.log('Criando Tamanhos...');
  const broto = await prisma.tamanho.create({
    data: { nome: 'Broto', fatias: 4, fatorMultiplicador: 0.60 },
  });

  const media = await prisma.tamanho.create({
    data: { nome: 'Média', fatias: 6, fatorMultiplicador: 0.80 },
  });

  const grande = await prisma.tamanho.create({
    data: { nome: 'Grande', fatias: 8, fatorMultiplicador: 1.00 },
  });

  // ----------------------------------------------------------------
  // 2. BORDAS RECHEADAS
  // ----------------------------------------------------------------
  console.log('Criando Bordas...');
  const bordaCatupiry = await prisma.borda.create({ data: { nome: 'Catupiry Original' } });
  const bordaCheddar = await prisma.borda.create({ data: { nome: 'Cheddar' } });
  const bordaChocolate = await prisma.borda.create({ data: { nome: 'Chocolate' } });

  // Preço da Borda por Tamanho (ex: Catupiry na Pizza Grande)
  const bordaCatupiryGrande = await prisma.bordaTamanhoPreco.create({
    data: { bordaId: bordaCatupiry.id, tamanhoId: grande.id, precoVenda: 10.00 },
  });

  // ----------------------------------------------------------------
  // 3. INGREDIENTES / INSUMOS
  // ----------------------------------------------------------------
  console.log('Criando Ingredientes...');
  const mucarela = await prisma.ingrediente.create({
    data: {
      nome: 'Queijo Muçarela',
      unidadeCompra: 'KG',
      precoUltimaCompra: 35.00, // R$ 35,00 por KG
      quantidadeEmbalagem: 1.000,
    },
  });

  const molhoTomate = await prisma.ingrediente.create({
    data: {
      nome: 'Molho de Tomate',
      unidadeCompra: 'KG',
      precoUltimaCompra: 8.00, // R$ 8,00 por KG
      quantidadeEmbalagem: 1.000,
    },
  });

  const calabresa = await prisma.ingrediente.create({
    data: {
      nome: 'Linguiça Calabresa',
      unidadeCompra: 'KG',
      precoUltimaCompra: 28.00, // R$ 28,00 por KG
      quantidadeEmbalagem: 1.000,
    },
  });

  const requeijao = await prisma.ingrediente.create({
    data: {
      nome: 'Requeijão Catupiry',
      unidadeCompra: 'KG',
      precoUltimaCompra: 32.00, // R$ 32,00 por KG
      quantidadeEmbalagem: 1.000,
    },
  });

  const caixaGrande = await prisma.ingrediente.create({
    data: {
      nome: 'Caixa de Pizza Grande',
      unidadeCompra: 'UN',
      precoUltimaCompra: 2.50, // R$ 2,50 por unidade
      quantidadeEmbalagem: 1.000,
    },
  });

  // Ficha técnica da Borda de Catupiry na Pizza Grande (150g de Requeijão)
  await prisma.fichaTecnica.create({
    data: {
      ingredienteId: requeijao.id,
      bordaTamanhoId: bordaCatupiryGrande.id,
      quantidadeUsada: 0.150, // 150g
      unidadeMedida: 'KG',
    },
  });

  // ----------------------------------------------------------------
  // 4. SABORES, PREÇOS E FICHAS TÉCNICAS
  // ----------------------------------------------------------------
  console.log('Criando Sabores e Fichas Técnicas...');

  // --- SABOR 1: CALABRESA ---
  const saborCalabresa = await prisma.sabor.create({
    data: {
      nome: 'Calabresa',
      descricao: 'Molho de tomate, muçarela, fatias de calabresa e cebola.',
    },
  });

  const calabresaGrande = await prisma.saborTamanhoPreco.create({
    data: { saborId: saborCalabresa.id, tamanhoId: grande.id, precoVenda: 50.00 },
  });

  // Ficha técnica Calabresa Grande (Molho: 100g, Muçarela: 150g, Calabresa: 200g)
  await prisma.fichaTecnica.createMany({
    data: [
      { ingredienteId: molhoTomate.id, saborTamanhoId: calabresaGrande.id, quantidadeUsada: 0.100, unidadeMedida: 'KG' },
      { ingredienteId: mucarela.id, saborTamanhoId: calabresaGrande.id, quantidadeUsada: 0.150, unidadeMedida: 'KG' },
      { ingredienteId: calabresa.id, saborTamanhoId: calabresaGrande.id, quantidadeUsada: 0.200, unidadeMedida: 'KG' },
    ],
  });

  // --- SABOR 2: QUATRO QUEIJOS ---
  const saborQuatroQueijos = await prisma.sabor.create({
    data: {
      nome: 'Quatro Queijos',
      descricao: 'Molho de tomate, muçarela, requeijão, provolone e parmesão.',
    },
  });

  const quatroQueijosGrande = await prisma.saborTamanhoPreco.create({
    data: { saborId: saborQuatroQueijos.id, tamanhoId: grande.id, precoVenda: 60.00 },
  });

  // Ficha técnica Quatro Queijos Grande
  await prisma.fichaTecnica.createMany({
    data: [
      { ingredienteId: molhoTomate.id, saborTamanhoId: quatroQueijosGrande.id, quantidadeUsada: 0.100, unidadeMedida: 'KG' },
      { ingredienteId: mucarela.id, saborTamanhoId: quatroQueijosGrande.id, quantidadeUsada: 0.250, unidadeMedida: 'KG' },
      { ingredienteId: requeijao.id, saborTamanhoId: quatroQueijosGrande.id, quantidadeUsada: 0.150, unidadeMedida: 'KG' },
    ],
  });

  // --- SABOR 3: FRANGO C/ CATUPIRY ---
  const saborFrangoCatupiry = await prisma.sabor.create({
    data: {
      nome: 'Frango com Catupiry',
      descricao: 'Molho de tomate, muçarela, frango desfiado temperado e requeijão catupiry.',
    },
  });

  const frangoCatupiryGrande = await prisma.saborTamanhoPreco.create({
    data: { saborId: saborFrangoCatupiry.id, tamanhoId: grande.id, precoVenda: 58.00 },
  });

  // Ficha técnica Frango c/ Catupiry Grande
  await prisma.fichaTecnica.createMany({
    data: [
      { ingredienteId: molhoTomate.id, saborTamanhoId: frangoCatupiryGrande.id, quantidadeUsada: 0.100, unidadeMedida: 'KG' },
      { ingredienteId: mucarela.id, saborTamanhoId: frangoCatupiryGrande.id, quantidadeUsada: 0.150, unidadeMedida: 'KG' },
      { ingredienteId: requeijao.id, saborTamanhoId: frangoCatupiryGrande.id, quantidadeUsada: 0.200, unidadeMedida: 'KG' },
    ],
  });

  console.log('✅ Banco de dados povoado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o povoamento do banco:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });