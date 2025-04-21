import type { Article } from "@/lib/types";

export function getMockArticleById(id: string): Article | null {
  switch (id) {
    case "mock-article-1":
      return {
        id: "mock-article-1",
        title: "Mock Article 1",
        authors: "John Doe, Jane Smith",
        journal: "Mock Journal",
        year: "2023",
        language: "Inglês",
        abstract: "This is a mock article for testing purposes.",
        content: "<p>This is the content of mock article 1.</p>",
        keywords: ["mock", "article", "test"],
        references: [],
        doi: "10.1234/mock-article-1",
        url: "https://example.com/mock-article-1",
        source: "Mock Data",
      };
    case "mock-article-2":
      return {
        id: "mock-article-2",
        title: "Mock Article 2",
        authors: "Alice Johnson, Bob Williams",
        journal: "Another Mock Journal",
        year: "2022",
        language: "Português",
        abstract: "Another mock article for testing purposes.",
        content: "<p>This is the content of mock article 2.</p>",
        keywords: ["mock", "article", "test", "portuguese"],
        references: [],
        doi: "10.1234/mock-article-2",
        url: "https://example.com/mock-article-2",
        source: "Mock Data",
      };
    default:
      return null;
  }
}
