import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { addMonths } from "date-fns";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";

  const acolhimentos = await prisma.acolhimento.findMany({
    where: search
      ? {
          nome_menor: { contains: search },
        }
      : undefined,
    include: { processo: true },
    orderBy: { data_proxima_revaliacao: "asc" },
  });

  return NextResponse.json(acolhimentos);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      nome_menor,
      data_acolhimento,
      numero_processo,
      local_acolhimento,
      dados_familiares,
    } = body;

    if (!nome_menor || !data_acolhimento) {
      return NextResponse.json(
        { error: "Nome e Data do Acolhimento são obrigatórios" },
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

    // Default 3 months periodicity
    const dataRevaliacao = addMonths(new Date(data_acolhimento), 3);

    const data = {
      nome_menor,
      data_acolhimento: new Date(data_acolhimento),
      processoId,
      local_acolhimento,
      data_proxima_revaliacao: dataRevaliacao,
      dados_familiares,
    };

    const acolhimento = id 
      ? await prisma.acolhimento.update({ where: { id: Number(id) }, data, include: { processo: true } })
      : await prisma.acolhimento.create({ data, include: { processo: true } });

    return NextResponse.json(acolhimento, { status: id ? 200 : 201 });
  } catch (error) {
    console.error("Erro ao criar/atualizar acolhimento:", error);
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
    await prisma.acolhimento.delete({ where: { id: Number(id) } });
    return NextResponse.json({ mensagem: "Registro removido" });
  } catch {
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 });
  }
}
