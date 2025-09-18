"use client";

import type React from "react";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check, Wand2, BookOpen, Languages } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { Article } from "@/lib/types";
import { ensureAbsoluteUrl } from "@/lib/api-helper";
import { toast } from "@/components/ui/use-toast";
import { melhorarTexto, corrigirGramatica, resumirTexto } from "@/app/actions";

interface ArticleViewProps {
  article: Article;
}

export function ArticleView({ article }: ArticleViewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copiedCitation, setCopiedCitation] = useState(false);
  const [improvedText, setImprovedText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [summarizedText, setSummarizedText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null);

  // Determinar a URL externa do artigo
  const externalUrl =
    article.url || (article.doi ? `https://doi.org/${article.doi}` : null);

  // Função para abrir o link externo
  const openExternalLink = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (externalUrl) {
      const absoluteUrl = ensureAbsoluteUrl(externalUrl);
      console.log("Abrindo URL externa:", absoluteUrl);
      window.open(absoluteUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Função para gerar citação em diferentes formatos
  const generateCitation = (format: "apa" | "abnt" | "vancouver") => {
    const authors = article.authors;
    const title = article.title;
    const journal = article.journal;
    const year = article.year;
    const doi = article.doi;

    let citation = "";

    switch (format) {
      case "apa":
        citation = `${authors} (${year}). ${title}. ${journal}.${doi ? ` https://doi.org/${doi}` : ""}`;
        break;
      case "abnt":
        citation = `${authors.toUpperCase()}. ${title}. ${journal}, ${year}.${doi ? ` DOI: ${doi}.` : ""}`;
        break;
      case "vancouver":
        const authorsVancouver = authors.split(", ").map(author => {
          const parts = author.trim().split(" ");
          if (parts.length >= 2) {
            const lastName = parts[parts.length - 1];
            const initials = parts.slice(0, -1).map(name => name.charAt(0)).join("");
            return `${lastName} ${initials}`;
          }
          return author;
        }).join(", ");
        citation = `${authorsVancouver}. ${title}. ${journal}. ${year}.${doi ? ` doi: ${doi}` : ""}`;
        break;
    }

    return citation;
  };

  // Função para copiar citação
  const copyCitation = (format: "apa" | "abnt" | "vancouver") => {
    const citation = generateCitation(format);
    navigator.clipboard.writeText(citation);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2000);
    toast({
      title: "Citação copiada",
      description: `Citação no formato ${format.toUpperCase()} copiada para a área de transferência`,
    });
  };

  // Função para melhorar texto com IA
  const handleImproveText = () => {
    setActiveAiAction("improve");
    startTransition(async () => {
      try {
        const improved = await melhorarTexto(article.abstract);
        setImprovedText(improved);
        toast({
          title: "Texto melhorado",
          description: "O resumo foi melhorado com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível melhorar o texto",
          variant: "destructive",
        });
      } finally {
        setActiveAiAction(null);
      }
    });
  };

  // Função para corrigir gramática
  const handleCorrectGrammar = () => {
    setActiveAiAction("correct");
    startTransition(async () => {
      try {
        const corrected = await corrigirGramatica(article.abstract);
        setCorrectedText(corrected);
        toast({
          title: "Gramática corrigida",
          description: "O texto foi corrigido com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível corrigir o texto",
          variant: "destructive",
        });
      } finally {
        setActiveAiAction(null);
      }
    });
  };

  // Função para resumir texto
  const handleSummarizeText = () => {
    setActiveAiAction("summarize");
    startTransition(async () => {
      try {
        const summarized = await resumirTexto(article.abstract);
        setSummarizedText(summarized);
        toast({
          title: "Texto resumido",
          description: "O resumo foi criado com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível resumir o texto",
          variant: "destructive",
        });
      } finally {
        setActiveAiAction(null);
      }
    });
  };

  return (
    <>
      {/* Link externo proeminente */}
      {externalUrl && (
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-200">
            Acesso ao artigo original
          </AlertTitle>
          <AlertDescription>
            <div className="mt-3 space-y-3">
              <p className="text-blue-700 dark:text-blue-300">
                Acesse o texto completo e informações adicionais no site original
              </p>
              <Button
                variant="default"
                size="sm"
                onClick={openExternalLink}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Acessar artigo original
              </Button>
              <p className="text-xs text-blue-600 dark:text-blue-400 break-all font-mono bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                {externalUrl}
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="citations">Citações</TabsTrigger>
          <TabsTrigger value="ai-tools" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Informações principais do artigo */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {article.source}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {article.language}
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {article.year}
                </Badge>
                {article.doi && (
                  <Badge variant="outline" className="text-sm font-mono">
                    DOI: {article.doi}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-2xl leading-tight">
                {article.title}
              </CardTitle>
              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <p className="font-medium">{article.authors}</p>
                <p className="italic">{article.journal}</p>
              </div>
            </CardHeader>
          </Card>

          {/* Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Resumo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                {article.abstract}
              </p>
            </CardContent>
          </Card>

          {/* Palavras-chave */}
          {article.keywords && article.keywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Palavras-chave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações adicionais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informações Bibliográficas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                    Revista/Fonte
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">{article.journal}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                    Ano de Publicação
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">{article.year}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                    Idioma
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">{article.language}</p>
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                    Fonte de Dados
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">{article.source}</p>
                </div>
              </div>
              {article.doi && (
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-1">
                    DOI (Digital Object Identifier)
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 font-mono text-sm bg-slate-100 dark:bg-slate-800 p-2 rounded">
                    {article.doi}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Conteúdo Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none dark:prose-invert prose-slate"
                dangerouslySetInnerHTML={{
                  __html: article.content || `<p>${article.abstract}</p>`,
                }}
              />
            </CardContent>
          </Card>

          {/* Referências */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Referências</CardTitle>
            </CardHeader>
            <CardContent>
              {article.references && article.references.length > 0 ? (
                <div className="space-y-3">
                  {article.references.map((ref, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-4 border-primary/30"
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium text-primary mr-2">
                          [{index + 1}]
                        </span>
                        {ref}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma referência disponível para este artigo.</p>
                  <p className="text-sm mt-2">
                    As referências podem estar disponíveis no artigo original.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="citations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Formatos de Citação</CardTitle>
              <p className="text-slate-600 dark:text-slate-400">
                Copie a citação no formato desejado para usar em seus trabalhos
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* APA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    Formato APA (7ª edição)
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCitation("apa")}
                    className="flex items-center gap-2"
                  >
                    {copiedCitation ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copiar
                  </Button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                    {generateCitation("apa")}
                  </p>
                </div>
              </div>

              <Separator />

              {/* ABNT */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    Formato ABNT (NBR 6023)
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCitation("abnt")}
                    className="flex items-center gap-2"
                  >
                    {copiedCitation ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copiar
                  </Button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                    {generateCitation("abnt")}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Vancouver */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-800 dark:text-slate-200">
                    Formato Vancouver
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCitation("vancouver")}
                    className="flex items-center gap-2"
                  >
                    {copiedCitation ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copiar
                  </Button>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                    {generateCitation("vancouver")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Ferramentas de IA
              </CardTitle>
              <p className="text-slate-600 dark:text-slate-400">
                Use inteligência artificial para melhorar, corrigir ou resumir o texto do artigo
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Texto original */}
              <div className="space-y-3">
                <h4 className="font-medium text-slate-800 dark:text-slate-200">
                  Resumo Original
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {article.abstract}
                  </p>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleImproveText}
                  disabled={isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {activeAiAction === "improve" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Melhorar texto
                </Button>
                <Button
                  onClick={handleCorrectGrammar}
                  disabled={isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {activeAiAction === "correct" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Corrigir gramática
                </Button>
                <Button
                  onClick={handleSummarizeText}
                  disabled={isPending}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {activeAiAction === "summarize" ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <BookOpen className="h-4 w-4" />
                  )}
                  Resumir
                </Button>
              </div>

              {/* Resultados da IA */}
              {improvedText && (
                <div className="space-y-3">
                  <h4 className="font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    Texto Melhorado
                  </h4>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                      {improvedText}
                    </p>
                  </div>
                </div>
              )}

              {correctedText && (
                <div className="space-y-3">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Gramática Corrigida
                  </h4>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {correctedText}
                    </p>
                  </div>
                </div>
              )}

              {summarizedText && (
                <div className="space-y-3">
                  <h4 className="font-medium text-purple-800 dark:text-purple-200 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Resumo Condensado
                  </h4>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed">
                      {summarizedText}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Conteúdo Detalhado</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none dark:prose-invert prose-slate prose-headings:text-slate-800 dark:prose-headings:text-slate-200 prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-a:text-primary hover:prose-a:text-primary/80"
                dangerouslySetInnerHTML={{
                  __html: article.content || `<p>${article.abstract}</p>`,
                }}
              />
            </CardContent>
          </Card>

          {externalUrl && (
            <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <ExternalLink className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">
                      Texto completo disponível
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Para acessar o artigo completo com todas as seções, figuras e tabelas
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openExternalLink}
                    className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Acessar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}