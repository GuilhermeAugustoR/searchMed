import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchCore } from "@/lib/api-sources/core";
import { getCache, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const page = Number.parseInt(searchParams.get("page") || "1");
  const pageSize = Number.parseInt(searchParams.get("page_size") || "20");
  const year = searchParams.get("year") || undefined;

  console.log("API CORE: Iniciando pesquisa com parâmetros:", {
    query,
    page,
    pageSize,
    year,
  });

  if (!query) {
    return NextResponse.json({ articles: [] });
  }

  // Criar uma chave de cache baseada nos parâmetros de pesquisa
  const cacheKey = `core:search:${query}:${page}:${pageSize}:${year || "all"}`;

  // Verificar se temos resultados em cache
  const cachedResults = getCache(cacheKey);
  if (cachedResults) {
    console.log(
      `Resultados encontrados no cache para a query "${query}" no CORE`
    );
    return NextResponse.json({ articles: cachedResults });
  }

  try {
    // Buscar artigos do CORE
    const articles = await searchCore(query, {
      page,
      pageSize,
      year,
    });

    // Armazenar os resultados em cache
    setCache(cacheKey, articles);

    console.log(`API CORE: Retornando ${articles.length} artigos`);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Erro ao buscar artigos do CORE:", error);
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
