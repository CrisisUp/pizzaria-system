# 🍕 Pizzaria System

Sistema de cardápio digital e gestão de pedidos para pizzaria com painel da cozinha em tempo real.

## 🚀 Tecnologias

| Camada | Tecnologia |
| --- | --- |
| **Backend** | Fastify 5 + Zod + Prisma 5 + Socket.IO 4 |
| **Frontend** | Next.js 16 + Tailwind CSS 4 + Axios |
| **Banco** | PostgreSQL 16 |
| **Infra** | Docker Compose |

## ✅ Funcionalidades

- 📏 Escolha dinâmica de tamanho com precificação automática
- 🧀 Borda recheada opcional com atualização de preço em tempo real
- 🍕 Seleção multi-sabores com limite por tamanho
- 🛵 3 tipos de pedido: Mesa, Delivery e Balcão
- 🔊 Efeitos sonoros (Web Audio API) com opção Mute/Unmute
- 👨‍🍳 Painel Kanban da cozinha com WebSockets em tempo real
- 📚 Swagger UI em `/docs`
- 🎨 Tema escuro responsivo

## 🏗️ Estrutura

```
pizzaria-system/
├── backend/                         # API Fastify + Prisma
│   ├── prisma/
│   │   ├── schema.prisma            # Schema do banco
│   │   ├── migrations/              # Migrações SQL
│   │   └── seed.ts                  # Dados iniciais
│   ├── src/
│   │   ├── lib/prisma.ts            # Singleton PrismaClient
│   │   ├── types/sabor.ts           # Tipos compartilhados
│   │   ├── repositories/            # Interfaces + implementações Prisma
│   │   ├── routes/                  # Rotas Fastify com validação Zod
│   │   ├── schemas/                 # Schemas Zod
│   │   ├── services/                # Lógica de negócio
│   │   ├── server.ts                # Ponto de entrada
│   │   └── socket.ts                # Configuração Socket.IO
│   ├── Dockerfile
│   └── package.json
├── frontend/                        # Next.js App Router
│   ├── app/
│   │   ├── page.tsx                 # Cardápio - Monte sua pizza
│   │   ├── layout.tsx               # Layout raiz
│   │   ├── cozinha/page.tsx         # Painel Kanban da cozinha
│   │   ├── services/api.ts          # Axios config
│   │   └── types/pizzaria.ts        # Types compartilhados
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml               # Orquestração dos containers
└── README.md
```

## 🔧 Como Rodar

### Com Docker (recomendado)

```bash
# Suba todos os serviços
docker compose up -d

# Execute o seed uma única vez
docker compose exec backend npx prisma db seed

# Backend: http://localhost:3333
# Frontend: http://localhost:3000
# Swagger: http://localhost:3333/docs
```

### Frontend (local)

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### Caso o banco esteja vazio (reset de volume)

```bash
docker compose down -v
docker compose up -d
docker compose exec backend npx prisma db seed
```

## 📊 API Endpoints

### Sabores
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/sabores` | Listar todos os sabores com preços |
| GET | `/api/sabores/:id` | Buscar sabor por ID |
| POST | `/api/sabores` | Criar novo sabor |
| PUT | `/api/sabores/:id` | Atualizar sabor |
| DELETE | `/api/sabores/:id` | Deletar sabor |
| PUT | `/api/sabores/:id/ficha-tecnica` | Atualizar ficha técnica |

### Tamanhos
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/tamanhos` | Listar todos os tamanhos |
| POST | `/api/tamanhos` | Criar novo tamanho |
| PUT | `/api/tamanhos/:id` | Atualizar tamanho |
| DELETE | `/api/tamanhos/:id` | Deletar tamanho |

### Bordas
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/bordas` | Listar todas as bordas |
| POST | `/api/bordas` | Criar nova borda |
| PUT | `/api/bordas/:id` | Atualizar borda |
| DELETE | `/api/bordas/:id` | Deletar borda |

### Ingredientes
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/ingredientes` | Listar todos os ingredientes |
| GET | `/api/ingredientes/:id` | Buscar ingrediente por ID |
| POST | `/api/ingredientes` | Criar novo ingrediente |
| PUT | `/api/ingredientes/:id` | Atualizar ingrediente |
| DELETE | `/api/ingredientes/:id` | Deletar ingrediente |

### Pedidos
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/pedidos` | Listar todos os pedidos |
| POST | `/api/pedidos` | Criar novo pedido |
| PATCH | `/api/pedidos/:id/status` | Atualizar status do pedido |

### Outros
| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/health` | Healthcheck do servidor |
| GET | `/docs` | Swagger UI |

## 🧹 Limpeza

```bash
# Remove todos os containers, redes e volumes
docker compose down -v

# Remove build artifacts
rm -rf backend/dist frontend/.next
```

## 📝 Licença

MIT
