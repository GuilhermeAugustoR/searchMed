import type { Article, SearchOptions } from "./types";
import { getMockArticleById } from "./mock-data";
import { getSemanticScholarArticleById } from "./api-sources/semantic-scholar";
import { getCrossrefArticleById } from "./api-sources/crossref";
import { getLancetArticleById } from "./api-sources/lancet";
// Importar a nova função de busca com IA
import { searchArticlesWithAI } from "./api-sources/ai-search";

// Base URL para a API do PubMed E-utilities
const PUBMED_API_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

// Versão da função getArticleById para uso no servidor
export async function getArticleByIdServer(
  id: string,
  searchParams?: URLSearchParams
): Promise<Article | null> {
  console.log(`[Server] Buscando artigo com ID: ${id}`);

  try {
    // Verificar se o ID é de um artigo simulado
    if (id.startsWith("mock")) {
      return getMockArticleById(id);
    }

    // Verificar a fonte do artigo com base no prefixo do ID
    if (id.startsWith("ss-")) {
      // Artigo do Semantic Scholar
      return getSemanticScholarArticleById(id);
    } else if (id.startsWith("cr-")) {
      // Artigo do Crossref
      return getCrossrefArticleById(id);
    } else if (id.startsWith("lancet-")) {
      // Artigo do The Lancet
      const result = await getLancetArticleById(id);
      if (result.error) {
        console.error(
          `[Server] Erro ao buscar artigo do The Lancet: ${result.error}`
        );
      }
      return result.article;
    } else if (id.startsWith("ai-")) {
      // Artigo da busca com IA
      // Para artigos de IA, vamos retornar um objeto básico com link para o artigo original
      console.log(
        `[Server] ID de artigo IA: ${id}, retornando objeto básico com link...`
      );

      // Extrair o modelo de IA do ID (formato: ai-modelo-timestamp-index)
      const parts = id.split("-");
      const aiModel = parts.length > 1 ? parts[1] : "openai";

      // Tentar extrair a URL do artigo original dos parâmetros da requisição
      const url = searchParams?.get("url") || "#";

      // Criar um objeto de artigo básico com ênfase no link externo
      return {
        id,
        title: "Artigo encontrado via IA",
        authors: "Autores disponíveis no site original",
        journal: "Fonte disponível no site original",
        year: new Date().getFullYear().toString(),
        language: "Idioma disponível no site original",
        abstract:
          "Para acessar o conteúdo completo, por favor visite o link do artigo original.",
        content:
          "<p>Para acessar o conteúdo completo, por favor visite o link do artigo original.</p>",
        keywords: ["artigo", "link", "externo"],
        references: [],
        url, // URL do artigo original
        source: `${aiModel === "gemini" ? "Gemini" : "OpenAI"} Search`,
      };
    } else if (id.startsWith("pm-")) {
      // Artigo do PubMed - remover o prefixo
      id = id.substring(3);
    }

    // Buscar detalhes do artigo diretamente da API do PubMed
    const summaryUrl = `${PUBMED_API_BASE}/esummary.fcgi?db=pubmed&id=${id}&retmode=json`;
    console.log(`[Server] Buscando detalhes do artigo em: ${summaryUrl}`);

    const summaryResponse = await fetch(summaryUrl);
    if (!summaryResponse.ok) {
      throw new Error(
        `Erro na API do PubMed: ${summaryResponse.status} ${summaryResponse.statusText}`
      );
    }

    const summaryData = await summaryResponse.json();

    if (!summaryData.result || !summaryData.result[id]) {
      console.log("[Server] Artigo não encontrado na API do PubMed");
      return null;
    }

    const articleData = summaryData.result[id];

    // Buscar o abstract completo
    const efetchUrl = `${PUBMED_API_BASE}/efetch.fcgi?db=pubmed&id=${id}&retmode=xml`;
    console.log(`[Server] Buscando abstract completo em: ${efetchUrl}`);

    const efetchResponse = await fetch(efetchUrl);
    if (!efetchResponse.ok) {
      throw new Error(
        `Erro na API do PubMed: ${efetchResponse.status} ${efetchResponse.statusText}`
      );
    }

    const efetchText = await efetchResponse.text();

    // Extrair o abstract do XML (simplificado)
    let abstract = articleData.abstract || "";
    if (!abstract) {
      const abstractMatch = efetchText.match(
        /<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g
      );
      if (abstractMatch) {
        abstract = abstractMatch
          .map((text) => {
            // Remover as tags XML
            return text.replace(/<[^>]*>/g, "");
          })
          .join("\n");
      }
    }

    // Extrair referências (simplificado)
    const references: string[] = [];
    const refMatch = efetchText.match(
      /<Reference[^>]*>([\s\S]*?)<\/Reference>/g
    );
    if (refMatch) {
      refMatch.forEach((ref) => {
        const citationMatch = ref.match(
          /<Citation[^>]*>([\s\S]*?)<\/Citation>/
        );
        if (citationMatch) {
          const citation = citationMatch[1].replace(/<[^>]*>/g, "").trim();
          if (citation) {
            references.push(citation);
          }
        }
      });
    }

    // Determinar o idioma do artigo
    let language = "Inglês"; // Padrão
    if (articleData.lang && articleData.lang.length > 0) {
      if (articleData.lang[0] === "por") language = "Português";
      else if (articleData.lang[0] === "spa") language = "Espanhol";
    }

    // Extrair autores
    const authors = articleData.authors
      ? articleData.authors.map((author: any) => author.name).join(", ")
      : "Autores não disponíveis";

    // Extrair palavras-chave
    const keywords =
      articleData.keywordlist && articleData.keywordlist.length > 0
        ? articleData.keywordlist
        : ["medicina", "pesquisa"];

    // Formatar o conteúdo como HTML
    const content = `<h2>Abstract</h2><p>${abstract}</p>`;

    const article: Article = {
      id: `pm-${id}`, // Adicionar prefixo para identificar a fonte
      title: articleData.title || "Título não disponível",
      authors: authors,
      journal:
        articleData.fulljournalname ||
        articleData.source ||
        "Revista não disponível",
      year: articleData.pubdate
        ? articleData.pubdate.substring(0, 4)
        : "Ano não disponível",
      language: language,
      abstract: abstract || "Resumo não disponível",
      content: content,
      keywords: keywords,
      references:
        references.length > 0
          ? references
          : ["Referências não disponíveis via API"],
      doi: articleData.articleids
        ? articleData.articleids.find((id: any) => id.idtype === "doi")
            ?.value || null
        : null,
      url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      source: "PubMed", // Adicionar fonte para identificação
    };

    console.log(`[Server] Artigo encontrado: ${article.title}`);
    return article;
  } catch (error) {
    console.error("[Server] Erro ao buscar artigo por ID:", error);
    return null;
  }
}

// Atualizar a função searchMultipleSourcesServer para usar apenas a fonte de IA
export async function searchMultipleSourcesServer(
  options: SearchOptions
): Promise<Article[]> {
  console.log(`[Multi-Source] Iniciando pesquisa com parâmetros:`, options);

  const {
    query,
    sources = ["openai"],
    aiModel = "openai",
    specificSources = [],
  } = options;

  if (!query) {
    console.log(
      "[Multi-Source] Nenhuma query fornecida, retornando lista vazia"
    );
    return [];
  }

  // Iniciar todas as buscas em paralelo
  const searchPromises: Promise<Article[]>[] = [];
  const sourceResults: Record<string, Article[]> = {};
  const sourceErrors: Record<string, string> = {};

  // Adicionar busca com IA (única fonte que usaremos)
  searchPromises.push(
    searchArticlesWithAI(query, {
      language: options.language,
      year: options.year,
      type: options.type,
      limit: 20,
      sources: specificSources.length > 0 ? specificSources : undefined,
      aiModel: aiModel as any,
    })
      .then((result) => {
        sourceResults.ai = result.articles;
        if (result.error) {
          sourceErrors.ai = result.error;
        }
        return result.articles;
      })
      .catch((error) => {
        console.error(`[Multi-Source] Erro ao buscar com ${aiModel}:`, error);
        sourceResults.ai = [];

        // Mensagem de erro mais amigável e específica
        if (error.message?.includes("JSON")) {
          sourceErrors.ai = `Erro de formatação na resposta do modelo ${
            aiModel === "gemini" ? "Google" : "OpenAI"
          }. Tente novamente ou use outro modelo.`;
        } else {
          sourceErrors.ai =
            error.message ||
            `Erro ao buscar com ${aiModel === "gemini" ? "Google" : "OpenAI"}`;
        }

        return [];
      })
  );

  try {
    // Aguardar todas as buscas e combinar os resultados
    await Promise.all(searchPromises);

    // Registrar resultados por fonte
    Object.entries(sourceResults).forEach(([source, articles]) => {
      console.log(
        `[Multi-Source] Fonte ${source}: ${articles.length} artigos encontrados`
      );
    });

    // Registrar erros por fonte
    Object.entries(sourceErrors).forEach(([source, error]) => {
      console.error(`[Multi-Source] Erro na fonte ${source}: ${error}`);
    });

    // Combinar todos os resultados em um único array
    let allArticles: Article[] = [];
    Object.values(sourceResults).forEach((articles) => {
      allArticles = [...allArticles, ...articles];
    });

    console.log(
      `[Multi-Source] Total de artigos encontrados: ${allArticles.length}`
    );

    // Ordenar os resultados conforme solicitado
    const { sort } = options;
    if (sort) {
      switch (sort) {
        case "date_desc":
          allArticles.sort(
            (a, b) => Number.parseInt(b.year) - Number.parseInt(a.year)
          );
          break;
        case "date_asc":
          allArticles.sort(
            (a, b) => Number.parseInt(a.year) - Number.parseInt(b.year)
          );
          break;
        case "relevance":
        default:
          // Manter a ordem atual (que já deve ser por relevância)
          break;
      }
    }

    return allArticles;
  } catch (error) {
    console.error("[Multi-Source] Erro ao buscar artigos:", error);
    return [];
  }
}
