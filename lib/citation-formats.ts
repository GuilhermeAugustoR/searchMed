import type { Article } from "./types";

export interface CitationFormat {
  name: string;
  description: string;
  generate: (article: Article) => string;
}

export const citationFormats: Record<string, CitationFormat> = {
  apa: {
    name: "APA",
    description: "American Psychological Association (7ª edição)",
    generate: (article: Article) => {
      const authors = article.authors;
      const year = article.year;
      const title = article.title;
      const journal = article.journal;
      const doi = article.doi;
      
      return `${authors} (${year}). ${title}. *${journal}*.${doi ? ` https://doi.org/${doi}` : ""}`;
    },
  },
  
  abnt: {
    name: "ABNT",
    description: "Associação Brasileira de Normas Técnicas (NBR 6023)",
    generate: (article: Article) => {
      const authors = article.authors.toUpperCase();
      const title = article.title;
      const journal = article.journal;
      const year = article.year;
      const doi = article.doi;
      
      return `${authors}. ${title}. **${journal}**, ${year}.${doi ? ` DOI: ${doi}.` : ""}`;
    },
  },
  
  vancouver: {
    name: "Vancouver",
    description: "International Committee of Medical Journal Editors",
    generate: (article: Article) => {
      const authorsVancouver = article.authors.split(", ").map(author => {
        const parts = author.trim().split(" ");
        if (parts.length >= 2) {
          const lastName = parts[parts.length - 1];
          const initials = parts.slice(0, -1).map(name => name.charAt(0)).join("");
          return `${lastName} ${initials}`;
        }
        return author;
      }).join(", ");
      
      const title = article.title;
      const journal = article.journal;
      const year = article.year;
      const doi = article.doi;
      
      return `${authorsVancouver}. ${title}. ${journal}. ${year}.${doi ? ` doi: ${doi}` : ""}`;
    },
  },
  
  chicago: {
    name: "Chicago",
    description: "Chicago Manual of Style (17ª edição)",
    generate: (article: Article) => {
      const authors = article.authors;
      const title = article.title;
      const journal = article.journal;
      const year = article.year;
      const doi = article.doi;
      
      return `${authors}. "${title}." *${journal}* (${year}).${doi ? ` https://doi.org/${doi}.` : ""}`;
    },
  },
  
  mla: {
    name: "MLA",
    description: "Modern Language Association (9ª edição)",
    generate: (article: Article) => {
      const authors = article.authors;
      const title = article.title;
      const journal = article.journal;
      const year = article.year;
      const doi = article.doi;
      
      return `${authors}. "${title}" *${journal}*, ${year}.${doi ? ` DOI: ${doi}.` : ""}`;
    },
  },
};

export function generateBibTeX(article: Article): string {
  const cleanTitle = article.title.replace(/[{}]/g, "");
  const cleanJournal = article.journal.replace(/[{}]/g, "");
  const cleanAuthors = article.authors.replace(/[{}]/g, "");
  
  const key = `${article.authors.split(",")[0].split(" ").pop()?.toLowerCase() || "article"}${article.year}`;
  
  return `@article{${key},
  title={${cleanTitle}},
  author={${cleanAuthors}},
  journal={${cleanJournal}},
  year={${article.year}},
  language={${article.language}},${article.doi ? `\n  doi={${article.doi}},` : ""}${article.url ? `\n  url={${article.url}},` : ""}
  source={${article.source}}
}`;
}

export function generateRIS(article: Article): string {
  return `TY  - JOUR
TI  - ${article.title}
AU  - ${article.authors.split(", ").join("\nAU  - ")}
JO  - ${article.journal}
PY  - ${article.year}
LA  - ${article.language}
AB  - ${article.abstract}${article.doi ? `\nDO  - ${article.doi}` : ""}${article.url ? `\nUR  - ${article.url}` : ""}
DB  - ${article.source}
ER  - `;
}