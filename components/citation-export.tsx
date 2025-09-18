"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Download, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { Article } from "@/lib/types";
import { citationFormats, generateBibTeX, generateRIS } from "@/lib/citation-formats";

interface CitationExportProps {
  article: Article;
}

export function CitationExport({ article }: CitationExportProps) {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const copyToClipboard = async (text: string, format: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(format);
      setTimeout(() => setCopiedFormat(null), 2000);
      toast({
        title: "Citação copiada",
        description: `Citação no formato ${format} copiada para a área de transferência`,
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a citação",
        variant: "destructive",
      });
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportBibTeX = () => {
    const bibTeX = generateBibTeX(article);
    const filename = `${article.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}.bib`;
    downloadFile(bibTeX, filename, "application/x-bibtex");
    toast({
      title: "BibTeX exportado",
      description: "Arquivo BibTeX baixado com sucesso",
    });
  };

  const exportRIS = () => {
    const ris = generateRIS(article);
    const filename = `${article.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, "_")}.ris`;
    downloadFile(ris, filename, "application/x-research-info-systems");
    toast({
      title: "RIS exportado",
      description: "Arquivo RIS baixado com sucesso",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Exportar Citações</CardTitle>
        <p className="text-slate-600 dark:text-slate-400">
          Copie ou baixe a citação no formato desejado para usar em seus trabalhos
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="formats" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="formats">Formatos de Citação</TabsTrigger>
            <TabsTrigger value="files">Arquivos de Referência</TabsTrigger>
          </TabsList>
          
          <TabsContent value="formats" className="space-y-4 mt-4">
            {Object.entries(citationFormats).map(([key, format]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">
                      {format.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {format.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(format.generate(article), format.name)}
                    className="flex items-center gap-2"
                  >
                    {copiedFormat === format.name ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    Copiar
                  </Button>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border text-sm">
                  <p className="text-slate-700 dark:text-slate-300 font-mono leading-relaxed">
                    {format.generate(article)}
                  </p>
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="files" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <FileText className="h-8 w-8 mx-auto text-slate-400" />
                    <div>
                      <h4 className="font-medium">BibTeX</h4>
                      <p className="text-xs text-slate-500">
                        Para LaTeX, Overleaf, Mendeley
                      </p>
                    </div>
                    <Button onClick={exportBibTeX} size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar .bib
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <FileText className="h-8 w-8 mx-auto text-slate-400" />
                    <div>
                      <h4 className="font-medium">RIS</h4>
                      <p className="text-xs text-slate-500">
                        Para Zotero, EndNote, RefWorks
                      </p>
                    </div>
                    <Button onClick={exportRIS} size="sm" className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar .ris
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Como usar os arquivos de referência:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• <strong>BibTeX (.bib):</strong> Importe no LaTeX, Overleaf ou Mendeley</li>
                <li>• <strong>RIS (.ris):</strong> Importe no Zotero, EndNote ou RefWorks</li>
                <li>• Os arquivos contêm todas as informações bibliográficas necessárias</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}