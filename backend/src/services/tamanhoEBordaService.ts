import { ITamanhoRepository, IBordaRepository } from '../repositories/ITamanhoEBordaRepository';
import { PrismaTamanhoRepository } from '../repositories/prisma/PrismaTamanhoRepository';
import { PrismaBordaRepository } from '../repositories/prisma/PrismaBordaRepository';

export interface CriarTamanhoDTO {
  nome: string;
  maxSabores: number;
  fatias: number;
}

export interface CriarBordaDTO {
  nome: string;
  bordaPrecos?: Array<{
    tamanhoId: number;
    precoVenda: number;
  }>;
}

export class TamanhoEBordaService {
  constructor(
    private readonly tamanhoRepository: ITamanhoRepository = new PrismaTamanhoRepository(),
    private readonly bordaRepository: IBordaRepository = new PrismaBordaRepository(),
  ) {}

  async listarTamanhos() {
    return this.tamanhoRepository.listarTodos();
  }

  async criarTamanho(data: CriarTamanhoDTO) {
    return this.tamanhoRepository.criar(data);
  }

  async atualizarTamanho(id: number, data: Partial<CriarTamanhoDTO>) {
    return this.tamanhoRepository.atualizar(id, data);
  }

  async deletarTamanho(id: number) {
    return this.tamanhoRepository.deletar(id);
  }

  async listarBordas() {
    return this.bordaRepository.listarTodas();
  }

  async criarBorda(data: CriarBordaDTO) {
    return this.bordaRepository.criar(data);
  }

  async atualizarBorda(id: number, data: { nome?: string }) {
    return this.bordaRepository.atualizar(id, data);
  }

  async deletarBorda(id: number) {
    return this.bordaRepository.deletar(id);
  }
}
