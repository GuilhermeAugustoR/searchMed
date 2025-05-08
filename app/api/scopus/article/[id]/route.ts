import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getScopusArticleById } from "@/lib/api-sources/scopus";
import { getCache, setCache } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const cacheKey = `scopus:article:${id}`;

  console.log(`API Scopus: Buscando artigo com ID: ${id}`);

  // Verificar se temos o artigo em cache
  const cachedArticle = getCache(cacheKey);
  if (cachedArticle) {
    console.log(`Artigo ${id} encontrado no cache do Scopus`);
    return NextResponse.json({ article: cachedArticle });
  }

  // Obter a API key do ambiente
  const apiKey = process.env.SCOPUS_API_KEY;

  if (!apiKey) {
    console.warn("API Scopus: API key não configurada");
    return NextResponse.json(
      {
        error: "API key não configurada",
        message: "A API do Scopus requer uma chave de API válida",
      },
      { status: 401 }
    );
  }

  try {
    // Buscar detalhes do artigo
    const article = await getScopusArticleById(id, apiKey);

    if (!article) {
      console.log("Artigo não encontrado no Scopus");
      return NextResponse.json(
        { error: "Artigo não encontrado" },
        { status: 404 }
      );
    }

    // Armazenar o artigo em cache
    setCache(cacheKey, article);

    console.log(`API Scopus: Artigo encontrado: ${article.title}`);
    return NextResponse.json({ article });
  } catch (error) {
    console.error("Erro ao buscar artigo por ID no Scopus:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar artigo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
