import { ISaborRepository, SaborComRelacionamentos } from '../repositories/ISaborRepository';

export interface PrecoPorTamanhoInput {
  tamanhoId: number;
  precoVenda: number;
}

export interface FichaTecnicaInput {
  tamanhoId: number;
  ingredienteId: string;
  quantidadeUsada: number;
  unidadeMedida?: string;
}

export interface CriarSaborInput {
  nome: string;
  descricao?: string;
  precos: PrecoPorTamanhoInput[];
  fichaTecnica: FichaTecnicaInput[];
}

export interface AtualizarSaborInput {
  nome?: string;
  descricao?: string;
  precos?: PrecoPorTamanhoInput[];
}

export class SaborService {
  constructor(private saborRepository: ISaborRepository) {}

  // Função privada auxiliar (Princípio DRY)
  private calcularCustosESabor(sabor: SaborComRelacionamentos) {
    const precosETamanhos = (sabor.saborPrecos || []).map((sp) => {
      const custoProducao = sp.fichaTecnica.reduce((acc, ft) => {
        const precoCompra = Number(ft.ingrediente.precoUltimaCompra) || 0;
        const qtdEmbalagem = Number(ft.ingrediente.quantidadeEmbalagem) || 1;
        const custoUnitario = precoCompra / qtdEmbalagem;
        const qtdUsada = Number(ft.quantidadeUsada) || 0;

        return acc + custoUnitario * qtdUsada;
      }, 0);

      return {
        saborTamanhoId: sp.id,
        tamanhoId: sp.tamanhoId,
        tamanhoNome: sp.tamanho.nome,
        precoVenda: Number(sp.precoVenda),
        custoProducao: Number(custoProducao.toFixed(2)),
        margemLucroBruta: Number((Number(sp.precoVenda) - custoProducao).toFixed(2)),
        fichaTecnica: sp.fichaTecnica.map((ft) => ({
          ingredienteId: ft.ingredienteId,
          ingrediente: ft.ingrediente.nome,
          quantidadeUsada: Number(ft.quantidadeUsada),
          unidadeMedida: ft.unidadeMedida,
        })),
      };
    });

    return {
      id: sabor.id,
      nome: sabor.nome,
      descricao: sabor.descricao,
      precosETamanhos: precosETamanhos,
    };
  }

  async listar() {
    const sabores = await this.saborRepository.listarTodos();
    return sabores.map((sabor) => this.calcularCustosESabor(sabor));
  }

  async buscarPorId(id: number) {
    const sabor = await this.saborRepository.buscarPorId(id);
    if (!sabor) return null;
    return this.calcularCustosESabor(sabor);
  }

  async criar(data: CriarSaborInput) {
    return await this.saborRepository.criar(data);
  }

  async atualizar(id: number, data: AtualizarSaborInput) {
    return await this.saborRepository.atualizar(id, data);
  }

  async atualizarFichaTecnica(saborId: number, fichaTecnica: FichaTecnicaInput[]) {
    await this.saborRepository.atualizarFichaTecnica(saborId, fichaTecnica);
    return { mensagem: 'Ficha técnica atualizada com sucesso.' };
  }

  async deletar(id: number) {
    return await this.saborRepository.deletar(id);
  }
}