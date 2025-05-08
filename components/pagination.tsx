"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { motion } from "framer-motion";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // Não mostrar paginação se houver apenas uma página
  if (totalPages <= 1) {
    return null;
  }

  // Determinar quais páginas mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Número máximo de botões de página para mostrar

    if (totalPages <= maxPagesToShow) {
      // Se o total de páginas for menor que o máximo, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sempre mostrar a primeira página
      pages.push(1);

      // Calcular o intervalo de páginas a mostrar
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Ajustar se estiver no início
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, maxPagesToShow - 1);
      }

      // Ajustar se estiver no final
      if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
      }

      // Adicionar elipses se necessário
      if (startPage > 2) {
        pages.push(-1); // -1 representa elipses
      }

      // Adicionar páginas do intervalo
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Adicionar elipses se necessário
      if (endPage < totalPages - 1) {
        pages.push(-2); // -2 representa elipses
      }

      // Sempre mostrar a última página
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <motion.div
      className="flex items-center justify-center space-x-2 mt-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="Primeira página"
        className="hidden sm:flex hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Página anterior"
        className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center space-x-2">
        {pageNumbers.map((page, index) => {
          if (page === -1 || page === -2) {
            // Renderizar elipses
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-slate-500 dark:text-slate-400"
              >
                ...
              </span>
            );
          }

          return (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => onPageChange(page)}
              aria-label={`Página ${page}`}
              aria-current={currentPage === page ? "page" : undefined}
              className={
                currentPage === page
                  ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              }
            >
              {page}
            </Button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Próxima página"
        className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Última página"
        className="hidden sm:flex hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
