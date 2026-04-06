import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";

  const bens = await prisma.bemApreendido.findMany({
    where: search
      ? {
          processo: {
            numero_processo: { contains: search },
          },
        }
      : undefined,
    include: { processo: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bens);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      numero_processo,
      bin,
      descricao,
      data_apreensao,
      procedimento,
      localizacao,
      cadastrado_sngb,
      data_cadastro_sngb,
      observacoes,
    } = body;

    if (!numero_processo || !descricao) {
      return NextResponse.json(
        { error: "Número do Processo e Descrição do Bem são obrigatórios" },
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
      processoId: processo.id,
      bin,
      descricao,
      data_apreensao: data_apreensao ? new Date(data_apreensao) : null,
      procedimento,
      localizacao,
      cadastrado_sngb,
      data_cadastro_sngb: data_cadastro_sngb ? new Date(data_cadastro_sngb) : null,
      observacoes,
    };

    const bem = id 
      ? await prisma.bemApreendido.update({ where: { id: Number(id) }, data, include: { processo: true } })
      : await prisma.bemApreendido.create({ data, include: { processo: true } });

    return NextResponse.json(bem, { status: id ? 200 : 201 });
  } catch (error) {
    console.error("Erro ao criar/atualizar bem apreendido:", error);
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
    await prisma.bemApreendido.delete({ where: { id: Number(id) } });
    return NextResponse.json({ mensagem: "Bem removido" });
  } catch {
    return NextResponse.json({ error: "Erro ao remover" }, { status: 500 });
  }
}
