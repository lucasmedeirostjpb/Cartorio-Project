-- CreateTable
CREATE TABLE "Processo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero_processo" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Expediente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "numero_sequencial" INTEGER NOT NULL,
    "destinatario_beneficiario" TEXT NOT NULL,
    "valor" REAL,
    "data_emissao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Expediente_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contato" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "oab" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PlantaoRegistro" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "adv_dp" TEXT,
    "bnmp" TEXT,
    "processoId" INTEGER,
    "tipo" TEXT,
    "servidor" TEXT,
    "assessor" TEXT,
    "situacao" TEXT,
    "encaminhamento" TEXT,
    "preso_em" TEXT,
    "mes_referencia" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlantaoRegistro_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PresoProvisorio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "data_prisao" DATETIME,
    "processoId" INTEGER NOT NULL,
    "situacao_criminal" TEXT,
    "data_ultima_revisao" DATETIME NOT NULL,
    "data_vencimento" DATETIME NOT NULL,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PresoProvisorio_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BemApreendido" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "processoId" INTEGER NOT NULL,
    "bin" TEXT,
    "descricao" TEXT NOT NULL,
    "data_apreensao" DATETIME,
    "procedimento" TEXT,
    "localizacao" TEXT,
    "cadastrado_sngb" TEXT,
    "data_cadastro_sngb" DATETIME,
    "observacoes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BemApreendido_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Acolhimento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_menor" TEXT NOT NULL,
    "data_acolhimento" DATETIME,
    "processoId" INTEGER,
    "local_acolhimento" TEXT,
    "data_proxima_revaliacao" DATETIME NOT NULL,
    "dados_familiares" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACOLHIDO',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Acolhimento_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GuiaMSE" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "numero_guia" TEXT,
    "infrator" TEXT NOT NULL,
    "processoId" INTEGER NOT NULL,
    "comarca_destino" TEXT NOT NULL,
    "providencia" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GuiaMSE_processoId_fkey" FOREIGN KEY ("processoId") REFERENCES "Processo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Processo_numero_processo_key" ON "Processo"("numero_processo");

-- CreateIndex
CREATE UNIQUE INDEX "Expediente_tipo_ano_numero_sequencial_key" ON "Expediente"("tipo", "ano", "numero_sequencial");

-- CreateIndex
CREATE UNIQUE INDEX "PresoProvisorio_processoId_key" ON "PresoProvisorio"("processoId");
