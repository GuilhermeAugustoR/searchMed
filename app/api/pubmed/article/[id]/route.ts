import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCache, setCache } from "@/lib/cache";
import { fetchWithRetry, requestLimiter } from "@/lib/api-helper";

// Base URL para a API do PubMed E-utilities
const PUBMED_API_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Aguardar a resolução de params antes de acessar suas propriedades
  const { id } = params;
  const cacheKey = `article:${id}`;

  console.log(`API PubMed: Buscando artigo com ID: ${id}`);

  // Verificar se temos o artigo em cache
  const cachedArticle = getCache(cacheKey);
  if (cachedArticle) {
    console.log(`Artigo ${id} encontrado no cache`);
    return NextResponse.json({ article: cachedArticle });
  }

  try {
    // Usar o limitador de requisições para evitar muitas requisições simultâneas
    return await requestLimiter.run(async () => {
      // Buscar detalhes do artigo usando o ID
      const summaryUrl = `${PUBMED_API_BASE}/esummary.fcgi?db=pubmed&id=${id}&retmode=json&tool=assistente-escrita&email=user@example.com`;
      console.log("Buscando detalhes do artigo em:", summaryUrl);

      const summaryResponse = await fetchWithRetry(summaryUrl);
      if (!summaryResponse.ok) {
        throw new Error(
          `Erro na API do PubMed: ${summaryResponse.status} ${summaryResponse.statusText}`
        );
      }

      const summaryData = await summaryResponse.json();

      if (!summaryData.result || !summaryData.result[id]) {
        console.log("Artigo não encontrado na API do PubMed");
        return NextResponse.json(
          { error: "Artigo não encontrado" },
          { status: 404 }
        );
      }

      const articleData = summaryData.result[id];

      // Buscar o abstract completo
      const efetchUrl = `${PUBMED_API_BASE}/efetch.fcgi?db=pubmed&id=${id}&retmode=xml&tool=assistente-escrita&email=user@example.com`;
      console.log("Buscando abstract completo em:", efetchUrl);

      // Aguardar um pouco antes de fazer a segunda requisição para evitar 429
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const efetchResponse = await fetchWithRetry(efetchUrl);
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
          : [];

      // Formatar o conteúdo como HTML
      const content = `<h2>Abstract</h2><p>${abstract}</p>`;

      const article = {
        id: id,
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
        source: "PubMed",
      };

      // Armazenar o artigo em cache
      setCache(cacheKey, article);

      console.log(`API PubMed: Artigo encontrado: ${article.title}`);
      return NextResponse.json({ article });
    });
  } catch (error) {
    console.error("Erro ao buscar artigo por ID:", error);
    return NextResponse.json(
      {
        error: "Erro ao buscar artigo",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
