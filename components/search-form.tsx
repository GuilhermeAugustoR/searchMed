"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  AlertCircle,
  Plus,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Lista de revistas científicas populares
const POPULAR_JOURNALS = [
  "The Lancet",
  "Nature",
  "Science",
  "JAMA",
  "New England Journal of Medicine",
  "BMJ",
  "Cell",
  "PLOS ONE",
  "Cochrane Database of Systematic Reviews",
  "Annals of Internal Medicine",
  "Circulation",
  "Pediatrics",
  "Diabetes Care",
  "Journal of Clinical Oncology",
  "Gastroenterology",
];

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados para os parâmetros de pesquisa
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchType, setSearchType] = useState(
    searchParams.get("type") || "keyword"
  );
  const [language, setLanguage] = useState(searchParams.get("lang") || "all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Novo estado para controlar o loading
  const [lastGeminiError, setLastGeminiError] = useState<string | null>(null);

  // Estado para o modelo de IA selecionado
  const [aiModel, setAiModel] = useState(
    searchParams.get("aiModel") || "openai"
  );

  // Estado para fontes específicas
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [customSource, setCustomSource] = useState("");

  // Inicializar fontes selecionadas a partir dos parâmetros de URL
  useEffect(() => {
    const sourcesParam = searchParams.get("specificSources");
    if (sourcesParam) {
      setSelectedSources(sourcesParam.split(","));
    }
  }, [searchParams]);

  // Verificar se a fonte Lancet está selecionada e mostrar alerta se necessário
  useEffect(() => {
    // Verificar apenas uma vez ao montar o componente
    const checkLancetApiKey = async () => {
      try {
        const response = await fetch("/api/check-lancet-api-key");
        const data = await response.json();
        setShowApiKeyAlert(
          !data.apiKeyConfigured &&
            searchParams.get("sources")!.includes("lancet")
        );
      } catch (error) {
        console.error("Erro ao verificar API key do Lancet:", error);
      }
    };

    checkLancetApiKey();

    // Verificar se houve erro recente com o Gemini
    const errorParam = searchParams.get("error");
    if (errorParam && errorParam.includes("gemini")) {
      setLastGeminiError(
        "Houve um problema com o modelo Gemini na última pesquisa. Usando OpenAI como alternativa."
      );
      setAiModel("openai");
    }
  }, [searchParams]);

  // Fontes de pesquisa - adicionar OpenAI como padrão
  const [sources, setSources] = useState<string[]>(() => {
    const sourcesParam = searchParams.get("sources");
    return sourcesParam
      ? sourcesParam.split(",")
      : ["openai", "pubmed", "semantic-scholar", "crossref"];
  });

  const handleSourceChange = (source: string, checked: boolean) => {
    const newSources = checked
      ? [...sources, source]
      : sources.filter((s) => s !== source);
    setSources(newSources);

    // Atualizar alerta se Lancet for selecionado/deselecionado
    if (source === "lancet") {
      setShowApiKeyAlert(checked);
    }
  };

  // Adicionar fonte personalizada
  const addCustomSource = () => {
    if (customSource && !selectedSources.includes(customSource)) {
      setSelectedSources([...selectedSources, customSource]);
      setCustomSource("");
    }
  };

  // Remover fonte selecionada
  const removeSource = (source: string) => {
    setSelectedSources(selectedSources.filter((s) => s !== source));
  };

  // Adicionar fonte popular
  const addPopularSource = (source: string) => {
    if (!selectedSources.includes(source)) {
      setSelectedSources([...selectedSources, source]);
    }
  };

  // Modificar o handleSubmit para sempre usar a fonte "openai" e mostrar loading
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Ativar o estado de carregamento
    setIsSearching(true);

    const params = new URLSearchParams();
    params.set("q", searchQuery);
    params.set("type", searchType);
    params.set("lang", language);

    // Adicionar modelo de IA selecionado
    params.set("aiModel", aiModel);

    // Sempre usar a fonte "openai" (que representa a busca por IA)
    params.set("sources", "openai");

    // Adicionar fontes específicas se houver
    if (selectedSources.length > 0) {
      params.set("specificSources", selectedSources.join(","));
    }

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

          {lastGeminiError && (
            <Alert variant="warning" className="mt-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{lastGeminiError}</AlertDescription>
            </Alert>
          )}

          {showAdvanced && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Modelo de IA</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="model-openai"
                        name="ai-model"
                        value="openai"
                        checked={aiModel === "openai"}
                        onChange={() => setAiModel("openai")}
                        className="mr-2"
                        disabled={isSearching}
                      />
                      <Label htmlFor="model-openai">OpenAI</Label>
                    </div>
                    <div className="flex items-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                id="model-gemini"
                                name="ai-model"
                                value="gemini"
                                checked={aiModel === "gemini"}
                                onChange={() => setAiModel("gemini")}
                                className="mr-2"
                                disabled={isSearching}
                              />
                              <Label htmlFor="model-gemini">Gemini</Label>
                              {lastGeminiError && (
                                <AlertTriangle className="h-3 w-3 ml-1 text-amber-500" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {lastGeminiError ||
                              "Google Gemini (com fallback automático para OpenAI se necessário)"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">
                    Buscar em revistas/fontes específicas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Selecione ou adicione revistas específicas para que a IA
                    busque artigos apenas dessas fontes.
                  </p>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite o nome de uma revista..."
                      value={customSource}
                      onChange={(e) => setCustomSource(e.target.value)}
                      className="flex-1"
                      disabled={isSearching}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addCustomSource}
                      disabled={
                        !customSource ||
                        selectedSources.includes(customSource) ||
                        isSearching
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium mb-2">
                      Revistas populares:
                    </h4>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isSearching}
                        >
                          Selecionar revista popular
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-1">
                          {POPULAR_JOURNALS.map((journal) => (
                            <Button
                              key={journal}
                              variant="ghost"
                              size="sm"
                              className="justify-start"
                              onClick={() => addPopularSource(journal)}
                              disabled={
                                selectedSources.includes(journal) || isSearching
                              }
                            >
                              {journal}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {selectedSources.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium mb-2">
                        Fontes selecionadas:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSources.map((source) => (
                          <Badge
                            key={source}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {source}
                            <button
                              type="button"
                              onClick={() => removeSource(source)}
                              className="ml-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                              aria-label={`Remover ${source}`}
                              disabled={isSearching}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {showApiKeyAlert && (
                <Alert variant="warning" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    A API key do Elsevier (The Lancet) não está configurada
                    corretamente. Verifique o arquivo .env.local.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={isSearching}
            >
              {showAdvanced
                ? "Ocultar opções avançadas"
                : "Mostrar opções avançadas"}
            </Button>

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
