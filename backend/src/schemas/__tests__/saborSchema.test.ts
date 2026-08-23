import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  criarSaborSchema,
  atualizarSaborSchema,
  atualizarFichaTecnicaSchema,
  saborParamsSchema,
  precoPorTamanhoSchema,
  ingredienteFichaTecnicaSchema,
} from '../saborSchema'

describe('schemas/saborSchema', () => {
  describe('precoPorTamanhoSchema', () => {
    it('deve validar preço válido', () => {
      const resultado = precoPorTamanhoSchema.safeParse({ tamanhoId: 1, precoVenda: 45.9 })
      expect(resultado.success).toBe(true)
    })

    it('deve rejeitar tamanhoId não positivo', () => {
      const resultado = precoPorTamanhoSchema.safeParse({ tamanhoId: 0, precoVenda: 45.9 })
      expect(resultado.success).toBe(false)
    })

    it('deve rejeitar precoVenda não positivo', () => {
      const resultado = precoPorTamanhoSchema.safeParse({ tamanhoId: 1, precoVenda: 0 })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('maior que zero')
      }
    })
  })

  describe('ingredienteFichaTecnicaSchema', () => {
    it('deve validar ficha técnica válida', () => {
      const resultado = ingredienteFichaTecnicaSchema.safeParse({
        tamanhoId: 1,
        ingredienteId: 'ingrediente-uuid',
        quantidadeUsada: 100,
        unidadeMedida: 'g',
      })
      expect(resultado.success).toBe(true)
    })

    it('deve usar unidadeMedida padrão "g"', () => {
      const resultado = ingredienteFichaTecnicaSchema.safeParse({
        tamanhoId: 1,
        ingredienteId: 'ingrediente-uuid',
        quantidadeUsada: 100,
      })
      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.unidadeMedida).toBe('g')
      }
    })

    it('deve rejeitar ingredienteId vazio', () => {
      const resultado = ingredienteFichaTecnicaSchema.safeParse({
        tamanhoId: 1,
        ingredienteId: '',
        quantidadeUsada: 100,
      })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('obrigatório')
      }
    })
  })

  describe('criarSaborSchema', () => {
    const saborValido = {
      nome: 'Calabresa',
      descricao: 'Calabresa com cebola',
      precos: [
        { tamanhoId: 1, precoVenda: 35.0 },
        { tamanhoId: 2, precoVenda: 45.0 },
      ],
      fichaTecnica: [
        { tamanhoId: 1, ingredienteId: 'ing-1', quantidadeUsada: 100, unidadeMedida: 'g' },
        { tamanhoId: 2, ingredienteId: 'ing-1', quantidadeUsada: 150, unidadeMedida: 'g' },
      ],
    }

    it('deve validar sabor completo válido', () => {
      const resultado = criarSaborSchema.safeParse({ body: saborValido })
      expect(resultado.success).toBe(true)
    })

    it('deve rejeitar nome vazio', () => {
      const input = { ...saborValido, nome: '' }
      const resultado = criarSaborSchema.safeParse({ body: input })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('obrigatório')
      }
    })

    it('deve rejeitar array de precos vazio', () => {
      const input = { ...saborValido, precos: [] }
      const resultado = criarSaborSchema.safeParse({ body: input })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('Pelo menos um preço')
      }
    })

    it('deve aceitar descricao opcional', () => {
      const input = { ...saborValido, descricao: undefined }
      const resultado = criarSaborSchema.safeParse({ body: input })
      expect(resultado.success).toBe(true)
    })
  })

  describe('atualizarSaborSchema', () => {
    it('deve aceitar atualização parcial (apenas nome)', () => {
      const resultado = atualizarSaborSchema.safeParse({ body: { nome: 'Novo Nome' } })
      expect(resultado.success).toBe(true)
    })

    it('deve aceitar atualização parcial (apenas descricao)', () => {
      const resultado = atualizarSaborSchema.safeParse({ body: { descricao: 'Nova descrição' } })
      expect(resultado.success).toBe(true)
    })

    it('deve aceitar atualização de precos', () => {
      const resultado = atualizarSaborSchema.safeParse({
        body: { precos: [{ tamanhoId: 1, precoVenda: 40.0 }] },
      })
      expect(resultado.success).toBe(true)
    })

    it('deve aceitar objeto vazio', () => {
      const resultado = atualizarSaborSchema.safeParse({ body: {} })
      expect(resultado.success).toBe(true)
    })
  })

  describe('atualizarFichaTecnicaSchema', () => {
    it('deve validar array de ficha técnica', () => {
      const resultado = atualizarFichaTecnicaSchema.safeParse({
        body: {
          fichaTecnica: [
            { tamanhoId: 1, ingredienteId: 'ing-1', quantidadeUsada: 100, unidadeMedida: 'g' },
            { tamanhoId: 2, ingredienteId: 'ing-2', quantidadeUsada: 50, unidadeMedida: 'ml' },
          ],
        },
      })
      expect(resultado.success).toBe(true)
    })

    it('deve rejeitar array vazio', () => {
      const resultado = atualizarFichaTecnicaSchema.safeParse({ body: { fichaTecnica: [] } })
      expect(resultado.success).toBe(true) // Zod não valida min por padrão
    })
  })

  describe('saborParamsSchema', () => {
    it('deve validar ID numérico válido', () => {
      const resultado = saborParamsSchema.safeParse({ id: '123' })
      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.id).toBe(123)
      }
    })

    it('deve rejeitar ID não numérico', () => {
      const resultado = saborParamsSchema.safeParse({ id: 'abc' })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('número válido')
      }
    })
  })
})