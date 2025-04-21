"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArticleView } from "@/components/article-view";
import { ArticleActions } from "@/components/article-actions";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { getArticleById } from "@/lib/api";
import type { Article } from "@/lib/types";
import { Button } from "@/components/ui/button";

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const fetchArticle = async () => {
    if (!params.id) return;

    setLoading(true);
    setError(null);

    try {
      const id = decodeURIComponent(params.id as string);
      console.log("Buscando artigo com ID:", id);

      const fetchedArticle = await getArticleById(id);

      if (!fetchedArticle) {
        setError("Artigo não encontrado");
        return;
      }

      setArticle(fetchedArticle);
    } catch (err: any) {
      console.error("Erro ao buscar artigo:", err);

      // Extrair a mensagem de erro mais específica se disponível
      let errorMessage =
        "Erro ao carregar o artigo. Por favor, tente novamente.";
      if (err.message && err.message.includes("429")) {
        errorMessage =
          "Muitas requisições. Por favor, aguarde um momento e tente novamente.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [params.id]);

  const handleRetry = () => {
    setRetrying(true);
    fetchArticle();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300">
              Carregando artigo...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-red-700 dark:text-red-400 mb-2">
              {error || "Artigo não encontrado"}
            </h2>
            <p className="text-red-600 dark:text-red-300 mb-6">
              {error && error.includes("Muitas requisições")
                ? "A API do PubMed está limitando nossas requisições. Por favor, aguarde um momento e tente novamente."
                : "Não foi possível carregar o artigo solicitado. Verifique o ID e tente novamente."}
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => router.back()} variant="outline">
                Voltar para resultados
              </Button>
              <Button onClick={handleRetry} disabled={retrying}>
                {retrying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tentando novamente...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Tentar novamente
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <ArticleActions article={article} />
        </div>

        <ArticleView article={article} />
      </div>
    </div>
  );
}
