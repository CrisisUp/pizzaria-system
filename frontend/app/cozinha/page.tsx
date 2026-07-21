'use client';

import axios from 'axios';
import {
  AlertCircle,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { api } from '../services/api';
import { Pedido, StatusPedido } from '../types/pizzaria';

const COLUNAS: { key: StatusPedido; label: string; icon: typeof Clock; color: string }[] = [
  { key: 'RECEBIDO', label: 'Recebido', icon: Clock, color: 'text-amber-400 border-amber-500/30' },
  { key: 'EM_PREPARO', label: 'Em Preparo', icon: ChefHat, color: 'text-blue-400 border-blue-500/30' },
  { key: 'EM_TRANSPORTE', label: 'Em Transporte', icon: Flame, color: 'text-orange-400 border-orange-500/30' },
  { key: 'CONCLUIDO', label: 'Concluído', icon: CheckCircle2, color: 'text-emerald-400 border-emerald-500/30' },
  { key: 'CANCELADO', label: 'Cancelado', icon: PackageCheck, color: 'text-zinc-500 border-zinc-800' },
];

const PROXIMO_STATUS: Partial<Record<StatusPedido, StatusPedido | null>> = {
  RECEBIDO: 'EM_PREPARO',
  EM_PREPARO: 'EM_TRANSPORTE',
  EM_TRANSPORTE: 'CONCLUIDO',
  CONCLUIDO: null,
  CANCELADO: null,
};

export default function CozinhaPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null);

  // Recarga manual via botão
  const recarregarPedidosManualmente = async () => {
    try {
      const response = await api.get<Pedido[]>('/pedidos');
      setPedidos(response.data);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('Erro ao recarregar pedidos:', err.response?.data?.mensagem || err.message);
      } else if (err instanceof Error) {
        console.error('Erro ao recarregar pedidos:', err.message);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Carrega os pedidos pela primeira vez
    async function buscarPedidosIniciais() {
      try {
        const response = await api.get<Pedido[]>('/pedidos');
        if (isMounted) {
          setPedidos(response.data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          if (axios.isAxiosError(err)) {
            console.error('Erro ao buscar pedidos:', err.response?.data?.mensagem || err.message);
          } else if (err instanceof Error) {
            console.error('Erro ao buscar pedidos:', err.message);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    buscarPedidosIniciais();

    // 2. Inicializa o Socket.IO para ouvir eventos em tempo real
    const socket = io("http://localhost:3333", {
      transports: ["websocket"],
    });

    // ⚡ Escuta novos pedidos criados pelo cliente
    socket.on('pedido:criado', (novoPedido: Pedido) => {
      console.log('🍕 Novo pedido recebido via WebSocket:', novoPedido);
      setPedidos((prev) => [novoPedido, ...prev]);
    });

    // Fallback: caso o evento emitido no backend seja 'novoPedido'
    socket.on('novoPedido', (novoPedido: Pedido) => {
      console.log('🍕 Novo pedido recebido via WebSocket:', novoPedido);
      setPedidos((prev) => [novoPedido, ...prev]);
    });

    // ⚡ Escuta alterações de status dos pedidos
    socket.on('pedido:atualizado', (pedidoAtualizado: Pedido) => {
      console.log('🔄 Status de pedido atualizado via WebSocket:', pedidoAtualizado);
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoAtualizado.id ? pedidoAtualizado : p))
      );
    });

    // Desconecta ao desmontar o componente
    return () => {
      isMounted = false;
      socket.off('pedido:criado');
      socket.off('novoPedido');
      socket.off('pedido:atualizado');
      socket.disconnect();
    };
  }, []);

  const alterarStatus = async (pedidoId: number, novoStatus: StatusPedido) => {
    setAtualizandoId(pedidoId);
    try {
      await api.patch(`/pedidos/${pedidoId}/status`, { status: novoStatus });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(`Erro ao atualizar status: ${err.response?.data?.mensagem || err.message}`);
      } else if (err instanceof Error) {
        alert(`Erro ao atualizar status: ${err.message}`);
      } else {
        alert('Erro desconhecido ao atualizar status.');
      }
    } finally {
      setAtualizandoId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p className="animate-pulse flex items-center gap-2">
          <ChefHat className="animate-bounce text-orange-500" /> Carregando pedidos...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-6 overflow-x-auto">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <ChefHat className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-xl font-bold text-white">Painel da Cozinha</h1>
              <p className="text-xs text-zinc-400">Acompanhe e atualize os pedidos em tempo real (WebSockets)</p>
            </div>
          </div>

          <button
            onClick={recarregarPedidosManualmente}
            className="flex items-center gap-2 text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-2 rounded-lg border border-zinc-800 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Recarregar
          </button>
        </header>

        {/* Quadro Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-w-[1100px]">
          {COLUNAS.map((coluna) => {
            const Icon = coluna.icon;
            const pedidosColuna = pedidos.filter((p) => p.status === coluna.key);

            return (
              <div
                key={coluna.key}
                className="bg-zinc-900/60 rounded-xl border border-zinc-800/80 p-3 flex flex-col h-[calc(100vh-140px)]"
              >
                {/* Header da Coluna */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${coluna.color}`} />
                    <span className="font-semibold text-sm">{coluna.label}</span>
                  </div>
                  <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-400 font-bold">
                    {pedidosColuna.length}
                  </span>
                </div>

                {/* Lista de Pedidos */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {pedidosColuna.length === 0 ? (
                    <p className="text-xs text-zinc-600 text-center py-8">Nenhum pedido</p>
                  ) : (
                    pedidosColuna.map((pedido) => {
                      const proximo = PROXIMO_STATUS[pedido.status];
                      const dataCriacao = (pedido as unknown as { criadoEm?: string }).criadoEm || (pedido as unknown as { createdAt?: string }).createdAt;

                      return (
                        <div
                          key={pedido.id}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-3 hover:border-zinc-700 transition-all shadow-md"
                        >
                          {/* Topo do Card */}
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-orange-400">
                                #{pedido.id}
                              </span>
                              <h3 className="font-semibold text-sm text-white">{pedido.clienteNome}</h3>
                            </div>
                            <span className="text-[10px] text-zinc-500">
                              {dataCriacao ? new Date(dataCriacao).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              }) : ''}
                            </span>
                          </div>

                          {/* Itens do Pedido */}
                          <div className="space-y-2 border-t border-b border-zinc-800/60 py-2">
                            {pedido.itens?.map((item) => {
                              const nomeBorda = item.bordaTamanho?.borda?.nome;

                              return (
                                <div key={item.id} className="text-xs space-y-0.5">
                                  <div className="font-medium text-zinc-200 flex items-center gap-1">
                                    <ShoppingBag className="w-3 h-3 text-orange-500 shrink-0" />
                                    <span>
                                      Pizza {item.tamanho?.nome}
                                      {nomeBorda && ` (Borda: ${nomeBorda})`}
                                    </span>
                                  </div>
                                  <p className="text-zinc-400 pl-4">
                                    {item.sabores?.map((s) => (s as unknown as { sabor?: { nome: string }; nome?: string }).sabor?.nome || (s as unknown as { nome?: string }).nome).filter(Boolean).join(', ')}
                                  </p>
                                  {item.observacoes && (
                                    <p className="text-amber-400/90 italic text-[11px] pl-4 flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3 shrink-0" />
                                      {item.observacoes}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Rodapé e Ação */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-bold text-zinc-300">
                              R$ {Number((pedido as unknown as { valorTotal?: number | string }).valorTotal || (pedido as unknown as { total?: number | string }).total || 0).toFixed(2)}
                            </span>

                            {proximo && (
                              <button
                                onClick={() => alterarStatus(pedido.id, proximo)}
                                disabled={atualizandoId === pedido.id}
                                className="text-xs bg-orange-600/20 hover:bg-orange-600/40 text-orange-400 hover:text-orange-300 border border-orange-500/30 px-2.5 py-1 rounded transition-all font-medium disabled:opacity-50 cursor-pointer"
                              >
                                {atualizandoId === pedido.id ? '...' : `Avançar ➔`}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}