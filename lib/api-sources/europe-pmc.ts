import type { Article } from "@/lib/types";
import { fetchWithRetry } from "@/lib/api-helper";

// Base URL para a API do Europe PMC
const EUROPE_PMC_API_BASE = "https://www.ebi.ac.uk/europepmc/webservices/rest";

// Função para buscar artigos do Europe PMC
export async function searchEuropePmc(
  query: string,
  options: {
    page?: number;
    pageSize?: number;
    resultType?: string;
    sort?: string;
  } = {}
): Promise<Article[]> {
  try {
    const {
      page = 1,
      pageSize = 20,
      resultType = "core",
      sort = "relevance",
    } = options;

    console.log(`[Europe PMC] Buscando artigos com query: ${query}`);

    // Calcular o offset com base na página
    const cursorMark = page === 1 ? "*" : `page${page}`;

    // Construir a URL para a API do Europe PMC
    // Modificando a URL para usar parâmetros mais simples e garantir que funcione
    const apiUrl = `${EUROPE_PMC_API_BASE}/search?query=${encodeURIComponent(
      query
    )}&resultType=${resultType}&cursorMark=${cursorMark}&pageSize=${pageSize}&format=json`;

    console.log(`[Europe PMC] URL da requisição: ${apiUrl}`);

    const response = await fetchWithRetry(apiUrl);
    if (!response.ok) {
      console.error(
        `[Europe PMC] API retornou status ${response.status}: ${response.statusText}`
      );
      throw new Error(
        `Erro na API do Europe PMC: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(`[Europe PMC] Resposta da API:`, data);

    if (
      !data.resultList ||
      !data.resultList.result ||
      data.resultList.result.length === 0
    ) {
      console.log("[Europe PMC] Nenhum resultado encontrado");
      return [];
    }

    console.log(
      `[Europe PMC] Encontrados ${data.resultList.result.length} artigos`
    );

    // Converter os resultados para o formato padrão da aplicação
    const articles: Article[] = data.resultList.result.map((result: any) => {
      // Extrair autores
      const authors = result.authorString || "Autores não disponíveis";

      // Determinar o idioma
      let language = "Inglês"; // Padrão
      if (result.language) {
        if (result.language === "por") language = "Português";
        else if (result.language === "spa") language = "Espanhol";
      }

      // Extrair palavras-chave
      const keywords = result.keywordList?.keyword || [];

      // Extrair DOI
      const doi = result.doi || null;

      // Gerar ID único
      const id = `epmc-${
        result.id || Math.random().toString(36).substring(2, 15)
      }`;

      // Construir URL para o artigo
      let url = null;
      if (result.fullTextUrlList?.fullTextUrl?.[0]?.url) {
        url = result.fullTextUrlList.fullTextUrl[0].url;
      } else if (doi) {
        url = `https://doi.org/${doi}`;
      } else {
        url = `https://europepmc.org/article/MED/${result.id}`;
      }

      return {
        id,
        title: result.title || "Título não disponível",
        authors,
        journal: result.journalTitle || "Revista não disponível",
        year: result.pubYear || "Ano não disponível",
        language,
        abstract: result.abstractText || "Resumo não disponível",
        content: `<h2>Abstract</h2><p>${
          result.abstractText || "Resumo não disponível"
        }</p>`,
        keywords,
        references: [],
        doi,
        url,
        source: "Europe PMC",
      };
    });

    return articles;
  } catch (error) {
    console.error("[Europe PMC] Erro ao buscar artigos:", error);
    return [];
  }
}

// Função para obter detalhes de um artigo específico do Europe PMC
export async function getEuropePmcArticleById(
  id: string
): Promise<Article | null> {
  try {
    // Remover o prefixo "epmc-" para obter o ID real do Europe PMC
    const pmcId = id.startsWith("epmc-") ? id.substring(5) : id;

    console.log(`[Europe PMC] Buscando detalhes do artigo com ID: ${pmcId}`);

    // Construir a URL para a API do Europe PMC
    const apiUrl = `${EUROPE_PMC_API_BASE}/search?query=ext_id:${pmcId}&resultType=core&format=json`;

    const response = await fetchWithRetry(apiUrl);
    if (!response.ok) {
      throw new Error(
        `Erro na API do Europe PMC: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (
      !data.resultList ||
      !data.resultList.result ||
      data.resultList.result.length === 0
    ) {
      console.log("[Europe PMC] Artigo não encontrado");
      return null;
    }

    const result = data.resultList.result[0];

    // Extrair autores
    const authors = result.authorString || "Autores não disponíveis";

    // Determinar o idioma
    let language = "Inglês"; // Padrão
    if (result.language) {
      if (result.language === "por") language = "Português";
      else if (result.language === "spa") language = "Espanhol";
    }

    // Extrair palavras-chave
    const keywords = result.keywordList ? result.keywordList.keyword : [];

    // Extrair DOI
    const doi = result.doi || null;

    // Buscar referências se disponíveis
    let references: string[] = [];
    try {
      const referencesUrl = `${EUROPE_PMC_API_BASE}/article/${pmcId}/references?format=json`;
      const referencesResponse = await fetchWithRetry(referencesUrl);

      if (referencesResponse.ok) {
        const referencesData = await referencesResponse.json();
        if (
          referencesData.referenceList &&
          referencesData.referenceList.reference
        ) {
          references = referencesData.referenceList.reference.map(
            (ref: any) => {
              return `${ref.authorString || ""} (${ref.pubYear || ""}). ${
                ref.title || ""
              }. ${ref.journalTitle || ""}.`;
            }
          );
        }
      }
    } catch (error) {
      console.error("[Europe PMC] Erro ao buscar referências:", error);
    }

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${result.abstractText || "Resumo não disponível"}</p>
      ${
        result.fullTextUrlList?.fullTextUrl
          ? `
        <h2>Texto Completo</h2>
        <ul>
          ${result.fullTextUrlList.fullTextUrl
            .map(
              (url: any) => `
            <li><a href="${url.url}" target="_blank" rel="noopener noreferrer">${url.availability} (${url.documentStyle})</a></li>
          `
            )
            .join("")}
        </ul>
      `
          : ""
      }
    `;

    // Construir URL para o artigo
    let url = null;
    if (result.fullTextUrlList?.fullTextUrl?.[0]?.url) {
      url = result.fullTextUrlList.fullTextUrl[0].url;
    } else if (doi) {
      url = `https://doi.org/${doi}`;
    } else {
      url = `https://europepmc.org/article/MED/${pmcId}`;
    }

    const article: Article = {
      id: `epmc-${pmcId}`,
      title: result.title || "Título não disponível",
      authors,
      journal: result.journalTitle || "Revista não disponível",
      year: result.pubYear || "Ano não disponível",
      language,
      abstract: result.abstractText || "Resumo não disponível",
      content,
      keywords,
      references,
      doi,
      url,
      source: "Europe PMC",
    };

    return article;
  } catch (error) {
    console.error("[Europe PMC] Erro ao buscar detalhes do artigo:", error);
    return null;
  }
}
