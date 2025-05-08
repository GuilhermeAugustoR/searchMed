import type { Article } from "@/lib/types";
import { fetchWithRetry } from "@/lib/api-helper";

// Base URL para a API do IEEE Xplore
const IEEE_API_BASE = "https://ieeexploreapi.ieee.org/api/v1/search/articles";

// Função para buscar artigos do IEEE Xplore
export async function searchIEEE(
  query: string,
  options: {
    page?: number;
    pageSize?: number;
    year?: string;
    sort?: string;
    apiKey?: string;
  } = {}
): Promise<Article[]> {
  try {
    const {
      page = 1,
      pageSize = 20,
      year,
      sort = "relevance",
      apiKey,
    } = options;

    console.log(`[IEEE] Buscando artigos com query: ${query}`);

    // Verificar se temos uma API key
    if (!apiKey) {
      console.warn("[IEEE] API key não fornecida. Usando método alternativo.");
      return createIEEERedirectArticle(query, year);
    }

    // Calcular o offset com base na página
    const startRecord = (page - 1) * pageSize + 1;

    // Construir os parâmetros da requisição
    const params = new URLSearchParams({
      querytext: query,
      start_record: startRecord.toString(),
      max_records: pageSize.toString(),
      sort_order: sort === "date_asc" ? "asc" : "desc",
      sort_field:
        sort === "date_desc" || sort === "date_asc"
          ? "publication_year"
          : "article_title",
      apikey: apiKey,
      format: "json",
    });

    // Adicionar filtro de ano se especificado
    if (year && year !== "all" && year !== "older") {
      params.append("publication_year", year);
    } else if (year === "older") {
      // Para artigos mais antigos, podemos usar um range de anos
      params.append("publication_range", "1900_2017");
    }

    const apiUrl = `${IEEE_API_BASE}?${params.toString()}`;
    console.log(`[IEEE] URL da requisição: ${apiUrl}`);

    const response = await fetchWithRetry(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `[IEEE] API retornou status ${response.status}: ${response.statusText}`
      );

      // Se a API falhar, usar o método alternativo
      return createIEEERedirectArticle(query, year);
    }

    const data = await response.json();
    console.log(`[IEEE] Resposta da API:`, data);

    if (!data.articles || data.articles.length === 0) {
      console.log("[IEEE] Nenhum resultado encontrado");
      return [];
    }

    console.log(`[IEEE] Encontrados ${data.articles.length} artigos`);

    // Converter os resultados para o formato padrão da aplicação
    const articles: Article[] = data.articles.map((article: any) => {
      // Extrair autores
      const authors =
        article.authors?.map((author: any) => author.full_name).join(", ") ||
        "Autores não disponíveis";

      // Determinar o idioma (IEEE não fornece essa informação diretamente)
      const language = "Inglês"; // Padrão

      // Extrair palavras-chave
      const keywords =
        article.index_terms?.ieee_terms?.terms ||
        article.index_terms?.author_terms?.terms ||
        [];

      // Extrair DOI
      const doi = article.doi || null;

      // Gerar ID único
      const id = `ieee-${
        article.article_number || Math.random().toString(36).substring(2, 15)
      }`;

      return {
        id,
        title: article.title || "Título não disponível",
        authors,
        journal: article.publication_title || "Revista não disponível",
        year: article.publication_year?.toString() || "Ano não disponível",
        language,
        abstract: article.abstract || "Resumo não disponível",
        content: `<h2>Abstract</h2><p>${
          article.abstract || "Resumo não disponível"
        }</p>`,
        keywords,
        references: [],
        doi,
        url:
          article.html_url ||
          article.pdf_url ||
          (doi ? `https://doi.org/${doi}` : null),
        source: "IEEE Xplore",
      };
    });

    return articles;
  } catch (error) {
    console.error("[IEEE] Erro ao buscar artigos:", error);
    // Em caso de erro, usar o método alternativo
    return createIEEERedirectArticle(query, options.year);
  }
}

// Função para criar um artigo de redirecionamento para o IEEE
function createIEEERedirectArticle(query: string, year?: string): Article[] {
  // Construir a URL de pesquisa do IEEE Xplore
  let searchUrl = `https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=${encodeURIComponent(
    query
  )}`;

  // Adicionar filtro de ano se especificado
  if (year && year !== "all" && year !== "older") {
    searchUrl += `&ranges=${year}_${year}_Year`;
  } else if (year === "older") {
    searchUrl += `&ranges=1900_2017_Year`;
  }

  // Criar um único resultado que direciona para a página de pesquisa
  return [
    {
      id: `ieee-redirect-${Date.now()}`,
      title: `Resultados do IEEE Xplore para "${query}"`,
      authors: "Diversos autores",
      journal: "IEEE Xplore - Biblioteca Digital",
      year: year || "Todos os anos",
      language: "Diversos",
      abstract: `Sua pesquisa por "${query}" encontrará resultados no IEEE Xplore. Clique em "Acessar resultados" para ver todos os artigos encontrados diretamente no site do IEEE.`,
      content: `<h2>Resultados do IEEE Xplore</h2>
             <p>Sua pesquisa por "${query}" encontrará resultados no IEEE Xplore.</p>
             <p>Devido a limitações de acesso à API, não é possível exibir os resultados detalhados diretamente nesta aplicação.</p>
             <p>Por favor, clique no botão "Acessar resultados" acima para visualizar todos os artigos encontrados diretamente no site do IEEE Xplore.</p>
             <p>O IEEE Xplore é uma biblioteca digital que fornece acesso a publicações técnicas em engenharia elétrica, ciência da computação e eletrônica.</p>`,
      keywords: [query],
      references: [],
      doi: undefined,
      url: searchUrl,
      source: "IEEE Xplore",
    },
  ];
}

// Também atualizar a função getIEEEArticleById para usar GET
export async function getIEEEArticleById(
  id: string,
  apiKey?: string
): Promise<Article | null> {
  try {
    // Remover o prefixo "ieee-" para obter o ID real do IEEE
    const ieeeId = id.startsWith("ieee-") ? id.substring(5) : id;

    // Se for um ID de redirecionamento, criar um artigo genérico
    if (ieeeId.startsWith("redirect-")) {
      return {
        id: id,
        title: "Artigo do IEEE Xplore",
        authors: "Informações disponíveis no site do IEEE",
        journal: "IEEE Xplore - Biblioteca Digital",
        year: "Informação disponível no site original",
        language: "Informação disponível no site original",
        abstract:
          "Para visualizar o resumo completo, acesse o artigo no site do IEEE Xplore.",
        content: `<h2>Artigo do IEEE Xplore</h2>
                 <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
                 <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do IEEE Xplore.</p>
                 <p>O IEEE Xplore é uma biblioteca digital que fornece acesso a publicações técnicas em engenharia elétrica, ciência da computação e eletrônica.</p>`,
        keywords: [],
        references: [],
        doi: undefined,
        url: "https://ieeexplore.ieee.org",
        source: "IEEE Xplore",
      };
    }

    console.log(`[IEEE] Buscando detalhes do artigo com ID: ${ieeeId}`);

    // Verificar se temos uma API key
    if (!apiKey) {
      console.warn(
        "[IEEE] API key não fornecida. A API do IEEE Xplore requer autenticação."
      );

      // Criar um artigo genérico com link para o IEEE
      return {
        id: id,
        title: "Artigo do IEEE Xplore",
        authors: "Informações disponíveis no site do IEEE",
        journal: "IEEE Xplore - Biblioteca Digital",
        year: "Informação disponível no site original",
        language: "Informação disponível no site original",
        abstract:
          "Para visualizar o resumo completo, acesse o artigo no site do IEEE Xplore.",
        content: `<h2>Artigo do IEEE Xplore</h2>
                 <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
                 <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do IEEE Xplore.</p>
                 <p>O IEEE Xplore é uma biblioteca digital que fornece acesso a publicações técnicas em engenharia elétrica, ciência da computação e eletrônica.</p>`,
        keywords: [],
        references: [],
        doi: undefined,
        url: `https://ieeexplore.ieee.org/document/${ieeeId}`,
        source: "IEEE Xplore",
      };
    }

    // Construir os parâmetros da requisição
    const params = new URLSearchParams({
      article_number: ieeeId,
      apikey: apiKey,
      format: "json",
    });

    const apiUrl = `${IEEE_API_BASE}?${params.toString()}`;

    const response = await fetchWithRetry(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      // Criar um artigo genérico com link para o IEEE
      return {
        id: id,
        title: "Artigo do IEEE Xplore",
        authors: "Informações disponíveis no site do IEEE",
        journal: "IEEE Xplore - Biblioteca Digital",
        year: "Informação disponível no site original",
        language: "Informação disponível no site original",
        abstract:
          "Para visualizar o resumo completo, acesse o artigo no site do IEEE Xplore.",
        content: `<h2>Artigo do IEEE Xplore</h2>
                 <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
                 <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do IEEE Xplore.</p>
                 <p>O IEEE Xplore é uma biblioteca digital que fornece acesso a publicações técnicas em engenharia elétrica, ciência da computação e eletrônica.</p>`,
        keywords: [],
        references: [],
        doi: undefined,
        url: `https://ieeexplore.ieee.org/document/${ieeeId}`,
        source: "IEEE Xplore",
      };
    }

    const data = await response.json();

    if (!data.articles || data.articles.length === 0) {
      console.log("[IEEE] Artigo não encontrado");
      return null;
    }

    const article = data.articles[0];

    // Extrair autores
    const authors =
      article.authors?.map((author: any) => author.full_name).join(", ") ||
      "Autores não disponíveis";

    // Determinar o idioma (IEEE não fornece essa informação diretamente)
    const language = "Inglês"; // Padrão

    // Extrair palavras-chave
    const keywords =
      article.index_terms?.ieee_terms?.terms ||
      article.index_terms?.author_terms?.terms ||
      [];

    // Extrair DOI
    const doi = article.doi || null;

    // Extrair referências
    const references =
      article.references?.map((ref: any) => ref.text || ref.title) || [];

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${article.abstract || "Resumo não disponível"}</p>
      ${
        article.html_url
          ? `<p><a href="${article.html_url}" target="_blank" rel="noopener noreferrer">Ver artigo completo no IEEE Xplore</a></p>`
          : ""
      }
      ${
        article.pdf_url
          ? `<p><a href="${article.pdf_url}" target="_blank" rel="noopener noreferrer">Download do PDF</a></p>`
          : ""
      }
    `;

    const articleData: Article = {
      id: `ieee-${ieeeId}`,
      title: article.title || "Título não disponível",
      authors,
      journal: article.publication_title || "Revista não disponível",
      year: article.publication_year?.toString() || "Ano não disponível",
      language,
      abstract: article.abstract || "Resumo não disponível",
      content,
      keywords,
      references,
      doi,
      url:
        article.html_url ||
        article.pdf_url ||
        (doi ? `https://doi.org/${doi}` : null),
      source: "IEEE Xplore",
    };

    return articleData;
  } catch (error) {
    console.error("[IEEE] Erro ao buscar detalhes do artigo:", error);

    // Em caso de erro, criar um artigo genérico com link para o IEEE
    return {
      id: id,
      title: "Artigo do IEEE Xplore",
      authors: "Informações disponíveis no site do IEEE",
      journal: "IEEE Xplore - Biblioteca Digital",
      year: "Informação disponível no site original",
      language: "Informação disponível no site original",
      abstract:
        "Para visualizar o resumo completo, acesse o artigo no site do IEEE Xplore.",
      content: `<h2>Artigo do IEEE Xplore</h2>
               <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
               <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do IEEE Xplore.</p>
               <p>O IEEE Xplore é uma biblioteca digital que fornece acesso a publicações técnicas em engenharia elétrica, ciência da computação e eletrônica.</p>`,
      keywords: [],
      references: [],
      doi: undefined,
      url: `https://ieeexplore.ieee.org/document/${id.replace("ieee-", "")}`,
      source: "IEEE Xplore",
    };
  }
}
