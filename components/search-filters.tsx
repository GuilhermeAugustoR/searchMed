"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface SearchFiltersProps {
  journals?: string[];
}

export function SearchFilters({ journals = [] }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "keyword";
  const language = searchParams.get("lang") || "all";
  const year = searchParams.get("year") || "all";
  const sort = searchParams.get("sort") || "relevance";
  const source = searchParams.get("source") || "pubmed";
  const page = searchParams.get("page") || "1";
  const selectedJournals = searchParams.get("journals")
    ? searchParams.get("journals")!.split(",")
    : [];

  // Estado para filtrar a lista de revistas
  const [journalFilter, setJournalFilter] = useState("");
  const [filteredJournals, setFilteredJournals] = useState<string[]>(journals);

  // Atualizar a lista filtrada de revistas quando o filtro ou a lista de revistas mudar
  useEffect(() => {
    if (!journalFilter) {
      setFilteredJournals(journals);
    } else {
      const filtered = journals.filter((journal) =>
        journal.toLowerCase().includes(journalFilter.toLowerCase())
      );
      setFilteredJournals(filtered);
    }
  }, [journalFilter, journals]);

  const updateFilter = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);

    // Resetar para a primeira página quando um filtro é alterado
    params.set("page", "1");

    router.push(`/search?${params.toString()}`);
  };

  const toggleJournal = (journal: string) => {
    const params = new URLSearchParams(searchParams.toString());

    let journals = selectedJournals.slice();

    if (journals.includes(journal)) {
      journals = journals.filter((j) => j !== journal);
    } else {
      journals.push(journal);
    }

    if (journals.length > 0) {
      params.set("journals", journals.join(","));
    } else {
      params.delete("journals");
    }

    // Resetar para a primeira página quando um filtro é alterado
    params.set("page", "1");

    router.push(`/search?${params.toString()}`);
  };

  const resetFilters = () => {
    const params = new URLSearchParams();
    params.set("q", query);
    params.set("type", "keyword");
    params.set("lang", "all");
    params.set("year", "all");
    params.set("sort", "relevance");
    params.set("source", source);
    params.set("page", "1");
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base">Ano de publicação</Label>
              <RadioGroup
                defaultValue={year}
                onValueChange={(value) => updateFilter("year", value)}
                className="mt-2 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="year-all" />
                  <Label htmlFor="year-all" className="font-normal">
                    Todos os anos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2023" id="year-2023" />
                  <Label htmlFor="year-2023" className="font-normal">
                    2023
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2022" id="year-2022" />
                  <Label htmlFor="year-2022" className="font-normal">
                    2022
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2021" id="year-2021" />
                  <Label htmlFor="year-2021" className="font-normal">
                    2021
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2020" id="year-2020" />
                  <Label htmlFor="year-2020" className="font-normal">
                    2020
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2019" id="year-2019" />
                  <Label htmlFor="year-2019" className="font-normal">
                    2019
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2018" id="year-2018" />
                  <Label htmlFor="year-2018" className="font-normal">
                    2018
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="older" id="year-older" />
                  <Label htmlFor="year-older" className="font-normal">
                    Antes de 2018
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div>
              <Label className="text-base">Ordenar por</Label>
              <RadioGroup
                defaultValue={sort}
                onValueChange={(value) => updateFilter("sort", value)}
                className="mt-2 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="relevance" id="sort-relevance" />
                  <Label htmlFor="sort-relevance" className="font-normal">
                    Relevância
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date_desc" id="sort-date-desc" />
                  <Label htmlFor="sort-date-desc" className="font-normal">
                    Mais recentes
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="date_asc" id="sort-date-asc" />
                  <Label htmlFor="sort-date-asc" className="font-normal">
                    Mais antigos
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Separator />

            <div>
              <Label className="text-base">Idioma</Label>
              <RadioGroup
                defaultValue={language}
                onValueChange={(value) => updateFilter("lang", value)}
                className="mt-2 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="lang-all" />
                  <Label htmlFor="lang-all" className="font-normal">
                    Todos
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="en" id="lang-en" />
                  <Label htmlFor="lang-en" className="font-normal">
                    Inglês
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pt" id="lang-pt" />
                  <Label htmlFor="lang-pt" className="font-normal">
                    Português
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="es" id="lang-es" />
                  <Label htmlFor="lang-es" className="font-normal">
                    Espanhol
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {journals.length > 0 && (
              <>
                <Separator />

                <div>
                  <Label className="text-base">Revistas</Label>
                  <div className="mt-2">
                    <Input
                      placeholder="Filtrar revistas..."
                      value={journalFilter}
                      onChange={(e) => setJournalFilter(e.target.value)}
                      className="mb-2"
                    />
                    <ScrollArea className="h-[200px] pr-4">
                      <div className="space-y-2">
                        {filteredJournals.map((journal) => (
                          <div
                            key={journal}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`journal-${journal}`}
                              checked={selectedJournals.includes(journal)}
                              onCheckedChange={() => toggleJournal(journal)}
                            />
                            <Label
                              htmlFor={`journal-${journal}`}
                              className="font-normal text-sm line-clamp-1"
                              title={journal}
                            >
                              {journal}
                            </Label>
                          </div>
                        ))}
                        {filteredJournals.length === 0 && (
                          <p className="text-sm text-muted-foreground">
                            Nenhuma revista encontrada
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={resetFilters}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Redefinir filtros
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
