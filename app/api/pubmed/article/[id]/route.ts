import { NextResponse } from "next/server";
import { getMockArticleById } from "@/lib/mock-data";
import type { Article } from "@/lib/types";

// Base URL para a API do PubMed E-utilities
const PUBMED_API_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    console.log(
      `Proxy de servidor: Recebida requisição para artigo com ID: ${id}`
    );

    // Decodificar o ID caso esteja codificado na URL
    const decodedId = decodeURIComponent(id);
    console.log(`Proxy de servidor: ID decodificado: ${decodedId}`);

    // Verificar se o ID é de um artigo simulado
    if (decodedId.startsWith("mock")) {
      console.log(
        `Proxy de servidor: Buscando artigo simulado com ID: ${decodedId}`
      );
      const mockArticle = getMockArticleById(decodedId);
      if (mockArticle) {
        return NextResponse.json({ article: mockArticle });
      } else {
        return NextResponse.json(
          { error: "Artigo simulado não encontrado" },
          { status: 404 }
        );
      }
    }

    // Buscar detalhes do artigo usando o ID
    const summaryUrl = `${PUBMED_API_BASE}/esummary.fcgi?db=pubmed&id=${decodedId}&retmode=json`;
    console.log(
      "Proxy de servidor: Buscando detalhes do artigo em:",
      summaryUrl
    );

    const summaryResponse = await fetch(summaryUrl);
    if (!summaryResponse.ok) {
      throw new Error(
        `Erro na API do PubMed: ${summaryResponse.status} ${summaryResponse.statusText}`
      );
    }

    const summaryData = await summaryResponse.json();

    if (!summaryData.result || !summaryData.result[decodedId]) {
      console.log("Proxy de servidor: Artigo não encontrado na API do PubMed");
      return NextResponse.json(
        { error: "Artigo não encontrado" },
        { status: 404 }
      );
    }

    const articleData = summaryData.result[decodedId];

    // Buscar o abstract completo
    const efetchUrl = `${PUBMED_API_BASE}/efetch.fcgi?db=pubmed&id=${decodedId}&retmode=xml`;
    console.log("Proxy de servidor: Buscando abstract completo em:", efetchUrl);

    const efetchResponse = await fetch(efetchUrl);
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
        : ["medicina", "pesquisa"];

    // Formatar o conteúdo como HTML
    const content = `<h2>Abstract</h2><p>${abstract}</p>`;

    const article: Article = {
      id: decodedId,
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
      url: `https://pubmed.ncbi.nlm.nih.gov/${decodedId}/`,
    };

    console.log(`Proxy de servidor: Artigo encontrado: ${article.title}`);
    return NextResponse.json({ article });
  } catch (error: any) {
    console.error("Proxy de servidor: Erro ao buscar artigo por ID:", error);
    return NextResponse.json(
      { error: "Erro ao buscar artigo", message: error.message },
      { status: 500 }
    );
  }
}
