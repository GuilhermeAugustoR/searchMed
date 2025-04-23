import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { searchScielo } from "@/lib/api-sources/scielo";
import { getCache, setCache } from "@/lib/cache";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const page = Number.parseInt(searchParams.get("page") || "1");
  const size = Number.parseInt(searchParams.get("size") || "20");
  const lang = searchParams.get("lang") || undefined;
  const year = searchParams.get("year") || undefined;

  console.log("API SciELO: Iniciando pesquisa com parâmetros:", {
    query,
    page,
    size,
    lang,
    year,
  });

  if (!query) {
    return NextResponse.json({ articles: [] });
  }

  // Criar uma chave de cache baseada nos parâmetros de pesquisa
  const cacheKey = `scielo:search:${query}:${page}:${size}:${lang || "all"}:${
    year || "all"
  }`;

  // Verificar se temos resultados em cache
  const cachedResults = getCache(cacheKey);
  if (cachedResults) {
    console.log(
      `Resultados encontrados no cache para a query "${query}" no SciELO`
    );
    return NextResponse.json({ articles: cachedResults });
  }

  try {
    // Buscar artigos do SciELO
    const articles = await searchScielo(query, {
      page,
      size,
      lang,
      year,
    });

    // Armazenar os resultados em cache
    setCache(cacheKey, articles);

    console.log(`API SciELO: Retornando ${articles.length} artigos`);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Erro ao buscar artigos do SciELO:", error);
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
