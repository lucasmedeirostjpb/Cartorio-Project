import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const anoAtual = new Date().getFullYear();

  try {
    const [
      totalOficios,
      totalAlvaras,
      totalExpedientes,
      totalPresos,
      totalAcolhidos,
    ] = await Promise.all([
      prisma.expediente.count({
        where: { tipo: "OFICIO", ano: anoAtual },
      }),
      prisma.expediente.count({
        where: { tipo: "ALVARA", ano: anoAtual },
      }),
      prisma.expediente.count({
        where: { ano: anoAtual },
      }),
      prisma.presoProvisorio.count(),
      prisma.acolhimento.count({
        where: { status: "ACOLHIDO" },
      }),
    ]);

    return NextResponse.json({
      ano: anoAtual,
      totalOficios,
      totalAlvaras,
      totalExpedientes,
      totalPresos,
      totalAcolhidos,
    });
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
    return NextResponse.json({
      ano: anoAtual,
      totalOficios: 0,
      totalAlvaras: 0,
      totalExpedientes: 0,
      totalPresos: 0,
      totalAcolhidos: 0,
    });
  }
}
