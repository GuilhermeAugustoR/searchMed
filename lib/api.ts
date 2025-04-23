import type { Article } from "./types";

// Função para buscar artigos do PubMed
export async function searchArticles(
  query: string,
  type: string,
  language: string,
  year: string,
  sort: string,
  source = "pubmed"
): Promise<Article[]> {
  console.log("Iniciando pesquisa com parâmetros:", {
    query,
    type,
    language,
    year,
    sort,
    source,
  });

  if (!query) {
    console.log("Nenhuma query fornecida, retornando lista vazia");
    return [];
  }

  try {
    let articles: Article[] = [];

    // Buscar artigos da fonte selecionada
    switch (source) {
      case "pubmed":
        articles = await searchPubMed(query, type, language, year, sort);
        break;
      case "arxiv":
        articles = await searchArXiv(query, year, sort);
        break;
      case "scielo":
        articles = await searchSciELO(query, language, year);
        break;
      case "core":
        articles = await searchCORE(query, year);
        break;
      case "europepmc":
        articles = await searchEuropePMC(query, sort);
        break;
      case "all":
        // Buscar de todas as fontes e combinar resultados
        // Usando Promise.allSettled para continuar mesmo se algumas promessas falharem
        const results = await Promise.allSettled([
          searchPubMed(query, type, language, year, sort),
          searchArXiv(query, year, sort),
          searchSciELO(query, language, year),
          searchCORE(query, year),
          searchEuropePMC(query, sort),
        ]);

        // Processar os resultados, ignorando os que falharam
        const validResults = results.map((result, index) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            const sources = ["PubMed", "arXiv", "SciELO", "CORE", "Europe PMC"];
            console.error(
              `Erro ao buscar de ${sources[index]}:`,
              result.reason
            );
            return [];
          }
        });

        // Combinar todos os resultados sem limitar a quantidade por fonte
        articles = [
          ...validResults[0], // PubMed
          ...validResults[1], // arXiv
          ...validResults[2], // SciELO
          ...validResults[3], // CORE
          ...validResults[4], // Europe PMC
        ];

        // Ordenar por relevância (assumindo que os mais relevantes vêm primeiro de cada fonte)
        // ou por ano se sort for por data
        if (sort === "date_desc") {
          articles.sort((a, b) => {
            const yearA = Number.parseInt(a.year) || 0;
            const yearB = Number.parseInt(b.year) || 0;
            return yearB - yearA;
          });
        } else if (sort === "date_asc") {
          articles.sort((a, b) => {
            const yearA = Number.parseInt(a.year) || 0;
            const yearB = Number.parseInt(b.year) || 0;
            return yearA - yearB;
          });
        }
        break;
      default:
        articles = await searchPubMed(query, type, language, year, sort);
    }

    console.log(`Encontrados ${articles.length} artigos da fonte ${source}`);
    return articles;
  } catch (error) {
    console.error("Erro ao buscar artigos:", error);
    return [];
  }
}

// Função para buscar artigos do PubMed
async function searchPubMed(
  query: string,
  type: string,
  language: string,
  year: string,
  sort: string
): Promise<Article[]> {
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
    throw new Error(
      `Erro na API do PubMed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.articles;
}

// Função para buscar artigos do arXiv
async function searchArXiv(
  query: string,
  year: string,
  sort: string
): Promise<Article[]> {
  // Mapear os parâmetros de ordenação
  let sortBy: "relevance" | "lastUpdatedDate" | "submittedDate" = "relevance";
  let sortOrder: "ascending" | "descending" = "descending";

  if (sort === "date_desc") {
    sortBy = "submittedDate";
    sortOrder = "descending";
  } else if (sort === "date_asc") {
    sortBy = "submittedDate";
    sortOrder = "ascending";
  }

  // Construir a URL para a API do servidor
  const params = new URLSearchParams({
    q: query,
    sort_by: sortBy,
    sort_order: sortOrder,
    max_results: "50", // Aumentar o número de resultados
  });

  // Adicionar filtro de ano se especificado
  if (year && year !== "all" && year !== "older") {
    // Adicionar ao query para filtrar por ano
    params.set("q", `${query} AND submittedDate:[${year}0101 TO ${year}1231]`);
  } else if (year === "older") {
    // Artigos antes de 2018
    params.set("q", `${query} AND submittedDate:[00000000 TO 20171231]`);
  }

  // Usar a API do servidor para evitar problemas de CORS
  const response = await fetch(`/api/arxiv/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Erro na API do arXiv: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.articles;
}

// Função para buscar artigos do SciELO
async function searchSciELO(
  query: string,
  language: string,
  year: string
): Promise<Article[]> {
  // Construir a URL para a API do servidor
  const params = new URLSearchParams({
    q: query,
    size: "50", // Aumentar o número de resultados
  });

  // Adicionar filtro de idioma se especificado
  if (language && language !== "all") {
    const langMap: Record<string, string> = {
      en: "en",
      pt: "pt",
      es: "es",
    };
    if (langMap[language]) {
      params.set("lang", langMap[language]);
    }
  }

  // Adicionar filtro de ano se especificado
  if (year && year !== "all" && year !== "older") {
    params.set("year", year);
  } else if (year === "older") {
    // Artigos antes de 2018
    params.set("year", "2017"); // Simplificação, idealmente seria um range
  }

  // Usar a API do servidor para evitar problemas de CORS
  const response = await fetch(`/api/scielo/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Erro na API do SciELO: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.articles;
}

// Função para buscar artigos do CORE
async function searchCORE(query: string, year: string): Promise<Article[]> {
  // Construir a URL para a API do servidor
  const params = new URLSearchParams({
    q: query,
    page_size: "50", // Aumentar o número de resultados
  });

  // Adicionar filtro de ano se especificado
  if (year && year !== "all" && year !== "older") {
    params.set("year", year);
  }

  // Usar a API do servidor para evitar problemas de CORS
  const response = await fetch(`/api/core/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Erro na API do CORE: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.articles;
}

// Função para buscar artigos do Europe PMC
async function searchEuropePMC(
  query: string,
  sort: string
): Promise<Article[]> {
  // Mapear os parâmetros de ordenação
  let sortParam = "relevance";
  if (sort === "date_desc") {
    sortParam = "date desc";
  } else if (sort === "date_asc") {
    sortParam = "date asc";
  }

  // Construir a URL para a API do servidor
  const params = new URLSearchParams({
    q: query,
    sort: sortParam,
    page_size: "50", // Aumentar o número de resultados
  });

  // Usar a API do servidor para evitar problemas de CORS
  const response = await fetch(`/api/europepmc/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Erro na API do Europe PMC: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.articles;
}

// Função para obter um artigo por ID
export async function getArticleById(id: string): Promise<Article | null> {
  console.log(`Buscando artigo com ID: ${id}`);

  try {
    // Determinar a fonte com base no prefixo do ID
    let apiEndpoint = "/api/pubmed/article";

    if (id.startsWith("arxiv-")) {
      apiEndpoint = "/api/arxiv/article";
    } else if (id.startsWith("scielo-")) {
      apiEndpoint = "/api/scielo/article";
    } else if (id.startsWith("core-")) {
      apiEndpoint = "/api/core/article";
    } else if (id.startsWith("epmc-")) {
      apiEndpoint = "/api/europepmc/article";
    }

    // Usar a API do servidor para evitar problemas de CORS
    const response = await fetch(`${apiEndpoint}/${id}`);

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
