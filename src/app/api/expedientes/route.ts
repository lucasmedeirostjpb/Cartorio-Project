import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";

  const expedientes = await prisma.expediente.findMany({
    where: search
      ? {
          processo: {
            numero_processo: { contains: search },
          },
        }
      : undefined,
    include: { processo: true },
    orderBy: { data_emissao: "desc" },
  });

  return NextResponse.json(expedientes);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { numero_processo, tipo, destinatario_beneficiario, valor } = body;

    if (!numero_processo || !tipo || !destinatario_beneficiario) {
      return NextResponse.json(
        { error: "Campos obrigatórios: numero_processo, tipo, destinatario_beneficiario" },
        { status: 400 }
      );
    }

    if (tipo === "ALVARA" && (valor === undefined || valor === null)) {
      return NextResponse.json(
        { error: "O campo 'valor' é obrigatório para Alvarás" },
        { status: 400 }
      );
    }

    // Find or create Processo
    let processo = await prisma.processo.findUnique({
      where: { numero_processo },
    });

    if (!processo) {
      processo = await prisma.processo.create({
        data: { numero_processo },
      });
    }

    const anoAtual = new Date().getFullYear();

    // Get the last sequential number for this type and year
    const ultimoExpediente = await prisma.expediente.findFirst({
      where: {
        tipo,
        ano: anoAtual,
      },
      orderBy: { numero_sequencial: "desc" },
    });

    const proximoNumero = (ultimoExpediente?.numero_sequencial ?? 0) + 1;

    const expediente = await prisma.expediente.create({
      data: {
        processoId: processo.id,
        tipo,
        ano: anoAtual,
        numero_sequencial: proximoNumero,
        destinatario_beneficiario,
        valor: tipo === "ALVARA" ? parseFloat(valor) : null,
      },
      include: { processo: true },
    });

    const tipoLabel = tipo === "OFICIO" ? "Ofício" : "Alvará";

    return NextResponse.json(
      {
        ...expediente,
        mensagem: `${tipoLabel} nº ${proximoNumero}/${anoAtual} gerado com sucesso!`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar expediente:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar expediente" },
      { status: 500 }
    );
  }
}
