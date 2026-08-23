import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SaborService } from '../../services/saborService'
import { ISaborRepository, SaborComRelacionamentos } from '../../repositories/ISaborRepository'

describe('services/saborService', () => {
  let service: SaborService
  let mockRepository: ISaborRepository

  beforeEach(() => {
    vi.clearAllMocks()
    mockRepository = {
      listarTodos: vi.fn(),
      buscarPorId: vi.fn(),
      criar: vi.fn(),
      atualizar: vi.fn(),
      atualizarFichaTecnica: vi.fn(),
      deletar: vi.fn(),
    }
    service = new SaborService(mockRepository)
  })

  describe('listar', () => {
    it('deve retornar sabores com custos e margens calculados', async () => {
      const saboresMock: SaborComRelacionamentos[] = [
        {
          id: 1,
          nome: 'Calabresa',
          descricao: 'Com cebola',
          saborPrecos: [
            {
              id: 1,
              tamanhoId: 1,
              precoVenda: 45.0,
              tamanho: { id: 1, nome: 'Grande' },
              fichaTecnica: [
                {
                  ingredienteId: 'ing-1',
                  ingrediente: { id: 'ing-1', nome: 'Calabresa', precoUltimaCompra: 50.0, quantidadeEmbalagem: 1 },
                  quantidadeUsada: 100,
                  unidadeMedida: 'g',
                },
              ],
            },
          ],
        },
      ]

      mockRepository.listarTodos.mockResolvedValue(saboresMock)

      const resultado = await service.listar()

      expect(resultado).toHaveLength(1)
      expect(resultado[0].nome).toBe('Calabresa')
      expect(resultado[0].precosETamanhos).toHaveLength(1)
      expect(resultado[0].precosETamanhos[0].precoVenda).toBe(45.0)
      // Custo: precoUltimaCompra = 50.0, quantidadeEmbalagem = 1
      // custoUnitario = 50.0 / 1 = 50.0
      // qtdUsada = 100
      // custo = 50.0 * 100 = 5000
      expect(resultado[0].precosETamanhos[0].custoProducao).toBe(5000)
      expect(resultado[0].precosETamanhos[0].margemLucroBruta).toBe(-4955)
    })

    it('deve lidar com sabores sem ficha técnica', async () => {
      const saboresMock: SaborComRelacionamentos[] = [
        {
          id: 1,
          nome: 'Simples',
          descricao: null,
          saborPrecos: [
            {
              id: 1,
              tamanhoId: 1,
              precoVenda: 30.0,
              tamanho: { id: 1, nome: 'Grande' },
              fichaTecnica: [],
            },
          ],
        },
      ]

      mockRepository.listarTodos.mockResolvedValue(saboresMock)

      const resultado = await service.listar()

      expect(resultado[0].precosETamanhos[0].custoProducao).toBe(0)
      expect(resultado[0].precosETamanhos[0].margemLucroBruta).toBe(30.0)
    })
  })

  describe('buscarPorId', () => {
    it('deve retornar null se sabor não encontrado', async () => {
      mockRepository.buscarPorId.mockResolvedValue(null)

      const resultado = await service.buscarPorId(999)

      expect(resultado).toBeNull()
    })

    it('deve retornar sabor com cálculos', async () => {
      const saborMock: SaborComRelacionamentos = {
        id: 1,
        nome: 'Calabresa',
        descricao: 'Com cebola',
        saborPrecos: [
          {
            id: 1,
            tamanhoId: 1,
            precoVenda: 45.0,
            tamanho: { id: 1, nome: 'Grande' },
            fichaTecnica: [],
          },
        ],
      }

      mockRepository.buscarPorId.mockResolvedValue(saborMock)

      const resultado = await service.buscarPorId(1)

      expect(resultado).toBeDefined()
      expect(resultado?.nome).toBe('Calabresa')
    })
  })

  describe('criar', () => {
    it('deve delegar para repository', async () => {
      const input = {
        nome: 'Novo Sabor',
        descricao: 'Descrição',
        precos: [{ tamanhoId: 1, precoVenda: 40.0 }],
        fichaTecnica: [{ tamanhoId: 1, ingredienteId: 'ing-1', quantidadeUsada: 100, unidadeMedida: 'g' }],
      }
      const saborCriado = { id: 1, ...input }
      mockRepository.criar.mockResolvedValue(saborCriado)

      const resultado = await service.criar(input)

      expect(resultado).toEqual(saborCriado)
      expect(mockRepository.criar).toHaveBeenCalledWith(input)
    })
  })

  describe('atualizar', () => {
    it('deve delegar para repository', async () => {
      const input = { nome: 'Sabor Atualizado' }
      const saborAtualizado = { id: 1, ...input }
      mockRepository.atualizar.mockResolvedValue(saborAtualizado)

      const resultado = await service.atualizar(1, input)

      expect(resultado).toEqual(saborAtualizado)
      expect(mockRepository.atualizar).toHaveBeenCalledWith(1, input)
    })
  })

  describe('atualizarFichaTecnica', () => {
    it('deve delegar para repository', async () => {
      const fichaTecnica = [
        { tamanhoId: 1, ingredienteId: 'ing-1', quantidadeUsada: 150, unidadeMedida: 'g' },
      ]
      mockRepository.atualizarFichaTecnica.mockResolvedValue(undefined)

      const resultado = await service.atualizarFichaTecnica(1, fichaTecnica)

      expect(resultado).toEqual({ mensagem: 'Ficha técnica atualizada com sucesso.' })
      expect(mockRepository.atualizarFichaTecnica).toHaveBeenCalledWith(1, fichaTecnica)
    })
  })

  describe('deletar', () => {
    it('deve delegar para repository', async () => {
      mockRepository.deletar.mockResolvedValue(undefined)

      await service.deletar(1)

      expect(mockRepository.deletar).toHaveBeenCalledWith(1)
    })
  })
})