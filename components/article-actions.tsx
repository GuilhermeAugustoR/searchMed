"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bookmark, BookmarkCheck, Download, Share2, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Article } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"

interface ArticleActionsProps {
  article: Article
}

export function ArticleActions({ article }: ArticleActionsProps) {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const savedArticles = JSON.parse(localStorage.getItem("savedArticles") || "[]")
    setIsSaved(savedArticles.includes(article.id))
  }, [article.id])

  const toggleSaveArticle = () => {
    const savedArticles = JSON.parse(localStorage.getItem("savedArticles") || "[]")

    let updated
    if (isSaved) {
      updated = savedArticles.filter((id: string) => id !== article.id)
      toast({
        description: "Artigo removido dos favoritos",
      })
    } else {
      updated = [...savedArticles, article.id]
      toast({
        description: "Artigo salvo nos favoritos",
      })
    }

    localStorage.setItem("savedArticles", JSON.stringify(updated))
    setIsSaved(!isSaved)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      description: "Link copiado para a área de transferência",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex justify-between items-center mb-6">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSaveArticle}
          aria-label={isSaved ? "Remover dos favoritos" : "Salvar artigo"}
        >
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Share2 className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleShare}>Copiar link</DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
