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
  source?: string;
}

export interface SearchOptions {
  query: string;
  type: string;
  language: string;
  year: string;
  sort: string;
  sources?: any;
}
