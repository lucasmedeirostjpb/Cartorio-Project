import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const anoAtual = new Date().getFullYear();

  const [totalOficios, totalAlvaras, totalExpedientes] = await Promise.all([
    prisma.expediente.count({
      where: { tipo: "OFICIO", ano: anoAtual },
    }),
    prisma.expediente.count({
      where: { tipo: "ALVARA", ano: anoAtual },
    }),
    prisma.expediente.count({
      where: { ano: anoAtual },
    }),
  ]);

  return NextResponse.json({
    ano: anoAtual,
    totalOficios,
    totalAlvaras,
    totalExpedientes,
  });
}
