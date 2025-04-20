import { NextResponse } from "next/server";
import { searchMultipleSourcesServer } from "@/lib/api-server";
import type { SearchOptions } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const options: SearchOptions = {
    query: searchParams.get("q") || "",
    type: searchParams.get("type") || "keyword",
    language: searchParams.get("lang") || "all",
    year: searchParams.get("year") || "all",
    sort: searchParams.get("sort") || "relevance",
  };

  // Obter fontes selecionadas (opcional)
  const sourcesParam = searchParams.get("sources");
  if (sourcesParam) {
    options.sources = sourcesParam.split(",");
  }

  console.log("API de pesquisa: Iniciando pesquisa com parâmetros:", options);

  if (!options.query) {
    return NextResponse.json({ articles: [] });
  }

  try {
    const articles = await searchMultipleSourcesServer(options);
    console.log(`API de pesquisa: Retornando ${articles.length} artigos`);

    // Adicionar informações sobre erros específicos de fontes
    const sourceErrors: Record<string, string> = {};

    // Verificar se a API do The Lancet foi solicitada mas não retornou resultados
    if (
      options.sources?.includes("lancet") &&
      !articles.some((a) => a.source === "The Lancet")
    ) {
      if (!process.env.ELSEVIER_API_KEY) {
        sourceErrors.lancet =
          "API key do Elsevier não configurada. Configure a variável de ambiente ELSEVIER_API_KEY.";
      } else {
        sourceErrors.lancet =
          "Não foi possível obter artigos do The Lancet. Verifique os logs para mais detalhes.";
      }
    }

    return NextResponse.json({
      articles,
      sourceErrors:
        Object.keys(sourceErrors).length > 0 ? sourceErrors : undefined,
    });
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
