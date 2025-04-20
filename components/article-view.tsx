"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/lib/types";
import { translateArticle, summarizeArticle } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, Database } from "lucide-react";
import Link from "next/link";

interface ArticleViewProps {
  article: Article;
}

export function ArticleView({ article }: ArticleViewProps) {
  const [activeTab, setActiveTab] = useState("original");
  const [translatedContent, setTranslatedContent] = useState("");
  const [summary, setSummary] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleTranslate = async () => {
    if (translatedContent) {
      setActiveTab("translated");
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateArticle(article.content, article.language);
      setTranslatedContent(result);
      setActiveTab("translated");
    } catch (error) {
      console.error("Erro ao traduzir artigo:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSummarize = async () => {
    if (summary) {
      setActiveTab("summary");
      return;
    }

    setIsSummarizing(true);
    try {
      const result = await summarizeArticle(article.content, article.language);
      setSummary(result);
      setActiveTab("summary");
    } catch (error) {
      console.error("Erro ao resumir artigo:", error);
    } finally {
      setIsSummarizing(false);
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
        return "destructive"; // Destacar The Lancet com uma cor diferente
      default:
        return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge
            variant={article.language === "Inglês" ? "secondary" : "default"}
          >
            {article.language}
          </Badge>
          <Badge variant="outline">{article.year}</Badge>
          <Badge variant="outline">{article.journal}</Badge>
          {article.source && (
            <Badge variant={getSourceBadgeVariant(article.source)}>
              <Database className="h-3 w-3 mr-1" />
              {article.source}
            </Badge>
          )}
        </div>
        <CardTitle className="text-2xl">{article.title}</CardTitle>
        <CardDescription>{article.authors}</CardDescription>

        {article.url && (
          <div className="mt-2">
            <Button variant="outline" size="sm" asChild>
              <Link
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver na fonte original <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="font-medium mb-2">Resumo</h3>
          <p className="text-slate-600 dark:text-slate-300">
            {article.abstract}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <h3 className="font-medium mr-2">Palavras-chave:</h3>
          {article.keywords.map((keyword, index) => (
            <Badge key={index} variant="outline">
              {keyword}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant="outline"
            onClick={handleTranslate}
            disabled={isTranslating}
          >
            {isTranslating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {translatedContent ? "Ver tradução" : "Traduzir artigo"}
          </Button>
          <Button
            variant="outline"
            onClick={handleSummarize}
            disabled={isSummarizing}
          >
            {isSummarizing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {summary ? "Ver resumo" : "Resumir artigo"}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="original">Original</TabsTrigger>
            <TabsTrigger
              value="translated"
              disabled={!translatedContent && !isTranslating}
            >
              Traduzido
            </TabsTrigger>
            <TabsTrigger value="summary" disabled={!summary && !isSummarizing}>
              Resumo
            </TabsTrigger>
            <TabsTrigger value="references">Referências</TabsTrigger>
          </TabsList>

          <TabsContent value="original" className="space-y-4">
            <div
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </TabsContent>

          <TabsContent value="translated" className="space-y-4">
            {isTranslating ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Traduzindo artigo...</p>
              </div>
            ) : (
              <div
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: translatedContent }}
              />
            )}
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            {isSummarizing ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2">Gerando resumo...</p>
              </div>
            ) : (
              <div
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            )}
          </TabsContent>

          <TabsContent value="references" className="space-y-4">
            <h3 className="font-medium mb-4">Referências Bibliográficas</h3>
            {article.references.length > 0 ? (
              <ul className="space-y-3">
                {article.references.map((reference, index) => (
                  <li key={index} className="text-sm">
                    <div className="p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-800">
                      {reference}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">
                Referências não disponíveis para este artigo.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
