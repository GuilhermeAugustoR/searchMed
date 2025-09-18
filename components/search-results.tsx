"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
  ChevronRight,
} from "lucide-react";
import type { Article } from "@/lib/types";
import { ensureAbsoluteUrl } from "@/lib/api-helper";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

  useEffect(() => {
    // Load saved articles from localStorage
    const saved = JSON.parse(localStorage.getItem("savedArticles") || "[]");
    setSavedArticles(saved);
  }, []);

  const toggleSaveArticle = (articleId: string, articleTitle: string) => {
    let updated;
    if (savedArticles.includes(articleId)) {
      updated = savedArticles.filter((id) => id !== articleId);
      toast({
        title: "Artigo removido",
        description: "O artigo foi removido dos seus favoritos",
        variant: "default",
      });
    } else {
      updated = [...savedArticles, articleId];
      toast({
        title: "Artigo salvo",
        description: "O artigo foi adicionado aos seus favoritos",
        variant: "default",
      });
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

  const extractDomain = (url: string): string => {
    try {
      const domain = new URL(ensureAbsoluteUrl(url)).hostname
        .replace("www.", "")
        .split(".")
        .slice(-2)
        .join(".");
      return domain;
    } catch (error) {
      return "";
    }
  };

  // Variantes de animação para os cards
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {articles.map((article, index) => (
        <motion.div
          key={article.id}
          variants={cardVariants}
          whileHover="hover"
          custom={index}
          className="rounded-xl overflow-hidden"
        >
          <Card className="overflow-hidden border-0 shadow-md dark:shadow-slate-900/30 transition-all duration-300 h-full flex flex-col bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={
                      article.language === "Inglês" ? "secondary" : "default"
                    }
                    className="animate-in fade-in-50 duration-300"
                  >
                    {article.language}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm animate-in fade-in-50 duration-300 delay-100"
                  >
                    {article.source === "CrossRef" ||
                    article.source === "OpenAlex"
                      ? `${article.source} • ${article.journal}`
                      : article.source ||
                        (article.id.startsWith("crossref-")
                          ? "CrossRef"
                          : article.id.startsWith("openalex-")
                          ? "OpenAlex"
                          : "Fonte desconhecida")}
                  </Badge>
                  {article.url && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-50/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 backdrop-blur-sm animate-in fade-in-50 duration-300 delay-200"
                    >
                      {extractDomain(article.url)}
                    </Badge>
                  )}
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full animate-in fade-in-50 duration-300">
                  {article.year}
                </span>
              </div>
              <CardTitle className="mt-3 text-xl md:text-2xl font-bold leading-tight">
                {/* Tratamento especial para artigos do SciELO */}
                {article.source === "SciELO" ? (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors flex items-center group"
                  >
                    {article.title}
                    <ExternalLink className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <Link
                    href={`/article/${article.id}`}
                    className="hover:text-primary transition-colors inline-flex items-center group"
                  >
                    {article.title}
                    <ChevronRight className="ml-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" />
                  </Link>
                )}
              </CardTitle>
              <CardDescription className="mt-2 text-sm md:text-base">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {article.journal}
                </span>{" "}
                • {article.authors}
              </CardDescription>
            </CardHeader>
            <CardContent className="py-3 flex-grow">
              <p className="text-slate-600 dark:text-slate-400 line-clamp-3 text-sm md:text-base">
                {article.abstract}
              </p>
              
              {/* Informações adicionais */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <div>
                    <span className="font-medium">Idioma:</span> {article.language}
                  </div>
                  <div>
                    <span className="font-medium">Ano:</span> {article.year}
                  </div>
                  {article.doi && (
                    <div className="col-span-2">
                      <span className="font-medium">DOI:</span> 
                      <span className="font-mono ml-1">{article.doi}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm border-t p-4">
              <div className="flex flex-wrap gap-2">
                {article.keywords.slice(0, 3).map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm animate-in fade-in-50 duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSaveArticle(article.id, article.title)}
                  aria-label={
                    savedArticles.includes(article.id)
                      ? "Remover dos salvos"
                      : "Salvar artigo"
                  }
                  className="text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
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
                    className="text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary transition-all duration-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Acessar original</span>
                    <span className="sm:hidden">Original</span>
                  </Button>
                )}

                {/* Para artigos que não são do SciELO, mostrar o botão "Ver detalhes" */}
                {article.source !== "SciELO" && (
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300"
                  >
                    <Link
                      href={`/article/${article.id}`}
                      className="flex items-center"
                    >
                      <span className="hidden sm:inline">Ver detalhes</span>
                      <span className="sm:hidden">Detalhes</span>
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
