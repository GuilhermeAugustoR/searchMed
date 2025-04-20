export interface Article {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  language: string;
  abstract: string;
  content: string;
  keywords: string[];
  references: string[];
  doi?: string;
  url?: any;
  source?: string; // Propriedade para identificar a fonte do artigo
}

export interface SearchOptions {
  query: string;
  type: string;
  language: string;
  year: string;
  sort: string;
  sources?: string[]; // Propriedade para filtrar por fontes
  aiModel?: string; // Nova propriedade para o modelo de IA
  specificSources?: string[]; // Nova propriedade para fontes específicas (revistas)
}
