import type { Article } from "@/lib/types";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

interface AISearchResult {
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract: string;
  url: string;
  doi?: string;
  language: string;
}

// Tipo para os modelos de IA suportados
type AIModel = "openai" | "gemini";

export async function searchArticlesWithAI(
  query: string,
  options: {
    language?: string;
    year?: string;
    type?: string;
    limit?: number;
    sources?: string[];
    aiModel?: AIModel;
  } = {}
): Promise<{ articles: Article[]; error?: string }> {
  try {
    const {
      language = "all",
      year = "all",
      type = "keyword",
      limit = 10,
      sources = [],
      aiModel = "openai",
    } = options;

    console.log(`[AI Search] Buscando artigos com query: ${query}`, {
      ...options,
      aiModel,
      sources: sources.length > 0 ? sources : "todas",
    });

    // Construir o prompt para a API da IA
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

    // Adicionar fontes específicas se fornecidas
    if (sources && sources.length > 0) {
      prompt += `\nBusque APENAS em artigos das seguintes fontes/revistas: ${sources.join(
        ", "
      )}. `;
      prompt += `É MUITO IMPORTANTE que você retorne APENAS artigos dessas fontes específicas. `;
    } else {
      prompt += `\nInclua artigos de revistas conceituadas como The Lancet, Nature, Science, JAMA, New England Journal of Medicine, etc. `;
    }

    // Modificar o prompt para o Gemini para garantir JSON válido
    if (aiModel === "gemini") {
      prompt += `
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
      
      IMPORTANTE: Certifique-se de que o JSON retornado seja ESTRITAMENTE VÁLIDO. Não inclua comentários, explicações ou texto adicional antes ou depois do JSON. Verifique se todas as aspas, vírgulas e chaves estão corretamente formatadas.
      
      É EXTREMAMENTE IMPORTANTE que você forneça URLs válidas e diretas para os artigos originais. 
      Priorize links para o artigo completo em PDF ou HTML no site da revista ou repositório oficial.
      Se o artigo tiver um DOI, inclua-o e também forneça a URL direta baseada no DOI.
      Não invente informações. Se não encontrar artigos suficientes, retorne apenas os que encontrou.
      `;
    } else {
      prompt += `
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
      
      É EXTREMAMENTE IMPORTANTE que você forneça URLs válidas e diretas para os artigos originais. 
      Priorize links para o artigo completo em PDF ou HTML no site da revista ou repositório oficial.
      Se o artigo tiver um DOI, inclua-o e também forneça a URL direta baseada no DOI.
      Não invente informações. Se não encontrar artigos suficientes, retorne apenas os que encontrou.
      `;
    }

    try {
      // Selecionar o modelo de IA com base na opção
      let model;
      if (aiModel === "gemini") {
        model = google("gemini-1.5-pro");
      } else {
        model = openai("gpt-4o");
      }

      // Fazer a chamada para a API da IA
      const { text } = await generateText({
        model,
        prompt,
      });

      // Extrair o JSON da resposta
      const jsonStr = extractJsonFromText(text);
      console.log(
        `[AI Search] JSON a ser analisado (primeiros 100 caracteres): ${jsonStr.substring(
          0,
          100
        )}...`
      );

      // Analisar os resultados com tratamento de erro robusto
      let results: AISearchResult[] = [];
      try {
        // Tentar analisar o JSON normalmente
        results = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error(
          `[AI Search] Erro ao analisar JSON do modelo ${aiModel}:`,
          parseError
        );
        console.error(
          `[AI Search] JSON problemático: ${jsonStr.substring(0, 500)}...`
        );

        // Tentar corrigir problemas comuns de JSON e analisar novamente
        try {
          const cleanedJson = sanitizeJson(jsonStr);
          results = JSON.parse(cleanedJson);
          console.log(`[AI Search] Análise de JSON bem-sucedida após limpeza`);
        } catch (secondError) {
          console.error(
            `[AI Search] Segunda tentativa de análise falhou:`,
            secondError
          );

          // Tentar usar o parser tolerante a erros
          try {
            results = parseJsonWithFallback(jsonStr);
            console.log(
              `[AI Search] Análise de JSON bem-sucedida com parser tolerante`
            );
          } catch (thirdError) {
            console.error(
              `[AI Search] Terceira tentativa de análise falhou:`,
              thirdError
            );

            // Se estamos usando Gemini, fazer fallback para OpenAI
            if (aiModel === "gemini") {
              console.log(
                `[AI Search] Fazendo fallback para OpenAI após falha do Gemini`
              );
              return searchArticlesWithAI(query, {
                ...options,
                aiModel: "openai",
              });
            }

            // Se ainda falhar e não for possível fazer fallback, lançar erro
            throw new Error(
              `Erro ao analisar resposta do modelo ${aiModel}. O modelo retornou um JSON inválido.`
            );
          }
        }
      }

      // Converter para o formato de artigo da aplicação
      const articles: Article[] = results.map((result, index) => {
        // Gerar ID único para o artigo
        const id = `ai-${aiModel}-${Date.now()}-${index}`;

        // Determinar o idioma
        const language = result.language || "Inglês";

        // Extrair palavras-chave do título e resumo
        const keywords = extractKeywords(result.title, result.abstract);

        // Garantir que temos uma URL válida e absoluta
        let url =
          result.url || (result.doi ? `https://doi.org/${result.doi}` : null);

        // Garantir que a URL seja absoluta
        if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
          url = `https://${url}`;
        }

        console.log(`[AI Search] Criando artigo com ID: ${id}`);

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
          url,
          source: `${aiModel === "gemini" ? "Gemini" : "OpenAI"} Search`,
        };
      });

      console.log(`[AI Search] Encontrados ${articles.length} artigos`);
      return { articles };
    } catch (error: any) {
      // Verificar se é um erro de cota excedida
      if (
        error.message?.includes("quota") ||
        error.message?.includes("insufficient_quota") ||
        error.lastError?.message?.includes("quota") ||
        error.lastError?.message?.includes("insufficient_quota")
      ) {
        console.error(
          `[AI Search] Erro de cota excedida no modelo ${aiModel}:`,
          error
        );
        return {
          articles: [],
          error: `Cota da ${
            aiModel === "gemini" ? "Google" : "OpenAI"
          } excedida. Por favor, verifique seu plano e detalhes de faturamento.`,
        };
      }

      // Se estamos usando Gemini e ocorreu um erro, fazer fallback para OpenAI
      if (aiModel === "gemini" && !error.message?.includes("quota")) {
        console.log(
          `[AI Search] Fazendo fallback para OpenAI após erro do Gemini:`,
          error.message
        );
        return searchArticlesWithAI(query, { ...options, aiModel: "openai" });
      }

      // Outros erros da API
      console.error(`[AI Search] Erro na API de ${aiModel}:`, error);
      return {
        articles: [],
        error: `Erro ao comunicar com a API de ${
          aiModel === "gemini" ? "Google" : "OpenAI"
        }. Por favor, tente novamente mais tarde.`,
      };
    }
  } catch (error) {
    console.error("[AI Search] Erro ao buscar artigos:", error);
    return {
      articles: [],
      error:
        error instanceof Error
          ? error.message
          : "Erro ao buscar artigos com IA",
    };
  }
}

// Função para extrair JSON de texto
function extractJsonFromText(text: string): string {
  // Tentar extrair JSON de blocos de código
  if (text.includes("```json")) {
    return text.split("```json")[1].split("```")[0].trim();
  } else if (text.includes("```")) {
    return text.split("```")[1].split("```")[0].trim();
  }

  // Tentar extrair array JSON
  const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }

  // Tentar extrair objeto JSON
  const objectMatch = text.match(/\{\s*"[\s\S]*"\s*:\s*[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0];
  }

  // Se não conseguir extrair, retornar o texto original
  return text;
}

// Função para sanitizar o JSON antes de analisá-lo
function sanitizeJson(jsonStr: string): string {
  // Remover caracteres de controle
  let cleaned = jsonStr.replace(/[\u0000-\u001F]+/g, " ");

  // Corrigir problemas comuns de formatação
  cleaned = cleaned
    // Remover vírgulas extras no final de objetos ou arrays
    .replace(/,\s*\}/g, "}")
    .replace(/,\s*\]/g, "]")
    // Adicionar vírgulas faltantes entre objetos
    .replace(/\}\s*\{/g, "},{")
    // Corrigir aspas inconsistentes
    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
    // Substituir aspas simples por aspas duplas em valores
    .replace(/:\s*'([^']*)'/g, ': "$1"')
    // Remover caracteres inválidos entre valores e vírgulas
    .replace(/("[^"]*")\s*([^\s,{}[\]])+\s*,/g, "$1,")
    // Remover caracteres inválidos entre valores e fechamento de objetos
    .replace(/("[^"]*")\s*([^\s,{}[\]])+\s*\}/g, "$1}")
    // Remover caracteres inválidos entre valores e fechamento de arrays
    .replace(/("[^"]*")\s*([^\s,{}[\]])+\s*\]/g, "$1]");

  return cleaned;
}

// Parser de JSON tolerante a erros
function parseJsonWithFallback(jsonStr: string): any[] {
  // Tentar extrair objetos individuais
  const objects: any[] = [];
  const regex = /\{[^{}]*\}/g;
  let match;

  while ((match = regex.exec(jsonStr)) !== null) {
    try {
      // Tentar analisar cada objeto individualmente
      const obj = JSON.parse(match[0]);

      // Verificar se o objeto tem as propriedades necessárias
      if (obj.title && obj.authors && obj.journal && obj.year && obj.abstract) {
        objects.push(obj);
      }
    } catch (e) {
      // Ignorar objetos que não podem ser analisados
      console.log(
        `[AI Search] Ignorando objeto JSON inválido: ${match[0].substring(
          0,
          50
        )}...`
      );
    }
  }

  // Se encontramos pelo menos um objeto válido, retornar a lista
  if (objects.length > 0) {
    return objects;
  }

  // Se não encontramos nenhum objeto válido, lançar erro
  throw new Error("Não foi possível extrair objetos JSON válidos da resposta");
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

// Função para obter detalhes de um artigo específico usando IA
export async function getArticleDetailsWithAI(
  articleInfo: Partial<Article>,
  aiModel: AIModel = "openai"
): Promise<{ article: Article | null; error?: string }> {
  try {
    console.log(
      `[AI Search] Buscando detalhes do artigo: ${articleInfo.title}`
    );

    // Se não temos informações suficientes, retornar erro
    if (!articleInfo.title && !articleInfo.doi && !articleInfo.url) {
      return {
        article: null,
        error: "Informações insuficientes para buscar detalhes do artigo",
      };
    }

    // Construir o prompt para a API da IA
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

    // Modificar o prompt para o Gemini para garantir JSON válido
    if (aiModel === "gemini") {
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
      
      IMPORTANTE: Certifique-se de que o JSON retornado seja ESTRITAMENTE VÁLIDO. Não inclua comentários, explicações ou texto adicional antes ou depois do JSON. Verifique se todas as aspas, vírgulas e chaves estão corretamente formatadas.
      
      É EXTREMAMENTE IMPORTANTE que você forneça uma URL válida e direta para o artigo original.
      Priorize links para o artigo completo em PDF ou HTML no site da revista ou repositório oficial.
      Se o artigo tiver um DOI, inclua-o e também forneça a URL direta baseada no DOI.
      Certifique-se de que as informações sejam precisas e completas. Não invente informações que não puder encontrar.
      Para o campo 'content', forneça o conteúdo principal do artigo em formato HTML, com tags <h2> para seções e <p> para parágrafos.
      `;
    } else {
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
      
      É EXTREMAMENTE IMPORTANTE que você forneça uma URL válida e direta para o artigo original.
      Priorize links para o artigo completo em PDF ou HTML no site da revista ou repositório oficial.
      Se o artigo tiver um DOI, inclua-o e também forneça a URL direta baseada no DOI.
      Certifique-se de que as informações sejam precisas e completas. Não invente informações que não puder encontrar.
      Para o campo 'content', forneça o conteúdo principal do artigo em formato HTML, com tags <h2> para seções e <p> para parágrafos.
      `;
    }

    try {
      // Selecionar o modelo de IA com base na opção
      let model;
      if (aiModel === "gemini") {
        model = google("gemini-1.5-pro");
      } else {
        model = openai("gpt-4o");
      }

      // Fazer a chamada para a API da IA
      const { text } = await generateText({
        model,
        prompt,
      });

      // Extrair o JSON da resposta
      const jsonStr = extractJsonFromText(text);
      console.log(
        `[AI Search] JSON a ser analisado (primeiros 100 caracteres): ${jsonStr.substring(
          0,
          100
        )}...`
      );

      // Analisar os resultados com tratamento de erro robusto
      let result: any = {};
      try {
        result = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error(
          `[AI Search] Erro ao analisar JSON do modelo ${aiModel}:`,
          parseError
        );
        console.error(
          `[AI Search] JSON problemático: ${jsonStr.substring(0, 500)}...`
        );

        // Tentar corrigir problemas comuns de JSON e analisar novamente
        try {
          const cleanedJson = sanitizeJson(jsonStr);
          result = JSON.parse(cleanedJson);
          console.log(`[AI Search] Análise de JSON bem-sucedida após limpeza`);
        } catch (secondError) {
          console.error(
            `[AI Search] Segunda tentativa de análise falhou:`,
            secondError
          );

          // Se estamos usando Gemini, fazer fallback para OpenAI
          if (aiModel === "gemini") {
            console.log(
              `[AI Search] Fazendo fallback para OpenAI após falha do Gemini`
            );
            return getArticleDetailsWithAI(articleInfo, "openai");
          }

          // Se ainda falhar e não for possível fazer fallback, lançar erro
          throw new Error(
            `Erro ao analisar resposta do modelo ${aiModel}. O modelo retornou um JSON inválido.`
          );
        }
      }

      // Gerar ID único para o artigo
      const id =
        articleInfo.id ||
        `ai-${aiModel}-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 9)}`;

      // Garantir que temos uma URL válida e absoluta
      let url =
        result.url || (result.doi ? `https://doi.org/${result.doi}` : null);

      // Garantir que a URL seja absoluta
      if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }

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
        url,
        source: `${aiModel === "gemini" ? "Gemini" : "OpenAI"} Search`,
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
        console.error(
          `[AI Search] Erro de cota excedida no modelo ${aiModel}:`,
          error
        );
        return {
          article: null,
          error: `Cota da ${
            aiModel === "gemini" ? "Google" : "OpenAI"
          } excedida. Por favor, verifique seu plano e detalhes de faturamento.`,
        };
      }

      // Se estamos usando Gemini e ocorreu um erro, fazer fallback para OpenAI
      if (aiModel === "gemini" && !error.message?.includes("quota")) {
        console.log(
          `[AI Search] Fazendo fallback para OpenAI após erro do Gemini:`,
          error.message
        );
        return getArticleDetailsWithAI(articleInfo, "openai");
      }

      // Outros erros da API
      console.error(`[AI Search] Erro na API de ${aiModel}:`, error);
      return {
        article: null,
        error: `Erro ao comunicar com a API de ${
          aiModel === "gemini" ? "Google" : "OpenAI"
        }. Por favor, tente novamente mais tarde.`,
      };
    }
  } catch (error) {
    console.error("[AI Search] Erro ao buscar detalhes do artigo:", error);
    return {
      article: null,
      error:
        error instanceof Error
          ? error.message
          : "Erro ao buscar detalhes do artigo com IA",
    };
  }
}
