import { PrismaClient } from '@prisma/client'

export async function seedSabores(prisma: PrismaClient, tamanhos: { id: number; nome: string }[]) {
  const sabores = [
    {
      nome: 'Calabresa',
      descricao: 'Calabresa com cebola e orégano',
      precos: tamanhos.map((t, i) => ({
        tamanhoId: t.id,
        precoVenda: 35 + i * 5,
      })),
      fichaTecnica: tamanhos.flatMap((t, i) => [
        { tamanhoId: t.id, ingredienteId: 'ing-calabresa', quantidadeUsada: 100 + i * 20, unidadeMedida: 'g' },
        { tamanhoId: t.id, ingredienteId: 'ing-cebola', quantidadeUsada: 30 + i * 10, unidadeMedida: 'g' },
        { tamanhoId: t.id, ingredienteId: 'ing-oregano', quantidadeUsada: 5, unidadeMedida: 'g' },
      ]),
    },
    {
      nome: 'Mussarela',
      descricao: 'Mussarela de búfala com manjericão',
      precos: tamanhos.map((t, i) => ({
        tamanhoId: t.id,
        precoVenda: 40 + i * 5,
      })),
      fichaTecnica: tamanhos.flatMap((t, i) => [
        { tamanhoId: t.id, ingredienteId: 'ing-mussarela', quantidadeUsada: 150 + i * 30, unidadeMedida: 'g' },
        { tamanhoId: t.id, ingredienteId: 'ing-manjericao', quantidadeUsada: 10, unidadeMedida: 'g' },
      ]),
    },
    {
      nome: 'Frango com Catupiry',
      descricao: 'Frango desfiado com catupiry',
      precos: tamanhos.map((t, i) => ({
        tamanhoId: t.id,
        precoVenda: 45 + i * 5,
      })),
      fichaTecnica: tamanhos.flatMap((t, i) => [
        { tamanhoId: t.id, ingredienteId: 'ing-frango', quantidadeUsada: 120 + i * 25, unidadeMedida: 'g' },
        { tamanhoId: t.id, ingredienteId: 'ing-catupiry', quantidadeUsada: 80 + i * 15, unidadeMedida: 'g' },
      ]),
    },
    {
      nome: 'Portuguesa',
      descricao: 'Presunto, ovos, cebola, azeitona, ervilha',
      precos: tamanhos.map((t, i) => ({
        tamanhoId: t.id,
        precoVenda: 50 + i * 5,
      })),
      fichaTecnica: tamanhos.flatMap((t, i) => [
        { tamanhoId: t.id, ingredienteId: 'ing-presunto', quantidadeUsada: 80 + i * 15, unidadeMedida: 'g' },
        { tamanhoId: t.id, ingredienteId: 'ing-ovos', quantidadeUsada: 2, unidadeMedida: 'un' },
        { tamanhoId: t.id, ingredienteId: 'ing-cebola', quantidadeUsada: 30 + i * 10, unidadeMedida: 'g' },
        { tamanhoId: t.id, ingredienteId: 'ing-azeitona', quantidadeUsada: 20, unidadeMedida: 'g' },
        { tamanhoId: t.id, ingredienteId: 'ing-ervilha', quantidadeUsada: 30, unidadeMedida: 'g' },
      ]),
    },
  ]

  for (const sabor of sabores) {
    const criado = await prisma.sabor.upsert({
      where: { nome: sabor.nome },
      update: { descricao: sabor.descricao },
      create: { nome: sabor.nome, descricao: sabor.descricao },
    })

    for (const preco of sabor.precos) {
      const saborTamanho = await prisma.saborTamanhoPreco.upsert({
        where: { saborId_tamanhoId: { saborId: criado.id, tamanhoId: preco.tamanhoId } },
        update: { precoVenda: preco.precoVenda },
        create: { saborId: criado.id, tamanhoId: preco.tamanhoId, precoVenda: preco.precoVenda },
      })

      const fichaParaTamanho = sabor.fichaTecnica.filter((ft) => ft.tamanhoId === preco.tamanhoId)
      if (fichaParaTamanho.length > 0) {
        await prisma.fichaTecnica.deleteMany({ where: { saborTamanhoId: saborTamanho.id } })
        await prisma.fichaTecnica.createMany({
          data: fichaParaTamanho.map((ft) => ({
            saborTamanhoId: saborTamanho.id,
            ingredienteId: ft.ingredienteId,
            quantidadeUsada: ft.quantidadeUsada,
            unidadeMedida: ft.unidadeMedida,
          })),
        })
      }
    }
  }

  return prisma.sabor.findMany({ include: { saborPrecos: true }, orderBy: { id: 'asc' } })
}