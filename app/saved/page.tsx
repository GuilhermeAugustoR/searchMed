"use client";

import { useState, useEffect } from "react";
import { SearchResults } from "@/components/search-results";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { getArticleById } from "@/lib/api";
import type { Article } from "@/lib/types";

export default function SavedArticlesPage() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedArticles() {
      setLoading(true);
      setError(null);
      try {
        // Carregar IDs dos artigos salvos do localStorage
        const savedIds = JSON.parse(
          localStorage.getItem("savedArticles") || "[]"
        );

        if (savedIds.length === 0) {
          setArticles([]);
          setLoading(false);
          return;
        }

        // Buscar detalhes de cada artigo
        const articlesPromises = savedIds.map(async (id: string) => {
          try {
            const article = await getArticleById(id);
            return article;
          } catch (error) {
            console.error(`Erro ao buscar artigo ${id}:`, error);
            return null;
          }
        });

        const fetchedArticles = await Promise.all(articlesPromises);
        const validArticles = fetchedArticles.filter(
          (article): article is Article => article !== null
        );

        if (validArticles.length === 0 && savedIds.length > 0) {
          setError(
            "Não foi possível carregar os artigos salvos. Verifique sua conexão e tente novamente."
          );
        }

        setArticles(validArticles);
      } catch (error) {
        console.error("Erro ao carregar artigos salvos:", error);
        setError(
          "Erro ao carregar artigos salvos. Por favor, tente novamente."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSavedArticles();
  }, []);

  const clearSavedArticles = () => {
    localStorage.setItem("savedArticles", "[]");
    setArticles([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Artigos Salvos</h1>
          {articles.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearSavedArticles}>
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar todos
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
            <p className="text-slate-600 dark:text-slate-400">
              Carregando artigos salvos...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            {articles.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-8 text-center">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Você ainda não salvou nenhum artigo.
                </p>
                <Button asChild>
                  <a href="/search">Iniciar pesquisa</a>
                </Button>
              </div>
            ) : (
              <SearchResults
                articles={articles}
                query=""
                type=""
                language=""
                year=""
                sort=""
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
