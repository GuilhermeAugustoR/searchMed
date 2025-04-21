"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "keyword";
  const language = searchParams.get("lang") || "all";
  const year = searchParams.get("year") || "all";
  const sort = searchParams.get("sort") || "relevance";

  const updateFilter = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    router.push(`/search?${params.toString()}`);
  };

  const resetFilters = () => {
    const params = new URLSearchParams();
    params.set("q", query);
    params.set("type", "keyword");
    params.set("lang", "all");
    params.set("year", "all");
    params.set("sort", "relevance");
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
