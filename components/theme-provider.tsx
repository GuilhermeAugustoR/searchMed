"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  // Evita problemas de hidratação renderizando o conteúdo apenas após a montagem no cliente
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Renderiza um placeholder invisível com a mesma estrutura para evitar layout shift
    return (
      <div style={{ visibility: "hidden", height: "100%" }}>
        <NextThemesProvider {...props}>{children}</NextThemesProvider>
      </div>
    );
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
