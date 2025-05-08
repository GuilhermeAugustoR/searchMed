"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { RotateCcw, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "year",
    "sort",
    "language",
  ]);

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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border border-slate-200 dark:border-slate-700 shadow-md overflow-hidden bg-white dark:bg-slate-800">
        <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2 text-primary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Accordion
            type="multiple"
            defaultValue={["year", "sort", "language"]}
            className="w-full"
          >
            <AccordionItem
              value="year"
              className="border-b border-slate-200 dark:border-slate-700"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                <span className="font-medium text-base">Ano de publicação</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <RadioGroup
                  defaultValue={year}
                  onValueChange={(value) => updateFilter("year", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="all" id="year-all" />
                    <Label
                      htmlFor="year-all"
                      className="font-normal cursor-pointer w-full"
                    >
                      Todos os anos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="2023" id="year-2023" />
                    <Label
                      htmlFor="year-2023"
                      className="font-normal cursor-pointer w-full"
                    >
                      2023
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="2022" id="year-2022" />
                    <Label
                      htmlFor="year-2022"
                      className="font-normal cursor-pointer w-full"
                    >
                      2022
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="2021" id="year-2021" />
                    <Label
                      htmlFor="year-2021"
                      className="font-normal cursor-pointer w-full"
                    >
                      2021
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="2020" id="year-2020" />
                    <Label
                      htmlFor="year-2020"
                      className="font-normal cursor-pointer w-full"
                    >
                      2020
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="2019" id="year-2019" />
                    <Label
                      htmlFor="year-2019"
                      className="font-normal cursor-pointer w-full"
                    >
                      2019
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="2018" id="year-2018" />
                    <Label
                      htmlFor="year-2018"
                      className="font-normal cursor-pointer w-full"
                    >
                      2018
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="older" id="year-older" />
                    <Label
                      htmlFor="year-older"
                      className="font-normal cursor-pointer w-full"
                    >
                      Antes de 2018
                    </Label>
                  </div>
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="sort"
              className="border-b border-slate-200 dark:border-slate-700"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                <span className="font-medium text-base">Ordenar por</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <RadioGroup
                  defaultValue={sort}
                  onValueChange={(value) => updateFilter("sort", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="relevance" id="sort-relevance" />
                    <Label
                      htmlFor="sort-relevance"
                      className="font-normal cursor-pointer w-full"
                    >
                      Relevância
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="date_desc" id="sort-date-desc" />
                    <Label
                      htmlFor="sort-date-desc"
                      className="font-normal cursor-pointer w-full"
                    >
                      Mais recentes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="date_asc" id="sort-date-asc" />
                    <Label
                      htmlFor="sort-date-asc"
                      className="font-normal cursor-pointer w-full"
                    >
                      Mais antigos
                    </Label>
                  </div>
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="language"
              className="border-b border-slate-200 dark:border-slate-700"
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                <span className="font-medium text-base">Idioma</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <RadioGroup
                  defaultValue={language}
                  onValueChange={(value) => updateFilter("lang", value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="all" id="lang-all" />
                    <Label
                      htmlFor="lang-all"
                      className="font-normal cursor-pointer w-full"
                    >
                      Todos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="en" id="lang-en" />
                    <Label
                      htmlFor="lang-en"
                      className="font-normal cursor-pointer w-full"
                    >
                      Inglês
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="pt" id="lang-pt" />
                    <Label
                      htmlFor="lang-pt"
                      className="font-normal cursor-pointer w-full"
                    >
                      Português
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <RadioGroupItem value="es" id="lang-es" />
                    <Label
                      htmlFor="lang-es"
                      className="font-normal cursor-pointer w-full"
                    >
                      Espanhol
                    </Label>
                  </div>
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>

            {journals.length > 0 && (
              <AccordionItem
                value="journals"
                className="border-b border-slate-200 dark:border-slate-700"
              >
                <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                  <span className="font-medium text-base">Revistas</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4">
                  <div className="space-y-3">
                    <Input
                      placeholder="Filtrar revistas..."
                      value={journalFilter}
                      onChange={(e) => setJournalFilter(e.target.value)}
                      className="mb-2 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                    />
                    <ScrollArea className="h-[200px] pr-4 rounded-md border border-slate-200 dark:border-slate-700 p-2">
                      <div className="space-y-1">
                        {filteredJournals.map((journal) => (
                          <div
                            key={journal}
                            className="flex items-center space-x-2 rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Checkbox
                              id={`journal-${journal}`}
                              checked={selectedJournals.includes(journal)}
                              onCheckedChange={() => toggleJournal(journal)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label
                              htmlFor={`journal-${journal}`}
                              className="font-normal text-sm line-clamp-1 cursor-pointer w-full"
                              title={journal}
                            >
                              {journal}
                            </Label>
                          </div>
                        ))}
                        {filteredJournals.length === 0 && (
                          <p className="text-sm text-muted-foreground p-2">
                            Nenhuma revista encontrada
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>

          <div className="p-6 pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
              onClick={resetFilters}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Redefinir filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
