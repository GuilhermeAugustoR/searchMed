import type { Article } from "./types";

// Dados simulados para quando a API do PubMed não estiver disponível
export const mockArticles: Article[] = [
  {
    id: "mock1",
    title: "Avanços recentes no tratamento de doenças cardiovasculares",
    authors: "Silva, J., Oliveira, M., Santos, P.",
    journal: "Revista Brasileira de Cardiologia",
    year: "2023",
    language: "Português",
    abstract:
      "Este artigo revisa os avanços mais recentes no tratamento de doenças cardiovasculares, incluindo novas terapias medicamentosas, procedimentos minimamente invasivos e abordagens de prevenção baseadas em evidências. São discutidos os resultados de estudos clínicos recentes e suas implicações para a prática médica.",
    content:
      "<h2>Abstract</h2><p>Este artigo revisa os avanços mais recentes no tratamento de doenças cardiovasculares, incluindo novas terapias medicamentosas, procedimentos minimamente invasivos e abordagens de prevenção baseadas em evidências. São discutidos os resultados de estudos clínicos recentes e suas implicações para a prática médica.</p><h2>Introdução</h2><p>As doenças cardiovasculares continuam sendo a principal causa de mortalidade em todo o mundo. Nos últimos anos, avanços significativos foram feitos no desenvolvimento de novos tratamentos e na melhoria dos existentes.</p>",
    keywords: [
      "cardiologia",
      "tratamento",
      "doenças cardiovasculares",
      "medicina baseada em evidências",
    ],
    references: [
      "Johnson A, et al. New approaches in cardiovascular medicine. N Engl J Med. 2022;387(12):1089-1098.",
      "Martinez C, et al. Minimally invasive procedures in cardiology. Circulation. 2023;145(8):623-635.",
      "Patel R, et al. Prevention strategies for cardiovascular disease. JAMA. 2022;327(19):1949-1960.",
    ],
    doi: "10.1234/rbcard.2023.001",
    url: "https://example.com/article1",
  },
  {
    id: "mock2",
    title: "The Impact of Artificial Intelligence on Medical Diagnostics",
    authors: "Johnson, R., Williams, S., Brown, T.",
    journal: "Journal of Medical Informatics",
    year: "2023",
    language: "Inglês",
    abstract:
      "This paper examines the growing role of artificial intelligence in medical diagnostics, with a focus on machine learning algorithms for image analysis. We review recent studies demonstrating the effectiveness of AI in detecting various conditions and discuss the challenges and ethical considerations of implementing these technologies in clinical practice.",
    content:
      "<h2>Abstract</h2><p>This paper examines the growing role of artificial intelligence in medical diagnostics, with a focus on machine learning algorithms for image analysis. We review recent studies demonstrating the effectiveness of AI in detecting various conditions and discuss the challenges and ethical considerations of implementing these technologies in clinical practice.</p><h2>Introduction</h2><p>Artificial intelligence (AI) is rapidly transforming healthcare, particularly in the field of medical diagnostics. Machine learning algorithms have shown remarkable accuracy in analyzing medical images and identifying patterns that may be difficult for human observers to detect.</p>",
    keywords: [
      "artificial intelligence",
      "medical diagnostics",
      "machine learning",
      "healthcare technology",
    ],
    references: [
      "Lee H, et al. Deep learning in medical imaging: general overview. Korean J Radiol. 2023;24(1):10-24.",
      "Chen M, et al. Development and validation of a deep learning algorithm for detection of diabetic retinopathy. JAMA. 2022;318(22):2211-2223.",
      "Wang P, et al. Ethical considerations in AI-based medical diagnostics. Lancet Digital Health. 2023;5(3):e129-e138.",
    ],
    doi: "10.5678/jmi.2023.002",
    url: "https://example.com/article2",
  },
  {
    id: "mock3",
    title: "Microbiota intestinal e sua relação com doenças autoimunes",
    authors: "Costa, A., Ferreira, L., Mendes, R.",
    journal: "Revista de Imunologia Clínica",
    year: "2022",
    language: "Português",
    abstract:
      "Esta revisão sistemática analisa a relação entre a microbiota intestinal e o desenvolvimento de doenças autoimunes. São apresentadas evidências recentes sobre como alterações na composição da microbiota podem influenciar a resposta imunológica e contribuir para o surgimento de condições como artrite reumatoide, lúpus eritematoso sistêmico e esclerose múltipla.",
    content:
      "<h2>Abstract</h2><p>Esta revisão sistemática analisa a relação entre a microbiota intestinal e o desenvolvimento de doenças autoimunes. São apresentadas evidências recentes sobre como alterações na composição da microbiota podem influenciar a resposta imunológica e contribuir para o surgimento de condições como artrite reumatoide, lúpus eritematoso sistêmico e esclerose múltipla.</p><h2>Introdução</h2><p>A microbiota intestinal desempenha um papel fundamental na regulação do sistema imunológico. Desequilíbrios na composição dessa microbiota têm sido associados a diversas condições autoimunes.</p>",
    keywords: [
      "microbiota intestinal",
      "doenças autoimunes",
      "imunologia",
      "disbiose",
    ],
    references: [
      "Almeida L, et al. Gut microbiome in autoimmune diseases: A comprehensive review. Autoimmun Rev. 2022;21(3):102945.",
      "Rodrigues M, et al. Microbiota-mediated regulation of the immune system in autoimmune arthritis. J Immunol Res. 2023;2023:7890123.",
      "Santos F, et al. Therapeutic modulation of gut microbiota in autoimmune diseases. Nat Rev Rheumatol. 2022;18(5):269-284.",
    ],
    doi: "10.9012/ric.2022.003",
    url: "https://example.com/article3",
  },
  {
    id: "mock4",
    title:
      "Advances in Neuroimaging for Early Detection of Alzheimer's Disease",
    authors: "Smith, J., Garcia, M., Chen, H.",
    journal: "Neurology Research International",
    year: "2023",
    language: "Inglês",
    abstract:
      "This review discusses recent advances in neuroimaging techniques for the early detection of Alzheimer's disease. We examine the utility of various modalities including MRI, PET, and functional imaging, as well as novel biomarkers and machine learning approaches for improving diagnostic accuracy in preclinical and early clinical stages of the disease.",
    content:
      "<h2>Abstract</h2><p>This review discusses recent advances in neuroimaging techniques for the early detection of Alzheimer's disease. We examine the utility of various modalities including MRI, PET, and functional imaging, as well as novel biomarkers and machine learning approaches for improving diagnostic accuracy in preclinical and early clinical stages of the disease.</p><h2>Introduction</h2><p>Early detection of Alzheimer's disease (AD) is crucial for implementing interventions that may slow disease progression. Neuroimaging has emerged as a powerful tool for identifying brain changes associated with AD before clinical symptoms become apparent.</p>",
    keywords: [
      "Alzheimer's disease",
      "neuroimaging",
      "early detection",
      "biomarkers",
    ],
    references: [
      "Johnson KA, et al. Brain imaging in Alzheimer disease. Cold Spring Harb Perspect Med. 2022;12(3):a006213.",
      "Martinez-Martin P, et al. Artificial intelligence for Alzheimer's disease neuroimaging. Nat Rev Neurol. 2023;19(1):32-45.",
      "Wilson RS, et al. The relationship between neuroimaging and cognitive decline in early Alzheimer disease. Neurology. 2022;98(7):e720-e731.",
    ],
    doi: "10.3456/nri.2023.004",
    url: "https://example.com/article4",
  },
  {
    id: "mock5",
    title: "Imunoterapia no tratamento do câncer: avanços e desafios",
    authors: "Pereira, C., Almeida, S., Rodrigues, T.",
    journal: "Revista Brasileira de Oncologia",
    year: "2023",
    language: "Português",
    abstract:
      "Este artigo apresenta uma revisão abrangente sobre o uso da imunoterapia no tratamento do câncer. São discutidos os principais tipos de imunoterapia, incluindo inibidores de checkpoint imunológico, terapias com células CAR-T e vacinas terapêuticas, bem como os resultados de estudos clínicos recentes e os desafios para a implementação dessas terapias na prática clínica.",
    content:
      "<h2>Abstract</h2><p>Este artigo apresenta uma revisão abrangente sobre o uso da imunoterapia no tratamento do câncer. São discutidos os principais tipos de imunoterapia, incluindo inibidores de checkpoint imunológico, terapias com células CAR-T e vacinas terapêuticas, bem como os resultados de estudos clínicos recentes e os desafios para a implementação dessas terapias na prática clínica.</p><h2>Introdução</h2><p>A imunoterapia revolucionou o tratamento do câncer nas últimas décadas, oferecendo novas opções para pacientes com diversos tipos de tumores. Ao contrário das terapias convencionais, a imunoterapia atua estimulando o sistema imunológico do próprio paciente a combater as células cancerígenas.</p>",
    keywords: [
      "imunoterapia",
      "câncer",
      "oncologia",
      "inibidores de checkpoint",
    ],
    references: [
      "Ribas A, et al. Cancer immunotherapy using checkpoint blockade. Science. 2022;359(6382):1350-1355.",
      "Martins F, et al. Adverse effects of immune-checkpoint inhibitors: epidemiology, management and surveillance. Nat Rev Clin Oncol. 2023;20(1):46-61.",
      "Silva M, et al. CAR-T cell therapy for solid tumors: clinical challenges and approaches. Front Immunol. 2022;13:765304.",
    ],
    doi: "10.7890/rbo.2023.005",
    url: "https://example.com/article5",
  },
];

// Função para obter um artigo simulado por ID
export function getMockArticleById(id: string): Article | null {
  return mockArticles.find((article) => article.id === id) || null;
}

// Função para filtrar artigos simulados com base em critérios de pesquisa
export function filterMockArticles(
  query: string,
  type: string,
  language: string,
  year: string,
  sort: string
): Article[] {
  // Se não houver query, retornar todos os artigos
  if (!query) {
    console.log(
      "Nenhuma query fornecida, retornando todos os artigos simulados"
    );
    return [...mockArticles];
  }

  console.log("Filtrando artigos simulados com os seguintes critérios:", {
    query,
    type,
    language,
    year,
    sort,
  });

  let filtered = [...mockArticles];

  // Filtrar por query
  const lowerQuery = query.toLowerCase();
  filtered = filtered.filter((article) => {
    // Verificar se a query está presente no título, resumo ou palavras-chave
    const matchesTitle = article.title.toLowerCase().includes(lowerQuery);
    const matchesAbstract = article.abstract.toLowerCase().includes(lowerQuery);
    const matchesKeywords = article.keywords.some((k) =>
      k.toLowerCase().includes(lowerQuery)
    );
    const matchesAuthors = article.authors.toLowerCase().includes(lowerQuery);
    const matchesJournal = article.journal.toLowerCase().includes(lowerQuery);

    // Aplicar filtro específico se o tipo for especificado
    if (type === "title") return matchesTitle;
    if (type === "author") return matchesAuthors;
    if (type === "journal") return matchesJournal;

    // Default: keyword (busca em título, resumo e palavras-chave)
    return matchesTitle || matchesAbstract || matchesKeywords;
  });

  console.log(
    `Após filtrar por query "${query}": ${filtered.length} artigos encontrados`
  );

  // Filtrar por idioma
  if (language && language !== "all") {
    const languageMap: Record<string, string> = {
      en: "Inglês",
      pt: "Português",
      es: "Espanhol",
    };
    const targetLanguage = languageMap[language];

    if (targetLanguage) {
      filtered = filtered.filter(
        (article) => article.language === targetLanguage
      );
      console.log(
        `Após filtrar por idioma "${targetLanguage}": ${filtered.length} artigos encontrados`
      );
    }
  }

  // Filtrar por ano
  if (year && year !== "all") {
    if (year === "older") {
      filtered = filtered.filter(
        (article) => Number.parseInt(article.year) < 2018
      );
    } else {
      filtered = filtered.filter((article) => article.year === year);
    }
    console.log(
      `Após filtrar por ano "${year}": ${filtered.length} artigos encontrados`
    );
  }

  // Ordenar resultados
  if (sort) {
    switch (sort) {
      case "date_desc":
        filtered.sort(
          (a, b) => Number.parseInt(b.year) - Number.parseInt(a.year)
        );
        break;
      case "date_asc":
        filtered.sort(
          (a, b) => Number.parseInt(a.year) - Number.parseInt(b.year)
        );
        break;
      case "relevance":
      default:
        // Manter a ordem padrão
        break;
    }
  }

  console.log(
    `Retornando ${filtered.length} artigos simulados após aplicar todos os filtros`
  );
  return filtered;
}
