"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <div className="max-w-3xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Digite termos de pesquisa, título ou autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                disabled={isSearching}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={searchType}
                onValueChange={setSearchType}
                disabled={isSearching}
              >
                <SelectTrigger>
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
                <SelectTrigger>
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
            <Select
              value={source}
              onValueChange={setSource}
              disabled={isSearching}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pubmed">PubMed</SelectItem>
                <SelectItem value="arxiv">arXiv</SelectItem>
                <SelectItem value="scielo">SciELO</SelectItem>
                <SelectItem value="core">CORE</SelectItem>
                <SelectItem value="europepmc">Europe PMC</SelectItem>
                <SelectItem value="all">Todas as fontes</SelectItem>
              </SelectContent>
            </Select>

            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={isSearching}
            >
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Pesquisando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Pesquisar
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
