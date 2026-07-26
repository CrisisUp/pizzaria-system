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
├── backend/                    # API Fastify + Prisma
│   ├── prisma/                 # Schema + migrations + seed
│   ├── src/
│   │   ├── controllers/        # Controller do pedido (legado)
│   │   ├── lib/                # Singleton PrismaClient
│   │   ├── repositories/       # Interfaces + implementações Prisma
│   │   ├── routes/             # Rotas Fastify com validação Zod
│   │   ├── schemas/            # Schemas Zod
│   │   ├── services/           # Lógica de negócio
│   │   ├── server.ts           # Ponto de entrada
│   │   └── socket.ts           # Configuração Socket.IO
│   └── package.json
├── frontend/                   # Next.js App Router
│   └── app/
│       ├── page.tsx            # Cardápio - Monte sua pizza
│       ├── cozinha/page.tsx    # Painel Kanban da cozinha
│       ├── services/api.ts     # Axios config
│       └── types/pizzaria.ts   # Types compartilhados
├── docker-compose.yml          # Orquestração dos containers
├── Dockerfile.backend          # Build da imagem do backend
└── tsconfig.json               # Config TypeScript do monorepo
```

## 🔧 Como Rodar

### Com Docker (recomendado)

```bash
docker compose up -d
# Backend: http://localhost:3333
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
# Rodar migration e seed manualmente (ver seção abaixo)
```

### Migração manual e seed (se necessário)

```bash
# Conecte no container e execute:
docker exec -i pizzaria-postgres psql -U pizzaria -d pizzaria < backend/prisma/migrations/20260721155409_init_fix_uuid/migration.sql

# Depois rode os inserts de seed (tamanhos, bordas, sabores e preços)
docker exec -i pizzaria-postgres psql -U pizzaria -d pizzaria -c "
ALTER TABLE tamanhos ADD COLUMN IF NOT EXISTS max_sabores INTEGER NOT NULL DEFAULT 2;
INSERT INTO tamanhos (nome, fatias, max_sabores, fator_multiplicador) VALUES
  ('Broto', 4, 2, 0.6), ('Média', 8, 3, 1.0), ('Grande', 10, 4, 1.3);
INSERT INTO bordas (nome) VALUES ('Catupiry'), ('Cheddar');
INSERT INTO sabores (nome, descricao) VALUES
  ('Margherita', 'Muçarela, molho e manjericão'),
  ('Calabresa', 'Calabresa, cebola e azeitonas'),
  ('Portuguesa', 'Presunto, ovo, cebola e azeitonas');
"
```

## 📊 API Endpoints

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/api/sabores` | Listar sabores com preços |
| GET | `/api/tamanhos` | Listar tamanhos |
| GET | `/api/bordas` | Listar bordas |
| GET | `/api/ingredientes` | Listar ingredientes |
| POST | `/api/pedidos` | Criar pedido |
| GET | `/api/pedidos` | Listar pedidos |
| PATCH | `/api/pedidos/:id/status` | Atualizar status |
| GET | `/health` | Healthcheck |
| GET | `/docs` | Swagger UI |

## 🧹 Limpeza

```bash
# Remove todos os containers, redes e volumes
docker compose down -v

# Remove node_modules do Windows (se existir)
rm -r backend/node_modules
rm -r frontend/.next
```

## 📝 Licença

MIT
