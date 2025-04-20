import type { Article } from "@/lib/types";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

interface OpenAISearchResult {
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract: string;
  url: string;
  doi?: string;
  language: string;
}

export async function searchArticlesWithOpenAI(
  query: string,
  options: {
    language?: string;
    year?: string;
    type?: string;
    limit?: number;
  } = {}
): Promise<{ articles: Article[]; error?: string }> {
  try {
    console.log(
      `[OpenAI Search] Buscando artigos com query: ${query}`,
      options
    );

    const {
      language = "all",
      year = "all",
      type = "keyword",
      limit = 10,
    } = options;

    // Construir o prompt para a API da OpenAI
    let prompt = `Busque artigos científicos médicos sobre "${query}". `;

    // Adicionar filtros ao prompt
    if (language && language !== "all") {
      const languageMap: Record<string, string> = {
        en: "inglês",
        pt: "português",
        es: "espanhol",
      };
      prompt += `Apenas artigos em ${languageMap[language] || language}. `;
    }

    if (year && year !== "all") {
      if (year === "older") {
        prompt += `Apenas artigos publicados antes de 2018. `;
      } else {
        prompt += `Apenas artigos publicados em ${year}. `;
      }
    }

    if (type && type !== "keyword") {
      const typeMap: Record<string, string> = {
        title: "no título",
        author: "do autor",
        journal: "da revista",
      };
      prompt += `Busque por "${query}" ${typeMap[type] || ""}. `;
    }

    prompt += `
    Inclua artigos de revistas conceituadas como The Lancet, Nature, Science, JAMA, New England Journal of Medicine, etc.
    
    Retorne exatamente ${limit} resultados no seguinte formato JSON:
    [
      {
        "title": "Título completo do artigo",
        "authors": "Lista de autores principais",
        "journal": "Nome da revista ou jornal",
        "year": "Ano de publicação",
        "abstract": "Resumo do artigo (2-3 frases)",
        "url": "URL direta para o artigo",
        "doi": "DOI do artigo, se disponível",
        "language": "Idioma do artigo (Inglês, Português ou Espanhol)"
      }
    ]
    
    Certifique-se de que as URLs sejam válidas e apontem diretamente para os artigos. Não invente informações.
    Se não encontrar artigos suficientes, retorne apenas os que encontrou.
    `;

    try {
      // Fazer a chamada para a API da OpenAI
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
      });

      // Extrair o JSON da resposta
      let jsonStr = text;
      if (text.includes("```json")) {
        jsonStr = text.split("```json")[1].split("```")[0].trim();
      } else if (text.includes("```")) {
        jsonStr = text.split("```")[1].split("```")[0].trim();
      }

      // Analisar os resultados
      const results: OpenAISearchResult[] = JSON.parse(jsonStr);

      // Converter para o formato de artigo da aplicação
      const articles: Article[] = results.map((result, index) => {
        // Gerar ID único para o artigo
        const id = `openai-${Date.now()}-${index}`;

        // Determinar o idioma
        const language = result.language || "Inglês";

        // Extrair palavras-chave do título e resumo
        const keywords = extractKeywords(result.title, result.abstract);

        return {
          id,
          title: result.title,
          authors: result.authors,
          journal: result.journal,
          year: result.year,
          language,
          abstract: result.abstract,
          content: `<h2>Abstract</h2><p>${result.abstract}</p>`,
          keywords,
          references: [],
          doi: result.doi,
          url: result.url,
          source: "OpenAI Search",
        };
      });

      console.log(`[OpenAI Search] Encontrados ${articles.length} artigos`);
      return { articles };
    } catch (error: any) {
      // Verificar se é um erro de cota excedida
      if (
        error.message?.includes("quota") ||
        error.message?.includes("insufficient_quota") ||
        error.lastError?.message?.includes("quota") ||
        error.lastError?.message?.includes("insufficient_quota")
      ) {
        console.error("[OpenAI Search] Erro de cota excedida:", error);
        return {
          articles: [],
          error:
            "Cota da OpenAI excedida. Por favor, verifique seu plano e detalhes de faturamento na plataforma OpenAI.",
        };
      }

      // Outros erros da API
      console.error("[OpenAI Search] Erro na API da OpenAI:", error);
      return {
        articles: [],
        error:
          "Erro ao comunicar com a API da OpenAI. Por favor, tente novamente mais tarde.",
      };
    }
  } catch (error) {
    console.error("[OpenAI Search] Erro ao buscar artigos:", error);
    return {
      articles: [],
      error:
        error instanceof Error
          ? error.message
          : "Erro ao buscar artigos com OpenAI",
    };
  }
}

// Função auxiliar para extrair palavras-chave do título e resumo
function extractKeywords(title: string, abstract: string): string[] {
  // Combinar título e resumo
  const text = `${title} ${abstract}`.toLowerCase();

  // Lista de palavras comuns a serem ignoradas
  const stopWords = [
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "with",
    "by",
    "about",
    "as",
    "of",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "shall",
    "should",
    "may",
    "might",
    "must",
    "can",
    "could",
  ];

  // Extrair palavras
  const words = text.match(/\b\w+\b/g) || [];

  // Filtrar palavras comuns e curtas
  const filteredWords = words.filter(
    (word) => word.length > 3 && !stopWords.includes(word)
  );

  // Contar frequência das palavras
  const wordCount: Record<string, number> = {};
  filteredWords.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  // Ordenar por frequência e pegar as 5 mais comuns
  const sortedWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  return sortedWords;
}

// Função para obter detalhes de um artigo específico usando OpenAI
export async function getArticleDetailsWithOpenAI(
  articleInfo: Partial<Article>
): Promise<{ article: Article | null; error?: string }> {
  try {
    console.log(
      `[OpenAI Search] Buscando detalhes do artigo: ${articleInfo.title}`
    );

    // Se não temos informações suficientes, retornar erro
    if (!articleInfo.title && !articleInfo.doi && !articleInfo.url) {
      return {
        article: null,
        error: "Informações insuficientes para buscar detalhes do artigo",
      };
    }

    // Construir o prompt para a API da OpenAI
    let prompt = `Busque informações detalhadas sobre o seguinte artigo científico:\n\n`;

    if (articleInfo.title) {
      prompt += `Título: ${articleInfo.title}\n`;
    }
    if (articleInfo.authors) {
      prompt += `Autores: ${articleInfo.authors}\n`;
    }
    if (articleInfo.journal) {
      prompt += `Revista: ${articleInfo.journal}\n`;
    }
    if (articleInfo.year) {
      prompt += `Ano: ${articleInfo.year}\n`;
    }
    if (articleInfo.doi) {
      prompt += `DOI: ${articleInfo.doi}\n`;
    }
    if (articleInfo.url) {
      prompt += `URL: ${articleInfo.url}\n`;
    }

    prompt += `
    Forneça informações completas sobre este artigo no seguinte formato JSON:
    {
      "title": "Título completo do artigo",
      "authors": "Lista completa de autores",
      "journal": "Nome completo da revista ou jornal",
      "year": "Ano de publicação",
      "abstract": "Resumo completo do artigo",
      "content": "Conteúdo principal do artigo em formato HTML, com tags <h2> para seções e <p> para parágrafos",
      "keywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3", "palavra-chave4", "palavra-chave5"],
      "references": ["Referência 1", "Referência 2", "Referência 3", "..."],
      "doi": "DOI do artigo, se disponível",
      "url": "URL direta para o artigo",
      "language": "Idioma do artigo (Inglês, Português ou Espanhol)"
    }
    
    Certifique-se de que as informações sejam precisas e completas. Não invente informações que não puder encontrar.
    Para o campo 'content', forneça o conteúdo principal do artigo em formato HTML, com tags <h2> para seções e <p> para parágrafos.
    `;

    try {
      // Fazer a chamada para a API da OpenAI
      const { text } = await generateText({
        model: openai("gpt-4o"),
        prompt,
      });

      // Extrair o JSON da resposta
      let jsonStr = text;
      if (text.includes("```json")) {
        jsonStr = text.split("```json")[1].split("```")[0].trim();
      } else if (text.includes("```")) {
        jsonStr = text.split("```")[1].split("```")[0].trim();
      }

      // Analisar os resultados
      const result = JSON.parse(jsonStr);

      // Gerar ID único para o artigo
      const id =
        articleInfo.id ||
        `openai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Criar o objeto de artigo
      const article: Article = {
        id,
        title: result.title,
        authors: result.authors,
        journal: result.journal,
        year: result.year,
        language: result.language || "Inglês",
        abstract: result.abstract,
        content: result.content || `<h2>Abstract</h2><p>${result.abstract}</p>`,
        keywords: Array.isArray(result.keywords) ? result.keywords : [],
        references: Array.isArray(result.references) ? result.references : [],
        doi: result.doi,
        url: result.url,
        source: "OpenAI Search",
      };

      return { article };
    } catch (error: any) {
      // Verificar se é um erro de cota excedida
      if (
        error.message?.includes("quota") ||
        error.message?.includes("insufficient_quota") ||
        error.lastError?.message?.includes("quota") ||
        error.lastError?.message?.includes("insufficient_quota")
      ) {
        console.error("[OpenAI Search] Erro de cota excedida:", error);
        return {
          article: null,
          error:
            "Cota da OpenAI excedida. Por favor, verifique seu plano e detalhes de faturamento na plataforma OpenAI.",
        };
      }

      // Outros erros da API
      console.error("[OpenAI Search] Erro na API da OpenAI:", error);
      return {
        article: null,
        error:
          "Erro ao comunicar com a API da OpenAI. Por favor, tente novamente mais tarde.",
      };
    }
  } catch (error) {
    console.error("[OpenAI Search] Erro ao buscar detalhes do artigo:", error);
    return {
      article: null,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao buscar detalhes do artigo com OpenAI",
    };
  }
}
