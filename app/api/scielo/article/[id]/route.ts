import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCache, setCache } from "@/lib/cache"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const cacheKey = `article:${id}`

  console.log(`API SciELO: Buscando artigo com ID: ${id}`)

  // Verificar se temos o artigo em cache
  const cachedArticle = getCache(cacheKey)
  if (cachedArticle) {
    console.log(`Artigo ${id} encontrado no cache`)
    return NextResponse.json({ article: cachedArticle })
  }

  try {
    // Criar um artigo genérico que direciona para o SciELO
    const article = {
      id: id,
      title: "Artigo do SciELO",
      authors: "Informações disponíveis no site do SciELO",
      journal: "SciELO - Biblioteca Científica Eletrônica Online",
      year: "Informação disponível no site original",
      language: "Informação disponível no site original",
      abstract: "Para visualizar o resumo completo, acesse o artigo no site do SciELO.",
      content: `<h2>Artigo do SciELO</h2>
               <p>Devido a limitações técnicas, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
               <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do SciELO.</p>
               <p>O SciELO (Scientific Electronic Library Online) é uma biblioteca eletrônica que abrange uma coleção selecionada de periódicos científicos brasileiros e de outros países da América Latina e Caribe.</p>`,
      keywords: [],
      references: [],
      doi: null,
      url: "https://search.scielo.org/",
      source: "SciELO",
    }

    // Armazenar o artigo em cache
    setCache(cacheKey, article)

    console.log(`API SciELO: Artigo genérico criado`)
    return NextResponse.json({ article })
  } catch (error) {
    console.error("Erro ao buscar artigo por ID:", error)
    return NextResponse.json(
      {
        error: "Erro ao buscar artigo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}
