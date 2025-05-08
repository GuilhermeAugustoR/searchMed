import type { Article } from "@/lib/types";

// URL correta para a API do DOAJ (Directory of Open Access Journals)
const DOAJ_API_BASE = "https://doaj.org/api/search/articles";

// Função para buscar artigos do DOAJ
export async function searchDOAJ(
  query: string,
  options: {
    page?: number;
    pageSize?: number;
    year?: string;
    sort?: string;
  } = {}
): Promise<Article[]> {
  try {
    const { page = 1, pageSize = 20, year, sort = "relevance" } = options;

    console.log(`[DOAJ] Buscando artigos com query: ${query}`);

    // Usar método alternativo que redireciona para o site do DOAJ
    return createDOAJRedirectArticle(query, year);
  } catch (error) {
    console.error("[DOAJ] Erro ao buscar artigos:", error);
    // Em caso de erro, usar o método alternativo
    return createDOAJRedirectArticle(query, options.year);
  }
}

// Função para criar um artigo de redirecionamento para o DOAJ
function createDOAJRedirectArticle(query: string, year?: string): Article[] {
  // Construir a URL de pesquisa do DOAJ
  const searchUrl = `https://doaj.org/search/articles?source={"query":{"query_string":{"query":"${encodeURIComponent(
    query
  )}","default_operator":"AND"}}}`;

  // Criar um único resultado que direciona para a página de pesquisa
  return [
    {
      id: `doaj-redirect-${Date.now()}`,
      title: `Resultados do DOAJ para "${query}"`,
      authors: "Diversos autores",
      journal: "DOAJ - Directory of Open Access Journals",
      year: year || "Todos os anos",
      language: "Diversos",
      abstract: `Sua pesquisa por "${query}" encontrará resultados no DOAJ. Clique em "Acessar resultados" para ver todos os artigos encontrados diretamente no site do DOAJ.`,
      content: `<h2>Resultados do DOAJ</h2>
             <p>Sua pesquisa por "${query}" encontrará resultados no DOAJ.</p>
             <p>Devido a limitações de acesso à API, não é possível exibir os resultados detalhados diretamente nesta aplicação.</p>
             <p>Por favor, clique no botão "Acessar resultados" acima para visualizar todos os artigos encontrados diretamente no site do DOAJ.</p>
             <p>O DOAJ (Directory of Open Access Journals) é um diretório online que indexa e fornece acesso a revistas de alta qualidade, de acesso aberto e revisadas por pares.</p>`,
      keywords: [query],
      references: [],
      doi: undefined,
      url: searchUrl,
      source: "DOAJ",
    },
  ];
}

// Função para obter detalhes de um artigo específico do DOAJ
export async function getDOAJArticleById(id: string): Promise<Article | null> {
  try {
    // Remover o prefixo "doaj-" para obter o ID real do DOAJ
    const doajId = id.startsWith("doaj-") ? id.substring(5) : id;

    // Se for um ID de redirecionamento, criar um artigo genérico
    if (doajId.startsWith("redirect-")) {
      return {
        id: id,
        title: "Artigo do DOAJ",
        authors: "Informações disponíveis no site do DOAJ",
        journal: "DOAJ - Directory of Open Access Journals",
        year: "Informação disponível no site original",
        language: "Informação disponível no site original",
        abstract:
          "Para visualizar o resumo completo, acesse o artigo no site do DOAJ.",
        content: `<h2>Artigo do DOAJ</h2>
                 <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
                 <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do DOAJ.</p>
                 <p>O DOAJ (Directory of Open Access Journals) é um diretório online que indexa e fornece acesso a revistas de alta qualidade, de acesso aberto e revisadas por pares.</p>`,
        keywords: [],
        references: [],
        doi: undefined,
        url: "https://doaj.org",
        source: "DOAJ",
      };
    }

    console.log(`[DOAJ] Buscando detalhes do artigo com ID: ${doajId}`);

    // Criar um artigo genérico com link para o DOAJ
    return {
      id: id,
      title: "Artigo do DOAJ",
      authors: "Informações disponíveis no site do DOAJ",
      journal: "DOAJ - Directory of Open Access Journals",
      year: "Informação disponível no site original",
      language: "Informação disponível no site original",
      abstract:
        "Para visualizar o resumo completo, acesse o artigo no site do DOAJ.",
      content: `<h2>Artigo do DOAJ</h2>
               <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
               <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do DOAJ.</p>
               <p>O DOAJ (Directory of Open Access Journals) é um diretório online que indexa e fornece acesso a revistas de alta qualidade, de acesso aberto e revisadas por pares.</p>`,
      keywords: [],
      references: [],
      doi: undefined,
      url: `https://doaj.org/article/${doajId}`,
      source: "DOAJ",
    };
  } catch (error) {
    console.error("[DOAJ] Erro ao buscar detalhes do artigo:", error);

    // Em caso de erro, criar um artigo genérico com link para o DOAJ
    return {
      id: id,
      title: "Artigo do DOAJ",
      authors: "Informações disponíveis no site do DOAJ",
      journal: "DOAJ - Directory of Open Access Journals",
      year: "Informação disponível no site original",
      language: "Informação disponível no site original",
      abstract:
        "Para visualizar o resumo completo, acesse o artigo no site do DOAJ.",
      content: `<h2>Artigo do DOAJ</h2>
               <p>Devido a limitações de acesso à API, não é possível exibir os detalhes deste artigo diretamente nesta aplicação.</p>
               <p>Por favor, clique no botão "Acessar artigo original" acima para visualizar o artigo completo diretamente no site do DOAJ.</p>
               <p>O DOAJ (Directory of Open Access Journals) é um diretório online que indexa e fornece acesso a revistas de alta qualidade, de acesso aberto e revisadas por pares.</p>`,
      keywords: [],
      references: [],
      doi: undefined,
      url: `https://doaj.org/article/${id.replace("doaj-", "")}`,
      source: "DOAJ",
    };
  }
}
