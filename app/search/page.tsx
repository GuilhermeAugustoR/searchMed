"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SearchResults } from "@/components/search-results";
import { SearchFilters } from "@/components/search-filters";
import { SearchForm } from "@/components/search-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Article } from "@/lib/types";
import { searchArticles } from "@/lib/api";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "keyword";
  const language = searchParams.get("lang") || "all";
  const year = searchParams.get("year") || "all";
  const sort = searchParams.get("sort") || "relevance";

  const fetchArticles = async () => {
    if (!query) {
      setArticles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Buscando artigos com parâmetros:", {
        query,
        type,
        language,
        year,
        sort,
      });

      // Buscar artigos via API
      const results = await searchArticles(query, type, language, year, sort);
      console.log(`Encontrados ${results.length} artigos do PubMed`);
      setArticles(results);
    } catch (err: any) {
      console.error("Erro ao buscar artigos:", err);

      // Extrair a mensagem de erro mais específica se disponível
      let errorMessage = "Erro ao buscar artigos. Por favor, tente novamente.";
      if (err.message && err.message.includes("429")) {
        errorMessage =
          "Muitas requisições. Por favor, aguarde um momento e tente novamente.";
      }

      setError(errorMessage);
      setArticles([]);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [query, type, language, year, sort]);

  const handleRetry = () => {
    setRetrying(true);
    fetchArticles();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <SearchFilters />
        </div>
        <div className="md:col-span-3">
          <h1 className="text-2xl font-bold mb-6">
            Resultados para: <span className="text-primary">{query}</span>
          </h1>

          {loading ? (
            <SearchResultsSkeleton />
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-red-700 dark:text-red-400 mb-2">
                {error}
              </h2>
              <p className="text-red-600 dark:text-red-300 mb-4">
                {error.includes("Muitas requisições")
                  ? "A API do PubMed está limitando nossas requisições. Por favor, aguarde um momento e tente novamente."
                  : "Ocorreu um erro ao buscar os artigos. Por favor, tente novamente."}
              </p>
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
          ) : (
            <div className="space-y-6">
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
                {articles.length} artigos encontrados
              </p>

              {articles.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 shadow-sm rounded-lg p-8 text-center">
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Nenhum resultado encontrado para{" "}
                    <span className="font-medium">"{query}"</span>.
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">
                    Tente termos diferentes ou ajuste os filtros de pesquisa.
                  </p>
                </div>
              ) : (
                <SearchResults
                  articles={articles}
                  query={query}
                  type={type}
                  language={language}
                  year={year}
                  sort={sort}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
        <p className="text-slate-600 dark:text-slate-400">
          Carregando resultados...
        </p>
      </div>
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="border rounded-lg p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4 mb-4" />
            <Skeleton className="h-20 w-full mb-4" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        ))}
    </div>
  );
}
