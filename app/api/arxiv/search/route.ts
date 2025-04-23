import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchArxiv } from "@/lib/api-sources/arxiv";
import { getCache, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const start = Number.parseInt(searchParams.get("start") || "0");
  // Aumentar o número de resultados retornados pelo arXiv
  const maxResults = Number.parseInt(searchParams.get("max_results") || "20");
  const sortBy = (searchParams.get("sort_by") || "relevance") as
    | "relevance"
    | "lastUpdatedDate"
    | "submittedDate";
  const sortOrder = (searchParams.get("sort_order") || "descending") as
    | "ascending"
    | "descending";

  console.log("API arXiv: Iniciando pesquisa com parâmetros:", {
    query,
    start,
    maxResults,
    sortBy,
    sortOrder,
  });

  if (!query) {
    return NextResponse.json({ articles: [] });
  }

  // Criar uma chave de cache baseada nos parâmetros de pesquisa
  const cacheKey = `arxiv:search:${query}:${start}:${maxResults}:${sortBy}:${sortOrder}`;

  // Verificar se temos resultados em cache
  const cachedResults = getCache(cacheKey);
  if (cachedResults) {
    console.log(
      `Resultados encontrados no cache para a query "${query}" no arXiv`
    );
    return NextResponse.json({ articles: cachedResults });
  }

  try {
    // Buscar artigos do arXiv
    const articles = await searchArxiv(query, {
      start,
      maxResults,
      sortBy,
      sortOrder,
    });

    // Armazenar os resultados em cache
    setCache(cacheKey, articles);

    console.log(`API arXiv: Retornando ${articles.length} artigos`);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Erro ao buscar artigos do arXiv:", error);
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
