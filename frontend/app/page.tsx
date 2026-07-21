'use client';

import axios from 'axios';
import { CheckCircle, Pizza, Plus, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from './services/api';
import { Borda, ItemPizza, Sabor, Tamanho } from './types/pizzaria';

// Função utilitária para converter preços com segurança e evitar NaN
const parsePreco = (valor: unknown): number => {
  if (valor === undefined || valor === null) return 0;
  const num = Number(valor);
  return isNaN(num) ? 0 : num;
};

// Função para remover duplicados de uma lista com base no ID
const removerDuplicados = <T extends { id: number | string }>(array: T[]): T[] => {
  const vistos = new Set();
  return array.filter((item) => {
    if (vistos.has(item.id)) return false;
    vistos.add(item.id);
    return true;
  });
};

export default function Home() {
  const [tamanhos, setTamanhos] = useState<Tamanho[]>([]);
  const [bordas, setBordas] = useState<Borda[]>([]);
  const [sabores, setSabores] = useState<Sabor[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado da pizza que está sendo montada
  const [pizza, setPizza] = useState<ItemPizza>({
    tamanho: null,
    borda: null,
    sabores: [],
    observacoes: '',
  });

  const [clienteNome, setClienteNome] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resTamanhos, resBordas, resSabores] = await Promise.all([
          api.get<Tamanho[]>('/tamanhos'),
          api.get<Borda[]>('/bordas'),
          api.get<Sabor[]>('/sabores'),
        ]);

        // Remove duplicados antes de salvar no estado
        const tamanhosUnicos = removerDuplicados(resTamanhos.data);
        const bordasUnicas = removerDuplicados(resBordas.data);
        const saboresUnicos = removerDuplicados(resSabores.data);

        setTamanhos(tamanhosUnicos);
        setBordas(bordasUnicas);
        setSabores(saboresUnicos);

        // Define o primeiro tamanho por padrão se existir
        if (tamanhosUnicos.length > 0) {
          setPizza((prev) => ({ ...prev, tamanho: tamanhosUnicos[0] }));
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          alert(`Erro ao carregar cardápio: ${err.response?.data?.mensagem || err.message}`);
        } else if (err instanceof Error) {
          alert(`Erro ao carregar cardápio: ${err.message}`);
        } else {
          alert('Erro desconhecido ao carregar cardápio.');
        }
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  // Cálculo dinâmico do preço total
  const precoTotal = () => {
    const base = pizza.tamanho ? parsePreco(pizza.tamanho.precoBase) : 0;
    const borda = pizza.borda ? parsePreco(pizza.borda.precoAdicional) : 0;
    return base + borda;
  };

  const selecionarSabor = (sabor: Sabor) => {
    if (!pizza.tamanho) return;

    const jaSelecionado = pizza.sabores.some((s) => s.id === sabor.id);

    if (jaSelecionado) {
      setPizza({
        ...pizza,
        sabores: pizza.sabores.filter((s) => s.id !== sabor.id),
      });
    } else {
      if (pizza.sabores.length < pizza.tamanho.maxSabores) {
        setPizza({
          ...pizza,
          sabores: [...pizza.sabores, sabor],
        });
      }
    }
  };

  const handleFinalizarPedido = async () => {
    if (!pizza.tamanho || pizza.sabores.length === 0 || !clienteNome.trim()) {
      alert('Por favor, informe seu nome, escolha o tamanho e ao menos 1 sabor.');
      return;
    }

    setEnviando(true);
    try {
      await api.post('/pedidos', {
        clienteNome,
        itens: [
          {
            tamanhoId: pizza.tamanho.id,
            bordaId: pizza.borda?.id,
            saboresIds: pizza.sabores.map((s) => s.id),
            observacao: pizza.observacoes,
          },
        ],
      });

      alert('🚀 Pedido enviado com sucesso!');
      // Reseta o form
      setClienteNome('');
      setPizza({
        tamanho: tamanhos[0] || null,
        borda: null,
        sabores: [],
        observacoes: '',
      });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(`Erro ao fazer pedido: ${err.response?.data?.mensagem || err.message}`);
      } else if (err instanceof Error) {
        alert(`Erro ao fazer pedido: ${err.message}`);
      } else {
        alert('Erro desconhecido ao fazer pedido.');
      }
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p className="animate-pulse flex items-center gap-2">
          <Pizza className="animate-spin" /> Carregando cardápio...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-zinc-800 pb-6">
          <Pizza className="w-10 h-10 text-orange-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Monte sua Pizza</h1>
            <p className="text-zinc-400 text-sm">Escolha o tamanho, borda e seus sabores favoritos!</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Principal: Opções */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Escolha de Tamanho */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-orange-400">1. Escolha o Tamanho</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tamanhos.map((t) => {
                  const ativo = pizza.tamanho?.id === t.id;
                  const preco = parsePreco(t.precoBase);

                  return (
                    <button
                      key={t.id}
                      onClick={() => setPizza({ ...pizza, tamanho: t, sabores: [] })}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        ativo
                          ? 'border-orange-500 bg-orange-500/10 text-white'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <p className="font-bold text-lg">{t.nome}</p>
                      <p className="text-xs text-zinc-400">{t.fatias} fatias • até {t.maxSabores} sabores</p>
                      <p className="text-orange-400 font-semibold mt-2">R$ {preco.toFixed(2)}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 2. Escolha da Borda */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-orange-400">2. Borda Recheada (Opcional)</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setPizza({ ...pizza, borda: null })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    pizza.borda === null
                      ? 'border-orange-500 bg-orange-500/10 text-white'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <p className="font-medium">Sem borda recheada</p>
                  <p className="text-xs text-zinc-500">Massa tradicional</p>
                </button>

                {bordas.map((b) => {
                  const ativo = pizza.borda?.id === b.id;
                  const precoAdicional = parsePreco(b.precoAdicional);

                  return (
                    <button
                      key={b.id}
                      onClick={() => setPizza({ ...pizza, borda: b })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        ativo
                          ? 'border-orange-500 bg-orange-500/10 text-white'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <p className="font-medium">{b.nome}</p>
                      <p className="text-xs text-orange-400">+ R$ {precoAdicional.toFixed(2)}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* 3. Escolha dos Sabores */}
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-orange-400">3. Escolha os Sabores</h2>
                <span className="text-xs text-zinc-400">
                  Selecionados: {pizza.sabores.length} de {pizza.tamanho?.maxSabores || 1}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sabores.map((s) => {
                  const selecionado = pizza.sabores.some((sabor) => sabor.id === s.id);
                  const desabilitado =
                    !selecionado && pizza.sabores.length >= (pizza.tamanho?.maxSabores || 1);

                  return (
                    <button
                      key={s.id}
                      disabled={desabilitado}
                      onClick={() => selecionarSabor(s)}
                      className={`p-4 rounded-xl border text-left transition-all flex justify-between items-start ${
                        selecionado
                          ? 'border-orange-500 bg-orange-500/10 text-white'
                          : desabilitado
                          ? 'border-zinc-900 bg-zinc-900/40 text-zinc-600 cursor-not-allowed'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <p className="font-bold">{s.nome}</p>
                        <p className="text-xs text-zinc-400 mt-1">{s.descricao}</p>
                      </div>
                      {selecionado ? (
                        <CheckCircle className="w-5 h-5 text-orange-500 shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 text-zinc-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

          </div>

          {/* Coluna Lateral: Resumo do Pedido */}
          <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 h-fit space-y-6 sticky top-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <ShoppingBag className="text-orange-500" /> Resumo do Pedido
            </h2>

            <div className="space-y-4 text-sm divide-y divide-zinc-800">
              {/* Cliente */}
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Seu Nome / Mesa:</label>
                <input
                  type="text"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Ex: João Silva - Mesa 04"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Detalhes da Pizza */}
              <div className="pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Tamanho:</span>
                  <span className="font-medium text-white">{pizza.tamanho?.nome || 'Não selecionado'}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Borda:</span>
                  <span className="font-medium text-white">{pizza.borda?.nome || 'Tradicional'}</span>
                </div>

                <div>
                  <span className="text-zinc-400 block mb-1">Sabores ({pizza.sabores.length}):</span>
                  {pizza.sabores.length === 0 ? (
                    <span className="text-xs text-amber-500/80">Selecione ao menos 1 sabor</span>
                  ) : (
                    <ul className="list-disc list-inside text-xs text-zinc-300 space-y-1">
                      {pizza.sabores.map((s) => (
                        <li key={s.id}>{s.nome}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Observações */}
              <div className="pt-4">
                <label className="block text-xs text-zinc-400 mb-1">Observações:</label>
                <textarea
                  value={pizza.observacoes}
                  onChange={(e) => setPizza({ ...pizza, observacoes: e.target.value })}
                  placeholder="Ex: Sem cebola, caprichar no orégano..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500 h-20 resize-none"
                />
              </div>

              {/* Valor Total */}
              <div className="pt-4 flex justify-between items-end">
                <div>
                  <span className="text-xs text-zinc-400 block">Total</span>
                  <span className="text-2xl font-extrabold text-orange-500">
                    R$ {precoTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinalizarPedido}
              disabled={enviando || !pizza.tamanho || pizza.sabores.length === 0}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-orange-600/20 cursor-pointer disabled:cursor-not-allowed"
            >
              {enviando ? 'Enviando...' : 'Confirmar e Fazer Pedido'}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}