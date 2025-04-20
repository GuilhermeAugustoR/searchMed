import { Suspense } from "react";
import { SearchResults } from "@/components/search-results";
import { SearchFilters } from "@/components/search-filters";
import { SearchForm } from "@/components/search-form";
import { Skeleton } from "@/components/ui/skeleton";
import { searchMultipleSourcesServer } from "@/lib/api-server";
import type { Article } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface SearchPageProps {
  searchParams: {
    q?: string;
    type?: string;
    lang?: string;
    year?: string;
    sort?: string;
    sources?: string;
  };
}

// Modificar a função para usar diretamente a função do servidor em vez de fetch
export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Aguardar os searchParams antes de acessar suas propriedades
  const params = await Promise.resolve(searchParams);

  const query = params.q || "";
  const type = params.type || "keyword";
  const language = params.lang || "all";
  const year = params.year || "all";
  const sort = params.sort || "relevance";

  // Processar fontes selecionadas
  let sources: string[] | undefined;
  if (params.sources) {
    sources = params.sources.split(",");
  }

  // Buscar artigos diretamente usando a função do servidor
  let articles: Article[] = [];
  const sourceErrors: Record<string, string> = {};

  if (query) {
    try {
      // Chamar diretamente a função do servidor em vez de usar fetch
      articles = await searchMultipleSourcesServer({
        query,
        type,
        language,
        year,
        sort,
        sources,
      });

      // Verificar se a API do The Lancet foi solicitada mas não retornou resultados
      if (
        sources?.includes("lancet") &&
        !articles.some((a) => a.source === "The Lancet")
      ) {
        if (!process.env.ELSEVIER_API_KEY) {
          sourceErrors.lancet =
            "API key do Elsevier não configurada. Configure a variável de ambiente ELSEVIER_API_KEY.";
        } else {
          sourceErrors.lancet =
            "Erro de autorização: A API key do Elsevier não tem permissões suficientes para acessar o The Lancet.";
        }
      }
    } catch (error) {
      console.error("Erro ao buscar artigos:", error);
      articles = [];
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchForm />
      </div>

      {sources?.includes("lancet") && sourceErrors.lancet && (
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problema com a API do The Lancet</AlertTitle>
          <AlertDescription>
            {sourceErrors.lancet}
            <br />
            <span className="text-sm mt-2 block">
              Para usar a API do The Lancet, você precisa obter uma chave de API
              válida da Elsevier com permissões para acessar o conteúdo do The
              Lancet.
              <a
                href="https://dev.elsevier.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline ml-1"
              >
                Saiba mais aqui
              </a>
              .
            </span>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <SearchFilters />
        </div>
        <div className="md:col-span-3">
          <h1 className="text-2xl font-bold mb-6">
            Resultados para: <span className="text-primary">{query}</span>
            {sources && sources.length < 4 && (
              <span className="text-sm font-normal ml-2 text-slate-500">
                (Buscando em:{" "}
                {sources
                  .map((s) => (s === "lancet" ? "The Lancet" : s))
                  .join(", ")}
                )
              </span>
            )}
          </h1>
          <Suspense fallback={<SearchResultsSkeleton />}>
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
                  sourceErrors={sourceErrors}
                />
              )}
            </div>
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {Array(5)
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
