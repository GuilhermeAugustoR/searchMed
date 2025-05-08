"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { SearchFilters } from "@/components/search-filters";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados para os parâmetros de pesquisa
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchType, setSearchType] = useState(
    searchParams.get("type") || "keyword"
  );
  const [language, setLanguage] = useState(searchParams.get("lang") || "all");
  const [source, setSource] = useState(searchParams.get("source") || "pubmed");
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Efeito para resetar o estado de loading quando os parâmetros de URL mudam
  useEffect(() => {
    setIsSearching(false);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Ativar o estado de carregamento
    setIsSearching(true);

    const params = new URLSearchParams();
    params.set("q", searchQuery);
    params.set("type", searchType);
    params.set("lang", language);
    params.set("source", source);

    router.push(`/search?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <div className="relative">
                  <Input
                    placeholder="Digite termos de pesquisa, título ou autor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 h-12 text-base border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                    disabled={isSearching}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={searchType}
                  onValueChange={setSearchType}
                  disabled={isSearching}
                >
                  <SelectTrigger className="h-12 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary/30 transition-all duration-300">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">Palavra-chave</SelectItem>
                    <SelectItem value="title">Título</SelectItem>
                    <SelectItem value="author">Autor</SelectItem>
                    <SelectItem value="journal">Revista</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={language}
                  onValueChange={setLanguage}
                  disabled={isSearching}
                >
                  <SelectTrigger className="h-12 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary/30 transition-all duration-300">
                    <SelectValue placeholder="Idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="en">Inglês</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="es">Espanhol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="w-full md:w-auto">
                <Select
                  value={source}
                  onValueChange={setSource}
                  disabled={isSearching}
                >
                  <SelectTrigger className="w-full md:w-[200px] h-12 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary/30 transition-all duration-300">
                    <SelectValue placeholder="Fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pubmed">PubMed</SelectItem>
                    <SelectItem value="arxiv">arXiv</SelectItem>
                    <SelectItem value="scielo">SciELO</SelectItem>
                    <SelectItem value="core">CORE</SelectItem>
                    <SelectItem value="europepmc">Europe PMC</SelectItem>
                    <SelectItem value="scopus">Scopus</SelectItem>
                    <SelectItem value="ieee">IEEE Xplore</SelectItem>
                    <SelectItem value="springer">Springer</SelectItem>
                    <SelectItem value="doaj">DOAJ</SelectItem>
                    <SelectItem value="crossref">CrossRef</SelectItem>
                    <SelectItem value="openalex">OpenAlex</SelectItem>
                    <SelectItem value="all">Todas as fontes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                {/* Versão mobile: Drawer para filtros */}
                <div className="md:hidden">
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="lg" className="w-full">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtros
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="p-4 max-h-[80vh] overflow-auto">
                        <h2 className="text-xl font-bold mb-4">
                          Filtros de pesquisa
                        </h2>
                        <SearchFilters journals={[]} />
                      </div>
                    </DrawerContent>
                  </Drawer>
                </div>

                <Button
                  type="submit"
                  className="w-full md:w-auto h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={isSearching}
                  size="lg"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Pesquisando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Pesquisar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
