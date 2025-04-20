import { NextResponse } from "next/server";
import type { Article } from "@/lib/types";

// Base URL para a API do PubMed E-utilities
const PUBMED_API_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "keyword";
  const language = searchParams.get("lang") || "all";
  const year = searchParams.get("year") || "all";
  const sort = searchParams.get("sort") || "relevance";

  console.log("Proxy de servidor: Iniciando pesquisa com parâmetros:", {
    query,
    type,
    language,
    year,
    sort,
  });

  if (!query) {
    return NextResponse.json({ articles: [] });
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
    const searchUrl = `${PUBMED_API_BASE}/esearch.fcgi?db=pubmed&term=${encodedQuery}&retmode=json&retmax=20`;
    console.log("Proxy de servidor: Buscando IDs de artigos em:", searchUrl);

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
        "Proxy de servidor: Nenhum resultado encontrado na API do PubMed"
      );
      return NextResponse.json({ articles: [] });
    }

    const ids = searchData.esearchresult.idlist;
    console.log(`Proxy de servidor: Encontrados ${ids.length} IDs de artigos`);

    // Buscar os detalhes dos artigos usando os IDs
    const summaryUrl = `${PUBMED_API_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(
      ","
    )}&retmode=json`;
    console.log(
      "Proxy de servidor: Buscando detalhes dos artigos em:",
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
          id: id,
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
          content:
            article.abstract || "Conteúdo completo não disponível via API",
          keywords: keywords.length > 0 ? keywords : ["medicina", "pesquisa"],
          references: [],
          doi: article.articleids
            ? article.articleids.find((id: any) => id.idtype === "doi")
                ?.value || null
            : null,
          url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
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
      `Proxy de servidor: Retornando ${articles.length} artigos processados`
    );
    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Proxy de servidor: Erro ao buscar artigos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar artigos", articles: [] },
      { status: 500 }
    );
  }
}
