import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSpringerArticleById } from "@/lib/api-sources/springer";
import { getCache, setCache } from "@/lib/cache";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const cacheKey = `springer:article:${id}`;

  console.log(`API Springer: Buscando artigo com ID: ${id}`);

  // Verificar se temos o artigo em cache
  const cachedArticle = getCache(cacheKey);
  if (cachedArticle) {
    console.log(`Artigo ${id} encontrado no cache do Springer`);
    return NextResponse.json({ article: cachedArticle });
  }

  // Obter a API key do ambiente
  const apiKey = process.env.SPRINGER_API_KEY;

  if (!apiKey) {
    console.warn("API Springer: API key não configurada");
    return NextResponse.json(
      {
        error: "API key não configurada",
        message: "A API do Springer requer uma chave de API válida",
      },
      { status: 401 }
    );
  }

  try {
    // Buscar detalhes do artigo
    const article = await getSpringerArticleById(id, apiKey);

    if (!article) {
      console.log("Artigo não encontrado no Springer");
      return NextResponse.json(
        { error: "Artigo não encontrado" },
        { status: 404 }
      );
    }

    // Armazenar o artigo em cache
    setCache(cacheKey, article);

    console.log(`API Springer: Artigo encontrado: ${article.title}`);
    return NextResponse.json({ article });
  } catch (error) {
    console.error("Erro ao buscar artigo por ID no Springer:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar artigo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
