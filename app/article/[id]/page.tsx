import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article-view";
import { ArticleActions } from "@/components/article-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { getArticleByIdServer } from "@/lib/api-server";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    // Aguardar os parâmetros antes de acessá-los (necessário no Next.js 15)
    const { id } = await params;

    // Decodificar o ID caso esteja codificado na URL
    const decodedId = decodeURIComponent(id);
    console.log(`[Page] Buscando artigo com ID decodificado: ${decodedId}`);

    // Usar a versão do servidor da função para buscar o artigo diretamente
    const article = await getArticleByIdServer(decodedId);

    if (!article) {
      console.log(`[Page] Artigo não encontrado para ID: ${decodedId}`);
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <ArticleActions article={article} />
          </div>

          <Suspense fallback={<ArticleSkeleton />}>
            <ArticleView article={article} />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[Page] Erro ao renderizar página do artigo:", error);
    notFound();
  }
}

function ArticleSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <div className="space-y-4 mt-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
