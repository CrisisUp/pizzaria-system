import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TamanhoEBordaService } from '../../services/tamanhoEBordaService'
import { ITamanhoRepository, IBordaRepository } from '../../repositories/ITamanhoEBordaRepository'

describe('services/tamanhoEBordaService', () => {
  let service: TamanhoEBordaService
  let mockTamanhoRepository: ITamanhoRepository
  let mockBordaRepository: IBordaRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockTamanhoRepository = {
      listarTodos: vi.fn(),
      criar: vi.fn(),
      atualizar: vi.fn(),
      deletar: vi.fn(),
    }
    mockBordaRepository = {
      listarTodas: vi.fn(),
      criar: vi.fn(),
      atualizar: vi.fn(),
      deletar: vi.fn(),
    }
    service = new TamanhoEBordaService(mockTamanhoRepository, mockBordaRepository)
  })

  describe('listarTamanhos', () => {
    it('deve delegar para tamanhoRepository', async () => {
      const tamanhosMock = [
        { id: 1, nome: 'Grande', fatias: 8, maxSabores: 2, fatorMultiplicador: 1.5 },
      ]
      mockTamanhoRepository.listarTodos.mockResolvedValue(tamanhosMock)

      const resultado = await service.listarTamanhos()

      expect(resultado).toEqual(tamanhosMock)
      expect(mockTamanhoRepository.listarTodos).toHaveBeenCalled()
    })
  })

  describe('criarTamanho', () => {
    it('deve delegar para tamanhoRepository', async () => {
      const input = { nome: 'Broto', fatias: 4, maxSabores: 1, fatorMultiplicador: 0.75 }
      const tamanhoCriado = { id: 1, ...input }
      mockTamanhoRepository.criar.mockResolvedValue(tamanhoCriado)

      const resultado = await service.criarTamanho(input)

      expect(resultado).toEqual(tamanhoCriado)
      expect(mockTamanhoRepository.criar).toHaveBeenCalledWith(input)
    })
  })

  describe('atualizarTamanho', () => {
    it('deve delegar para tamanhoRepository', async () => {
      const input = { nome: 'Grande Atualizado' }
      const tamanhoAtualizado = { id: 1, ...input, fatias: 8, maxSabores: 2, fatorMultiplicador: 1.5 }
      mockTamanhoRepository.atualizar.mockResolvedValue(tamanhoAtualizado)

      const resultado = await service.atualizarTamanho(1, input)

      expect(resultado).toEqual(tamanhoAtualizado)
      expect(mockTamanhoRepository.atualizar).toHaveBeenCalledWith(1, input)
    })
  })

  describe('deletarTamanho', () => {
    it('deve delegar para tamanhoRepository', async () => {
      mockTamanhoRepository.deletar.mockResolvedValue(undefined)

      await service.deletarTamanho(1)

      expect(mockTamanhoRepository.deletar).toHaveBeenCalledWith(1)
    })
  })

  describe('listarBordas', () => {
    it('deve delegar para bordaRepository', async () => {
      const bordasMock = [
        { id: 1, nome: 'Catupiry', bordaPrecos: [] },
      ]
      mockBordaRepository.listarTodas.mockResolvedValue(bordasMock)

      const resultado = await service.listarBordas()

      expect(resultado).toEqual(bordasMock)
      expect(mockBordaRepository.listarTodas).toHaveBeenCalled()
    })
  })

  describe('criarBorda', () => {
    it('deve delegar para bordaRepository', async () => {
      const input = { nome: 'Cheddar', bordaPrecos: [{ tamanhoId: 1, precoVenda: 5.0 }] }
      const bordaCriada = { id: 1, ...input }
      mockBordaRepository.criar.mockResolvedValue(bordaCriada)

      const resultado = await service.criarBorda(input)

      expect(resultado).toEqual(bordaCriada)
      expect(mockBordaRepository.criar).toHaveBeenCalledWith(input)
    })
  })

  describe('atualizarBorda', () => {
    it('deve delegar para bordaRepository', async () => {
      const input = { nome: 'Cheddar Atualizado' }
      const bordaAtualizada = { id: 1, ...input, bordaPrecos: [] }
      mockBordaRepository.atualizar.mockResolvedValue(bordaAtualizada)

      const resultado = await service.atualizarBorda(1, input)

      expect(resultado).toEqual(bordaAtualizada)
      expect(mockBordaRepository.atualizar).toHaveBeenCalledWith(1, input)
    })
  })

  describe('deletarBorda', () => {
    it('deve delegar para bordaRepository', async () => {
      mockBordaRepository.deletar.mockResolvedValue(undefined)

      await service.deletarBorda(1)

      expect(mockBordaRepository.deletar).toHaveBeenCalledWith(1)
    })
  })
})