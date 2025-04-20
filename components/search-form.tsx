"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SearchForm() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("keyword");
  const [language, setLanguage] = useState("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(false);

  // Fontes de pesquisa
  const [sources, setSources] = useState<string[]>([
    "pubmed",
    "semantic-scholar",
    "crossref",
    "lancet",
  ]);

  // Verificar se a fonte Lancet está selecionada e mostrar alerta se necessário
  useEffect(() => {
    // Verificar apenas uma vez ao montar o componente
    const checkLancetApiKey = async () => {
      try {
        const response = await fetch("/api/check-lancet-api-key");
        const data = await response.json();
        setShowApiKeyAlert(
          !data.apiKeyConfigured && sources.includes("lancet")
        );
      } catch (error) {
        console.error("Erro ao verificar API key do Lancet:", error);
      }
    };

    checkLancetApiKey();
  }, []);

  const handleSourceChange = (source: string, checked: boolean) => {
    const newSources = checked
      ? [...sources, source]
      : sources.filter((s) => s !== source);

    setSources(newSources);

    // Atualizar alerta se Lancet for selecionado/deselecionado
    // if (source === "lancet") {
    //   setShowApiKeyAlert(checked && !window.lancetApiKeyConfigured);
    // }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const params = new URLSearchParams();
    params.set("q", searchQuery);
    params.set("type", searchType);
    params.set("lang", language);

    // Adicionar fontes selecionadas
    if (sources.length > 0 && sources.length < 4) {
      params.set("sources", sources.join(","));
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
              />
            </div>
            <div className="flex gap-2">
              <Select value={searchType} onValueChange={setSearchType}>
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

              <Select value={language} onValueChange={setLanguage}>
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

          {showAdvanced && (
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md">
              <h3 className="text-sm font-medium mb-3">Fontes de pesquisa</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="source-pubmed"
                    checked={sources.includes("pubmed")}
                    onCheckedChange={(checked) =>
                      handleSourceChange("pubmed", checked as boolean)
                    }
                  />
                  <Label htmlFor="source-pubmed">PubMed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="source-semantic-scholar"
                    checked={sources.includes("semantic-scholar")}
                    onCheckedChange={(checked) =>
                      handleSourceChange("semantic-scholar", checked as boolean)
                    }
                  />
                  <Label htmlFor="source-semantic-scholar">
                    Semantic Scholar
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="source-crossref"
                    checked={sources.includes("crossref")}
                    onCheckedChange={(checked) =>
                      handleSourceChange("crossref", checked as boolean)
                    }
                  />
                  <Label htmlFor="source-crossref">Crossref</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="source-lancet"
                    checked={sources.includes("lancet")}
                    onCheckedChange={(checked) =>
                      handleSourceChange("lancet", checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="source-lancet"
                    className="font-medium text-primary"
                  >
                    The Lancet
                  </Label>
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
            >
              {showAdvanced
                ? "Ocultar opções avançadas"
                : "Mostrar opções avançadas"}
            </Button>

            <Button type="submit" className="w-full md:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Pesquisar
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
