import type { Article } from "@/lib/types";
import { fetchWithRetry } from "@/lib/api-helper";

// Base URL para a API do Springer
const SPRINGER_API_BASE = "https://api.springernature.com/meta/v2/json";

// Função para buscar artigos do Springer
export async function searchSpringer(
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

    console.log(`[Springer] Buscando artigos com query: ${query}`);

    // Verificar se temos uma API key
    if (!apiKey) {
      console.warn(
        "[Springer] API key não fornecida. Usando método alternativo."
      );
      return createSpringerRedirectArticle(query, year);
    }

    // Calcular o offset com base na página
    const start = (page - 1) * pageSize + 1;

    // Construir a query com filtros
    let queryParams = `s=${start}&p=${pageSize}&api_key=${apiKey}`;

    // Adicionar a query principal
    queryParams += `&q=${encodeURIComponent(query)}`;

    // Adicionar filtro de ano se especificado
    if (year && year !== "all" && year !== "older") {
      queryParams += `&year=${year}`;
    } else if (year === "older") {
      // Para artigos mais antigos, podemos usar um range de anos
      queryParams += `&date=before-2018`;
    }

    // Adicionar ordenação
    if (sort === "date_desc") {
      queryParams += `&sort=date&order=desc`;
    } else if (sort === "date_asc") {
      queryParams += `&sort=date&order=asc`;
    }

    // Construir a URL para a API do Springer
    const apiUrl = `${SPRINGER_API_BASE}?${queryParams}`;

    console.log(`[Springer] URL da requisição: ${apiUrl}`);

    const response = await fetchWithRetry(apiUrl);

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
        `[Springer] API retornou status ${response.status}: ${response.statusText}${errorDetails}`
      );

      // Se a API falhar, usar o método alternativo
      return createSpringerRedirectArticle(query, year);
    }

    const data = await response.json();
    console.log(`[Springer] Resposta da API:`, data);

    if (!data.records || data.records.length === 0) {
      console.log("[Springer] Nenhum resultado encontrado");
      return [];
    }

    console.log(`[Springer] Encontrados ${data.records.length} artigos`);

    // Converter os resultados para o formato padrão da aplicação
    const articles: Article[] = data.records.map((record: any) => {
      // Extrair autores
      const authors =
        record.creators?.map((creator: any) => creator.creator).join(", ") ||
        "Autores não disponíveis";

      // Determinar o idioma
      let language = "Inglês"; // Padrão
      if (record.language) {
        if (record.language === "pt") language = "Português";
        else if (record.language === "es") language = "Espanhol";
      }

      // Extrair palavras-chave
      const keywords = record.subjects?.map((subject: any) => subject) || [];

      // Extrair DOI
      const doi = record.doi || null;

      // Gerar ID único
      const id = `springer-${
        record.identifier || Math.random().toString(36).substring(2, 15)
      }`;

      // Extrair ano
      const year = record.publicationDate
        ? record.publicationDate.substring(0, 4)
        : "Ano não disponível";

      return {
        id,
        title: record.title || "Título não disponível",
        authors,
        journal: record.publicationName || "Revista não disponível",
        year,
        language,
        abstract: record.abstract || "Resumo não disponível",
        content: `<h2>Abstract</h2><p>${
          record.abstract || "Resumo não disponível"
        }</p>`,
        keywords,
        references: [],
        doi,
        url: record.url || (doi ? `https://doi.org/${doi}` : null),
        source: "Springer",
      };
    });

    return articles;
  } catch (error) {
    const { year } = options;
    console.error("[Springer] Erro ao buscar artigos:", error);
    // Em caso de erro, usar o método alternativo
    return createSpringerRedirectArticle(query, year);
  }
}

// Função para criar um artigo de redirecionamento para o Springer
function createSpringerRedirectArticle(
  query: string,
  year?: string
): Article[] {
  // Construir a URL de pesquisa do Springer
  let searchUrl = `https://link.springer.com/search?query=${encodeURIComponent(
    query
  )}`;

  // Adicionar filtro de ano se especificado
  if (year && year !== "all" && year !== "older") {
    searchUrl += `&date-facet-mode=in&facet-start-year=${year}&facet-end-year=${year}`;
  } else if (year === "older") {
    searchUrl += `&date-facet-mode=in&facet-start-year=1900&facet-end-year=2017`;
  }

  // Criar um único resultado que direciona para a página de pesquisa
  return [
    {
      id: `springer-redirect-${Date.now()}`,
      title: `Resultados do Springer para "${query}"`,
      authors: "Diversos autores",
      journal: "Springer - Editora científica",
      year: year || "Todos os anos",
      language: "Diversos",
      abstract: `Sua pesquisa por "${query}" encontrará resultados no Springer. Clique em "Acessar resultados" para ver todos os artigos encontrados diretamente no site do Springer.`,
      content: `<h2>Resultados do Springer</h2>
             <p>Sua pesquisa por "${query}" encontrará resultados no Springer.</p>
             <p>Devido a limitações de acesso à API, não é possível exibir os resultados detalhados diretamente nesta aplicação.</p>
             <p>Por favor, clique no botão "Acessar resultados" acima para visualizar todos os artigos encontrados diretamente no site do Springer.</p>
             <p>O Springer é uma das principais editoras científicas do mundo, publicando livros, e-books e periódicos revisados por pares em ciência, tecnologia e medicina.</p>`,
      keywords: [query],
      references: [],
      doi: undefined,
      url: searchUrl,
      source: "Springer",
    },
  ];
}

// Função para obter detalhes de um artigo específico do Springer
export async function getSpringerArticleById(
  id: string,
  apiKey?: string
): Promise<Article | null> {
  try {
    // Remover o prefixo "springer-" para obter o ID real do Springer
    const springerId = id.startsWith("springer-") ? id.substring(9) : id;

    // Se for um ID de redirecionamento, criar um artigo genérico
    if (springerId.startsWith("redirect-")) {
      return {
        id: id,
        title: "Artigo do Springer",
        authors: "Informações disponíveis no site do Springer",
        journal: "Springer - Editora científica",
        year: "Informação disponível no site original",
        language: "Informação disponível no site original",
        abstract:
          "Para visualizar o resumo completo, acesse o artigo no site do Springer.",
        content: `<h2>Artigo do Springer</h2>
                 <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
                 <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do Springer.</p>
                 <p>O Springer é uma das principais editoras científicas do mundo, publicando livros, e-books e periódicos revisados por pares em ciência, tecnologia e medicina.</p>`,
        keywords: [],
        references: [],
        doi: undefined,
        url: "https://link.springer.com",
        source: "Springer",
      };
    }

    console.log(`[Springer] Buscando detalhes do artigo com ID: ${springerId}`);

    // Verificar se temos uma API key
    if (!apiKey) {
      console.warn(
        "[Springer] API key não fornecida. A API do Springer requer autenticação."
      );

      // Criar um artigo genérico com link para o Springer
      return {
        id: id,
        title: "Artigo do Springer",
        authors: "Informações disponíveis no site do Springer",
        journal: "Springer - Editora científica",
        year: "Informação disponível no site original",
        language: "Informação disponível no site original",
        abstract:
          "Para visualizar o resumo completo, acesse o artigo no site do Springer.",
        content: `<h2>Artigo do Springer</h2>
                 <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
                 <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do Springer.</p>
                 <p>O Springer é uma das principais editoras científicas do mundo, publicando livros, e-books e periódicos revisados por pares em ciência, tecnologia e medicina.</p>`,
        keywords: [],
        references: [],
        doi: undefined,
        url: `https://doi.org/${springerId}`,
        source: "Springer",
      };
    }

    // Construir a URL para a API do Springer
    const apiUrl = `${SPRINGER_API_BASE}?q=doi:${springerId}&api_key=${apiKey}`;

    const response = await fetchWithRetry(apiUrl);

    if (!response.ok) {
      // Criar um artigo genérico com link para o Springer
      return {
        id: id,
        title: "Artigo do Springer",
        authors: "Informações disponíveis no site do Springer",
        journal: "Springer - Editora científica",
        year: "Informação disponível no site original",
        language: "Informação disponível no site original",
        abstract:
          "Para visualizar o resumo completo, acesse o artigo no site do Springer.",
        content: `<h2>Artigo do Springer</h2>
                 <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
                 <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do Springer.</p>
                 <p>O Springer é uma das principais editoras científicas do mundo, publicando livros, e-books e periódicos revisados por pares em ciência, tecnologia e medicina.</p>`,
        keywords: [],
        references: [],
        doi: undefined,
        url: `https://doi.org/${springerId}`,
        source: "Springer",
      };
    }

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      console.log("[Springer] Artigo não encontrado");
      return null;
    }

    const record = data.records[0];

    // Extrair autores
    const authors =
      record.creators?.map((creator: any) => creator.creator).join(", ") ||
      "Autores não disponíveis";

    // Determinar o idioma
    let language = "Inglês"; // Padrão
    if (record.language) {
      if (record.language === "pt") language = "Português";
      else if (record.language === "es") language = "Espanhol";
    }

    // Extrair palavras-chave
    const keywords = record.subjects?.map((subject: any) => subject) || [];

    // Extrair DOI
    const doi = record.doi || null;

    // Extrair ano
    const year = record.publicationDate
      ? record.publicationDate.substring(0, 4)
      : "Ano não disponível";

    // Formatar o conteúdo como HTML
    const content = `
      <h2>Abstract</h2>
      <p>${record.abstract || "Resumo não disponível"}</p>
      ${
        record.url
          ? `<p><a href="${record.url}" target="_blank" rel="noopener noreferrer">Ver artigo completo no Springer</a></p>`
          : ""
      }
      ${
        doi
          ? `<p><a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">Ver via DOI</a></p>`
          : ""
      }
    `;

    const article: Article = {
      id: `springer-${springerId}`,
      title: record.title || "Título não disponível",
      authors,
      journal: record.publicationName || "Revista não disponível",
      year,
      language,
      abstract: record.abstract || "Resumo não disponível",
      content,
      keywords,
      references: [],
      doi,
      url: record.url || (doi ? `https://doi.org/${doi}` : null),
      source: "Springer",
    };

    return article;
  } catch (error) {
    console.error("[Springer] Erro ao buscar detalhes do artigo:", error);

    // Em caso de erro, criar um artigo genérico com link para o Springer
    return {
      id: id,
      title: "Artigo do Springer",
      authors: "Informações disponíveis no site do Springer",
      journal: "Springer - Editora científica",
      year: "Informação disponível no site original",
      language: "Informação disponível no site original",
      abstract:
        "Para visualizar o resumo completo, acesse o artigo no site do Springer.",
      content: `<h2>Artigo do Springer</h2>
               <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
               <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do Springer.</p>
               <p>O Springer é uma das principais editoras científicas do mundo, publicando livros, e-books e periódicos revisados por pares em ciência, tecnologia e medicina.</p>`,
      keywords: [],
      references: [],
      doi: undefined,
      url: `https://doi.org/${id.replace("springer-", "")}`,
      source: "Springer",
    };
  }
}
