"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    const query = params.get("q")
    const type = params.get("type")

    router.push(`/search?q=${query || ""}&type=${type || "keyword"}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="year-filter">Ano de publicação</Label>
          <Select
            defaultValue={searchParams.get("year") || "all"}
            onValueChange={(value) => updateFilters("year", value)}
          >
            <SelectTrigger id="year-filter">
              <SelectValue placeholder="Todos os anos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2020">2020</SelectItem>
              <SelectItem value="2019">2019</SelectItem>
              <SelectItem value="2018">2018</SelectItem>
              <SelectItem value="older">Antes de 2018</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort-filter">Ordenar por</Label>
          <Select
            defaultValue={searchParams.get("sort") || "relevance"}
            onValueChange={(value) => updateFilters("sort", value)}
          >
            <SelectTrigger id="sort-filter">
              <SelectValue placeholder="Relevância" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevância</SelectItem>
              <SelectItem value="date_desc">Mais recentes</SelectItem>
              <SelectItem value="date_asc">Mais antigos</SelectItem>
              <SelectItem value="citations">Mais citados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label>Idioma</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lang-en"
                checked={searchParams.get("lang") === "en"}
                onCheckedChange={() => updateFilters("lang", "en")}
              />
              <label htmlFor="lang-en" className="text-sm">
                Inglês
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lang-pt"
                checked={searchParams.get("lang") === "pt"}
                onCheckedChange={() => updateFilters("lang", "pt")}
              />
              <label htmlFor="lang-pt" className="text-sm">
                Português
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lang-es"
                checked={searchParams.get("lang") === "es"}
                onCheckedChange={() => updateFilters("lang", "es")}
              />
              <label htmlFor="lang-es" className="text-sm">
                Espanhol
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lang-all"
                checked={!searchParams.get("lang") || searchParams.get("lang") === "all"}
                onCheckedChange={() => updateFilters("lang", "all")}
              />
              <label htmlFor="lang-all" className="text-sm">
                Todos os idiomas
              </label>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
