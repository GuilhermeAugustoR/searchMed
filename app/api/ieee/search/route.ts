import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchIEEE } from "@/lib/api-sources/ieee";
import { getCache, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const page = Number.parseInt(searchParams.get("page") || "1");
  const pageSize = Number.parseInt(searchParams.get("page_size") || "20");
  const year = searchParams.get("year") || undefined;
  const sort = searchParams.get("sort") || "relevance";

  // Obter a API key do ambiente
  const apiKey = process.env.IEEE_API_KEY;

  console.log("API IEEE: Iniciando pesquisa com parâmetros:", {
    query,
    page,
    pageSize,
    year,
    sort,
  });

  if (!query) {
    return NextResponse.json({ articles: [] });
  }

  if (!apiKey) {
    console.warn("API IEEE: API key não configurada");
    return NextResponse.json(
      {
        error: "API key não configurada",
        message: "A API do IEEE Xplore requer uma chave de API válida",
        articles: [],
      },
      { status: 401 }
    );
  }

  // Criar uma chave de cache baseada nos parâmetros de pesquisa
  const cacheKey = `ieee:search:${query}:${page}:${pageSize}:${
    year || "all"
  }:${sort}`;

  // Verificar se temos resultados em cache
  const cachedResults = getCache(cacheKey);
  if (cachedResults) {
    console.log(
      `Resultados encontrados no cache para a query "${query}" no IEEE`
    );
    return NextResponse.json({ articles: cachedResults });
  }

  try {
    // Buscar artigos do IEEE
    const articles = await searchIEEE(query, {
      page,
      pageSize,
      year,
      sort,
      apiKey,
    });

    // Armazenar os resultados em cache
    setCache(cacheKey, articles);

    console.log(`API IEEE: Retornando ${articles.length} artigos`);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Erro ao buscar artigos do IEEE:", error);
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
