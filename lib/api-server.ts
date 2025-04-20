import type { Article, SearchOptions } from "./types";
import { getMockArticleById } from "./mock-data";
import { getSemanticScholarArticleById } from "./api-sources/semantic-scholar";
import { getCrossrefArticleById } from "./api-sources/crossref";
import { getLancetArticleById } from "./api-sources/lancet";

// Base URL para a API do PubMed E-utilities
const PUBMED_API_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

// Função para buscar artigos do PubMed no servidor
export async function searchPubMedServer(
  options: SearchOptions,
  limit = 20
): Promise<Article[]> {
  const { query, type, language, year, sort } = options;

  console.log(`[PubMed Server] Iniciando pesquisa com parâmetros:`, options);

  if (!query) {
    console.log(
      "[PubMed Server] Nenhuma query fornecida, retornando lista vazia"
    );
    return [];
  }

  try {
    // Construir a query para o PubMed
    let searchQuery = query;

    // Adicionar filtros à query
    if (language && language !== "all") {
      const languageMap: Record<string, string> = {
        en: "English[Language]",
        pt: "Portuguese[Language]",
        es: "Spanish[Language]",
      };
      if (languageMap[language]) {
        searchQuery += ` AND ${languageMap[language]}`;
      }
    }

    // Filtrar por ano
    if (year && year !== "all") {
      if (year === "older") {
        searchQuery += ` AND ("0001"[PDAT] : "2017"[PDAT])`;
      } else {
        searchQuery += ` AND "${year}"[PDAT]`;
      }
    }

    // Adicionar filtro por tipo de campo
    if (type && type !== "keyword") {
      const fieldMap: Record<string, string> = {
        title: "[Title]",
        author: "[Author]",
        journal: "[Journal]",
      };
      if (fieldMap[type]) {
        searchQuery = `${query}${fieldMap[type]}`;
      }
    }

    // Codificar a query para URL
    const encodedQuery = encodeURIComponent(searchQuery);

    // Primeiro, buscar os IDs dos artigos
    const searchUrl = `${PUBMED_API_BASE}/esearch.fcgi?db=pubmed&term=${encodedQuery}&retmode=json&retmax=${limit}`;
    console.log("[PubMed Server] Buscando IDs de artigos em:", searchUrl);

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(
        `Erro na API do PubMed: ${searchResponse.status} ${searchResponse.statusText}`
      );
    }

    const searchData = await searchResponse.json();

    if (
      !searchData.esearchresult ||
      !searchData.esearchresult.idlist ||
      searchData.esearchresult.idlist.length === 0
    ) {
      console.log(
        "[PubMed Server] Nenhum resultado encontrado na API do PubMed"
      );
      return [];
    }

    const ids = searchData.esearchresult.idlist;
    console.log(`[PubMed Server] Encontrados ${ids.length} IDs de artigos`);

    // Buscar os detalhes dos artigos usando os IDs
    const summaryUrl = `${PUBMED_API_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(
      ","
    )}&retmode=json`;
    console.log(
      "[PubMed Server] Buscando detalhes dos artigos em:",
      summaryUrl
    );

    const summaryResponse = await fetch(summaryUrl);
    if (!summaryResponse.ok) {
      throw new Error(
        `Erro na API do PubMed: ${summaryResponse.status} ${summaryResponse.statusText}`
      );
    }

    const summaryData = await summaryResponse.json();

    // Processar os resultados
    const articles: Article[] = [];

    for (const id of ids) {
      if (summaryData.result && summaryData.result[id]) {
        const article = summaryData.result[id];

        // Determinar o idioma do artigo
        let language = "Inglês"; // Padrão
        if (article.lang && article.lang.length > 0) {
          if (article.lang[0] === "por") language = "Português";
          else if (article.lang[0] === "spa") language = "Espanhol";
        }

        // Extrair autores
        const authors = article.authors
          ? article.authors
              .map((author: any) => author.name)
              .slice(0, 3)
              .join(", ")
          : "Autores não disponíveis";

        // Extrair palavras-chave
        const keywords = article.keywordlist ? article.keywordlist : [];

        // Criar objeto do artigo
        articles.push({
          id: `pm-${id}`, // Adicionar prefixo para identificar a fonte
          title: article.title || "Título não disponível",
          authors: authors,
          journal:
            article.fulljournalname ||
            article.source ||
            "Revista não disponível",
          year: article.pubdate
            ? article.pubdate.substring(0, 4)
            : "Ano não disponível",
          language: language,
          abstract: article.abstract || "Resumo não disponível",
          content: `<h2>Abstract</h2><p>${
            article.abstract || "Conteúdo não disponível"
          }</p>`,
          keywords: keywords.length > 0 ? keywords : ["medicina", "pesquisa"],
          references: [],
          doi: article.articleids
            ? article.articleids.find((id: any) => id.idtype === "doi")
                ?.value || null
            : null,
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
          source: "PubMed", // Adicionar fonte para identificação
        });
      }
    }

    // Ordenar resultados
    if (sort) {
      switch (sort) {
        case "date_desc":
          articles.sort(
            (a, b) => Number.parseInt(b.year) - Number.parseInt(a.year)
          );
          break;
        case "date_asc":
          articles.sort(
            (a, b) => Number.parseInt(a.year) - Number.parseInt(b.year)
          );
          break;
        case "relevance":
        default:
          // Mantém a ordem retornada pelo PubMed (que já é por relevância)
          break;
      }
    }

    console.log(
      `[PubMed Server] Retornando ${articles.length} artigos processados`
    );
    return articles;
  } catch (error) {
    console.error("[PubMed Server] Erro ao buscar artigos:", error);
    return [];
  }
}

// Versão da função getArticleById para uso no servidor
export async function getArticleByIdServer(
  id: string
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

// Função para buscar artigos de múltiplas fontes
export async function searchMultipleSourcesServer(
  options: SearchOptions
): Promise<Article[]> {
  console.log(`[Multi-Source] Iniciando pesquisa com parâmetros:`, options);

  const {
    query,
    sources = ["pubmed", "semantic-scholar", "crossref", "lancet"],
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

  // Adicionar fontes selecionadas
  if (sources.includes("pubmed")) {
    searchPromises.push(
      searchPubMedServer(options, 10)
        .then((articles) => {
          sourceResults.pubmed = articles;
          return articles;
        })
        .catch((error) => {
          console.error("[Multi-Source] Erro ao buscar no PubMed:", error);
          sourceResults.pubmed = [];
          sourceErrors.pubmed = error.message || "Erro ao buscar no PubMed";
          return [];
        })
    );
  }

  if (sources.includes("semantic-scholar")) {
    const { searchSemanticScholar } = await import(
      "./api-sources/semantic-scholar"
    );
    searchPromises.push(
      searchSemanticScholar(query, 10)
        .then((articles) => {
          sourceResults["semantic-scholar"] = articles;
          return articles;
        })
        .catch((error) => {
          console.error(
            "[Multi-Source] Erro ao buscar no Semantic Scholar:",
            error
          );
          sourceResults["semantic-scholar"] = [];
          sourceErrors["semantic-scholar"] =
            error.message || "Erro ao buscar no Semantic Scholar";
          return [];
        })
    );
  }

  if (sources.includes("crossref")) {
    const { searchCrossref } = await import("./api-sources/crossref");
    searchPromises.push(
      searchCrossref(query, 10)
        .then((articles) => {
          sourceResults.crossref = articles;
          return articles;
        })
        .catch((error) => {
          console.error("[Multi-Source] Erro ao buscar no Crossref:", error);
          sourceResults.crossref = [];
          sourceErrors.crossref = error.message || "Erro ao buscar no Crossref";
          return [];
        })
    );
  }

  if (sources.includes("lancet")) {
    const { searchLancet } = await import("./api-sources/lancet");
    searchPromises.push(
      searchLancet(query, 10)
        .then((result) => {
          sourceResults.lancet = result.articles;
          if (result.error) {
            sourceErrors.lancet = result.error;
          }
          return result.articles;
        })
        .catch((error) => {
          console.error("[Multi-Source] Erro ao buscar no The Lancet:", error);
          sourceResults.lancet = [];
          sourceErrors.lancet = error.message || "Erro ao buscar no The Lancet";
          return [];
        })
    );
  }

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
      `[Multi-Source] Total de artigos encontrados em todas as fontes: ${allArticles.length}`
    );

    // Remover possíveis duplicatas (baseado no DOI, se disponível)
    const uniqueArticles = removeDuplicates(allArticles);

    console.log(
      `[Multi-Source] Artigos após remoção de duplicatas: ${uniqueArticles.length}`
    );

    // Ordenar os resultados conforme solicitado
    const { sort } = options;
    if (sort) {
      switch (sort) {
        case "date_desc":
          uniqueArticles.sort(
            (a, b) => Number.parseInt(b.year) - Number.parseInt(a.year)
          );
          break;
        case "date_asc":
          uniqueArticles.sort(
            (a, b) => Number.parseInt(a.year) - Number.parseInt(b.year)
          );
          break;
        case "relevance":
        default:
          // Manter a ordem atual (que já deve ser por relevância)
          break;
      }
    }

    return uniqueArticles;
  } catch (error) {
    console.error(
      "[Multi-Source] Erro ao buscar artigos de múltiplas fontes:",
      error
    );
    return [];
  }
}

// Função auxiliar para remover duplicatas
function removeDuplicates(articles: Article[]): Article[] {
  const uniqueMap = new Map<string, Article>();

  articles.forEach((article) => {
    // Usar DOI como identificador único se disponível
    if (article.doi) {
      // Se já existe um artigo com este DOI, manter o que tem mais informações
      if (uniqueMap.has(article.doi)) {
        const existing = uniqueMap.get(article.doi)!;
        // Verificar qual tem mais informações (por exemplo, abstract mais longo)
        if (article.abstract.length > existing.abstract.length) {
          uniqueMap.set(article.doi, article);
        }
      } else {
        // Se não existe ainda, adicionar ao mapa
        uniqueMap.set(article.doi, article);
      }
    } else {
      // Se não tem DOI, usar o ID como chave
      uniqueMap.set(article.id, article);
    }
  });

  // Converter o mapa de volta para um array
  return Array.from(uniqueMap.values());
}
