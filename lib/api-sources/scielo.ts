import type { Article } from "@/lib/types"

// Função para buscar artigos do SciELO
export async function searchScielo(
  query: string,
  options: {
    page?: number
    size?: number
    lang?: string
    year?: string
  } = {},
): Promise<Article[]> {
  try {
    const { page = 1, size = 10, lang, year } = options

    console.log(`[SciELO] Buscando artigos com query: ${query}`)

    // Em vez de tentar extrair dados do HTML, vamos criar resultados simulados
    // que direcionam o usuário para a página de pesquisa do SciELO

    // Construir a URL de pesquisa do SciELO com os filtros apropriados
    let searchUrl = `https://search.scielo.org/?q=${encodeURIComponent(query)}`

    // Adicionar filtro de idioma se especificado
    if (lang) {
      if (lang === "pt") searchUrl += "&la=pt"
      else if (lang === "en") searchUrl += "&la=en"
      else if (lang === "es") searchUrl += "&la=es"
    }

    // Adicionar filtro de ano se especificado
    if (year && year !== "all" && year !== "older") {
      searchUrl += `&py=${year}`
    }

    console.log(`[SciELO] URL de pesquisa: ${searchUrl}`)

    // Criar resultados simulados que direcionam para a página de pesquisa do SciELO
    const articles: Article[] = []

    // Criar um único resultado que direciona para a página de pesquisa
    articles.push({
      id: `scielo-search-${Date.now()}`,
      title: `Resultados do SciELO para "${query}"`,
      authors: "Diversos autores",
      journal: "SciELO - Biblioteca Científica Eletrônica Online",
      year: year || "Todos os anos",
      language: lang === "pt" ? "Português" : lang === "en" ? "Inglês" : lang === "es" ? "Espanhol" : "Todos",
      abstract: `Sua pesquisa por "${query}" encontrou resultados no SciELO. Clique em "Acessar resultados" para ver todos os artigos encontrados diretamente no site do SciELO.`,
      content: `<h2>Resultados do SciELO</h2>
               <p>Sua pesquisa por "${query}" encontrou resultados no SciELO.</p>
               <p>Devido a limitações técnicas, não é possível exibir os resultados detalhados diretamente nesta aplicação.</p>
               <p>Por favor, clique no botão "Acessar resultados" acima para visualizar todos os artigos encontrados diretamente no site do SciELO.</p>
               <p>O SciELO (Scientific Electronic Library Online) é uma biblioteca eletrônica que abrange uma coleção selecionada de periódicos científicos brasileiros e de outros países da América Latina e Caribe.</p>`,
      keywords: [query],
      references: [],
      doi: undefined,
      url: searchUrl,
      source: "SciELO",
    })

    console.log(`[SciELO] Retornando ${articles.length} resultados simulados`)
    return articles
  } catch (error) {
    console.error("[SciELO] Erro ao buscar artigos:", error)
    return []
  }
}

// Função para obter detalhes de um artigo específico do SciELO
export async function getScieloArticleById(id: string): Promise<Article | undefined> {
  try {
    console.log(`[SciELO] Buscando detalhes do artigo com ID: ${id}`)

    // Como não podemos extrair detalhes confiáveis, vamos criar um artigo genérico
    // que direciona o usuário para a página de pesquisa do SciELO

    const searchUrl = "https://search.scielo.org/"

    const article: Article = {
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
      doi: undefined,
      url: searchUrl,
      source: "SciELO",
    }

    console.log(`[SciELO] Retornando artigo genérico com link para o SciELO`)
    return article
  } catch (error) {
    console.error("[SciELO] Erro ao buscar detalhes do artigo:", error)
    return undefined
  }
}
