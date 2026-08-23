import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  criarTamanhoSchema,
  atualizarTamanhoSchema,
  tamanhoParamsSchema,
  criarBordaSchema,
  atualizarBordaSchema,
  bordaParamsSchema,
} from '../tamanhoEBordaSchema'

describe('schemas/tamanhoEBordaSchema', () => {
  describe('criarTamanhoSchema', () => {
    const tamanhoValido = {
      nome: 'Grande',
      fatias: 8,
      maxSabores: 2,
      fatorMultiplicador: 1.5,
    }

    it('deve validar tamanho completo válido', () => {
      const resultado = criarTamanhoSchema.safeParse(tamanhoValido)
      expect(resultado.success).toBe(true)
    })

    it('deve aplicar valores padrão para maxSabores e fatorMultiplicador', () => {
      const input = { nome: 'Broto', fatias: 4 }
      const resultado = criarTamanhoSchema.safeParse(input)
      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.maxSabores).toBe(2)
        expect(resultado.data.fatorMultiplicador).toBe(1)
      }
    })

    it('deve rejeitar nome com menos de 2 caracteres', () => {
      const input = { ...tamanhoValido, nome: 'G' }
      const resultado = criarTamanhoSchema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('pelo menos 2 caracteres')
      }
    })

    it('deve rejeitar fatias não positivo', () => {
      const input = { ...tamanhoValido, fatias: 0 }
      const resultado = criarTamanhoSchema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('maior que zero')
      }
    })

    it('deve rejeitar maxSabores não positivo', () => {
      const input = { ...tamanhoValido, maxSabores: 0 }
      const resultado = criarTamanhoSchema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('pelo menos 1')
      }
    })

    it('deve rejeitar fatorMultiplicador não positivo', () => {
      const input = { ...tamanhoValido, fatorMultiplicador: 0 }
      const resultado = criarTamanhoSchema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('positivo')
      }
    })
  })

  describe('atualizarTamanhoSchema', () => {
    it('deve aceitar atualização parcial (apenas nome)', () => {
      const resultado = atualizarTamanhoSchema.safeParse({ nome: 'Novo Nome' })
      expect(resultado.success).toBe(true)
    })

    it('deve aceitar atualização parcial (apenas fatias)', () => {
      const resultado = atualizarTamanhoSchema.safeParse({ fatias: 10 })
      expect(resultado.success).toBe(true)
    })

    it('deve aceitar objeto vazio', () => {
      const resultado = atualizarTamanhoSchema.safeParse({})
      expect(resultado.success).toBe(true)
    })

    it('deve validar campos quando presentes', () => {
      const resultado = atualizarTamanhoSchema.safeParse({ nome: 'A' })
      expect(resultado.success).toBe(false)
    })
  })

  describe('tamanhoParamsSchema', () => {
    it('deve validar ID numérico válido', () => {
      const resultado = tamanhoParamsSchema.safeParse({ id: '123' })
      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.id).toBe(123)
      }
    })

    it('deve rejeitar ID não numérico', () => {
      const resultado = tamanhoParamsSchema.safeParse({ id: 'abc' })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('número válido')
      }
    })
  })

  describe('criarBordaSchema', () => {
    const bordaValida = {
      nome: 'Catupiry',
      bordaPrecos: [
        { tamanhoId: 1, precoVenda: 5.0 },
        { tamanhoId: 2, precoVenda: 7.0 },
      ],
    }

    it('deve validar borda completa válida', () => {
      const resultado = criarBordaSchema.safeParse(bordaValida)
      expect(resultado.success).toBe(true)
    })

    it('deve aceitar borda sem bordaPrecos (opcional)', () => {
      const input = { nome: 'Cheddar' }
      const resultado = criarBordaSchema.safeParse(input)
      expect(resultado.success).toBe(true)
    })

    it('deve rejeitar nome com menos de 2 caracteres', () => {
      const input = { ...bordaValida, nome: 'C' }
      const resultado = criarBordaSchema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('pelo menos 2 caracteres')
      }
    })

    it('deve validar bordaPrecos quando presente', () => {
      const input = {
        ...bordaValida,
        bordaPrecos: [{ tamanhoId: 0, precoVenda: 5.0 }],
      }
      const resultado = criarBordaSchema.safeParse(input)
      expect(resultado.success).toBe(false)
    })

    it('deve aceitar precoVenda zero em bordaPrecos', () => {
      const input = { ...bordaValida, bordaPrecos: [{ tamanhoId: 1, precoVenda: 0 }] }
      const resultado = criarBordaSchema.safeParse(input)
      expect(resultado.success).toBe(true)
    })

    it('deve rejeitar precoVenda negativo em bordaPrecos', () => {
      const input = { ...bordaValida, bordaPrecos: [{ tamanhoId: 1, precoVenda: -1 }] }
      const resultado = criarBordaSchema.safeParse(input)
      expect(resultado.success).toBe(false)
    })
  })

  describe('atualizarBordaSchema', () => {
    it('deve aceitar atualização parcial (apenas nome)', () => {
      const resultado = atualizarBordaSchema.safeParse({ nome: 'Novo Nome' })
      expect(resultado.success).toBe(true)
    })

    it('deve aceitar atualização de bordaPrecos', () => {
      const resultado = atualizarBordaSchema.safeParse({
        bordaPrecos: [{ tamanhoId: 1, precoVenda: 10.0 }],
      })
      expect(resultado.success).toBe(true)
    })

    it('deve aceitar objeto vazio', () => {
      const resultado = atualizarBordaSchema.safeParse({})
      expect(resultado.success).toBe(true)
    })
  })

  describe('bordaParamsSchema', () => {
    it('deve validar ID numérico válido', () => {
      const resultado = bordaParamsSchema.safeParse({ id: '456' })
      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.id).toBe(456)
      }
    })

    it('deve rejeitar ID não numérico', () => {
      const resultado = bordaParamsSchema.safeParse({ id: 'xyz' })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('número válido')
      }
    })
  })
})