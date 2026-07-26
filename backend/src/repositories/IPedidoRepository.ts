import { StatusPedido } from '@prisma/client';

export interface IPedidoRepository {
  listar(): Promise<any[]>;
  buscarPorId(id: number): Promise<{
    pedido: { id: number; status: StatusPedido };
    itens: Array<{
      id: number;
      quantidade: number;
      sabores: Array<{
        fracao: number;
        saborTamanho: {
          fichaTecnica: Array<{
            ingredienteId: string;
            quantidadeUsada: number;
          }>;
        };
      }>;
    }>;
  } | null>;
}
