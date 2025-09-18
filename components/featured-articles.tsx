"use client";

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
import { searchArticles } from "@/lib/api";
import type { Article } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedArticles() {
      try {
        // Buscar artigos recentes sobre medicina
        const results = await searchArticles(
          "medicine",
          "keyword",
          "all",
          "2023",
          "date_desc"
        );
        setArticles(results.slice(0, 3));
      } catch (error) {
        console.error("Erro ao buscar artigos em destaque:", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedArticles();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-full">
            <CardHeader>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-6 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter className="flex flex-col items-start">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">
          Nenhum artigo em destaque disponível no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <Card
          key={article.id}
          className="h-full flex flex-col transition-all hover:shadow-md"
        >
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge
                variant={
                  article.language === "Inglês" ? "secondary" : "default"
                }
              >
                {article.language}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {article.year}
              </span>
            </div>
            <CardTitle className="mt-2 text-lg">
              <Link
                href={`/article/${article.id}`}
                className="hover:text-primary transition-colors"
              >
                {article.title}
              </Link>
            </CardTitle>
            <CardDescription>{article.journal}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4">
              {article.abstract}
            </p>
            
            {/* Informações adicionais */}
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div>
                  <span className="font-medium">Fonte:</span> {article.source}
                </div>
                {article.doi && (
                  <div>
                    <span className="font-medium">DOI:</span> 
                    <span className="font-mono ml-1">{article.doi}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start pt-4 border-t">
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-2">
              {article.authors}
            </p>
            <div className="flex flex-wrap gap-2">
              {article.keywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
