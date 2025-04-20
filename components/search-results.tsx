"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Database,
  AlertCircle,
} from "lucide-react";
import type { Article } from "@/lib/types";

// Modificar a interface SearchResultsProps para incluir sourceErrors e aiModel
interface SearchResultsProps {
  articles: Article[];
  query: string;
  type: string;
  language: string;
  year: string;
  sort: string;
  sourceErrors?: Record<string, string>;
  aiModel?: string;
}

export function SearchResults({
  articles,
  query,
  type,
  language,
  year,
  sort,
  sourceErrors,
  aiModel = "openai",
}: SearchResultsProps) {
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Load saved articles from localStorage
    const saved = JSON.parse(localStorage.getItem("savedArticles") || "[]");
    setSavedArticles(saved);
  }, []);

  const toggleSaveArticle = (articleId: string) => {
    let updated;
    if (savedArticles.includes(articleId)) {
      updated = savedArticles.filter((id) => id !== articleId);
    } else {
      updated = [...savedArticles, articleId];
    }
    setSavedArticles(updated);
    localStorage.setItem("savedArticles", JSON.stringify(updated));
  };

  // Função para abrir o link externo em uma nova aba
  const openExternalLink = (url: string | undefined, e: React.MouseEvent) => {
    e.preventDefault();
    if (url) {
      // Garantir que a URL seja absoluta
      let fullUrl = url;
      if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
        fullUrl = `https://${fullUrl}`;
      }
      // Abrir em uma nova aba
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Função para navegar para a página de detalhes do artigo com a URL como parâmetro de consulta
  const navigateToArticleDetails = (article: Article, e: React.MouseEvent) => {
    e.preventDefault();
    if (article.id.startsWith("ai-") && article.url) {
      // Para artigos de IA, passar a URL como parâmetro de consulta
      router.push(
        `/article/${article.id}?url=${encodeURIComponent(article.url)}`
      );
    } else {
      // Para outros artigos, navegar normalmente
      router.push(`/article/${article.id}`);
    }
  };

  // Determinar a cor do badge da fonte
  const getSourceBadgeVariant = (source?: string) => {
    switch (source) {
      case "PubMed":
        return "default";
      case "Semantic Scholar":
        return "secondary";
      case "Crossref":
        return "outline";
      case "The Lancet":
        return "destructive";
      case "OpenAI Search":
      case "Gemini Search":
        return "default";
      default:
        return "default";
    }
  };

  // Determinar o nome de exibição do modelo de IA
  const aiModelDisplayName = aiModel === "gemini" ? "Google Gemini" : "OpenAI";

  return (
    <div className="space-y-6">
      {/* Exibir erros específicos de fontes, se houver */}
      {sourceErrors && Object.keys(sourceErrors).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 dark:bg-amber-900/20 dark:border-amber-800">
          <h3 className="text-amber-800 dark:text-amber-400 font-medium mb-2 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Avisos sobre fontes de pesquisa:
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {Object.entries(sourceErrors).map(([source, error]) => (
              <li
                key={source}
                className="text-amber-700 dark:text-amber-400 text-sm"
              >
                <strong>
                  {source === "lancet"
                    ? "The Lancet"
                    : source === "ai"
                    ? aiModelDisplayName
                    : source === "openai"
                    ? "OpenAI Search"
                    : source}
                </strong>
                : {error}
              </li>
            ))}
          </ul>
          {sourceErrors.ai && (
            <div className="mt-3 text-sm text-amber-700 dark:text-amber-400">
              <p>Se você está tendo problemas com a cota da IA, considere:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>
                  Verificar seu plano e faturamento na plataforma correspondente
                </li>
                <li>Usar outro modelo de IA nas opções avançadas</li>
                <li>Usar outras fontes de pesquisa disponíveis</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {articles.map((article) => (
        <Card
          key={article.id}
          className="overflow-hidden transition-all hover:shadow-md"
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    article.language === "Inglês" ? "secondary" : "default"
                  }
                >
                  {article.language}
                </Badge>
                {article.source && (
                  <Badge variant={getSourceBadgeVariant(article.source)}>
                    <Database className="h-3 w-3 mr-1" />
                    {article.source}
                  </Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {article.year}
              </span>
            </div>
            <CardTitle className="mt-2">
              <Link
                href={`/article/${article.id}${
                  article.url ? `?url=${encodeURIComponent(article.url)}` : ""
                }`}
                className="hover:text-primary transition-colors"
              >
                {article.title}
              </Link>
            </CardTitle>
            <CardDescription>
              {article.journal} • {article.authors}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400 line-clamp-3">
              {article.abstract}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 border-t">
            <div className="flex flex-wrap gap-2">
              {article.keywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleSaveArticle(article.id)}
                aria-label={
                  savedArticles.includes(article.id)
                    ? "Remover dos salvos"
                    : "Salvar artigo"
                }
                className="text-slate-600 dark:text-slate-400 hover:text-primary"
              >
                {savedArticles.includes(article.id) ? (
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </Button>

              {/* Botão para acessar diretamente o artigo original */}
              {article.url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => openExternalLink(article.url, e)}
                  className="text-slate-600 dark:text-slate-400 hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Acessar original
                </Button>
              )}

              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/article/${article.id}${
                    article.url ? `?url=${encodeURIComponent(article.url)}` : ""
                  }`}
                >
                  Ver detalhes
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
