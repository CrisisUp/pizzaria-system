import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { registerSchema, loginSchema, authParamsSchema } from '../authSchema'

describe('schemas/authSchema', () => {
  describe('registerSchema', () => {
    const schema = registerSchema

    it('deve validar dados de registro válidos', () => {
      const input = {
        body: {
          nome: 'João Silva',
          email: 'joao@email.com',
          senha: 'senha123',
        },
      }

      const resultado = schema.safeParse(input)
      expect(resultado.success).toBe(true)
    })

    it('deve rejeitar nome com menos de 2 caracteres', () => {
      const input = {
        body: {
          nome: 'J',
          email: 'joao@email.com',
          senha: 'senha123',
        },
      }

      const resultado = schema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('pelo menos 2 caracteres')
      }
    })

    it('deve rejeitar email inválido', () => {
      const input = {
        body: {
          nome: 'João Silva',
          email: 'email-invalido',
          senha: 'senha123',
        },
      }

      const resultado = schema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('Email inválido')
      }
    })

    it('deve rejeitar senha com menos de 6 caracteres', () => {
      const input = {
        body: {
          nome: 'João Silva',
          email: 'joao@email.com',
          senha: '12345',
        },
      }

      const resultado = schema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('pelo menos 6 caracteres')
      }
    })

    it('deve rejeitar campos obrigatórios ausentes', () => {
      const input = { body: {} }

      const resultado = schema.safeParse(input)
      expect(resultado.success).toBe(false)
      expect(resultado.error.issues.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('loginSchema', () => {
    const schema = loginSchema

    it('deve validar dados de login válidos', () => {
      const input = {
        body: {
          email: 'joao@email.com',
          senha: 'senha123',
        },
      }

      const resultado = schema.safeParse(input)
      expect(resultado.success).toBe(true)
    })

    it('deve rejeitar email inválido', () => {
      const input = {
        body: {
          email: 'email-invalido',
          senha: 'senha123',
        },
      }

      const resultado = schema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('Email inválido')
      }
    })

    it('deve rejeitar senha vazia', () => {
      const input = {
        body: {
          email: 'joao@email.com',
          senha: '',
        },
      }

      const resultado = schema.safeParse(input)
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('obrigatória')
      }
    })
  })

  describe('authParamsSchema', () => {
    it('deve validar ID numérico válido', () => {
      const resultado = authParamsSchema.safeParse({ id: '123' })
      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.id).toBe(123)
      }
    })

    it('deve rejeitar ID não numérico', () => {
      const resultado = authParamsSchema.safeParse({ id: 'abc' })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('número válido')
      }
    })

    it('deve aceitar ID vazio (transforma para 0)', () => {
      const resultado = authParamsSchema.safeParse({ id: '' })
      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.id).toBe(0)
      }
    })
  })
})