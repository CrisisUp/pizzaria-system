#!/bin/sh

# Aplica as migrations pendentes no banco de dados
echo "🚀 Executando migrations do Prisma..."
npx prisma migrate deploy

# Executa os seeds (se houver)
echo "🌱 Populando o banco com seeds..."
npx prisma db seed

# Inicia a aplicação em produção
echo "🔥 Iniciando o servidor Node.js..."
exec "$@"