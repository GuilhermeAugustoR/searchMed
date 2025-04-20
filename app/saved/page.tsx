"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { getArticleById } from "@/lib/api"
import type { Article } from "@/lib/types"

export default function SavedArticlesPage() {
  const [savedArticles, setSavedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSavedArticles = async () => {
      setLoading(true)
      try {
        const savedIds = JSON.parse(localStorage.getItem("savedArticles") || "[]")

        if (savedIds.length === 0) {
          setSavedArticles([])
          setLoading(false)
          return
        }

        const articlesPromises = savedIds.map((id: string) => getArticleById(id))
        const articles = await Promise.all(articlesPromises)
        setSavedArticles(articles.filter(Boolean) as Article[])
      } catch (error) {
        console.error("Error loading saved articles:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSavedArticles()
  }, [])

  const removeArticle = (id: string) => {
    const savedIds = JSON.parse(localStorage.getItem("savedArticles") || "[]")
    const updatedIds = savedIds.filter((savedId: string) => savedId !== id)
    localStorage.setItem("savedArticles", JSON.stringify(updatedIds))

    setSavedArticles(savedArticles.filter((article) => article.id !== id))
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Artigos Salvos</h1>
        <p>Carregando seus artigos salvos...</p>
      </div>
    )
  }

  if (savedArticles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Artigos Salvos</h1>
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <p className="text-lg text-slate-600 mb-4">Você ainda não salvou nenhum artigo.</p>
          <Button asChild>
            <Link href="/">Explorar artigos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Artigos Salvos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedArticles.map((article) => (
          <Card key={article.id} className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between">
                <Badge variant={article.language === "Inglês" ? "secondary" : "default"}>{article.language}</Badge>
                <span className="text-sm text-muted-foreground">{article.year}</span>
              </div>
              <CardTitle className="mt-2 text-lg">
                <Link href={`/article/${article.id}`} className="hover:underline">
                  {article.title}
                </Link>
              </CardTitle>
              <CardDescription>{article.journal}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-slate-600 line-clamp-4">{article.abstract}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t pt-4">
              <Button variant="ghost" size="sm" onClick={() => removeArticle(article.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/article/${article.id}`}>Ver detalhes</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
