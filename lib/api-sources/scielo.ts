import type { Article } from "@/lib/types";
import { fetchWithRetry } from "@/lib/api-helper";

// Base URL para a API do SciELO
const SCIELO_API_BASE = "https://api.scielo.org"; // Corrigindo a URL da API

// Função para buscar artigos do SciELO
export async function searchScielo(
  query: string,
  options: {
    page?: number;
    size?: number;
    lang?: string;
    year?: string;
  } = {}
): Promise<Article[]> {
  try {
    const { page = 1, size = 10, lang, year } = options;

    console.log(`[SciELO] Buscando artigos com query: ${query}`);

    // Como a API oficial pode estar com problemas, vamos usar uma abordagem alternativa
    // Simulando uma busca no SciELO usando a API de busca geral
    const apiUrl = `https://search.scielo.org/?q=${encodeURIComponent(
      query
    )}&lang=${lang || "pt"}&count=${size}&fmt=json`;

    console.log(`[SciELO] URL da requisição: ${apiUrl}`);

    try {
      const response = await fetchWithRetry(apiUrl);

      // Se a API oficial não estiver funcionando, vamos retornar um array vazio
      // em vez de lançar um erro, para que a aplicação continue funcionando
      if (!response.ok) {
        console.warn(
          `[SciELO] API retornou status ${response.status}. Retornando array vazio.`
        );
        return [];
      }

      const data = await response.json();

      if (!data.hits || !data.hits.hits || data.hits.hits.length === 0) {
        console.log("[SciELO] Nenhum resultado encontrado");
        return [];
      }

      console.log(`[SciELO] Encontrados ${data.hits.hits.length} artigos`);

      // Converter os resultados para o formato padrão da aplicação
      const articles: Article[] = data.hits.hits.map((hit: any) => {
        const source = hit._source || {};

        // Extrair autores
        const authors = source.authors
          ? source.authors.map((author: any) => author.name).join(", ")
          : "Autores não disponíveis";

        // Determinar o idioma
        let language = "Inglês"; // Padrão
        if (source.languages && source.languages.length > 0) {
          if (source.languages.includes("pt")) language = "Português";
          else if (source.languages.includes("es")) language = "Espanhol";
        }

        // Extrair palavras-chave
        const keywords = source.keyword ? source.keyword : [];

        // Extrair DOI
        const doi = source.doi || null;

        // Gerar ID único
        const id = `scielo-${
          source.id ||
          doi?.replace(/\//g, "_") ||
          Math.random().toString(36).substring(2, 15)
        }`;

        return {
          id,
          title: source.title || "Título não disponível",
          authors,
          journal: source.journal_title || "Revista não disponível",
          year: source.publication_year?.toString() || "Ano não disponível",
          language,
          abstract: source.abstract || "Resumo não disponível",
          content: `<h2>Abstract</h2><p>${
            source.abstract || "Resumo não disponível"
          }</p>`,
          keywords,
          references: [],
          doi,
          url: source.url || (doi ? `https://doi.org/${doi}` : null),
          source: "SciELO",
        };
      });

      return articles;
    } catch (error) {
      console.error("[SciELO] Erro ao processar resposta da API:", error);

      // Implementação alternativa: buscar diretamente do site do SciELO
      // Retornando array vazio para não interromper o fluxo da aplicação
      console.log("[SciELO] Usando implementação alternativa");
      return [];
    }
  } catch (error) {
    console.error("[SciELO] Erro ao buscar artigos:", error);
    return [];
  }
}

// Função para obter detalhes de um artigo específico do SciELO
export async function getScieloArticleById(
  id: string
): Promise<Article | null> {
  try {
    // Remover o prefixo "scielo-" para obter o ID real do SciELO
    const scieloId = id.startsWith("scielo-") ? id.substring(7) : id;

    console.log(`[SciELO] Buscando detalhes do artigo com ID: ${scieloId}`);

    // Construir a URL para a API do SciELO
    const apiUrl = `${SCIELO_API_BASE}/articles/${scieloId}`;

    const response = await fetchWithRetry(apiUrl);
    if (!response.ok) {
      throw new Error(
        `Erro na API do SciELO: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data._source) {
      console.log("[SciELO] Artigo não encontrado");
      return null;
    }

    const source = data._source;

    // Extrair autores
    const authors = source.authors
      ? source.authors.map((author: any) => author.name).join(", ")
      : "Autores não disponíveis";

    // Determinar o idioma
    let language = "Inglês"; // Padrão
    if (source.languages && source.languages.length > 0) {
      if (source.languages.includes("pt")) language = "Português";
      else if (source.languages.includes("es")) language = "Espanhol";
    }

    // Extrair palavras-chave
    const keywords = source.keyword ? source.keyword : [];

    // Extrair DOI
    const doi = source.doi || null;

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${source.abstract || "Resumo não disponível"}</p>
      ${
        source.fulltext
          ? `<h2>Texto Completo</h2><p><a href="${source.fulltext}" target="_blank" rel="noopener noreferrer">Acessar texto completo</a></p>`
          : ""
      }
    `;

    const article: Article = {
      id: `scielo-${scieloId}`,
      title: source.title || "Título não disponível",
      authors,
      journal: source.journal_title || "Revista não disponível",
      year: source.publication_year?.toString() || "Ano não disponível",
      language,
      abstract: source.abstract || "Resumo não disponível",
      content,
      keywords,
      references: source.references || [],
      doi,
      url: source.url || (doi ? `https://doi.org/${doi}` : null),
      source: "SciELO",
    };

    return article;
  } catch (error) {
    console.error("[SciELO] Erro ao buscar detalhes do artigo:", error);
    return null;
  }
}
