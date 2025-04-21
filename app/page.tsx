import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, FileText, BookMarked } from "lucide-react";
import { FeaturedArticles } from "@/components/featured-articles";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">
          Assistente de Pesquisa Acadêmica
        </h1>
        <p className="text-xl mb-8 text-slate-600 dark:text-slate-400">
          Encontre, organize e explore artigos científicos de forma simples e
          eficiente
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Link href="/search" passHref>
            <Button size="lg" className="w-full h-16 text-lg">
              <Search className="mr-2 h-5 w-5" />
              Iniciar pesquisa
            </Button>
          </Link>
          <Link href="/saved" passHref>
            <Button size="lg" variant="outline" className="w-full h-16 text-lg">
              <BookMarked className="mr-2 h-5 w-5" />
              Artigos salvos
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Pesquisa Avançada</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Encontre artigos científicos relevantes usando filtros avançados e
              pesquisa por palavras-chave.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Organização</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Salve artigos para leitura posterior e organize-os em coleções
              personalizadas.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
            <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Citações</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Exporte citações em diferentes formatos para usar em seus
              trabalhos acadêmicos.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-16 mb-8">Artigos em Destaque</h2>
        <FeaturedArticles />
      </div>
    </div>
  );
}
