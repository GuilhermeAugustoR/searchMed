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
  url?: string;
  source?: string; // Nova propriedade para identificar a fonte do artigo
}

export interface SearchOptions {
  query: string;
  type: string;
  language: string;
  year: string;
  sort: string;
  sources?: string[]; // Nova propriedade para filtrar por fontes
}
