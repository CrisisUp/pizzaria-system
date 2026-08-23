import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { criarPedidoSchema, atualizarStatusSchema, pedidoParamsSchema } from '../pedidoSchema'

describe('schemas/pedidoSchema', () => {
  describe('criarPedidoSchema', () => {
    const schema = z.object({ body: criarPedidoSchema })

    const pedidoValido = {
      clienteNome: 'João Silva',
      clienteTelefone: '(11) 99999-9999',
      enderecoEntrega: 'Rua das Flores, 123',
      tipoPedido: 'DELIVERY' as const,
      itens: [
        {
          tamanhoId: 1,
          bordaTamanhoId: 2,
          quantidade: 1,
          observacoes: 'Sem cebola',
          sabores: [
            { saborTamanhoId: 1, fracao: 0.5 },
            { saborTamanhoId: 2, fracao: 0.5 },
          ],
        },
      ],
    }

    it('deve validar pedido completo válido', () => {
      const resultado = schema.safeParse({ body: pedidoValido })
      expect(resultado.success).toBe(true)
    })

    it('deve validar pedido mínimo (apenas campos obrigatórios)', () => {
      const pedidoMinimo = {
        clienteNome: 'João',
        tipoPedido: 'BALCAO' as const,
        itens: [
          {
            tamanhoId: 1,
            quantidade: 1,
            sabores: [{ saborTamanhoId: 1, fracao: 1 }],
          },
        ],
      }

      const resultado = schema.safeParse({ body: pedidoMinimo })
      expect(resultado.success).toBe(true)
    })

    it('deve rejeitar clienteNome com menos de 2 caracteres', () => {
      const input = { ...pedidoValido, clienteNome: 'J' }
      const resultado = schema.safeParse({ body: input })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('mínimo 2 caracteres')
      }
    })

    it('deve rejeitar tipoPedido inválido', () => {
      const input = { ...pedidoValido, tipoPedido: 'INVALIDO' as any }
      const resultado = schema.safeParse({ body: input })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('BALCAO, DELIVERY ou MESA')
      }
    })

    it('deve aceitar todos os tipos de pedido válidos', () => {
      const tipos: Array<'BALCAO' | 'DELIVERY' | 'MESA'> = ['BALCAO', 'DELIVERY', 'MESA']
      for (const tipo of tipos) {
        const input = { ...pedidoValido, tipoPedido: tipo }
        const resultado = schema.safeParse({ body: input })
        expect(resultado.success).toBe(true)
      }
    })

    it('deve rejeitar array de itens vazio', () => {
      const input = { ...pedidoValido, itens: [] }
      const resultado = schema.safeParse({ body: input })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('pelo menos 1 item')
      }
    })

    it('deve rejeitar item sem tamanhoId', () => {
      const input = {
        ...pedidoValido,
        itens: [{ quantidade: 1, sabores: [{ saborTamanhoId: 1, fracao: 1 }] }],
      }
      const resultado = schema.safeParse({ body: input })
      expect(resultado.success).toBe(false)
    })

    it('deve rejeitar item com quantidade menor que 1', () => {
      const input = { ...pedidoValido, itens: [{ ...pedidoValido.itens[0], quantidade: 0 }] }
      const resultado = schema.safeParse({ body: input })
      expect(resultado.success).toBe(false)
    })

    it('deve aceitar bordaTamanhoId opcional', () => {
      const input = { ...pedidoValido, itens: [{ ...pedidoValido.itens[0], bordaTamanhoId: undefined }] }
      const resultado = schema.safeParse({ body: input })
      expect(resultado.success).toBe(true)
    })

    it('deve aceitar bordaTamanhoId null e transformar em undefined', () => {
      const input = { ...pedidoValido, itens: [{ ...pedidoValido.itens[0], bordaTamanhoId: null }] }
      const resultado = schema.safeParse({ body: input })
      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.body.itens[0].bordaTamanhoId).toBeUndefined()
      }
    })

    it('deve rejeitar sabores array vazio no item', () => {
      const input = { ...pedidoValido, itens: [{ ...pedidoValido.itens[0], sabores: [] }] }
      const resultado = schema.safeParse({ body: input })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('Pelo menos um sabor')
      }
    })

    it('deve rejeitar sabor sem saborTamanhoId', () => {
      const input = { ...pedidoValido, itens: [{ ...pedidoValido.itens[0], sabores: [{ fracao: 0.5 }] }] }
      const resultado = schema.safeParse({ body: input })
      expect(resultado.success).toBe(false)
    })

    it('deve rejeitar fracao maior que 1', () => {
      const input = { ...pedidoValido, itens: [{ ...pedidoValido.itens[0], sabores: [{ saborTamanhoId: 1, fracao: 1.5 }] }] }
      const resultado = schema.safeParse({ body: input })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('não pode ser maior que 1')
      }
    })

    it('deve aceitar fracao 1 (inteira), 0.5 (meia), 0.33 (terça)', () => {
      const fracoes = [1, 0.5, 0.33, 0.25]
      for (const fracao of fracoes) {
        const input = { ...pedidoValido, itens: [{ ...pedidoValido.itens[0], sabores: [{ saborTamanhoId: 1, fracao }] }] }
        const resultado = schema.safeParse({ body: input })
        expect(resultado.success).toBe(true)
      }
    })
  })

  describe('atualizarStatusSchema', () => {
    const schema = z.object({ body: atualizarStatusSchema })

    it('deve validar todos os status válidos', () => {
      const statusValidos = ['RECEBIDO', 'EM_PREPARO', 'EM_TRANSPORTE', 'CONCLUIDO', 'CANCELADO']
      for (const status of statusValidos) {
        const resultado = schema.safeParse({ body: { status } })
        expect(resultado.success).toBe(true)
      }
    })

    it('deve rejeitar status inválido', () => {
      const resultado = schema.safeParse({ body: { status: 'INVALIDO' } })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('inválido')
      }
    })
  })

  describe('pedidoParamsSchema', () => {
    it('deve validar ID numérico válido', () => {
      const resultado = pedidoParamsSchema.safeParse({ id: '123' })
      expect(resultado.success).toBe(true)
      if (resultado.success) {
        expect(resultado.data.id).toBe(123)
      }
    })

    it('deve rejeitar ID não numérico', () => {
      const resultado = pedidoParamsSchema.safeParse({ id: 'abc' })
      expect(resultado.success).toBe(false)
      if (!resultado.success) {
        expect(resultado.error.issues[0].message).toContain('número válido')
      }
    })
  })
})