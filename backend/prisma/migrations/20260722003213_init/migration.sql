-- CreateEnum
CREATE TYPE "TipoPedido" AS ENUM ('BALCAO', 'DELIVERY', 'MESA');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('RECEBIDO', 'EM_PREPARO', 'EM_TRANSPORTE', 'CONCLUIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "tamanhos" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,
    "fatias" INTEGER NOT NULL DEFAULT 8,
    "fator_multiplicador" DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tamanhos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bordas" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(50) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bordas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "borda_tamanho_precos" (
    "id" SERIAL NOT NULL,
    "borda_id" INTEGER NOT NULL,
    "tamanho_id" INTEGER NOT NULL,
    "preco_venda" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "borda_tamanho_precos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sabores" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sabores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sabor_tamanho_precos" (
    "id" SERIAL NOT NULL,
    "sabor_id" INTEGER NOT NULL,
    "tamanho_id" INTEGER NOT NULL,
    "preco_venda" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "sabor_tamanho_precos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredientes" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "unidade_compra" VARCHAR(10) NOT NULL,
    "preco_ultima_compra" DECIMAL(10,2) NOT NULL,
    "quantidade_embalagem" DECIMAL(10,3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingredientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ficha_tecnica" (
    "id" SERIAL NOT NULL,
    "ingrediente_id" UUID NOT NULL,
    "sabor_tamanho_id" INTEGER,
    "borda_tamanho_id" INTEGER,
    "quantidade_usada" DECIMAL(10,3) NOT NULL,
    "unidade_medida" VARCHAR(10) NOT NULL,

    CONSTRAINT "ficha_tecnica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" SERIAL NOT NULL,
    "cliente_nome" VARCHAR(100) NOT NULL,
    "cliente_telefone" VARCHAR(20),
    "endereco_entrega" TEXT,
    "tipo_pedido" "TipoPedido" NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'RECEBIDO',
    "valor_total" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_itens" (
    "id" SERIAL NOT NULL,
    "pedido_id" INTEGER NOT NULL,
    "tamanho_id" INTEGER,
    "borda_tamanho_id" INTEGER,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "preco_borda_aplicado" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "preco_unitario_final" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "observacoes" TEXT,

    CONSTRAINT "pedido_itens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_item_sabores" (
    "id" SERIAL NOT NULL,
    "pedido_item_id" INTEGER NOT NULL,
    "sabor_tamanho_id" INTEGER NOT NULL,
    "fracao" DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    "preco_sabor_aplicado" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "pedido_item_sabores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "borda_tamanho_precos_borda_id_tamanho_id_key" ON "borda_tamanho_precos"("borda_id", "tamanho_id");

-- CreateIndex
CREATE UNIQUE INDEX "sabor_tamanho_precos_sabor_id_tamanho_id_key" ON "sabor_tamanho_precos"("sabor_id", "tamanho_id");

-- AddForeignKey
ALTER TABLE "borda_tamanho_precos" ADD CONSTRAINT "borda_tamanho_precos_borda_id_fkey" FOREIGN KEY ("borda_id") REFERENCES "bordas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "borda_tamanho_precos" ADD CONSTRAINT "borda_tamanho_precos_tamanho_id_fkey" FOREIGN KEY ("tamanho_id") REFERENCES "tamanhos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sabor_tamanho_precos" ADD CONSTRAINT "sabor_tamanho_precos_sabor_id_fkey" FOREIGN KEY ("sabor_id") REFERENCES "sabores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sabor_tamanho_precos" ADD CONSTRAINT "sabor_tamanho_precos_tamanho_id_fkey" FOREIGN KEY ("tamanho_id") REFERENCES "tamanhos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ficha_tecnica" ADD CONSTRAINT "ficha_tecnica_ingrediente_id_fkey" FOREIGN KEY ("ingrediente_id") REFERENCES "ingredientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ficha_tecnica" ADD CONSTRAINT "ficha_tecnica_sabor_tamanho_id_fkey" FOREIGN KEY ("sabor_tamanho_id") REFERENCES "sabor_tamanho_precos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ficha_tecnica" ADD CONSTRAINT "ficha_tecnica_borda_tamanho_id_fkey" FOREIGN KEY ("borda_tamanho_id") REFERENCES "borda_tamanho_precos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_tamanho_id_fkey" FOREIGN KEY ("tamanho_id") REFERENCES "tamanhos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_itens" ADD CONSTRAINT "pedido_itens_borda_tamanho_id_fkey" FOREIGN KEY ("borda_tamanho_id") REFERENCES "borda_tamanho_precos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_item_sabores" ADD CONSTRAINT "pedido_item_sabores_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_itens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_item_sabores" ADD CONSTRAINT "pedido_item_sabores_sabor_tamanho_id_fkey" FOREIGN KEY ("sabor_tamanho_id") REFERENCES "sabor_tamanho_precos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
