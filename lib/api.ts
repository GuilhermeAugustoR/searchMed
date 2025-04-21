import type { Article } from "./types";

// Função para buscar artigos do PubMed
export async function searchArticles(
  query: string,
  type: string,
  language: string,
  year: string,
  sort: string
): Promise<Article[]> {
  console.log("Iniciando pesquisa com parâmetros:", {
    query,
    type,
    language,
    year,
    sort,
  });

  if (!query) {
    console.log("Nenhuma query fornecida, retornando lista vazia");
    return [];
  }

  try {
    // Construir a URL para a API do servidor
    const params = new URLSearchParams({
      q: query,
      type,
      lang: language,
      year,
      sort,
    });

    // Usar a API do servidor para evitar problemas de CORS
    const response = await fetch(`/api/pubmed/search?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Encontrados ${data.articles.length} artigos`);

    return data.articles;
  } catch (error) {
    console.error("Erro ao buscar artigos:", error);
    return [];
  }
}

// Função para obter um artigo por ID
export async function getArticleById(id: string): Promise<Article | null> {
  console.log(`Buscando artigo com ID: ${id}`);

  try {
    // Usar a API do servidor para evitar problemas de CORS
    const response = await fetch(`/api/pubmed/article/${id}`);

    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.article) {
      console.log("Artigo não encontrado");
      return null;
    }

    console.log(`Artigo encontrado: ${data.article.title}`);
    return data.article;
  } catch (error) {
    console.error("Erro ao buscar artigo por ID:", error);
    return null;
  }
}
