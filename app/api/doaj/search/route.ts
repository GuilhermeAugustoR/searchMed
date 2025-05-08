import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchDOAJ } from "@/lib/api-sources/doaj";
import { getCache, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const page = Number.parseInt(searchParams.get("page") || "1");
  const pageSize = Number.parseInt(searchParams.get("page_size") || "20");
  const year = searchParams.get("year") || undefined;
  const sort = searchParams.get("sort") || "relevance";

  console.log("API DOAJ: Iniciando pesquisa com parâmetros:", {
    query,
    page,
    pageSize,
    year,
    sort,
  });

  if (!query) {
    return NextResponse.json({ articles: [] });
  }

  // Criar uma chave de cache baseada nos parâmetros de pesquisa
  const cacheKey = `doaj:search:${query}:${page}:${pageSize}:${
    year || "all"
  }:${sort}`;

  // Verificar se temos resultados em cache
  const cachedResults = getCache(cacheKey);
  if (cachedResults) {
    console.log(
      `Resultados encontrados no cache para a query "${query}" no DOAJ`
    );
    return NextResponse.json({ articles: cachedResults });
  }

  try {
    // Buscar artigos do DOAJ
    const articles = await searchDOAJ(query, {
      page,
      pageSize,
      year,
      sort,
    });

    // Armazenar os resultados em cache
    setCache(cacheKey, articles);

    console.log(`API DOAJ: Retornando ${articles.length} artigos`);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Erro ao buscar artigos do DOAJ:", error);
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
