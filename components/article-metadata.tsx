"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Globe, BookOpen, Database, Hash } from "lucide-react";
import type { Article } from "@/lib/types";

interface ArticleMetadataProps {
  article: Article;
}

export function ArticleMetadata({ article }: ArticleMetadataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Metadados do Artigo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">
                  Data de Publicação
                </h4>
                <p className="text-slate-600 dark:text-slate-400">{article.year}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">
                  Idioma
                </h4>
                <p className="text-slate-600 dark:text-slate-400">{article.language}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">
                  Revista/Fonte
                </h4>
                <p className="text-slate-600 dark:text-slate-400">{article.journal}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">
                  Base de Dados
                </h4>
                <Badge variant="secondary">{article.source}</Badge>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Identificadores */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Identificadores
          </h4>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                ID do Sistema
              </h5>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border">
                {article.id}
              </p>
            </div>
            
            {article.doi && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  DOI (Digital Object Identifier)
                </h5>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border">
                  {article.doi}
                </p>
              </div>
            )}
            
            {article.url && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  URL Original
                </h5>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded border break-all">
                  {article.url}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Estatísticas do conteúdo */}
        <Separator />
        
        <div className="space-y-4">
          <h4 className="font-medium text-slate-800 dark:text-slate-200">
            Estatísticas do Conteúdo
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {article.abstract.split(" ").length}
              </p>
              <p className="text-xs text-slate-500">Palavras no resumo</p>
            </div>
            
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {article.abstract.length}
              </p>
              <p className="text-xs text-slate-500">Caracteres</p>
            </div>
            
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {article.keywords.length}
              </p>
              <p className="text-xs text-slate-500">Palavras-chave</p>
            </div>
            
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {article.references.length}
              </p>
              <p className="text-xs text-slate-500">Referências</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}