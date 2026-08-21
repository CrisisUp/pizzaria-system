FROM node:20-alpine

# Instala bibliotecas necessárias para o Prisma funcionar no Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./
RUN npm install --save-dev @types/node

COPY . .

# Gera o Prisma Client e faz o build da aplicação
RUN npx prisma generate
RUN rm -rf dist && npm run build

EXPOSE 3333

CMD ["/bin/sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm run start"]