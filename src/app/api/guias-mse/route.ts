import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";

  const guias = await prisma.guiaMSE.findMany({
    where: search
      ? {
          infrator: { contains: search },
        }
      : undefined,
    include: { processo: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(guias);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      numero_guia,
      infrator,
      numero_processo,
      comarca_destino,
      providencia,
    } = body;

    if (!infrator || !numero_processo || !comarca_destino) {
      return NextResponse.json(
        { error: "Nome do Infrator, Número do Processo e Comarca de Destino são obrigatórios" },
        { status: 400 }
      );
    }

    let processo = await prisma.processo.findUnique({
      where: { numero_processo },
    });

    if (!processo) {
      processo = await prisma.processo.create({
        data: { numero_processo },
      });
    }

    const data = {
      numero_guia,
      infrator,
      processoId: processo.id,
      comarca_destino,
      providencia,
    };

    const guia = id 
      ? await prisma.guiaMSE.update({ where: { id: Number(id) }, data, include: { processo: true } })
      : await prisma.guiaMSE.create({ data, include: { processo: true } });

    return NextResponse.json(guia, { status: id ? 200 : 201 });
  } catch (error) {
    console.error("Erro ao criar/atualizar guia MSE:", error);
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
    await prisma.guiaMSE.delete({ where: { id: Number(id) } });
    return NextResponse.json({ mensagem: "Guia removida" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 });
  }
}
