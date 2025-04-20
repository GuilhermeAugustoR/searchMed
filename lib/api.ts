import type { Article } from "./types";
import { filterMockArticles, getMockArticleById } from "./mock-data";

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
    // Construir a URL para a rota de API do proxy
    const params = new URLSearchParams({
      q: query,
      type,
      lang: language,
      year,
      sort,
    });

    // Construir URL absoluta usando window.location.origin
    const apiUrl = `${
      window.location.origin
    }/api/pubmed/search?${params.toString()}`;
    console.log("Fazendo requisição para o proxy de servidor:", apiUrl);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(
        `Erro na requisição: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      `Recebidos ${data.articles.length} artigos do proxy de servidor`
    );

    return data.articles;
  } catch (error) {
    console.error("Erro ao buscar artigos:", error);
    // Em caso de erro, usar dados simulados como fallback
    console.log("Usando dados simulados como fallback devido a erro");
    return filterMockArticles(query, type, language, year, sort);
  }
}

// Função para obter um artigo por ID
export async function getArticleById(id: string): Promise<Article | null> {
  console.log(`Buscando artigo com ID: ${id}`);

  try {
    // Construir URL absoluta usando window.location.origin
    const apiUrl = new URL(
      `/api/pubmed/article/${encodeURIComponent(id)}`,
      window.location.origin
    ).toString();
    console.log("Fazendo requisição para o proxy de servidor:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro na requisição: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      `Artigo recebido do proxy de servidor: ${
        data.article?.title || "Não encontrado"
      }`
    );

    return data.article;
  } catch (error) {
    console.error("Erro ao buscar artigo por ID:", error);
    // Em caso de erro, tentar retornar um artigo simulado como fallback
    console.log("Tentando usar dados simulados como fallback devido a erro");
    return getMockArticleById(id);
  }
}
