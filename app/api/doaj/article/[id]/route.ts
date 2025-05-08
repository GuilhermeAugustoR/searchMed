import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDOAJArticleById } from "@/lib/api-sources/doaj";
import { getCache, setCache } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const cacheKey = `doaj:article:${id}`;

  console.log(`API DOAJ: Buscando artigo com ID: ${id}`);

  // Verificar se temos o artigo em cache
  const cachedArticle = getCache(cacheKey);
  if (cachedArticle) {
    console.log(`Artigo ${id} encontrado no cache do DOAJ`);
    return NextResponse.json({ article: cachedArticle });
  }

  try {
    // Buscar detalhes do artigo
    const article = await getDOAJArticleById(id);

    if (!article) {
      console.log("Artigo não encontrado no DOAJ");
      return NextResponse.json(
        { error: "Artigo não encontrado" },
        { status: 404 }
      );
    }

    // Armazenar o artigo em cache
    setCache(cacheKey, article);

    console.log(`API DOAJ: Artigo encontrado: ${article.title}`);
    return NextResponse.json({ article });
  } catch (error) {
    console.error("Erro ao buscar artigo por ID no DOAJ:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar artigo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
