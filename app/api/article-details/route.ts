import { NextResponse } from "next/server";
import { getArticleDetailsWithAI } from "@/lib/api-sources/ai-search";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { articleInfo, aiModel = "openai" } = body;

    if (!articleInfo) {
      return NextResponse.json(
        { error: "Informações do artigo não fornecidas" },
        { status: 400 }
      );
    }

    console.log(
      "API de detalhes do artigo: Buscando detalhes para:",
      articleInfo.title || articleInfo.id
    );

    const result = await getArticleDetailsWithAI(articleInfo, aiModel as any);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ article: result.article });
  } catch (error) {
    console.error("API de detalhes do artigo: Erro:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao buscar detalhes do artigo",
      },
      { status: 500 }
    );
  }
}
