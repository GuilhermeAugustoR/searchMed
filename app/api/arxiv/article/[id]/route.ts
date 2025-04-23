import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getArxivArticleById } from "@/lib/api-sources/arxiv";
import { getCache, setCache } from "@/lib/cache";
import { requestLimiter } from "@/lib/api-helper";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const cacheKey = `arxiv:article:${id}`;

  console.log(`API arXiv: Buscando artigo com ID: ${id}`);

  // Verificar se temos o artigo em cache
  const cachedArticle = getCache(cacheKey);
  if (cachedArticle) {
    console.log(`Artigo ${id} encontrado no cache do arXiv`);
    return NextResponse.json({ article: cachedArticle });
  }

  try {
    // Usar o limitador de requisições para evitar muitas requisições simultâneas
    return await requestLimiter.run(async () => {
      // Buscar detalhes do artigo
      const article = await getArxivArticleById(id);

      if (!article) {
        console.log("Artigo não encontrado no arXiv");
        return NextResponse.json(
          { error: "Artigo não encontrado" },
          { status: 404 }
        );
      }

      // Armazenar o artigo em cache
      setCache(cacheKey, article);

      console.log(`API arXiv: Artigo encontrado: ${article.title}`);
      return NextResponse.json({ article });
    });
  } catch (error) {
    console.error("Erro ao buscar artigo por ID no arXiv:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar artigo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
