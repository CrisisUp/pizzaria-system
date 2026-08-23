import { describe, it, expect } from 'vitest'
import { sanitizeText } from '../sanitize'

describe('lib/sanitize', () => {
  describe('sanitizeText', () => {
    it('deve retornar string vazia para input vazio', () => {
      expect(sanitizeText('')).toBe('')
      expect(sanitizeText('   ')).toBe('')
    })

    it('deve retornar null/undefined como está', () => {
      expect(sanitizeText(null as any)).toBeNull()
      expect(sanitizeText(undefined as any)).toBeUndefined()
    })

    it('deve remover tags script', () => {
      const input = '<script>alert("xss")</script>Texto normal'
      const resultado = sanitizeText(input)
      expect(resultado).not.toContain('<script>')
      expect(resultado).not.toContain('</script>')
      expect(resultado).toContain('Texto normal')
    })

    it('deve remover tags iframe', () => {
      const input = '<iframe src="evil.com"></iframe>Texto'
      const resultado = sanitizeText(input)
      expect(resultado).not.toContain('<iframe')
      expect(resultado).not.toContain('</iframe>')
    })

    it('deve remover tags object/embed/form/input/textarea/button/link/meta/base/applet', () => {
      const tags = ['object', 'embed', 'form', 'input', 'textarea', 'button', 'link', 'meta', 'base', 'applet']
      for (const tag of tags) {
        const input = `<${tag}>conteúdo</${tag}>`
        const resultado = sanitizeText(input)
        expect(resultado).not.toContain(`<${tag}>`)
        expect(resultado).not.toContain(`</${tag}>`)
      }
    })

    it('deve remover event handlers (onclick, onerror, onload, etc.)', () => {
      const input = '<div onclick="alert(1)" onerror="steal()">Texto</div>'
      const resultado = sanitizeText(input)
      expect(resultado).not.toContain('onclick=')
      expect(resultado).not.toContain('onerror=')
      expect(resultado).toContain('Texto')
    })

    it('deve remover javascript: URIs', () => {
      const input = '<a href="javascript:alert(1)">Link</a>'
      const resultado = sanitizeText(input)
      expect(resultado).not.toContain('javascript:')
    })

    it('deve remover data: URIs perigosos', () => {
      const input = '<img src="data:text/html,<script>alert(1)</script>">'
      const resultado = sanitizeText(input)
      expect(resultado).not.toContain('data:text/html')
    })

    it('deve remover SVG com onload', () => {
      const input = '<svg onload="alert(1)"></svg>'
      const resultado = sanitizeText(input)
      expect(resultado).not.toContain('onload=')
    })

    it('deve preservar < e > para expressoes matematicas e codigo', () => {
      const input = 'a < b > c'
      const resultado = sanitizeText(input)
      // A função preserva < e > para casos legitimos (expressoes matematicas, codigo)
      expect(resultado).toBe('a < b > c')
    })

    it('deve preservar texto normal com acentos e pontuação', () => {
      const input = 'Olá, mundo! Teste com acentos: áéíóú àèìòù'
      const resultado = sanitizeText(input)
      expect(resultado).toBe(input)
    })

    it('deve lidar com strings apenas com espaços', () => {
      expect(sanitizeText('   ')).toBe('')
    })

    it('deve remover múltiplas tags aninhadas', () => {
      const input = '<div><script>alert(1)</script><span onclick="x">Texto</span></div>'
      const resultado = sanitizeText(input)
      expect(resultado).not.toContain('<script>')
      expect(resultado).not.toContain('onclick=')
      expect(resultado).toContain('Texto')
    })

    it('deve fazer trim no resultado', () => {
      const input = '  texto com espaços  '
      const resultado = sanitizeText(input)
      expect(resultado).toBe('texto com espaços')
    })
  })
})