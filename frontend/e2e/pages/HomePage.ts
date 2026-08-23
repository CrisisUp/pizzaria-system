import { Page, Locator, expect } from '@playwright/test'

export class HomePage {
  readonly page: Page
  readonly tamanhoButtons: Locator
  readonly bordaButtons: Locator
  readonly saborButtons: Locator
  readonly clienteNomeInput: Locator
  readonly tipoPedidoButtons: Locator
  readonly clienteTelefoneInput: Locator
  readonly enderecoEntregaInput: Locator
  readonly observacoesTextarea: Locator
  readonly finalizarButton: Locator
  readonly precoTotal: Locator

  constructor(page: Page) {
    this.page = page
    this.tamanhoButtons = page.locator('[data-testid^="tamanho-"]')
    this.bordaButtons = page.locator('[data-testid^="borda-"]')
    this.saborButtons = page.locator('[data-testid^="sabor-"]')
    this.clienteNomeInput = page.locator('[data-testid="cliente-nome"]')
    this.tipoPedidoButtons = page.locator('[data-testid^="tipo-pedido-"]')
    this.clienteTelefoneInput = page.locator('[data-testid="cliente-telefone"]')
    this.enderecoEntregaInput = page.locator('[data-testid="endereco-entrega"]')
    this.observacoesTextarea = page.locator('[data-testid="observacoes"]')
    this.finalizarButton = page.locator('[data-testid="finalizar-pedido"]')
    this.precoTotal = page.locator('[data-testid="preco-total"]')
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForLoadState('networkidle')
  }

  async selecionarTamanho(nome: string) {
    await this.page.click(`[data-testid="tamanho-${nome}"]`)
  }

  async selecionarBorda(nome: string | null) {
    if (nome) {
      await this.page.click(`[data-testid="borda-${nome}"]`)
    } else {
      await this.page.click('[data-testid="borda-sem"]')
    }
  }

  async selecionarSabores(nomes: string[]) {
    for (const nome of nomes) {
      await this.page.click(`[data-testid="sabor-${nome}"]`)
    }
  }

  async preencherCliente(nome: string, tipo: 'MESA' | 'DELIVERY' | 'BALCAO', telefone?: string, endereco?: string) {
    await this.clienteNomeInput.fill(nome)
    await this.page.click(`[data-testid="tipo-pedido-${tipo}"]`)
    if (tipo === 'DELIVERY') {
      await this.clienteTelefoneInput.fill(telefone || '')
      await this.enderecoEntregaInput.fill(endereco || '')
    }
  }

  async preencherObservacoes(observacoes: string) {
    await this.observacoesTextarea.fill(observacoes)
  }

  async finalizarPedido() {
    await this.finalizarButton.click()
    await expect(this.page.locator('text=Pedido enviado com sucesso')).toBeVisible({ timeout: 10000 })
  }

  async getPrecoTotal(): Promise<number> {
    const text = await this.precoTotal.textContent()
    return parseFloat(text?.replace('R$ ', '').replace(',', '.') || '0')
  }

  async isSaborSelecionado(nome: string): Promise<boolean> {
    const button = this.page.locator(`[data-testid="sabor-${nome}"]`)
    const className = await button.getAttribute('class')
    return className?.includes('border-orange-500') || false
  }

  async isSaborDisabled(nome: string): Promise<boolean> {
    const button = this.page.locator(`[data-testid="sabor-${nome}"]`)
    return await button.isDisabled()
  }
}