import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const audiencia = await prisma.audiencia.findUnique({
      where: { id },
      include: {
        envolvidos: true,
        processo: true,
      },
    });

    if (!audiencia) {
      return NextResponse.json(
        { error: "Audiência não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(audiencia);
  } catch (error) {
    console.error("Erro ao buscar audiência:", error);
    return NextResponse.json(
      { error: "Erro ao buscar audiência" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { envolvidos, ...data } = body;

    const updateData: any = { ...data };
    if (data.data_hora) {
      updateData.data_hora = new Date(data.data_hora);
    }

    const audiencia = await prisma.$transaction(async (tx) => {
      if (envolvidos) {
        // Remove envolvidos antigos e recria (estratégia simples)
        await tx.envolvido.deleteMany({
          where: { audienciaId: id },
        });

        updateData.envolvidos = {
          create: envolvidos.map((e: any) => ({
            nome: e.nome,
            papel: e.papel,
            telefone: e.telefone,
            documento: e.documento,
            presenca_confirmada: e.presenca_confirmada || false,
          })),
        };
      }

      return await tx.audiencia.update({
        where: { id },
        data: updateData,
        include: {
          envolvidos: true,
          processo: true,
        },
      });
    });

    return NextResponse.json(audiencia);
  } catch (error) {
    console.error("Erro ao atualizar audiência:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar audiência" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.audiencia.delete({
      where: { id },
    });

    return NextResponse.json({ mensagem: "Audiência excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir audiência:", error);
    return NextResponse.json(
      { error: "Erro ao excluir audiência" },
      { status: 500 }
    );
  }
}
