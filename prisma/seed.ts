import { PrismaClient, TipoExpediente, TipoContato } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed (LIMPEZA TOTAL)...");

  // Clear existing data in reverse order of dependency
  await prisma.guiaMSE.deleteMany();
  await prisma.acolhimento.deleteMany();
  await prisma.bemApreendido.deleteMany();
  await prisma.plantaoRegistro.deleteMany();
  await prisma.presoProvisorio.deleteMany();
  await prisma.expediente.deleteMany();
  await prisma.contato.deleteMany();
  await prisma.processo.deleteMany();

  console.log("🧹 Banco de dados limpo com sucesso.");

  // 1. Create Processos
  console.log("📂 Criando Processos...");
  const processos = await Promise.all([
    prisma.processo.create({ data: { numero_processo: "0000123-45.2024.8.15.0001" } }),
    prisma.processo.create({ data: { numero_processo: "0000456-78.2025.8.15.0001" } }),
    prisma.processo.create({ data: { numero_processo: "0000789-01.2025.8.15.0001" } }),
    prisma.processo.create({ data: { numero_processo: "0001337-22.2026.8.15.0001" } }),
    prisma.processo.create({ data: { numero_processo: "0009999-00.2026.8.15.0001" } }),
  ]);

  // 2. Create Presos Provisórios
  console.log("⛓️ Criando Presos Provisórios...");
  await prisma.presoProvisorio.createMany({
    data: [
      {
        nome: "JOSÉ DA SILVA SANTOS",
        processoId: processos[0].id,
        data_prisao: new Date(),
        situacao_criminal: "AGUARDANDO JULGAMENTO",
        data_ultima_revisao: new Date(),
        data_vencimento: new Date(new Date().setDate(new Date().getDate() + 90)), // 90 days from now
      },
      {
        nome: "MARCUS AURÉLIUS LIMA",
        processoId: processos[1].id,
        data_prisao: new Date(new Date().setDate(new Date().getDate() - 85)),
        situacao_criminal: "FLAGRANTE CONVERTIDO",
        data_ultima_revisao: new Date(),
        data_vencimento: new Date(new Date().setDate(new Date().getDate() + 5)), // Vencendo logo
      }
    ]
  });

  // 3. Create Acolhimentos (Infância)
  console.log("🏠 Criando Acolhimentos...");
  await prisma.acolhimento.createMany({
    data: [
      {
        nome_menor: "MENOR A.B.C.",
        data_acolhimento: new Date(new Date().setDate(new Date().getDate() - 30)),
        local_acolhimento: "FAMÍLIA ACOLHEDORA",
        data_proxima_revaliacao: new Date(new Date().setDate(new Date().getDate() + 60)),
        status: "ACOLHIDO",
      },
      {
        nome_menor: "MENOR X.Y.Z.",
        data_acolhimento: new Date(new Date().setDate(new Date().getDate() - 10)),
        local_acolhimento: "ABRIGO",
        data_proxima_revaliacao: new Date(new Date().setDate(new Date().getDate() + 80)),
        status: "ACOLHIDO",
      }
    ]
  });

  // 4. Create Guias MSE
  console.log("📋 Criando Guias MSE...");
  await prisma.guiaMSE.createMany({
    data: [
      {
        infrator: "JOVEM APRENDIZ 01",
        numero_guia: "MSE-2026-001",
        processoId: processos[4].id,
        comarca_destino: "JOÃO PESSOA",
        providencia: "LIBERDADE ASSISTIDA EM CUMPRIMENTO",
      }
    ]
  });

  // 5. Create Plantão Registros
  console.log("⚖️ Criando Registros de Plantão...");
  await prisma.plantaoRegistro.createMany({
    data: [
      {
        nome: "SUSPEITO DE FURTO X",
        tipo: "FLAGRANTE",
        situacao: "CONCEDIDA LIBERDADE",
        encaminhamento: "ARQUIVADO",
        mes_referencia: "ABRIL 2026",
      },
      {
        nome: "FLAGRANTE TRÁFICO Y",
        tipo: "FLAGRANTE",
        situacao: "MANUTENÇÃO DA PRISÃO",
        encaminhamento: "ENCAMINHADO AO PRESÍDIO",
        mes_referencia: "ABRIL 2026",
      }
    ]
  });

  // 6. Create Bens Apreendidos
  console.log("📦 Criando Bens Apreendidos...");
  await prisma.bemApreendido.createMany({
    data: [
      {
        processoId: processos[0].id,
        descricao: "VEÍCULO GOL PRATA",
        localizacao: "PÁTIO DA DP",
        cadastrado_sngb: "SIM",
      },
      {
        processoId: processos[3].id,
        descricao: "ARMA DE FOGO TIPO REVÓLVER",
        localizacao: "COFRE DO FÓRUM",
        cadastrado_sngb: "NÃO",
      }
    ]
  });

  // 7. Create Contatos
  console.log("📞 Criando Contatos Profissionais...");
  await prisma.contato.createMany({
    data: [
      { nome: "DELEGACIA DE QUEIMADAS", tipo: TipoContato.DELEGACIA, telefone: "(83) 3300-0001", email: "dp.queimadas@pc.pb.gov.br" },
      { nome: "PRESÍDIO REGIONAL CG", tipo: TipoContato.PRESIDIO, telefone: "(83) 3310-0002", email: "presidio.cg@seap.pb.gov.br" },
      { nome: "DR. LUCAS MEDEIROS", tipo: TipoContato.ADVOGADO, telefone: "(83) 99999-0001", oab: "PB 12345" },
    ]
  });

  // 8. Create Expedientes (Ofícios e Alvarás)
  console.log("📝 Criando Expedientes...");
  const currentYear = new Date().getFullYear();
  await prisma.expediente.createMany({
    data: [
      { processoId: processos[0].id, tipo: TipoExpediente.OFICIO, ano: currentYear, numero_sequencial: 1, destinatario_beneficiario: "DELEGACIA", data_emissao: new Date() },
      { processoId: processos[1].id, tipo: TipoExpediente.ALVARA, ano: currentYear, numero_sequencial: 1, destinatario_beneficiario: "JOAQUIM DA SILVA", valor: 5000.00, data_emissao: new Date() },
    ]
  });

  console.log("🚀 Seed finalizado com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
