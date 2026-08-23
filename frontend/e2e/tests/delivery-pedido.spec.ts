import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

test.describe('Pedido Delivery', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
  })

  test('deve exibir campos de telefone e endereço apenas para delivery', async () => {
    // Inicialmente deve ser MESA (padrão)
    await expect(homePage.clienteTelefoneInput).toBeHidden()
    await expect(homePage.enderecoEntregaInput).toBeHidden()

    // Mudar para DELIVERY
    await homePage.page.click('[data-testid="tipo-pedido-DELIVERY"]')
    await expect(homePage.clienteTelefoneInput).toBeVisible()
    await expect(homePage.enderecoEntregaInput).toBeVisible()

    // Voltar para BALCAO
    await homePage.page.click('[data-testid="tipo-pedido-BALCAO"]')
    await expect(homePage.clienteTelefoneInput).toBeHidden()
    await expect(homePage.enderecoEntregaInput).toBeHidden()
  })

  test('deve validar telefone obrigatório para delivery', async () => {
    await homePage.selecionarTamanho('Grande')
    await homePage.selecionarSabores(['Calabresa'])
    await homePage.preencherCliente('João', 'DELIVERY', '', 'Rua Teste, 123')
    await homePage.finalizarButton.click()

    await expect(homePage.page.locator('text=telefone e endereço')).toBeVisible({ timeout: 5000 })
  })

  test('deve validar endereço obrigatório para delivery', async () => {
    await homePage.selecionarTamanho('Grande')
    await homePage.selecionarSabores(['Calabresa'])
    await homePage.preencherCliente('João', 'DELIVERY', '(11) 99999-9999', '')
    await homePage.finalizarButton.click()

    await expect(homePage.page.locator('text=telefone e endereço')).toBeVisible({ timeout: 5000 })
  })

  test('deve aceitar pedido delivery completo', async () => {
    await homePage.selecionarTamanho('Grande')
    await homePage.selecionarBorda('Catupiry')
    await homePage.selecionarSabores(['Calabresa', 'Mussarela'])
    await homePage.preencherCliente('João Delivery', 'DELIVERY', '(11) 99999-8888', 'Rua das Palmeiras, 789 - Casa')
    await homePage.preencherObservacoes('Interfone 101')
    await homePage.finalizarPedido()

    await expect(homePage.page.locator('text=Pedido enviado com sucesso')).toBeVisible()
  })

  test('deve manter tipo de pedido selecionado visualmente', async () => {
    await homePage.page.click('[data-testid="tipo-pedido-DELIVERY"]')
    const deliveryButton = homePage.page.locator('[data-testid="tipo-pedido-DELIVERY"]')
    await expect(deliveryButton).toHaveClass(/bg-orange-500/)

    await homePage.page.click('[data-testid="tipo-pedido-MESA"]')
    const mesaButton = homePage.page.locator('[data-testid="tipo-pedido-MESA"]')
    await expect(mesaButton).toHaveClass(/bg-orange-500/)
  })
})