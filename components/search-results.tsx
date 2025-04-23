"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Bookmark, BookmarkCheck, ExternalLink } from "lucide-react";
import type { Article } from "@/lib/types";
import { ensureAbsoluteUrl } from "@/lib/api-helper";

interface SearchResultsProps {
  articles: Article[];
  query: string;
  type: string;
  language: string;
  year: string;
  sort: string;
}

export function SearchResults({
  articles,
  query,
  type,
  language,
  year,
  sort,
}: SearchResultsProps) {
  const [savedArticles, setSavedArticles] = useState<string[]>([]);

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
      const fullUrl = ensureAbsoluteUrl(url);
      // Abrir em uma nova aba
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-6">
      {articles.map((article) => (
        <Card
          key={article.id}
          className="overflow-hidden transition-all hover:shadow-md"
        >
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    article.language === "Inglês" ? "secondary" : "default"
                  }
                >
                  {article.language}
                </Badge>
                {article.source && (
                  <Badge variant="outline" className="text-xs">
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
                href={`/article/${article.id}`}
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
                <Link href={`/article/${article.id}`}>Ver detalhes</Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
