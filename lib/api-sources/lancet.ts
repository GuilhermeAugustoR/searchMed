import type { Article } from "@/lib/types";

// Base URL para a API do The Lancet (Elsevier API)
const ELSEVIER_API_BASE =
  "https://api.elsevier.com/content/search/sciencedirect";

// Função para buscar artigos do The Lancet
export async function searchLancet(
  query: string,
  limit = 10
): Promise<{ articles: Article[]; error?: string }> {
  try {
    console.log(
      `[Lancet] Buscando artigos com query: ${query}, limit: ${limit}`
    );

    // Obter a chave da API do ambiente
    const API_KEY = process.env.ELSEVIER_API_KEY;

    // Verificar se a API_KEY está disponível
    if (!API_KEY) {
      console.error(
        "[Lancet] API key não configurada. Configure a variável de ambiente ELSEVIER_API_KEY."
      );
      return {
        articles: [],
        error:
          "API key do Elsevier não configurada. Configure a variável de ambiente ELSEVIER_API_KEY.",
      };
    }

    // Construir a URL para a API do Elsevier (The Lancet)
    // Filtrar apenas para artigos do The Lancet
    const apiUrl = `${ELSEVIER_API_BASE}?query=${encodeURIComponent(
      query
    )}&publication=The Lancet&count=${limit}&apiKey=${API_KEY}`;

    console.log(`[Lancet] Fazendo requisição para: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "X-ELS-APIKey": API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Lancet] Erro na API do Elsevier: ${response.status} ${response.statusText}`
      );
      console.error(`[Lancet] Detalhes do erro: ${errorText}`);

      let errorMessage = "Erro ao acessar a API do Elsevier.";

      // Verificar o tipo de erro para fornecer mensagens mais específicas
      if (response.status === 401) {
        errorMessage =
          "Erro de autorização: A API key do Elsevier não tem permissões suficientes para acessar o The Lancet.";
      } else if (response.status === 403) {
        errorMessage =
          "Acesso negado: Verifique se sua API key tem permissão para acessar o conteúdo do The Lancet.";
      } else if (response.status === 429) {
        errorMessage =
          "Limite de requisições excedido. Tente novamente mais tarde.";
      }

      return { articles: [], error: errorMessage };
    }

    const data = await response.json();
    console.log(
      `[Lancet] Encontrados ${data.searchResults?.entry?.length || 0} artigos`
    );

    // Se não houver resultados, retornar array vazio
    if (!data.searchResults?.entry || data.searchResults.entry.length === 0) {
      console.log("[Lancet] Nenhum resultado encontrado");
      return { articles: [] };
    }

    // Converter os resultados para o formato padrão da aplicação
    const articles: Article[] = data.searchResults.entry.map((entry: any) => {
      // Extrair autores
      const authors = entry.author
        ? entry.author.join(", ")
        : "Autores não disponíveis";

      // Determinar o idioma (assumindo inglês para The Lancet)
      const language = "Inglês";

      // Extrair DOI
      const doi = entry.prism?.doi || null;

      // Gerar ID único prefixado para identificar a fonte
      const id = `lancet-${
        entry.prism?.doi?.replace(/\//g, "_") ||
        Math.random().toString(36).substring(2, 15)
      }`;

      // Extrair abstract
      const abstract = entry.description || "Resumo não disponível";

      // Extrair palavras-chave
      const keywords = entry.subject
        ? entry.subject.split(",").map((s: string) => s.trim())
        : [];

      return {
        id,
        title: entry.title || "Título não disponível",
        authors,
        journal: entry["prism:publicationName"] || "The Lancet",
        year: entry["prism:coverDate"]
          ? new Date(entry["prism:coverDate"]).getFullYear().toString()
          : "Ano não disponível",
        language,
        abstract,
        content: `<h2>Abstract</h2><p>${abstract}</p>`,
        keywords,
        references: [],
        doi,
        url:
          entry.link?.[0]?.["@href"] ||
          `https://www.thelancet.com/journals/lancet/article/${doi}`,
        source: "The Lancet",
      };
    });

    return { articles };
  } catch (error) {
    console.error("[Lancet] Erro ao buscar artigos:", error);
    return {
      articles: [],
      error:
        "Erro ao processar a resposta da API do Elsevier. Verifique os logs para mais detalhes.",
    };
  }
}

// Função para obter detalhes de um artigo específico do The Lancet
export async function getLancetArticleById(
  id: string
): Promise<{ article: Article | null; error?: string }> {
  try {
    // Remover o prefixo "lancet-" e converter de volta para o formato DOI
    const doi = id.startsWith("lancet-")
      ? id.substring(7).replace(/_/g, "/")
      : id;

    console.log(`[Lancet] Buscando detalhes do artigo com DOI: ${doi}`);

    // Obter a chave da API do ambiente
    const API_KEY = process.env.ELSEVIER_API_KEY;

    // Verificar se a API_KEY está disponível
    if (!API_KEY) {
      console.error(
        "[Lancet] API key não configurada. Configure a variável de ambiente ELSEVIER_API_KEY."
      );
      return {
        article: null,
        error:
          "API key do Elsevier não configurada. Configure a variável de ambiente ELSEVIER_API_KEY.",
      };
    }

    // Construir a URL para a API do Elsevier
    const apiUrl = `https://api.elsevier.com/content/article/doi/${encodeURIComponent(
      doi
    )}?apiKey=${API_KEY}`;

    console.log(`[Lancet] Fazendo requisição para: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
        "X-ELS-APIKey": API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Lancet] Erro na API do Elsevier: ${response.status} ${response.statusText}`
      );
      console.error(`[Lancet] Detalhes do erro: ${errorText}`);

      let errorMessage = "Erro ao acessar a API do Elsevier.";

      // Verificar o tipo de erro para fornecer mensagens mais específicas
      if (response.status === 401) {
        errorMessage =
          "Erro de autorização: A API key do Elsevier não tem permissões suficientes para acessar o The Lancet.";
      } else if (response.status === 403) {
        errorMessage =
          "Acesso negado: Verifique se sua API key tem permissão para acessar o conteúdo do The Lancet.";
      } else if (response.status === 429) {
        errorMessage =
          "Limite de requisições excedido. Tente novamente mais tarde.";
      }

      return { article: null, error: errorMessage };
    }

    const data = await response.json();

    const article = data["full-text-retrieval-response"];

    if (!article) {
      console.log("[Lancet] Artigo não encontrado na API do Elsevier");
      return {
        article: null,
        error: "Artigo não encontrado na API do Elsevier",
      };
    }

    // Extrair autores
    const authors = article.authors?.author
      ?.map((author: any) => {
        return `${author["surname"] || ""}, ${
          author["given-name"] || ""
        }`.trim();
      })
      .join(", ");

    // Determinar o idioma (assumindo inglês para The Lancet)
    const language = "Inglês";

    // Extrair abstract
    const abstract =
      article.coredata?.["dc:description"] || "Resumo não disponível";

    // Extrair palavras-chave
    const keywords = article.coredata?.["prism:keyword"]
      ? article.coredata["prism:keyword"]
          .split(",")
          .map((s: string) => s.trim())
      : [];

    // Formatar o conteúdo como HTML
    const content = article.originalText
      ? `<div class="lancet-article">${article.originalText}</div>`
      : `<h2>Abstract</h2><p>${abstract}</p>`;

    // Extrair referências
    const references =
      article.references?.reference?.map((ref: any) => ref["ref-fulltext"]) ||
      [];

    const articleObj: Article = {
      id: `lancet-${doi.replace(/\//g, "_")}`,
      title: article.coredata?.["dc:title"] || "Título não disponível",
      authors: authors || "Autores não disponíveis",
      journal: article.coredata?.["prism:publicationName"] || "The Lancet",
      year: article.coredata?.["prism:coverDate"]
        ? new Date(article.coredata["prism:coverDate"]).getFullYear().toString()
        : "Ano não disponível",
      language,
      abstract,
      content,
      keywords,
      references,
      doi,
      url:
        article.coredata?.["prism:url"] ||
        `https://www.thelancet.com/journals/lancet/article/${doi}`,
      source: "The Lancet",
    };

    return { article: articleObj };
  } catch (error) {
    console.error("[Lancet] Erro ao buscar detalhes do artigo:", error);
    return {
      article: null,
      error:
        "Erro ao processar a resposta da API do Elsevier. Verifique os logs para mais detalhes.",
    };
  }
}
