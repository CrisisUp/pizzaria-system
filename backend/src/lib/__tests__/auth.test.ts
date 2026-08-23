import { describe, it, expect, vi, beforeEach } from 'vitest'
import { hashPassword, comparePassword, generateToken, verifyToken, authenticateRequest } from '../auth'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

describe('lib/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('deve chamar bcrypt.hash com a senha e salt rounds 10', async () => {
      const senha = 'minhasenha123'
      const hashEsperado = 'hashed_password'

      vi.mocked(bcrypt.hash).mockResolvedValue(hashEsperado)

      const resultado = await hashPassword(senha)

      expect(bcrypt.hash).toHaveBeenCalledWith(senha, 10)
      expect(resultado).toBe(hashEsperado)
    })
  })

  describe('comparePassword', () => {
    it('deve retornar true quando senha confere com hash', async () => {
      const senha = 'minhasenha123'
      const hash = 'hashed_password'

      vi.mocked(bcrypt.compare).mockResolvedValue(true)

      const resultado = await comparePassword(senha, hash)

      expect(bcrypt.compare).toHaveBeenCalledWith(senha, hash)
      expect(resultado).toBe(true)
    })

    it('deve retornar false quando senha não confere', async () => {
      const senha = 'senhaerrada'
      const hash = 'hashed_password'

      vi.mocked(bcrypt.compare).mockResolvedValue(false)

      const resultado = await comparePassword(senha, hash)

      expect(resultado).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('deve gerar token JWT com payload correto', () => {
      const payload = { usuarioId: 1, email: 'test@test.com', nome: 'Test User' }
      const tokenEsperado = 'mock_token'

      vi.mocked(jwt.sign).mockReturnValue(tokenEsperado)

      const resultado = generateToken(payload)

      expect(jwt.sign).toHaveBeenCalledWith(payload, expect.any(String), { expiresIn: '7d' })
      expect(resultado).toBe(tokenEsperado)
    })
  })

  describe('verifyToken', () => {
    it('deve retornar payload quando token válido', () => {
      const token = 'valid_token'
      const payloadEsperado = { usuarioId: 1, email: 'test@test.com', nome: 'Test User' }

      vi.mocked(jwt.verify).mockReturnValue(payloadEsperado)

      const resultado = verifyToken(token)

      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String))
      expect(resultado).toEqual(payloadEsperado)
    })

    it('deve retornar null quando token inválido', () => {
      const token = 'invalid_token'

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const resultado = verifyToken(token)

      expect(resultado).toBeNull()
    })

    it('deve retornar null quando token expirado', () => {
      const token = 'expired_token'

      vi.mocked(jwt.verify).mockImplementation(() => {
        const err = new Error('jwt expired')
        err.name = 'TokenExpiredError'
        throw err
      })

      const resultado = verifyToken(token)

      expect(resultado).toBeNull()
    })
  })

  describe('authenticateRequest', () => {
    it('deve retornar null quando não há header Authorization', async () => {
      const request = new Request('http://localhost', {
        headers: {},
      })

      const resultado = await authenticateRequest(request)

      expect(resultado).toBeNull()
    })

    it('deve retornar null quando header não começa com Bearer', async () => {
      const request = new Request('http://localhost', {
        headers: { authorization: 'Basic abc123' },
      })

      const resultado = await authenticateRequest(request)

      expect(resultado).toBeNull()
    })

    it('deve retornar payload quando token válido', async () => {
      const request = new Request('http://localhost', {
        headers: { authorization: 'Bearer valid_token' },
      })

      vi.mocked(jwt.verify).mockReturnValue({ usuarioId: 1, email: 'test@test.com', nome: 'Test User' })

      const resultado = await authenticateRequest(request)

      expect(resultado).toEqual({ usuarioId: 1, email: 'test@test.com', nome: 'Test User' })
    })

    it('deve retornar null quando token inválido', async () => {
      const request = new Request('http://localhost', {
        headers: { authorization: 'Bearer invalid_token' },
      })

      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const resultado = await authenticateRequest(request)

      expect(resultado).toBeNull()
    })
  })
})