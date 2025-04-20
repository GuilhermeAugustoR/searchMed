import type { Article } from "@/lib/types";

// Base URL para a API do Crossref
const CROSSREF_API_BASE = "https://api.crossref.org/works";

// Função para buscar artigos do Crossref
export async function searchCrossref(
  query: string,
  limit = 10
): Promise<Article[]> {
  try {
    console.log(
      `[Crossref] Buscando artigos com query: ${query}, limit: ${limit}`
    );

    // Construir a URL para a API do Crossref
    const apiUrl = `${CROSSREF_API_BASE}?query=${encodeURIComponent(
      query
    )}&rows=${limit}&filter=type:journal-article&sort=relevance`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        // Adicionar um e-mail para identificação (boa prática para a API do Crossref)
        "User-Agent": "MedSearch/1.0 (mailto:medsearch@example.com)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro na API do Crossref: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      `[Crossref] Encontrados ${data.message?.items?.length || 0} artigos`
    );

    // Converter os resultados para o formato padrão da aplicação
    const articles: Article[] =
      data.message?.items?.map((item: any) => {
        // Extrair autores
        const authors =
          item.author
            ?.map((author: any) => {
              return `${author.family || ""}, ${author.given || ""}`.trim();
            })
            .join(", ") || "Autores não disponíveis";

        // Determinar o idioma (Crossref pode fornecer essa informação)
        const language =
          item.language === "pt"
            ? "Português"
            : item.language === "es"
            ? "Espanhol"
            : item.language === "en"
            ? "Inglês"
            : "Idioma não especificado";

        // Extrair DOI
        const doi = item.DOI || null;

        // Gerar ID único prefixado para identificar a fonte
        const id = `cr-${
          item.DOI?.replace(/\//g, "_") ||
          Math.random().toString(36).substring(2, 15)
        }`;

        // Extrair abstract (Crossref nem sempre fornece)
        const abstract = item.abstract || "Resumo não disponível";

        // Extrair palavras-chave
        const keywords = item.subject || [];

        return {
          id,
          title: item.title?.[0] || "Título não disponível",
          authors,
          journal: item["container-title"]?.[0] || "Revista não disponível",
          year:
            item.created?.["date-parts"]?.[0]?.[0]?.toString() ||
            "Ano não disponível",
          language,
          abstract,
          content: `<h2>Abstract</h2><p>${abstract}</p>`,
          keywords,
          references: [], // Crossref não fornece referências diretamente nesta consulta
          doi,
          url: item.URL || `https://doi.org/${item.DOI}`,
          source: "Crossref", // Adicionar fonte para identificação
        };
      }) || [];

    return articles;
  } catch (error) {
    console.error("[Crossref] Erro ao buscar artigos:", error);
    return [];
  }
}

// Função para obter detalhes de um artigo específico do Crossref
export async function getCrossrefArticleById(
  id: string
): Promise<Article | null> {
  try {
    // Remover o prefixo "cr-" e converter de volta para o formato DOI
    const doi = id.startsWith("cr-") ? id.substring(3).replace(/_/g, "/") : id;

    console.log(`[Crossref] Buscando detalhes do artigo com DOI: ${doi}`);

    // Construir a URL para a API do Crossref
    const apiUrl = `${CROSSREF_API_BASE}/${encodeURIComponent(doi)}`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "MedSearch/1.0 (mailto:medsearch@example.com)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Erro na API do Crossref: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const item = data.message;

    if (!item) {
      throw new Error("Artigo não encontrado na API do Crossref");
    }

    // Extrair autores
    const authors =
      item.author
        ?.map((author: any) => {
          return `${author.family || ""}, ${author.given || ""}`.trim();
        })
        .join(", ") || "Autores não disponíveis";

    // Determinar o idioma
    const language =
      item.language === "pt"
        ? "Português"
        : item.language === "es"
        ? "Espanhol"
        : item.language === "en"
        ? "Inglês"
        : "Idioma não especificado";

    // Extrair abstract
    const abstract = item.abstract || "Resumo não disponível";

    // Extrair palavras-chave
    const keywords = item.subject || [];

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${abstract}</p>
      ${item.publisher ? `<h3>Publisher</h3><p>${item.publisher}</p>` : ""}
    `;

    // Extrair referências (se disponíveis)
    const references =
      item.reference?.map((ref: any) => {
        return (
          ref.unstructured ||
          `${ref.journal - item.title || ""} ${ref.volume || ""} ${
            ref.year || ""
          }`.trim()
        );
      }) || [];

    const article: Article = {
      id: `cr-${item.DOI?.replace(/\//g, "_")}`,
      title: item.title?.[0] || "Título não disponível",
      authors,
      journal: item["container-title"]?.[0] || "Revista não disponível",
      year:
        item.created?.["date-parts"]?.[0]?.[0]?.toString() ||
        "Ano não disponível",
      language,
      abstract,
      content,
      keywords,
      references,
      doi: item.DOI,
      url: item.URL || `https://doi.org/${item.DOI}`,
      source: "Crossref", // Adicionar fonte para identificação
    };

    return article;
  } catch (error) {
    console.error("[Crossref] Erro ao buscar detalhes do artigo:", error);
    return null;
  }
}
