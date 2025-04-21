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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import type { Article } from "@/lib/types";

interface ArticleActionsProps {
  article: Article;
}

export function ArticleActions({ article }: ArticleActionsProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(false);

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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `Confira este artigo: ${article.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copiado",
        description:
          "O link do artigo foi copiado para a área de transferência",
      });
    }
  };

  const handleCitationExport = () => {
    // Gerar citação no formato APA
    const authors = article.authors.split(", ").join(" & ");
    const citation = `${authors} (${article.year}). ${article.title}. ${article.journal}.`;

    navigator.clipboard.writeText(citation);
    toast({
      title: "Citação copiada",
      description: "A citação foi copiada para a área de transferência",
    });
  };

  const handleExternalLink = () => {
    if (article.url) {
      window.open(article.url, "_blank", "noopener,noreferrer");
    } else if (article.doi) {
      window.open(
        `https://doi.org/${article.doi}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <div className="flex justify-between items-center">
      <Button variant="ghost" onClick={() => router.back()}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={toggleSave}>
          {isSaved ? (
            <>
              <BookmarkCheck className="mr-2 h-4 w-4 text-primary" />
              Salvo
            </>
          ) : (
            <>
              <Bookmark className="mr-2 h-4 w-4" />
              Salvar
            </>
          )}
        </Button>

        {(article.url || article.doi) && (
          <Button variant="outline" size="sm" onClick={handleExternalLink}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Acessar original
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCitationExport}>
              <Download className="mr-2 h-4 w-4" />
              Copiar citação
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
