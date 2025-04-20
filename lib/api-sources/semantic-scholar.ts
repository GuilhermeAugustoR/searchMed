import type { Article } from "@/lib/types";

// Base URL para a API do Semantic Scholar
const SEMANTIC_SCHOLAR_API_BASE = "https://api.semanticscholar.org/graph/v1";

// Função para buscar artigos do Semantic Scholar
export async function searchSemanticScholar(
  query: string,
  limit = 10
): Promise<Article[]> {
  try {
    console.log(
      `[Semantic Scholar] Buscando artigos com query: ${query}, limit: ${limit}`
    );

    // Construir a URL para a API do Semantic Scholar
    const apiUrl = `${SEMANTIC_SCHOLAR_API_BASE}/paper/search?query=${encodeURIComponent(
      query
    )}&limit=${limit}&fields=title,abstract,authors,year,venue,url,externalIds`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro na API do Semantic Scholar: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      `[Semantic Scholar] Encontrados ${data.data?.length || 0} artigos`
    );

    // Converter os resultados para o formato padrão da aplicação
    const articles: Article[] =
      data.data?.map((paper: any) => {
        // Extrair autores
        const authors =
          paper.authors?.map((author: any) => author.name).join(", ") ||
          "Autores não disponíveis";

        // Determinar o idioma (Semantic Scholar não fornece essa informação diretamente)
        const language = "Inglês"; // Assumindo inglês como padrão

        // Extrair DOI
        const doi = paper.externalIds?.DOI || null;

        // Gerar ID único prefixado para identificar a fonte
        const id = `ss-${
          paper.paperId || Math.random().toString(36).substring(2, 15)
        }`;

        return {
          id,
          title: paper.title || "Título não disponível",
          authors,
          journal: paper.venue || "Revista não disponível",
          year: paper.year?.toString() || "Ano não disponível",
          language,
          abstract: paper.abstract || "Resumo não disponível",
          content: `<h2>Abstract</h2><p>${
            paper.abstract || "Conteúdo não disponível"
          }</p>`,
          keywords: [], // Semantic Scholar não fornece palavras-chave
          references: [], // Referências seriam buscadas separadamente
          doi,
          url:
            paper.url ||
            `https://www.semanticscholar.org/paper/${paper.paperId}`,
          source: "Semantic Scholar", // Adicionar fonte para identificação
        };
      }) || [];

    return articles;
  } catch (error) {
    console.error("[Semantic Scholar] Erro ao buscar artigos:", error);
    return [];
  }
}

// Função para obter detalhes de um artigo específico do Semantic Scholar
export async function getSemanticScholarArticleById(
  id: string
): Promise<Article | null> {
  try {
    // Remover o prefixo "ss-" para obter o ID real do Semantic Scholar
    const paperId = id.startsWith("ss-") ? id.substring(3) : id;

    console.log(
      `[Semantic Scholar] Buscando detalhes do artigo com ID: ${paperId}`
    );

    // Construir a URL para a API do Semantic Scholar
    const apiUrl = `${SEMANTIC_SCHOLAR_API_BASE}/paper/${paperId}?fields=title,abstract,authors,year,venue,url,externalIds,references,citations`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro na API do Semantic Scholar: ${response.status} ${response.statusText}`
      );
    }

    const paper = await response.json();

    // Extrair autores
    const authors =
      paper.authors?.map((author: any) => author.name).join(", ") ||
      "Autores não disponíveis";

    // Determinar o idioma (Semantic Scholar não fornece essa informação diretamente)
    const language = "Inglês"; // Assumindo inglês como padrão

    // Extrair DOI
    const doi = paper.externalIds?.DOI || null;

    // Extrair referências
    const references =
      paper.references?.map((ref: any) => {
        const refAuthors =
          ref.authors?.map((author: any) => author.name).join(", ") ||
          "Autores não disponíveis";
        return `${refAuthors}. ${ref.title || "Título não disponível"}. ${
          ref.venue || ""
        }. ${ref.year || ""}.`;
      }) || [];

    // Extrair palavras-chave (Semantic Scholar não fornece diretamente)
    const keywords: string[] = [];

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${paper.abstract || "Resumo não disponível"}</p>
      ${paper.tldr?.text ? `<h2>TL;DR</h2><p>${paper.tldr.text}</p>` : ""}
    `;

    const article: Article = {
      id: `ss-${paper.paperId}`,
      title: paper.title || "Título não disponível",
      authors,
      journal: paper.venue || "Revista não disponível",
      year: paper.year?.toString() || "Ano não disponível",
      language,
      abstract: paper.abstract || "Resumo não disponível",
      content,
      keywords,
      references,
      doi,
      url:
        paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      source: "Semantic Scholar", // Adicionar fonte para identificação
    };

    return article;
  } catch (error) {
    console.error(
      "[Semantic Scholar] Erro ao buscar detalhes do artigo:",
      error
    );
    return null;
  }
}
