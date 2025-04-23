import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getEuropePmcArticleById } from "@/lib/api-sources/europe-pmc";
import { getCache, setCache } from "@/lib/cache";
import { requestLimiter } from "@/lib/api-helper";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const cacheKey = `europepmc:article:${id}`;

  console.log(`API Europe PMC: Buscando artigo com ID: ${id}`);

  // Verificar se temos o artigo em cache
  const cachedArticle = getCache(cacheKey);
  if (cachedArticle) {
    console.log(`Artigo ${id} encontrado no cache do Europe PMC`);
    return NextResponse.json({ article: cachedArticle });
  }

  try {
    // Usar o limitador de requisições para evitar muitas requisições simultâneas
    return await requestLimiter.run(async () => {
      // Buscar detalhes do artigo
      const article = await getEuropePmcArticleById(id);

      if (!article) {
        console.log("Artigo não encontrado no Europe PMC");
        return NextResponse.json(
          { error: "Artigo não encontrado" },
          { status: 404 }
        );
      }

      // Armazenar o artigo em cache
      setCache(cacheKey, article);

      console.log(`API Europe PMC: Artigo encontrado: ${article.title}`);
      return NextResponse.json({ article });
    });
  } catch (error) {
    console.error("Erro ao buscar artigo por ID no Europe PMC:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar artigo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
