import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SaborSelecionado {
  saborTamanhoId: number; // ID da combinação Sabor + Tamanho
  fracao: number;         // Ex: 0.5 para meio-a-meio, 1.0 para inteira
}

interface ItemPizzaInput {
  tamanhoId: number;
  sabores: SaborSelecionado[];
  bordaTamanhoId?: number; // Opcional
}

interface ResultadoCustoPizza {
  custoSabores: number;
  custoBorda: number;
  custoTotalPizza: number;
  detalhamentoIngredientes: Array<{
    nome: string;
    quantidadeCalculada: number;
    unidade: string;
    custoCalculado: number;
  }>;
}

export async function calcularCustoPizza(input: ItemPizzaInput): Promise<ResultadoCustoPizza> {
  let custoSabores = 0;
  let custoBorda = 0;
  const detalhamentoMap = new Map<number, { nome: string; quantidadeCalculada: number; unidade: string; custoCalculado: number }>();

  // 1. Calcular custo dos sabores (recheio)
  for (const itemSabor of input.sabores) {
    const fichasSabores = await prisma.fichaTecnica.findMany({
      where: { saborTamanhoId: itemSabor.saborTamanhoId },
      include: { ingrediente: true }
    });

    for (const ft of fichasSabores) {
      const qtdEfetiva = Number(ft.quantidadeUsada) * itemSabor.fracao;
      const embalagem = Number(ft.ingrediente.quantidadeEmbalagem);
      const precoCompra = Number(ft.ingrediente.precoUltimaCompra);

      const custoInsumo = (qtdEfetiva / embalagem) * precoCompra;
      custoSabores += custoInsumo;

      // Agrupar detalhamento se o mesmo ingrediente aparecer em mais de um sabor
      const idIngrediente = ft.ingrediente.id;
      if (detalhamentoMap.has(idIngrediente)) {
        const existente = detalhamentoMap.get(idIngrediente)!;
        existente.quantidadeCalculada += qtdEfetiva;
        existente.custoCalculado += custoInsumo;
      } else {
        detalhamentoMap.set(idIngrediente, {
          nome: ft.ingrediente.nome,
          quantidadeCalculada: qtdEfetiva,
          unidade: ft.unidadeMedida,
          custoCalculado: custoInsumo
        });
      }
    }
  }

  // 2. Calcular custo da borda (se informada)
  if (input.bordaTamanhoId) {
    const fichasBorda = await prisma.fichaTecnica.findMany({
      where: { bordaTamanhoId: input.bordaTamanhoId },
      include: { ingrediente: true }
    });

    for (const ft of fichasBorda) {
      const qtdEfetiva = Number(ft.quantidadeUsada); // Borda é sempre 100%
      const embalagem = Number(ft.ingrediente.quantidadeEmbalagem);
      const precoCompra = Number(ft.ingrediente.precoUltimaCompra);

      const custoInsumo = (qtdEfetiva / embalagem) * precoCompra;
      custoBorda += custoInsumo;

      const idIngrediente = ft.ingrediente.id;
      if (detalhamentoMap.has(idIngrediente)) {
        const existente = detalhamentoMap.get(idIngrediente)!;
        existente.quantidadeCalculada += qtdEfetiva;
        existente.custoCalculado += custoInsumo;
      } else {
        detalhamentoMap.set(idIngrediente, {
          nome: ft.ingrediente.nome,
          quantidadeCalculada: qtdEfetiva,
          unidade: ft.unidadeMedida,
          custoCalculado: custoInsumo
        });
      }
    }
  }

  return {
    custoSabores: Number(custoSabores.toFixed(2)),
    custoBorda: Number(custoBorda.toFixed(2)),
    custoTotalPizza: Number((custoSabores + custoBorda).toFixed(2)),
    detalhamentoIngredientes: Array.from(detalhamentoMap.values()).map(item => ({
      ...item,
      quantidadeCalculada: Number(item.quantidadeCalculada.toFixed(3)),
      custoCalculado: Number(item.custoCalculado.toFixed(2))
    }))
  };
}