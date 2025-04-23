import type { Article } from "@/lib/types";
import { XMLParser } from "fast-xml-parser";
import { fetchWithRetry } from "@/lib/api-helper";

// Base URL para a API do arXiv
const ARXIV_API_BASE = "http://export.arxiv.org/api/query";

// Função para buscar artigos do arXiv
export async function searchArxiv(
  query: string,
  options: {
    start?: number;
    maxResults?: number;
    sortBy?: "relevance" | "lastUpdatedDate" | "submittedDate";
    sortOrder?: "ascending" | "descending";
  } = {}
): Promise<Article[]> {
  try {
    const {
      start = 0,
      maxResults = 20,
      sortBy = "relevance",
      sortOrder = "descending",
    } = options;

    console.log(`[arXiv] Buscando artigos com query: ${query}`);

    // Construir a URL para a API do arXiv
    const params = new URLSearchParams({
      search_query: `all:${query}`,
      start: start.toString(),
      max_results: maxResults.toString(),
      sortBy: sortBy,
      sortOrder: sortOrder,
    });

    const apiUrl = `${ARXIV_API_BASE}?${params.toString()}`;
    console.log(`[arXiv] URL da requisição: ${apiUrl}`);

    const response = await fetchWithRetry(apiUrl);
    if (!response.ok) {
      throw new Error(
        `Erro na API do arXiv: ${response.status} ${response.statusText}`
      );
    }

    const xmlData = await response.text();

    // Parsear o XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "_",
    });
    const result = parser.parse(xmlData);

    if (!result.feed || !result.feed.entry) {
      console.log("[arXiv] Nenhum resultado encontrado");
      return [];
    }

    // Normalizar para array mesmo se houver apenas um resultado
    const entries = Array.isArray(result.feed.entry)
      ? result.feed.entry
      : [result.feed.entry];
    console.log(`[arXiv] Encontrados ${entries.length} artigos`);

    // Converter os resultados para o formato padrão da aplicação
    const articles: Article[] = entries.map((entry: any) => {
      // Extrair o ID do arXiv
      const arxivId = entry.id.split("/").pop().split("v")[0];

      // Extrair autores
      const authors = Array.isArray(entry.author)
        ? entry.author.map((author: any) => author.name).join(", ")
        : entry.author.name;

      // Extrair categorias como keywords
      const categories = Array.isArray(entry.category)
        ? entry.category.map((cat: any) => cat._term)
        : [entry.category._term];

      // Extrair data de publicação
      const pubDate = new Date(entry.published);
      const year = pubDate.getFullYear().toString();

      // Extrair link para o PDF
      const pdfLink = Array.isArray(entry.link)
        ? entry.link.find((link: any) => link._title === "pdf")._href
        : entry.link._href;

      return {
        id: `arxiv-${arxivId}`,
        title: entry.title.replace(/\n/g, " ").trim(),
        authors,
        journal: "arXiv",
        year,
        language: "Inglês", // arXiv é predominantemente em inglês
        abstract: entry.summary.replace(/\n/g, " ").trim(),
        content: `<h2>Abstract</h2><p>${entry.summary
          .replace(/\n/g, " ")
          .trim()}</p>`,
        keywords: categories,
        references: [],
        doi: null, // arXiv não fornece DOI diretamente
        url: pdfLink || entry.id,
        source: "arXiv",
      };
    });

    return articles;
  } catch (error) {
    console.error("[arXiv] Erro ao buscar artigos:", error);
    return [];
  }
}

// Função para obter detalhes de um artigo específico do arXiv
export async function getArxivArticleById(id: string): Promise<Article | null> {
  try {
    // Remover o prefixo "arxiv-" para obter o ID real do arXiv
    const arxivId = id.startsWith("arxiv-") ? id.substring(6) : id;

    console.log(`[arXiv] Buscando detalhes do artigo com ID: ${arxivId}`);

    // Construir a URL para a API do arXiv
    const apiUrl = `${ARXIV_API_BASE}?id_list=${arxivId}`;

    const response = await fetchWithRetry(apiUrl);
    if (!response.ok) {
      throw new Error(
        `Erro na API do arXiv: ${response.status} ${response.statusText}`
      );
    }

    const xmlData = await response.text();

    // Parsear o XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "_",
    });
    const result = parser.parse(xmlData);

    if (!result.feed || !result.feed.entry) {
      console.log("[arXiv] Artigo não encontrado");
      return null;
    }

    const entry = Array.isArray(result.feed.entry)
      ? result.feed.entry[0]
      : result.feed.entry;

    // Extrair autores
    const authors = Array.isArray(entry.author)
      ? entry.author.map((author: any) => author.name).join(", ")
      : entry.author.name;

    // Extrair categorias como keywords
    const categories = Array.isArray(entry.category)
      ? entry.category.map((cat: any) => cat._term)
      : [entry.category._term];

    // Extrair data de publicação
    const pubDate = new Date(entry.published);
    const year = pubDate.getFullYear().toString();

    // Extrair link para o PDF
    let pdfLink = "";
    if (Array.isArray(entry.link)) {
      const pdfLinkObj = entry.link.find((link: any) => link._title === "pdf");
      pdfLink = pdfLinkObj ? pdfLinkObj._href : entry.link[0]._href;
    } else {
      pdfLink = entry.link._href;
    }

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${entry.summary.replace(/\n/g, " ").trim()}</p>
      <h2>Categories</h2>
      <p>${categories.join(", ")}</p>
      <p><a href="${pdfLink}" target="_blank" rel="noopener noreferrer">Download PDF</a></p>
    `;

    const article: Article = {
      id: `arxiv-${arxivId}`,
      title: entry.title.replace(/\n/g, " ").trim(),
      authors,
      journal: "arXiv",
      year,
      language: "Inglês", // arXiv é predominantemente em inglês
      abstract: entry.summary.replace(/\n/g, " ").trim(),
      content,
      keywords: categories,
      references: [],
      doi: undefined, // arXiv não fornece DOI diretamente
      url: pdfLink || entry.id,
      source: "arXiv",
    };

    return article;
  } catch (error) {
    console.error("[arXiv] Erro ao buscar detalhes do artigo:", error);
    return null;
  }
}
