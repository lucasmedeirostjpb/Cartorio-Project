import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (search) {
      where.OR = [
        { numero_processo: { contains: search, mode: "insensitive" } },
        {
          envolvidos: {
            some: { nome: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    if (startDate || endDate) {
      where.data_hora = {};
      if (startDate) {
        where.data_hora.gte = new Date(startDate);
      }
      if (endDate) {
        // Se for apenas uma data (YYYY-MM-DD), ajustamos para o final do dia
        const end = new Date(endDate);
        if (endDate.length === 10) {
          end.setHours(23, 59, 59, 999);
        }
        where.data_hora.lte = end;
      }
    }

    const audiencias = await prisma.audiencia.findMany({
      where,
      include: {
        envolvidos: true,
        processo: true,
      },
      orderBy: { data_hora: "asc" },
    });

    return NextResponse.json(audiencias);
  } catch (error) {
    console.error("Erro ao buscar audiências:", error);
    return NextResponse.json(
      { error: "Erro ao buscar audiências" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      data_hora,
      numero_processo,
      classe,
      tipo,
      modalidade,
      status,
      link_video_conferencia,
      observacoes,
      envolvidos = [],
    } = body;

    console.log("Recebendo POST /api/audiencias:", { numero_processo, tipo, status });

    if (!data_hora || !numero_processo || !classe || !tipo || !modalidade) {
      console.warn("Validação falhou - campos obrigatórios ausentes:", { 
        data_hora: !!data_hora, 
        numero_processo: !!numero_processo, 
        classe: !!classe, 
        tipo: !!tipo, 
        modalidade: !!modalidade 
      });
      return NextResponse.json(
        {
          error:
            "Campos obrigatórios: data_hora, numero_processo, classe, tipo, modalidade",
        },
        { status: 400 }
      );
    }

    // Buscar ou criar Processo
    let processo = await prisma.processo.findUnique({
      where: { numero_processo },
    });

    if (!processo) {
      processo = await prisma.processo.create({
        data: { numero_processo },
      });
    }

    const audiencia = await prisma.audiencia.create({
      data: {
        data_hora: new Date(data_hora),
        numero_processo,
        classe,
        tipo,
        modalidade,
        status,
        link_video_conferencia,
        observacoes,
        processoId: processo.id,
        envolvidos: {
          create: envolvidos.map((e: any) => ({
            nome: e.nome,
            papel: e.papel,
            telefone: e.telefone,
            documento: e.documento,
            presenca_confirmada: e.presenca_confirmada || false,
          })),
        },
      },
      include: {
        envolvidos: true,
        processo: true,
      },
    });

    return NextResponse.json(audiencia, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar audiência:", error);
    return NextResponse.json(
      { error: "Erro interno ao criar audiência" },
      { status: 500 }
    );
  }
}
