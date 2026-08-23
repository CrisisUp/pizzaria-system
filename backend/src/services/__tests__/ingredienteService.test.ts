import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IngredienteService } from '../../services/ingredienteService'
import { IIngredienteRepository } from '../../repositories/IIngredienteRepository'

describe('services/ingredienteService', () => {
  let service: IngredienteService
  let mockRepository: IIngredienteRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockRepository = {
      listarTodos: vi.fn(),
      buscarPorId: vi.fn(),
      criar: vi.fn(),
      atualizar: vi.fn(),
      deletar: vi.fn(),
      buscarPorNome: vi.fn(),
      buscarPorUnidadeCompra: vi.fn(),
      buscarComFichaTecnica: vi.fn(),
    }
    service = new IngredienteService(mockRepository)
  })

  describe('listarTodos', () => {
    it('deve delegar para repository', async () => {
      const ingredientesMock = [
        { id: '1', nome: 'Queijo', unidadeCompra: 'KG', precoUltimaCompra: 45.0, quantidadeEmbalagem: 1, estoqueAtual: 10 },
      ]
      mockRepository.listarTodos.mockResolvedValue(ingredientesMock)

      const resultado = await service.listarTodos()

      expect(resultado).toEqual(ingredientesMock)
      expect(mockRepository.listarTodos).toHaveBeenCalled()
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar ingrediente quando encontrado', async () => {
      const ingredienteMock = { id: '1', nome: 'Queijo', unidadeCompra: 'KG', precoUltimaCompra: 45.0, quantidadeEmbalagem: 1, estoqueAtual: 10 }
      mockRepository.buscarPorId.mockResolvedValue(ingredienteMock)

      const resultado = await service.buscarPorId('1')

      expect(resultado).toEqual(ingredienteMock)
    })

    it('deve lançar erro quando não encontrado', async () => {
      mockRepository.buscarPorId.mockResolvedValue(null)

      await expect(service.buscarPorId('999')).rejects.toThrow('Ingrediente com ID 999 não encontrado')
    })
  })

  describe('criar', () => {
    it('deve converter números e delegar para repository', async () => {
      const input = {
        nome: 'Queijo',
        unidadeCompra: 'KG',
        precoUltimaCompra: '45.50',
        quantidadeEmbalagem: '1.5',
      }
      const ingredienteCriado = { id: '1', ...input, precoUltimaCompra: 45.5, quantidadeEmbalagem: 1.5 }
      mockRepository.criar.mockResolvedValue(ingredienteCriado)

      const resultado = await service.criar(input)

      expect(resultado).toEqual(ingredienteCriado)
      expect(mockRepository.criar).toHaveBeenCalledWith({
        nome: 'Queijo',
        unidadeCompra: 'KG',
        precoUltimaCompra: 45.5,
        quantidadeEmbalagem: 1.5,
      })
    })
  })

  describe('atualizar', () => {
    it('deve atualizar apenas campos fornecidos', async () => {
      const input = { nome: 'Novo Nome', precoUltimaCompra: '50.00' }
      const ingredienteAtualizado = { id: '1', nome: 'Novo Nome', unidadeCompra: 'KG', precoUltimaCompra: 50.0, quantidadeEmbalagem: 1, estoqueAtual: 10 }
      mockRepository.atualizar.mockResolvedValue(ingredienteAtualizado)

      const resultado = await service.atualizar('1', input)

      expect(resultado).toEqual(ingredienteAtualizado)
      expect(mockRepository.atualizar).toHaveBeenCalledWith('1', {
        nome: 'Novo Nome',
        precoUltimaCompra: 50.0,
      })
    })

    it('deve ignorar campos undefined', async () => {
      const input = { nome: undefined, precoUltimaCompra: undefined }
      const ingredienteAtualizado = { id: '1', nome: 'Queijo', unidadeCompra: 'KG', precoUltimaCompra: 45.0, quantidadeEmbalagem: 1, estoqueAtual: 10 }
      mockRepository.atualizar.mockResolvedValue(ingredienteAtualizado)

      await service.atualizar('1', input)

      expect(mockRepository.atualizar).toHaveBeenCalledWith('1', {})
    })
  })

  describe('deletar', () => {
    it('deve delegar para repository', async () => {
      mockRepository.deletar.mockResolvedValue(undefined)

      await service.deletar('1')

      expect(mockRepository.deletar).toHaveBeenCalledWith('1')
    })
  })

  describe('buscarPorNome', () => {
    it('deve delegar para repository', async () => {
      const ingredientesMock = [{ id: '1', nome: 'Queijo Mussarela', unidadeCompra: 'KG', precoUltimaCompra: 45.0, quantidadeEmbalagem: 1, estoqueAtual: 10 }]
      mockRepository.buscarPorNome.mockResolvedValue(ingredientesMock)

      const resultado = await service.buscarPorNome('Queijo')

      expect(resultado).toEqual(ingredientesMock)
      expect(mockRepository.buscarPorNome).toHaveBeenCalledWith('Queijo')
    })
  })

  describe('buscarPorUnidadeCompra', () => {
    it('deve delegar para repository', async () => {
      const ingredientesMock = [{ id: '1', nome: 'Queijo', unidadeCompra: 'KG', precoUltimaCompra: 45.0, quantidadeEmbalagem: 1, estoqueAtual: 10 }]
      mockRepository.buscarPorUnidadeCompra.mockResolvedValue(ingredientesMock)

      const resultado = await service.buscarPorUnidadeCompra('KG')

      expect(resultado).toEqual(ingredientesMock)
      expect(mockRepository.buscarPorUnidadeCompra).toHaveBeenCalledWith('KG')
    })
  })

  describe('buscarComFichaTecnica', () => {
    it('deve delegar para repository', async () => {
      const ingredientesMock = [{ id: '1', nome: 'Queijo', unidadeCompra: 'KG', precoUltimaCompra: 45.0, quantidadeEmbalagem: 1, estoqueAtual: 10, fichaTecnica: [] }]
      mockRepository.buscarComFichaTecnica.mockResolvedValue(ingredientesMock)

      const resultado = await service.buscarComFichaTecnica()

      expect(resultado).toEqual(ingredientesMock)
      expect(mockRepository.buscarComFichaTecnica).toHaveBeenCalled()
    })
  })
})