import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get("tipo") || "";

  const contatos = await prisma.contato.findMany({
    where: tipo ? { tipo: tipo as never } : undefined,
    orderBy: { nome: "asc" },
  });

  return NextResponse.json(contatos);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, tipo, telefone, email, oab } = body;

    if (!nome || !tipo) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, tipo" },
        { status: 400 }
      );
    }

    const contato = await prisma.contato.create({
      data: { nome, tipo, telefone, email, oab },
    });

    return NextResponse.json(contato, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar contato:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar contato" },
      { status: 500 }
    );
  }
}
