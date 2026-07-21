# 🍕 Cardápio Digital & Pedidos - Pizzaria

Um sistema moderno e intuitivo de cardápio interativo e checkout de pedidos de pizza. O projeto conta com cálculo dinâmico de preços por tamanho/borda/sabores, suporte a múltiplos tipos de pedido (Mesa, Delivery e Balcão) e efeitos sonoros para uma experiência do usuário incrível.

---

## 🚀 Funcionalidades

- 📏 **Escolha Dinâmica de Tamanho:** Preços mínimos calculados automaticamente com base no tamanho selecionado.
- 🧀 **Borda Recheada Opcional:** Atualização em tempo real do valor total ao selecionar/desselecionar bordas.
- 🍕 **Seleção Multi-sabores:** Limitação automática de acordo com a quantidade máxima permitida por tamanho (ex: até 4 sabores numa pizza Grande).
- 🛵 **Fluxo de Atendimento Flexível:**
  - **🍽️ Mesa:** Nome / Número da Mesa.
  - **🛵 Delivery:** Validação de telefone/WhatsApp e endereço de entrega.
  - **🛍️ Balcão:** Retirada rápida.
- 🔊 **Efeitos Sonoros Integrados:** Audio feedback no clique dos botões e som comemorativo ao enviar o pedido (com opção de Mute/Unmute no topo).
- 🎨 **Interface Dark Mode:** Layout responsivo, elegante e otimizado para dispositivos móveis feito com Tailwind CSS.

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router, React, TypeScript)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) & [Lucide React](https://lucide.dev/) (Ícones)
- **Requisições HTTP:** [Axios](https://axios-http.com/)
- **Audio:** Web Audio API (Nativa do Navegador)

---

## 📂 Estrutura das Requisições (API)

O projeto se integra com um backend (Fastify / Express / Nest) enviando payloads validados para a rota `/pedidos`:

```json
{
  "clienteNome": "João Silva",
  "tipoPedido": "DELIVERY",
  "clienteTelefone": "(11) 99999-9999",
  "enderecoEntrega": "Rua das Flores, 123",
  "itens": [
    {
      "tamanhoId": 1,
      "bordaTamanhoId": 2,
      "quantidade": 1,
      "observacoes": "Sem cebola",
      "sabores": [
        { "saborTamanhoId": 10, "fracao": 0.5 },
        { "saborTamanhoId": 12, "fracao": 0.5 }
      ]
    }
  ]
}
```

## 🔧 Como Executar o Projeto

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- Node.js (v18 ou superior)
- Gerenciador de pacotes (npm, yarn ou pnpm)

### Passo a Passo

Clone o repositório:

```bash
git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
cd seu-repositorio
```

### Instale as dependências

```bash
npm install
# ou
yarn install
```

### Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do frontend e aponte para a sua API backend:

Snippet de código
NEXT_PUBLIC_API_URL=<http://localhost:3333>
Execute o servidor de desenvolvimento:

```bash
npm run dev
# ou
yarn dev
```

### Acesse no navegador

Acesse <http://localhost:3000> para ver o resultado.

### 📜 Licença

- Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes
