import type { Article } from "@/lib/types";
import { fetchWithRetry } from "@/lib/api-helper";

// Base URL para a API do Scopus
const SCOPUS_API_BASE = "https://api.elsevier.com/content/search/scopus";

// Função para buscar artigos do Scopus
export async function searchScopus(
  query: string,
  options: {
    page?: number;
    pageSize?: number;
    year?: string;
    sort?: string;
    apiKey?: string;
  } = {}
): Promise<Article[]> {
  const year: string | undefined = options.year; // Declare year here
  try {
    const { page = 1, pageSize = 20, sort = "relevancy", apiKey } = options;

    console.log(`[Scopus] Buscando artigos com query: ${query}`);

    // Verificar se temos uma API key
    if (!apiKey) {
      console.warn(
        "[Scopus] API key não fornecida. Usando método alternativo."
      );
      return createScopusRedirectArticle(query, year);
    }

    // Calcular o offset com base na página
    const start = (page - 1) * pageSize;

    // Construir a query com filtros
    let fullQuery = encodeURIComponent(`TITLE-ABS-KEY(${query})`);

    // Adicionar filtro de ano se especificado
    if (year && year !== "all" && year !== "older") {
      fullQuery = encodeURIComponent(
        `TITLE-ABS-KEY(${query}) AND PUBYEAR = ${year}`
      );
    } else if (year === "older") {
      fullQuery = encodeURIComponent(
        `TITLE-ABS-KEY(${query}) AND PUBYEAR < 2018`
      );
    }

    // Construir a URL para a API do Scopus com os parâmetros corretos
    const apiUrl = `${SCOPUS_API_BASE}?query=${fullQuery}&start=${start}&count=${pageSize}&sort=${sort}&view=COMPLETE`;

    console.log(`[Scopus] URL da requisição: ${apiUrl}`);

    const response = await fetchWithRetry(apiUrl, {
      headers: {
        "X-ELS-APIKey": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      // Tentar obter mais detalhes sobre o erro
      let errorDetails = "";
      try {
        const errorResponse = await response.text();
        errorDetails = ` - Detalhes: ${errorResponse}`;
      } catch (e) {
        // Ignorar erro ao tentar ler detalhes
      }

      console.error(
        `[Scopus] API retornou status ${response.status}: ${response.statusText}${errorDetails}`
      );

      // Se a API falhar, usar o método alternativo
      return createScopusRedirectArticle(query, year);
    }

    const data = await response.json();
    console.log(`[Scopus] Resposta da API:`, data);

    if (
      !data["search-results"] ||
      !data["search-results"].entry ||
      data["search-results"].entry.length === 0
    ) {
      console.log("[Scopus] Nenhum resultado encontrado");
      return [];
    }

    console.log(
      `[Scopus] Encontrados ${data["search-results"].entry.length} artigos`
    );

    // Converter os resultados para o formato padrão da aplicação
    const articles: Article[] = data["search-results"].entry.map(
      (entry: any) => {
        // Extrair autores
        const authors =
          entry.creator || entry["dc:creator"] || "Autores não disponíveis";

        // Determinar o idioma (Scopus não fornece essa informação diretamente)
        const language = "Inglês"; // Padrão

        // Extrair palavras-chave
        const keywords = entry.authkeywords?.split("|") || [];

        // Extrair DOI
        const doi = entry.prism?.doi || entry["prism:doi"] || null;

        // Gerar ID único
        const id = `scopus-${
          entry["dc:identifier"] || Math.random().toString(36).substring(2, 15)
        }`;

        // Extrair ano
        const year = entry["prism:coverDate"]
          ? entry["prism:coverDate"].substring(0, 4)
          : "Ano não disponível";

        return {
          id,
          title: entry["dc:title"] || "Título não disponível",
          authors: typeof authors === "string" ? authors : authors.join(", "),
          journal:
            entry["prism:publicationName"] ||
            entry["source-title"] ||
            "Revista não disponível",
          year,
          language,
          abstract: entry["dc:description"] || "Resumo não disponível",
          content: `<h2>Abstract</h2><p>${
            entry["dc:description"] || "Resumo não disponível"
          }</p>`,
          keywords,
          references: [],
          doi,
          url: entry.link || (doi ? `https://doi.org/${doi}` : null),
          source: "Scopus",
        };
      }
    );

    return articles;
  } catch (error) {
    console.error("[Scopus] Erro ao buscar artigos:", error);
    // Em caso de erro, usar o método alternativo
    return createScopusRedirectArticle(query, year);
  }
}

// Função para criar um artigo de redirecionamento para o Scopus
function createScopusRedirectArticle(query: string, year?: string): Article[] {
  // Construir a URL de pesquisa do Scopus
  let searchUrl = `https://www.scopus.com/results/results.uri?src=s&st1=${encodeURIComponent(
    query
  )}`;

  // Adicionar filtro de ano se especificado
  if (year && year !== "all" && year !== "older") {
    searchUrl += `&publishYear=${year}`;
  } else if (year === "older") {
    searchUrl += `&publishYear=before+2018`;
  }

  // Criar um único resultado que direciona para a página de pesquisa
  return [
    {
      id: `scopus-redirect-${Date.now()}`,
      title: `Resultados do Scopus para "${query}"`,
      authors: "Diversos autores",
      journal: "Scopus - Base de dados de citações e resumos",
      year: year || "Todos os anos",
      language: "Diversos",
      abstract: `Sua pesquisa por "${query}" encontrará resultados no Scopus. Clique em "Acessar resultados" para ver todos os artigos encontrados diretamente no site do Scopus.`,
      content: `<h2>Resultados do Scopus</h2>
             <p>Sua pesquisa por "${query}" encontrará resultados no Scopus.</p>
             <p>Devido a limitações de acesso à API, não é possível exibir os resultados detalhados diretamente nesta aplicação.</p>
             <p>Por favor, clique no botão "Acessar resultados" acima para visualizar todos os artigos encontrados diretamente no site do Scopus.</p>
             <p>O Scopus é a maior base de dados de resumos e citações da literatura revisada por pares: revistas científicas, livros e anais de congressos.</p>`,
      keywords: [query],
      references: [],
      doi: undefined,
      url: searchUrl,
      source: "Scopus",
    },
  ];
}

// Função para obter detalhes de um artigo específico do Scopus
export async function getScopusArticleById(
  id: string,
  apiKey?: string
): Promise<Article | null> {
  try {
    // Remover o prefixo "scopus-" para obter o ID real do Scopus
    const scopusId = id.startsWith("scopus-") ? id.substring(7) : id;

    // Se for um ID de redirecionamento, criar um artigo genérico
    if (scopusId.startsWith("redirect-")) {
      return {
        id: id,
        title: "Artigo do Scopus",
        authors: "Informações disponíveis no site do Scopus",
        journal: "Scopus - Base de dados de citações e resumos",
        year: "Informação disponível no site original",
        language: "Informação disponível no site original",
        abstract:
          "Para visualizar o resumo completo, acesse o artigo no site do Scopus.",
        content: `<h2>Artigo do Scopus</h2>
                 <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
                 <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do Scopus.</p>
                 <p>O Scopus é a maior base de dados de resumos e citações da literatura revisada por pares: revistas científicas, livros e anais de congressos.</p>`,
        keywords: [],
        references: [],
        doi: undefined,
        url: "https://www.scopus.com",
        source: "Scopus",
      };
    }

    console.log(`[Scopus] Buscando detalhes do artigo com ID: ${scopusId}`);

    // Verificar se temos uma API key
    if (!apiKey) {
      console.warn(
        "[Scopus] API key não fornecida. A API do Scopus requer autenticação."
      );

      // Criar um artigo genérico com link para o Scopus
      return {
        id: id,
        title: "Artigo do Scopus",
        authors: "Informações disponíveis no site do Scopus",
        journal: "Scopus - Base de dados de citações e resumos",
        year: "Informação disponível no site original",
        language: "Informação disponível no site original",
        abstract:
          "Para visualizar o resumo completo, acesse o artigo no site do Scopus.",
        content: `<h2>Artigo do Scopus</h2>
                 <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
                 <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do Scopus.</p>
                 <p>O Scopus é a maior base de dados de resumos e citações da literatura revisada por pares: revistas científicas, livros e anais de congressos.</p>`,
        keywords: [],
        references: [],
        doi: undefined,
        url: `https://www.scopus.com/record/display.uri?eid=${scopusId}`,
        source: "Scopus",
      };
    }

    // Construir a URL para a API do Scopus
    const apiUrl = `${SCOPUS_API_BASE}?query=ID:${scopusId}`;

    const response = await fetchWithRetry(apiUrl, {
      headers: {
        "X-ELS-APIKey": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      // Criar um artigo genérico com link para o Scopus
      return {
        id: id,
        title: "Artigo do Scopus",
        authors: "Informações disponíveis no site do Scopus",
        journal: "Scopus - Base de dados de citações e resumos",
        year: "Informação disponível no site original",
        language: "Informação disponível no site original",
        abstract:
          "Para visualizar o resumo completo, acesse o artigo no site do Scopus.",
        content: `<h2>Artigo do Scopus</h2>
                 <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
                 <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do Scopus.</p>
                 <p>O Scopus é a maior base de dados de resumos e citações da literatura revisada por pares: revistas científicas, livros e anais de congressos.</p>`,
        keywords: [],
        references: [],
        doi: undefined,
        url: `https://www.scopus.com/record/display.uri?eid=${scopusId}`,
        source: "Scopus",
      };
    }

    const data = await response.json();

    if (
      !data["search-results"] ||
      !data["search-results"].entry ||
      data["search-results"].entry.length === 0
    ) {
      console.log("[Scopus] Artigo não encontrado");
      return null;
    }

    const entry = data["search-results"].entry[0];

    // Extrair autores
    const authors =
      entry.creator || entry["dc:creator"] || "Autores não disponíveis";

    // Determinar o idioma (Scopus não fornece essa informação diretamente)
    const language = "Inglês"; // Padrão

    // Extrair palavras-chave
    const keywords = entry.authkeywords?.split("|") || [];

    // Extrair DOI
    const doi = entry.prism?.doi || entry["prism:doi"] || null;

    // Extrair ano
    const year = entry["prism:coverDate"]
      ? entry["prism:coverDate"].substring(0, 4)
      : "Ano não disponível";

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${entry["dc:description"] || "Resumo não disponível"}</p>
      ${
        doi
          ? `<p><a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">Ver artigo completo via DOI</a></p>`
          : ""
      }
    `;

    const article: Article = {
      id: `scopus-${scopusId}`,
      title: entry["dc:title"] || "Título não disponível",
      authors: typeof authors === "string" ? authors : authors.join(", "),
      journal:
        entry["prism:publicationName"] ||
        entry["source-title"] ||
        "Revista não disponível",
      year,
      language,
      abstract: entry["dc:description"] || "Resumo não disponível",
      content,
      keywords,
      references: [],
      doi,
      url: entry.link || (doi ? `https://doi.org/${doi}` : null),
      source: "Scopus",
    };

    return article;
  } catch (error) {
    console.error("[Scopus] Erro ao buscar detalhes do artigo:", error);

    // Em caso de erro, criar um artigo genérico com link para o Scopus
    return {
      id: id,
      title: "Artigo do Scopus",
      authors: "Informações disponíveis no site do Scopus",
      journal: "Scopus - Base de dados de citações e resumos",
      year: "Informação disponível no site original",
      language: "Informação disponível no site original",
      abstract:
        "Para visualizar o resumo completo, acesse o artigo no site do Scopus.",
      content: `<h2>Artigo do Scopus</h2>
               <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
               <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do Scopus.</p>
               <p>O Scopus é a maior base de dados de resumos e citações da literatura revisada por pares: revistas científicas, livros e anais de congressos.</p>`,
      keywords: [],
      references: [],
      doi: undefined,
      url: `https://www.scopus.com/record/display.uri?eid=${id.replace(
        "scopus-",
        ""
      )}`,
      source: "Scopus",
    };
  }
}
