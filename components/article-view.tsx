"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Article } from "@/lib/types";

// Adicionar a importação da função ensureAbsoluteUrl
import { ensureAbsoluteUrl } from "@/lib/api-helper";

interface ArticleViewProps {
  article: Article;
}

export function ArticleView({ article }: ArticleViewProps) {
  const [activeTab, setActiveTab] = useState("original");
  const [isLoading, setIsLoading] = useState(false);

  // Determinar a URL externa do artigo
  const externalUrl =
    article.url || (article.doi ? `https://doi.org/${article.doi}` : null);

  // Função para abrir o link externo
  const openExternalLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (externalUrl) {
      // Garantir que a URL seja absoluta
      const absoluteUrl = ensureAbsoluteUrl(externalUrl);

      // Registrar a URL que está sendo aberta para depuração
      console.log("Abrindo URL externa:", absoluteUrl);

      // Abrir em uma nova aba
      window.open(absoluteUrl, "_blank", "noopener,noreferrer");
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="original">Resumo</TabsTrigger>
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
