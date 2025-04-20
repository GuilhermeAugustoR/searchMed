import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-medium text-slate-700 dark:text-slate-300">
            Carregando artigo...
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-md">
            Estamos buscando os detalhes do artigo solicitado.
          </p>
        </div>
      </div>
    </div>
  );
}
