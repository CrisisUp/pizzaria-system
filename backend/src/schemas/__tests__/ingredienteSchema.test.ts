import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { criarIngredienteSchema, atualizarIngredienteSchema, ingredienteParamsSchema } from '../ingredienteSchema'

describe('schemas/ingredienteSchema', () => {
  describe('criarIngredienteSchema', () => {
    const ingredienteValido = {
      nome: 'Queijo Mussarela',
      unidadeCompra: 'KG',
      precoUltimaCompra: 45.9,
      quantidadeEmbalagem: 1,
    }

    it('deve validar ingrediente completo válido', () => {
      const resultado = criarIngredienteSchema.safeParse(ingredienteValido)
      expect(resultado.success).toBe(true)
    })

    it('deve rejeitar nome com menos de 2 caracteres', () => {
      const input = { ...ingredienteValido, nome: 'Q' }
      const resultado = criarIngredienteSchema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('pelo menos 2 caracteres')
      }
    })

    it('deve rejeitar unidadeCompra vazia', () => {
      const input = { ...ingredienteValido, unidadeCompra: '' }
      const resultado = criarIngredienteSchema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('obrigatória')
      }
    })

    it('deve rejeitar precoUltimaCompra negativo', () => {
      const input = { ...ingredienteValido, precoUltimaCompra: -10 }
      const resultado = criarIngredienteSchema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('não pode ser negativo')
      }
    })

    it('deve aceitar precoUltimaCompra zero', () => {
      const input = { ...ingredienteValido, precoUltimaCompra: 0 }
      const resultado = criarIngredienteSchema.safeParse(input)
      expect(resultado.success).toBe(true)
    })

    it('deve rejeitar quantidadeEmbalagem não positiva', () => {
      const input = { ...ingredienteValido, quantidadeEmbalagem: 0 }
      const resultado = criarIngredienteSchema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('positiva')
      }
    })

    it('deve aceitar unidades comuns (KG, L, UN)', () => {
      const unidades = ['KG', 'L', 'UN', 'PC', 'CX']
      for (const unidade of unidades) {
        const input = { ...ingredienteValido, unidadeCompra: unidade }
        const resultado = criarIngredienteSchema.safeParse(input)
        expect(resultado.success).toBe(true)
      }
    })
  })

  describe('atualizarIngredienteSchema', () => {
    it('deve aceitar atualização parcial (apenas nome)', () => {
      const resultado = atualizarIngredienteSchema.safeParse({ nome: 'Novo Nome' })
      expect(resultado.success).toBe(true)
    })

    it('deve aceitar atualização parcial (apenas precoUltimaCompra)', () => {
      const resultado = atualizarIngredienteSchema.safeParse({ precoUltimaCompra: 50.0 })
      expect(resultado.success).toBe(true)
    })

    it('deve aceitar objeto vazio', () => {
      const resultado = atualizarIngredienteSchema.safeParse({})
      expect(resultado.success).toBe(true)
    })

    it('deve validar campos quando presentes', () => {
      const resultado = atualizarIngredienteSchema.safeParse({ nome: 'A' })
      expect(resultado.success).toBe(false)
    })
  })

  describe('ingredienteParamsSchema', () => {
    it('deve aceitar ID string (UUID)', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000'
      const resultado = ingredienteParamsSchema.safeParse({ id: uuid })
      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.id).toBe(uuid)
      }
    })

    it('deve rejeitar ID number (params são strings do URL)', () => {
      const resultado = ingredienteParamsSchema.safeParse({ id: 123 })
      expect(resultado.success).toBe(false)
    })
  })
})