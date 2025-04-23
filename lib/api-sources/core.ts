import type { Article } from "@/lib/types";
import { fetchWithRetry } from "@/lib/api-helper";

// Base URL para a API do CORE
const CORE_API_BASE = "https://api.core.ac.uk/v3";

// Função para buscar artigos do CORE
export async function searchCore(
  query: string,
  options: {
    page?: number;
    pageSize?: number;
    year?: string;
  } = {}
): Promise<Article[]> {
  try {
    const { page = 1, pageSize = 20, year } = options;

    console.log(`[CORE] Buscando artigos com query: ${query}`);

    // Construir a URL para a API do CORE
    let apiUrl = `${CORE_API_BASE}/search/works?q=${encodeURIComponent(
      query
    )}&page=${page}&pageSize=${pageSize}`;

    // Adicionar filtro por ano se fornecido
    if (year && year !== "all") {
      apiUrl += `&yearPublished=${year}`;
    }

    console.log(`[CORE] URL da requisição: ${apiUrl}`);

    try {
      const response = await fetchWithRetry(apiUrl, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.warn(
          `[CORE] API retornou status ${response.status}. Retornando array vazio.`
        );
        return [];
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        console.log("[CORE] Nenhum resultado encontrado");
        return [];
      }

      console.log(`[CORE] Encontrados ${data.results.length} artigos`);

      // Converter os resultados para o formato padrão da aplicação
      const articles: Article[] = data.results.map((result: any) => {
        // Extrair autores
        const authors = result.authors
          ? result.authors.map((author: any) => author.name).join(", ")
          : "Autores não disponíveis";

        // Determinar o idioma (CORE não fornece essa informação diretamente)
        const language = "Inglês"; // Assumindo inglês como padrão

        // Extrair palavras-chave
        const keywords = result.topics || [];

        // Extrair DOI
        const doi = result.doi || null;

        // Gerar ID único
        const id = `core-${
          result.id || Math.random().toString(36).substring(2, 15)
        }`;

        return {
          id,
          title: result.title || "Título não disponível",
          authors,
          journal: result.publisher || "Fonte não disponível",
          year: result.yearPublished?.toString() || "Ano não disponível",
          language,
          abstract: result.abstract || "Resumo não disponível",
          content: `<h2>Abstract</h2><p>${
            result.abstract || "Resumo não disponível"
          }</p>`,
          keywords,
          references: [],
          doi,
          url:
            result.downloadUrl ||
            result.sourceFulltextUrls?.[0] ||
            (doi ? `https://doi.org/${doi}` : null),
          source: "CORE",
        };
      });

      return articles;
    } catch (error) {
      console.error("[CORE] Erro ao processar resposta da API:", error);
      return [];
    }
  } catch (error) {
    console.error("[CORE] Erro ao buscar artigos:", error);
    return [];
  }
}

// Função para obter detalhes de um artigo específico do CORE
export async function getCoreArticleById(id: string): Promise<Article | null> {
  try {
    // Remover o prefixo "core-" para obter o ID real do CORE
    const coreId = id.startsWith("core-") ? id.substring(5) : id;

    console.log(`[CORE] Buscando detalhes do artigo com ID: ${coreId}`);

    // Construir a URL para a API do CORE
    const apiUrl = `${CORE_API_BASE}/works/${coreId}`;

    const response = await fetchWithRetry(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro na API do CORE: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    // Extrair autores
    const authors = result.authors
      ? result.authors.map((author: any) => author.name).join(", ")
      : "Autores não disponíveis";

    // Determinar o idioma (CORE não fornece essa informação diretamente)
    const language = "Inglês"; // Assumindo inglês como padrão

    // Extrair palavras-chave
    const keywords = result.topics || [];

    // Extrair DOI
    const doi = result.doi || null;

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${result.abstract || "Resumo não disponível"}</p>
      ${
        result.downloadUrl
          ? `<h2>Texto Completo</h2><p><a href="${result.downloadUrl}" target="_blank" rel="noopener noreferrer">Download do texto completo</a></p>`
          : ""
      }
      ${
        result.sourceFulltextUrls && result.sourceFulltextUrls.length > 0
          ? `<p><a href="${result.sourceFulltextUrls[0]}" target="_blank" rel="noopener noreferrer">Acessar na fonte original</a></p>`
          : ""
      }
    `;

    const article: Article = {
      id: `core-${coreId}`,
      title: result.title || "Título não disponível",
      authors,
      journal: result.publisher || "Fonte não disponível",
      year: result.yearPublished?.toString() || "Ano não disponível",
      language,
      abstract: result.abstract || "Resumo não disponível",
      content,
      keywords,
      references: [],
      doi,
      url:
        result.downloadUrl ||
        result.sourceFulltextUrls?.[0] ||
        (doi ? `https://doi.org/${doi}` : null),
      source: "CORE",
    };

    return article;
  } catch (error) {
    console.error("[CORE] Erro ao buscar detalhes do artigo:", error);
    return null;
  }
}
