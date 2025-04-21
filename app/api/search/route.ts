import { type NextRequest, NextResponse } from "next/server";
import type { SearchOptions } from "@/lib/types";
import { searchArticles } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const options: SearchOptions = {
    query: searchParams.get("q") || "",
    type: searchParams.get("type") || "keyword",
    language: searchParams.get("lang") || "all",
    year: searchParams.get("year") || "all",
    sort: searchParams.get("sort") || "relevance",
  };

  console.log("API de pesquisa: Iniciando pesquisa com parâmetros:", options);

  if (!options.query) {
    return NextResponse.json({ articles: [] });
  }

  try {
    // Usar a função searchArticles diretamente do lib/api.ts
    const articles = await searchArticles(
      options.query,
      options.type,
      options.language,
      options.year,
      options.sort
    );

    console.log(`API de pesquisa: Retornando ${articles.length} artigos`);

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("API de pesquisa: Erro ao buscar artigos:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar artigos",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        articles: [],
      },
      { status: 500 }
    );
  }
}
