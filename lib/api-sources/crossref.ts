import type { Article } from "@/lib/types";
import { fetchWithRetry } from "@/lib/api-helper";

// Base URL para a API do CrossRef
const CROSSREF_API_BASE = "https://api.crossref.org/works";

// Função para buscar artigos do CrossRef (API pública que não requer autenticação)
export async function searchCrossRef(
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

    console.log(`[CrossRef] Buscando artigos com query: ${query}`);

    // Calcular o offset com base na página
    const offset = (page - 1) * pageSize;

    // Construir a query com filtros
    let queryParams = `query=${encodeURIComponent(
      query
    )}&rows=${pageSize}&offset=${offset}`;

    // Adicionar filtro de ano se especificado
    if (year && year !== "all" && year !== "older") {
      queryParams += `&filter=from-pub-date:${year},until-pub-date:${year}`;
    } else if (year === "older") {
      queryParams += `&filter=until-pub-date:2017`;
    }

    // Adicionar ordenação
    if (sort === "date_desc") {
      queryParams += `&sort=published-desc`;
    } else if (sort === "date_asc") {
      queryParams += `&sort=published-asc`;
    } else {
      queryParams += `&sort=score`;
    }

    // Construir a URL para a API do CrossRef
    const apiUrl = `${CROSSREF_API_BASE}?${queryParams}`;

    console.log(`[CrossRef] URL da requisição: ${apiUrl}`);

    const response = await fetchWithRetry(apiUrl);

    if (!response.ok) {
      console.error(
        `[CrossRef] API retornou status ${response.status}: ${response.statusText}`
      );
      return [];
    }

    const data = await response.json();

    if (
      !data.message ||
      !data.message.items ||
      data.message.items.length === 0
    ) {
      console.log("[CrossRef] Nenhum resultado encontrado");
      return [];
    }

    console.log(`[CrossRef] Encontrados ${data.message.items.length} artigos`);

    // Converter os resultados para o formato padrão da aplicação
    const articles: Article[] = data.message.items.map((item: any) => {
      // Extrair autores
      const authors = item.author
        ? item.author
            .map((a: any) => `${a.given || ""} ${a.family || ""}`)
            .join(", ")
        : "Autores não disponíveis";

      // Determinar o idioma (CrossRef não fornece essa informação diretamente)
      const language = "Inglês"; // Padrão

      // Extrair palavras-chave
      const keywords = item.subject || [];

      // Extrair DOI
      const doi = item.DOI || null;

      // Gerar ID único
      const id = `crossref-${
        doi
          ? doi.replace(/\//g, "-")
          : Math.random().toString(36).substring(2, 15)
      }`;

      // Extrair ano
      const year = item.published
        ? item.published["date-parts"]
          ? item.published["date-parts"][0][0]
          : "Ano não disponível"
        : "Ano não disponível";

      // Extrair abstract
      const abstract = item.abstract || "Resumo não disponível";

      // Extrair informação da revista/fonte
      const journal = item["container-title"]
        ? item["container-title"][0]
        : "Revista não disponível";

      // Extrair URL mais específica se disponível
      let url = null;
      if (doi) {
        // Verificar se há URLs específicas disponíveis
        if (item.resource?.primary?.URL) {
          url = item.resource.primary.URL;
        } else if (item.link && item.link.length > 0) {
          // Usar o primeiro link disponível
          url = item.link[0].URL;
        } else {
          // Usar o DOI como fallback
          url = `https://doi.org/${doi}`;
        }
      }

      return {
        id,
        title: item.title ? item.title[0] : "Título não disponível",
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
        source: "CrossRef", // Fonte da API
      };
    });

    return articles;
  } catch (error) {
    console.error("[CrossRef] Erro ao buscar artigos:", error);
    return [];
  }
}

// Função para obter detalhes de um artigo específico do CrossRef
export async function getCrossRefArticleById(
  id: string
): Promise<Article | null> {
  try {
    // Verificar se o ID é um DOI
    let doi: string;

    if (id.includes("crossref-")) {
      doi = id.substring(9).replace(/-/g, "/");
    } else if (id.includes("10.")) {
      // O ID já parece ser um DOI
      doi = id;
    } else {
      // Não é um DOI, não podemos buscar
      console.error("[CrossRef] ID não é um DOI válido:", id);
      return null;
    }

    console.log(`[CrossRef] Buscando detalhes do artigo com DOI: ${doi}`);

    // Construir a URL para a API do CrossRef
    const apiUrl = `${CROSSREF_API_BASE}/${encodeURIComponent(doi)}`;

    const response = await fetchWithRetry(apiUrl);

    if (!response.ok) {
      console.error(
        `[CrossRef] API retornou status ${response.status}: ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    if (!data.message) {
      console.log("[CrossRef] Artigo não encontrado");
      return null;
    }

    const item = data.message;

    // Extrair autores
    const authors = item.author
      ? item.author
          .map((a: any) => `${a.given || ""} ${a.family || ""}`)
          .join(", ")
      : "Autores não disponíveis";

    // Determinar o idioma (CrossRef não fornece essa informação diretamente)
    const language = "Inglês"; // Padrão

    // Extrair palavras-chave
    const keywords = item.subject || [];

    // Extrair ano
    const year = item.published
      ? item.published["date-parts"]
        ? item.published["date-parts"][0][0]
        : "Ano não disponível"
      : "Ano não disponível";

    // Extrair abstract
    const abstract = item.abstract || "Resumo não disponível";

    // Extrair informação da revista/fonte
    const journal = item["container-title"]
      ? item["container-title"][0]
      : "Revista não disponível";

    // Extrair URL mais específica se disponível
    let url = `https://doi.org/${doi}`;
    if (item.resource?.primary?.URL) {
      url = item.resource.primary.URL;
    } else if (item.link && item.link.length > 0) {
      // Usar o primeiro link disponível
      url = item.link[0].URL;
    }

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${abstract}</p>
      <p><a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">Ver artigo completo via DOI</a></p>
    `;

    const article: Article = {
      id: `crossref-${doi.replace(/\//g, "-")}`,
      title: item.title ? item.title[0] : "Título não disponível",
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
      source: "CrossRef", // Garantir que isso esteja definido
    };

    return article;
  } catch (error) {
    console.error("[CrossRef] Erro ao buscar detalhes do artigo:", error);
    return null;
  }
}

// Função para obter artigo por DOI (pode ser usada por outras fontes)
export async function getArticleByDOI(
  doi: string,
  source: string
): Promise<Article | null> {
  try {
    // Usar a API do CrossRef para obter detalhes do artigo pelo DOI
    const url = `${CROSSREF_API_BASE}/${encodeURIComponent(doi)}`;
    const response = await fetchWithRetry(url);

    if (!response.ok) {
      throw new Error(`Erro ao buscar DOI: ${response.status}`);
    }

    const data = await response.json();

    if (!data.message) {
      throw new Error("Formato de resposta inválido");
    }

    const item = data.message;

    // Extrair autores
    const authors = item.author
      ? item.author
          .map((a: any) => `${a.given || ""} ${a.family || ""}`)
          .join(", ")
      : "Autores não disponíveis";

    // Extrair ano
    const year = item.published
      ? item.published["date-parts"]
        ? item.published["date-parts"][0][0]
        : "Ano não disponível"
      : "Ano não disponível";

    // Extrair abstract
    const abstract = item.abstract || "Resumo não disponível";

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${abstract}</p>
      <p><a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">Ver artigo completo via DOI</a></p>
    `;

    return {
      id: `${source.toLowerCase()}-${doi.replace(/\//g, "-")}`,
      title: item.title ? item.title[0] : "Título não disponível",
      authors,
      journal: item["container-title"]
        ? item["container-title"][0]
        : "Revista não disponível",
      year: year.toString(),
      language: "Inglês", // CrossRef não fornece idioma diretamente
      abstract,
      content,
      keywords: item.subject || [],
      references: [],
      doi,
      url: `https://doi.org/${doi}`,
      source,
    };
  } catch (error) {
    console.error(`Erro ao buscar artigo por DOI (${doi}):`, error);
    return null;
  }
}
