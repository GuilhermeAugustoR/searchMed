import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIEEEArticleById } from "@/lib/api-sources/ieee";
import { getCache, setCache } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const cacheKey = `ieee:article:${id}`;

  console.log(`API IEEE: Buscando artigo com ID: ${id}`);

  // Verificar se temos o artigo em cache
  const cachedArticle = getCache(cacheKey);
  if (cachedArticle) {
    console.log(`Artigo ${id} encontrado no cache do IEEE`);
    return NextResponse.json({ article: cachedArticle });
  }

  // Obter a API key do ambiente
  const apiKey = process.env.IEEE_API_KEY;

  if (!apiKey) {
    console.warn("API IEEE: API key não configurada");
    return NextResponse.json(
      {
        error: "API key não configurada",
        message: "A API do IEEE Xplore requer uma chave de API válida",
      },
      { status: 401 }
    );
  }

  try {
    // Buscar detalhes do artigo
    const article = await getIEEEArticleById(id, apiKey);

    if (!article) {
      console.log("Artigo não encontrado no IEEE");
      return NextResponse.json(
        { error: "Artigo não encontrado" },
        { status: 404 }
      );
    }

    // Armazenar o artigo em cache
    setCache(cacheKey, article);

    console.log(`API IEEE: Artigo encontrado: ${article.title}`);
    return NextResponse.json({ article });
  } catch (error) {
    console.error("Erro ao buscar artigo por ID no IEEE:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar artigo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
