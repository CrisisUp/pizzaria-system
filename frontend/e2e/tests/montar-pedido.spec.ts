import { test, expect } from '@playwright/test'
import { HomePage } from '../pages/HomePage'

test.describe('Montar Pedido', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goto()
  })

  test('deve montar pizza e fazer pedido balcão', async () => {
    await homePage.selecionarTamanho('Grande')
    await homePage.selecionarBorda('Catupiry')
    await homePage.selecionarSabores(['Calabresa', 'Mussarela'])
    await homePage.preencherCliente('João Silva', 'BALCAO')
    await homePage.finalizarPedido()
    await expect(homePage.page.locator('text=Pedido enviado com sucesso')).toBeVisible()
  })

  test('deve respeitar maxSabores do tamanho', async () => {
    await homePage.selecionarTamanho('Broto') // maxSabores = 1 (padrão)
    await homePage.selecionarSabores(['Calabresa'])

    // Tentar selecionar segundo sabor - deve estar desabilitado
    const segundoSabor = homePage.page.locator('[data-testid="sabor-Mussarela"]')
    await expect(segundoSabor).toBeDisabled()
  })

  test('deve permitir até maxSabores sabores', async () => {
    await homePage.selecionarTamanho('Grande') // maxSabores = 2
    await homePage.selecionarSabores(['Calabresa', 'Mussarela'])

    const primeiroSabor = await homePage.isSaborSelecionado('Calabresa')
    const segundoSabor = await homePage.isSaborSelecionado('Mussarela')
    expect(primeiroSabor).toBe(true)
    expect(segundoSabor).toBe(true)

    // Terceiro deve estar desabilitado
    const terceiroSabor = await homePage.isSaborDisabled('Frango com Catupiry')
    expect(terceiroSabor).toBe(true)
  })

  test('deve calcular preço corretamente', async () => {
    await homePage.selecionarTamanho('Grande')
    await homePage.selecionarBorda('Catupiry')
    await homePage.selecionarSabores(['Calabresa'])
    const preco = await homePage.getPrecoTotal()
    expect(preco).toBeGreaterThan(0)
  })

  test('deve fazer pedido mesa', async () => {
    await homePage.selecionarTamanho('Média')
    await homePage.selecionarSabores(['Portuguesa'])
    await homePage.preencherCliente('Mesa 04 - Carlos', 'MESA')
    await homePage.finalizarPedido()
    await expect(homePage.page.locator('text=Pedido enviado com sucesso')).toBeVisible()
  })

  test('deve fazer pedido delivery com telefone e endereço', async () => {
    await homePage.selecionarTamanho('Grande')
    await homePage.selecionarBorda('Cheddar')
    await homePage.selecionarSabores(['Frango com Catupiry'])
    await homePage.preencherCliente('Ana Paula', 'DELIVERY', '(11) 98888-7777', 'Av. Principal, 456 - Apto 101')
    await homePage.finalizarPedido()
    await expect(homePage.page.locator('text=Pedido enviado com sucesso')).toBeVisible()
  })

  test('deve validar campos obrigatórios para delivery', async () => {
    await homePage.selecionarTamanho('Grande')
    await homePage.selecionarSabores(['Calabresa'])
    await homePage.preencherCliente('Sem telefone', 'DELIVERY')

    await homePage.finalizarButton.click()

    // Deve mostrar alerta
    await expect(homePage.page.locator('text=telefone e endereço')).toBeVisible({ timeout: 5000 })
  })

  test('deve limpar formulário após pedido bem-sucedido', async () => {
    await homePage.selecionarTamanho('Grande')
    await homePage.selecionarBorda('Catupiry')
    await homePage.selecionarSabores(['Calabresa'])
    await homePage.preencherCliente('Teste Limpeza', 'BALCAO')
    await homePage.preencherObservacoes('Teste observação')
    await homePage.finalizarPedido()

    // Verificar se formulário foi limpo
    await expect(homePage.clienteNomeInput).toHaveValue('')
    await expect(homePage.observacoesTextarea).toHaveValue('')
  })

  test('deve alternar seleção de sabor', async () => {
    await homePage.selecionarTamanho('Grande')
    await homePage.selecionarSabores(['Calabresa'])
    expect(await homePage.isSaborSelecionado('Calabresa')).toBe(true)

    // Clicar novamente para deselecionar
    await homePage.page.click('[data-testid="sabor-Calabresa"]')
    expect(await homePage.isSaborSelecionado('Calabresa')).toBe(false)
  })
})