import { PrismaClient, TipoExpediente, TipoContato } from "@prisma/client";

// In seed script, we rely on the env var or standard initialization
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // Clear existing data in reverse order of dependency
  await prisma.expediente.deleteMany();
  await prisma.processo.deleteMany();
  await prisma.contato.deleteMany();

  // Create Processos
  const processos = await Promise.all([
    prisma.processo.create({ data: { numero_processo: "0000123-45.2024.8.15.0001" } }),
    prisma.processo.create({ data: { numero_processo: "0000456-78.2025.8.15.0001" } }),
    prisma.processo.create({ data: { numero_processo: "0000789-01.2025.8.15.0001" } }),
    prisma.processo.create({ data: { numero_processo: "0001234-56.2026.8.15.0001" } }),
    prisma.processo.create({ data: { numero_processo: "0002345-67.2026.8.15.0001" } }),
  ]);

  // Create Expedientes for current year
  const currentYear = new Date().getFullYear();
  await prisma.expediente.createMany({
    data: [
      {
        processoId: processos[0].id,
        tipo: TipoExpediente.OFICIO,
        ano: currentYear,
        numero_sequencial: 1,
        destinatario_beneficiario: "Delegacia de Queimadas",
        data_emissao: new Date(currentYear, 0, 15),
      },
      {
        processoId: processos[1].id,
        tipo: TipoExpediente.OFICIO,
        ano: currentYear,
        numero_sequencial: 2,
        destinatario_beneficiario: "Presidio PB-1 - João Pessoa",
        data_emissao: new Date(currentYear, 1, 20),
      },
      {
        processoId: processos[2].id,
        tipo: TipoExpediente.OFICIO,
        ano: currentYear,
        numero_sequencial: 3,
        destinatario_beneficiario: "Conselho Tutelar de Queimadas",
        data_emissao: new Date(currentYear, 2, 10),
      },
      {
        processoId: processos[0].id,
        tipo: TipoExpediente.ALVARA,
        ano: currentYear,
        numero_sequencial: 1,
        destinatario_beneficiario: "Maria da Silva",
        valor: 2500.0,
        data_emissao: new Date(currentYear, 0, 22),
      },
      {
        processoId: processos[3].id,
        tipo: TipoExpediente.ALVARA,
        ano: currentYear,
        numero_sequencial: 2,
        destinatario_beneficiario: "João Santos",
        valor: 15000.0,
        data_emissao: new Date(currentYear, 2, 5),
      },
    ],
  });

  // Create Contatos
  await prisma.contato.createMany({
    data: [
      {
        nome: "Delegacia de Polícia Civil - Queimadas",
        tipo: TipoContato.DELEGACIA,
        telefone: "(83) 3000-1001",
        email: "delegacia.queimadas@policiacivil.pb.gov.br",
      },
      {
        nome: "Delegacia de Polícia Civil - Campina Grande",
        tipo: TipoContato.DELEGACIA,
        telefone: "(83) 3000-2002",
        email: "delegacia.cg@policiacivil.pb.gov.br",
      },
      {
        nome: "Presídio PB-1 - João Pessoa",
        tipo: TipoContato.PRESIDIO,
        telefone: "(83) 3200-5000",
        email: "pb1@seap.pb.gov.br",
      },
      {
        nome: "Penitenciária Padrão de CG",
        tipo: TipoContato.PRESIDIO,
        telefone: "(83) 3200-5100",
        email: "penitenciaria.cg@seap.pb.gov.br",
      },
      {
        nome: "Dr. Carlos Eduardo Mendes",
        tipo: TipoContato.ADVOGADO,
        telefone: "(83) 99900-1234",
        email: "carlos.mendes@adv.oabpb.org.br",
        oab: "PB 12.345",
      },
      {
        nome: "Dra. Ana Beatriz Souza",
        tipo: TipoContato.ADVOGADO,
        telefone: "(83) 99800-5678",
        email: "ana.souza@adv.oabpb.org.br",
        oab: "PB 67.890",
      },
      {
        nome: "Dr. Roberto Farias Lima",
        tipo: TipoContato.ADVOGADO,
        telefone: "(83) 99700-9012",
        email: "roberto.lima@adv.oabpb.org.br",
        oab: "PB 11.222",
      },
      {
        nome: "Conselho Tutelar de Queimadas",
        tipo: TipoContato.CONSELHO,
        telefone: "(83) 3400-1500",
        email: "conselho.queimadas@gmail.com",
      },
      {
        nome: "CREAS - Queimadas",
        tipo: TipoContato.OUTROS,
        telefone: "(83) 3400-1600",
        email: "creas.queimadas@gmail.com",
      },
      {
        nome: "Defensoria Pública - Queimadas",
        tipo: TipoContato.OUTROS,
        telefone: "(83) 3400-1700",
        email: "defensoria.queimadas@defensoria.pb.gov.br",
      },
    ],
  });

  console.log("✅ Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
