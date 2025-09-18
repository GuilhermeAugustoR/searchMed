"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  Download,
  ExternalLink,
  Share2,
  Copy,
  Check,
  FileText,
  Printer,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import type { Article } from "@/lib/types";
import { ensureAbsoluteUrl } from "@/lib/api-helper";

interface ArticleActionsProps {
  article: Article;
}

export function ArticleActions({ article }: ArticleActionsProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se o artigo está salvo
    const savedArticles = JSON.parse(
      localStorage.getItem("savedArticles") || "[]"
    );
    setIsSaved(savedArticles.includes(article.id));
  }, [article.id]);

  const toggleSave = () => {
    const savedArticles = JSON.parse(
      localStorage.getItem("savedArticles") || "[]"
    );
    let updated;

    if (savedArticles.includes(article.id)) {
      updated = savedArticles.filter((id: string) => id !== article.id);
      toast({
        title: "Artigo removido",
        description: "O artigo foi removido dos seus favoritos",
      });
    } else {
      updated = [...savedArticles, article.id];
      toast({
        title: "Artigo salvo",
        description: "O artigo foi adicionado aos seus favoritos",
      });
    }

    localStorage.setItem("savedArticles", JSON.stringify(updated));
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    const shareData = {
      title: article.title,
      text: `Confira este artigo científico: ${article.title}`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback para copiar o link
        await copyToClipboard(window.location.href, "Link copiado");
      }
    } else {
      await copyToClipboard(window.location.href, "Link copiado");
    }
  };

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(successMessage);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: successMessage,
        description: "Conteúdo copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo",
        variant: "destructive",
      });
    }
  };

  const generateCitation = (format: "apa" | "abnt" | "vancouver") => {
    const authors = article.authors;
    const title = article.title;
    const journal = article.journal;
    const year = article.year;
    const doi = article.doi;

    switch (format) {
      case "apa":
        return `${authors} (${year}). ${title}. ${journal}.${doi ? ` https://doi.org/${doi}` : ""}`;
      case "abnt":
        return `${authors.toUpperCase()}. ${title}. ${journal}, ${year}.${doi ? ` DOI: ${doi}.` : ""}`;
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
        return `${authorsVancouver}. ${title}. ${journal}. ${year}.${doi ? ` doi: ${doi}` : ""}`;
      default:
        return "";
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const exportAsText = () => {
    const content = `
TÍTULO: ${article.title}

AUTORES: ${article.authors}

REVISTA: ${article.journal}

ANO: ${article.year}

IDIOMA: ${article.language}

FONTE: ${article.source}

${article.doi ? `DOI: ${article.doi}` : ""}

${article.url ? `URL: ${article.url}` : ""}

RESUMO:
${article.abstract}

${article.keywords.length > 0 ? `PALAVRAS-CHAVE: ${article.keywords.join(", ")}` : ""}

${article.references.length > 0 ? `\nREFERÊNCIAS:\n${article.references.map((ref, i) => `[${i + 1}] ${ref}`).join("\n")}` : ""}

CITAÇÃO APA:
${generateCitation("apa")}

CITAÇÃO ABNT:
${generateCitation("abnt")}

CITAÇÃO VANCOUVER:
${generateCitation("vancouver")}
    `.trim();

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${article.title.substring(0, 50).replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Arquivo exportado",
      description: "O artigo foi exportado como arquivo de texto",
    });
  };

  // Função para abrir o link externo
  const handleExternalLink = () => {
    let url = null;
    if (article.url) {
      url = article.url;
    } else if (article.doi) {
      url = `https://doi.org/${article.doi}`;
    }

    if (url) {
      const absoluteUrl = ensureAbsoluteUrl(url);
      console.log("Abrindo URL externa:", absoluteUrl);
      window.open(absoluteUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border shadow-sm">
      <Button 
        variant="ghost" 
        onClick={() => router.back()}
        className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar aos resultados
      </Button>

      <div className="flex flex-wrap gap-2">
        <Button 
          variant={isSaved ? "default" : "outline"} 
          size="sm" 
          onClick={toggleSave}
          className="flex items-center gap-2 transition-all duration-300"
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Salvo</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              <span className="hidden sm:inline">Salvar</span>
            </>
          )}
        </Button>

        {(article.url || article.doi) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExternalLink}
            className="flex items-center gap-2 hover:border-primary hover:text-primary transition-all duration-300"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden sm:inline">Original</span>
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 hover:border-primary hover:text-primary transition-all duration-300"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Mais</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar artigo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(generateCitation("apa"), "Citação APA copiada")}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar citação APA
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyToClipboard(generateCitation("abnt"), "Citação ABNT copiada")}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar citação ABNT
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportAsText}>
              <FileText className="mr-2 h-4 w-4" />
              Exportar como texto
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint} className="no-print">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir artigo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}