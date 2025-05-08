import type { Article } from "@/lib/types";
import { fetchWithRetry } from "@/lib/api-helper";

// Função para buscar artigos do OpenAlex (API pública que não requer autenticação)
export async function searchOpenAlex(
  query: string,
  options: {
    page?: number;
    pageSize?: number;
    year?: string;
    sort?: string;
  } = {}
): Promise<Article[]> {
  try {
    const { page = 1, pageSize = 20, year, sort = "relevance" } = options;

    console.log(`[OpenAlex] Buscando artigos com query: ${query}`);

    // Construir a query com filtros
    let apiUrl = `https://api.openalex.org/works?search=${encodeURIComponent(
      query
    )}&per-page=${pageSize}&page=${page}`;

    // Adicionar filtro de ano se especificado
    if (year && year !== "all" && year !== "older") {
      apiUrl += `&filter=publication_year:${year}`;
    } else if (year === "older") {
      apiUrl += `&filter=publication_year:<2018`;
    }

    // Adicionar ordenação
    if (sort === "date_desc") {
      apiUrl += `&sort=publication_date:desc`;
    } else if (sort === "date_asc") {
      apiUrl += `&sort=publication_date:asc`;
    } else {
      apiUrl += `&sort=relevance_score:desc`;
    }

    console.log(`[OpenAlex] URL da requisição: ${apiUrl}`);

    const response = await fetchWithRetry(apiUrl);

    if (!response.ok) {
      console.error(
        `[OpenAlex] API retornou status ${response.status}: ${response.statusText}`
      );
      return [];
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log("[OpenAlex] Nenhum resultado encontrado");
      return [];
    }

    console.log(`[OpenAlex] Encontrados ${data.results.length} artigos`);

    // Converter os resultados para o formato padrão da aplicação
    const articles: Article[] = data.results.map((item: any) => {
      // Extrair autores
      const authors = item.authorships
        ? item.authorships.map((a: any) => a.author.display_name).join(", ")
        : "Autores não disponíveis";

      // Determinar o idioma (OpenAlex não fornece essa informação diretamente)
      const language = "Inglês"; // Padrão

      // Extrair palavras-chave
      const keywords = item.concepts
        ? item.concepts.slice(0, 5).map((c: any) => c.display_name)
        : [];

      // Extrair DOI
      const doi = item.doi ? item.doi.replace("https://doi.org/", "") : null;

      // Gerar ID único
      const id = `openalex-${
        item.id.split("/").pop() || Math.random().toString(36).substring(2, 15)
      }`;

      // Extrair ano
      const year = item.publication_year || "Ano não disponível";

      // Extrair abstract
      const abstract = item.abstract_inverted_index
        ? reconstructAbstract(item.abstract_inverted_index)
        : "Resumo não disponível";

      // Extrair informação da revista/fonte
      const journal =
        item.primary_location?.source?.display_name || "Revista não disponível";

      // Extrair URL mais específica se disponível
      let url = null;
      if (item.primary_location?.landing_page_url) {
        url = item.primary_location.landing_page_url;
      } else if (item.locations && item.locations.length > 0) {
        // Procurar por qualquer URL disponível nas localizações
        for (const location of item.locations) {
          if (location.landing_page_url) {
            url = location.landing_page_url;
            break;
          }
        }
      } else if (doi) {
        // Usar o DOI como fallback
        url = `https://doi.org/${doi}`;
      }

      return {
        id,
        title: item.title || "Título não disponível",
        authors,
        journal: journal,
        year: year.toString(),
        language,
        abstract,
        content: `<h2>Abstract</h2><p>${abstract}</p>`,
        keywords,
        references: [],
        doi,
        url: url,
        source: "OpenAlex", // Fonte da API
      };
    });

    return articles;
  } catch (error) {
    console.error("[OpenAlex] Erro ao buscar artigos:", error);
    return [];
  }
}

// Função para obter detalhes de um artigo específico do OpenAlex
export async function getOpenAlexArticleById(
  id: string
): Promise<Article | null> {
  try {
    // Remover o prefixo "openalex-" para obter o ID real do OpenAlex
    const openAlexId = id.startsWith("openalex-") ? id.substring(9) : id;

    console.log(`[OpenAlex] Buscando detalhes do artigo com ID: ${openAlexId}`);

    // Construir a URL para a API do OpenAlex
    const apiUrl = `https://api.openalex.org/works/${openAlexId}`;

    const response = await fetchWithRetry(apiUrl);

    if (!response.ok) {
      console.error(
        `[OpenAlex] API retornou status ${response.status}: ${response.statusText}`
      );
      return null;
    }

    const item = await response.json();

    // Extrair autores
    const authors = item.authorships
      ? item.authorships.map((a: any) => a.author.display_name).join(", ")
      : "Autores não disponíveis";

    // Determinar o idioma (OpenAlex não fornece essa informação diretamente)
    const language = "Inglês"; // Padrão

    // Extrair palavras-chave
    const keywords = item.concepts
      ? item.concepts.slice(0, 5).map((c: any) => c.display_name)
      : [];

    // Extrair DOI
    const doi = item.doi ? item.doi.replace("https://doi.org/", "") : null;

    // Extrair ano
    const year = item.publication_year || "Ano não disponível";

    // Extrair abstract
    const abstract = item.abstract_inverted_index
      ? reconstructAbstract(item.abstract_inverted_index)
      : "Resumo não disponível";

    // Extrair informação da revista/fonte
    const journal =
      item.primary_location?.source?.display_name || "Revista não disponível";

    // Extrair URL mais específica se disponível
    let url = null;
    if (item.primary_location?.landing_page_url) {
      url = item.primary_location.landing_page_url;
    } else if (item.locations && item.locations.length > 0) {
      // Procurar por qualquer URL disponível nas localizações
      for (const location of item.locations) {
        if (location.landing_page_url) {
          url = location.landing_page_url;
          break;
        }
      }
    } else if (doi) {
      // Usar o DOI como fallback
      url = `https://doi.org/${doi}`;
    }

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${abstract}</p>
      ${
        doi
          ? `<p><a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">Ver artigo completo via DOI</a></p>`
          : ""
      }
    `;

    const article: Article = {
      id: `openalex-${openAlexId}`,
      title: item.title || "Título não disponível",
      authors,
      journal: journal,
      year: year.toString(),
      language,
      abstract,
      content,
      keywords,
      references: [],
      doi,
      url: url,
      source: "OpenAlex", // Garantir que isso esteja definido
    };

    return article;
  } catch (error) {
    console.error("[OpenAlex] Erro ao buscar detalhes do artigo:", error);
    return null;
  }
}

// Função para reconstruir o abstract a partir do formato invertido do OpenAlex
export function reconstructAbstract(
  invertedIndex: Record<string, number[]>
): string {
  try {
    // Criar um array para armazenar as palavras na posição correta
    const words: string[] = [];

    // Para cada palavra no índice invertido
    for (const [word, positions] of Object.entries(invertedIndex)) {
      // Colocar a palavra em cada posição indicada
      for (const position of positions) {
        words[position] = word;
      }
    }

    // Juntar as palavras em uma string
    return words.join(" ");
  } catch (error) {
    console.error("Erro ao reconstruir abstract:", error);
    return "Resumo não disponível";
  }
}
