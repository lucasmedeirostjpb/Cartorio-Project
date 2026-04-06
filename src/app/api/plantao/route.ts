import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mes = searchParams.get("mes") || "";

  const registros = await prisma.plantaoRegistro.findMany({
    where: mes ? { mes_referencia: mes } : undefined,
    include: { processo: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(registros);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      nome,
      adv_dp,
      bnmp,
      numero_processo,
      tipo,
      servidor,
      assessor,
      situacao,
      encaminhamento,
      preso_em,
      mes_referencia,
    } = body;

    if (!nome || !mes_referencia) {
      return NextResponse.json(
        { error: "Nome e Mês de Referência são obrigatórios" },
        { status: 400 }
      );
    }

    let processoId = null;
    if (numero_processo) {
      let processo = await prisma.processo.findUnique({
        where: { numero_processo },
      });

      if (!processo) {
        processo = await prisma.processo.create({
          data: { numero_processo },
        });
      }
      processoId = processo.id;
    }

    const data = {
      nome,
      adv_dp,
      bnmp,
      processoId,
      tipo,
      servidor,
      assessor,
      situacao,
      encaminhamento,
      preso_em,
      mes_referencia,
    };

    const registro = id 
      ? await prisma.plantaoRegistro.update({ where: { id: Number(id) }, data, include: { processo: true } })
      : await prisma.plantaoRegistro.create({ data, include: { processo: true } });

    return NextResponse.json(registro, { status: id ? 200 : 201 });
  } catch (error) {
    console.error("Erro ao criar/atualizar registro de plantão:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });
    await prisma.plantaoRegistro.delete({ where: { id: Number(id) } });
    return NextResponse.json({ mensagem: "Registro removido" });
  } catch {
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 });
  }
}
