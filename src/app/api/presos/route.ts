import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { addDays } from "date-fns";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";

  const presos = await prisma.presoProvisorio.findMany({
    where: search
      ? {
          processo: {
            numero_processo: { contains: search },
          },
        }
      : undefined,
    include: { processo: true },
    orderBy: { data_vencimento: "asc" },
  });

  return NextResponse.json(presos);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      nome,
      data_prisao,
      numero_processo,
      situacao_criminal,
      data_ultima_revisao,
      observacoes,
    } = body;

    if (!nome || !numero_processo || !data_ultima_revisao) {
      return NextResponse.json(
        { error: "Nome, Número do Processo e Data da Última Revisão são obrigatórios" },
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

    const dataVencimento = addDays(new Date(data_ultima_revisao), 90);

    const data = {
      nome,
      data_prisao: data_prisao ? new Date(data_prisao) : null,
      processoId: processo.id,
      situacao_criminal,
      data_ultima_revisao: new Date(data_ultima_revisao),
      data_vencimento: dataVencimento,
      observacoes,
    };

    const preso = id
      ? await prisma.presoProvisorio.update({ where: { id: Number(id) }, data, include: { processo: true } })
      : await prisma.presoProvisorio.upsert({
          where: { processoId: processo.id },
          update: data,
          create: data,
          include: { processo: true },
        });

    return NextResponse.json(preso, { status: id ? 200 : 201 });
  } catch (error) {
    console.error("Erro ao criar/atualizar preso provisório:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.presoProvisorio.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ mensagem: "Preso removido com sucesso" });
  } catch (error: unknown) {
    console.error("Erro ao remover preso:", error);
    return NextResponse.json({ error: "Erro ao remover registro" }, { status: 500 });
  }
}
