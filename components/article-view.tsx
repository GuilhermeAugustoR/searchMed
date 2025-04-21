"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Article } from "@/lib/types";

interface ArticleViewProps {
  article: Article;
}

export function ArticleView({ article }: ArticleViewProps) {
  const [activeTab, setActiveTab] = useState("original");
  const [translatedContent, setTranslatedContent] = useState("");
  const [summary, setSummary] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleTranslate = () => {
    // Placeholder para função de tradução
    setIsTranslating(true);
    // Simulação de tradução
    setTimeout(() => {
      setTranslatedContent(`Tradução do conteúdo do artigo "${article.title}"`);
      setIsTranslating(false);
      setActiveTab("translated");
    }, 1500);
  };

  const handleSummarize = () => {
    // Placeholder para função de resumo
    setIsSummarizing(true);
    // Simulação de resumo
    setTimeout(() => {
      setSummary(`Resumo do artigo "${article.title}"`);
      setIsSummarizing(false);
      setActiveTab("summary");
    }, 1500);
  };

  // Determinar a URL externa do artigo
  const externalUrl =
    article.url || (article.doi ? `https://doi.org/${article.doi}` : null);

  // Função para abrir o link externo em uma nova aba
  const openExternalLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (externalUrl) {
      // Garantir que a URL seja absoluta
      let url = externalUrl;
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }
      // Abrir em uma nova aba usando window.open
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <>
      {/* Link externo proeminente */}
      {externalUrl && (
        <Alert className="mb-6">
          <AlertTitle className="flex items-center">
            <ExternalLink className="h-4 w-4 mr-2" />
            Link para o artigo original
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <Button
                variant="default"
                size="sm"
                className="mt-2"
                onClick={openExternalLink}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Acessar artigo original
              </Button>
              <p className="text-xs mt-2 text-muted-foreground break-all">
                {externalUrl}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
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
          <TabsTrigger value="original">Resumo</TabsTrigger>
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
            dangerouslySetInnerHTML={{
              __html:
                article.content ||
                `<p>${article.abstract || "Resumo não disponível"}</p>`,
            }}
          />

          {externalUrl && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Para acessar o artigo completo, visite o site original:
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={openExternalLink}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Acessar artigo original
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="translated" className="space-y-4">
          {/* Conteúdo traduzido do artigo */}
          {translatedContent ? (
            <p>{translatedContent}</p>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              Nenhuma tradução disponível. Clique em "Traduzir artigo" para
              traduzir.
            </p>
          )}
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          {/* Resumo do artigo */}
          {summary ? (
            <p>{summary}</p>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              Nenhum resumo disponível. Clique em "Resumir artigo" para gerar um
              resumo.
            </p>
          )}
        </TabsContent>

        <TabsContent value="references" className="space-y-4">
          {article.references && article.references.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Referências</h2>
              <ul className="space-y-2 list-disc pl-5">
                {article.references.map((ref, index) => (
                  <li
                    key={index}
                    className="text-slate-700 dark:text-slate-300"
                  >
                    {ref}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              Nenhuma referência disponível para este artigo.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
