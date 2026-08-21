FROM node:20-alpine

# Instala bibliotecas necessárias para o Prisma funcionar no Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# 1. Instala dependências ANTES de copiar o código (melhor cache de layers)
COPY package*.json ./
RUN npm install

# 2. Copia o código e gera o Prisma Client
COPY . .
RUN npx prisma generate
RUN rm -rf dist && npm run build

EXPOSE 3333

# Seed NÃO roda aqui — use 'docker compose run backend npx prisma db seed' uma vez
CMD ["/bin/sh", "-c", "npx prisma migrate deploy && npm run start"]
