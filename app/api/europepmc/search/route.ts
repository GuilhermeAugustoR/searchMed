import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchEuropePmc } from "@/lib/api-sources/europe-pmc";
import { getCache, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const page = Number.parseInt(searchParams.get("page") || "1");
  // Aumentar o número de resultados retornados pelo Europe PMC
  const pageSize = Number.parseInt(searchParams.get("page_size") || "20");
  const resultType = searchParams.get("result_type") || "core";
  const sort = searchParams.get("sort") || "relevance";

  console.log("API Europe PMC: Iniciando pesquisa com parâmetros:", {
    query,
    page,
    pageSize,
    resultType,
    sort,
  });

  if (!query) {
    return NextResponse.json({ articles: [] });
  }

  // Criar uma chave de cache baseada nos parâmetros de pesquisa
  const cacheKey = `europepmc:search:${query}:${page}:${pageSize}:${resultType}:${sort}`;

  // Verificar se temos resultados em cache
  const cachedResults = getCache(cacheKey);
  if (cachedResults) {
    console.log(
      `Resultados encontrados no cache para a query "${query}" no Europe PMC`
    );
    return NextResponse.json({ articles: cachedResults });
  }

  try {
    // Buscar artigos do Europe PMC
    const articles = await searchEuropePmc(query, {
      page,
      pageSize,
      resultType,
      sort,
    });

    // Armazenar os resultados em cache
    setCache(cacheKey, articles);

    console.log(`API Europe PMC: Retornando ${articles.length} artigos`);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Erro ao buscar artigos do Europe PMC:", error);
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
