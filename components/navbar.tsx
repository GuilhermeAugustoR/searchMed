"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookmarkIcon,
  HomeIcon,
  MenuIcon,
  SearchIcon,
  XIcon,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleResetApp = () => {
    // Limpar qualquer estado que possa estar causando travamento
    localStorage.setItem("app_reset", Date.now().toString());
    window.location.href = "/";
  };

  const navItems = [
    { href: "/", label: "Início", icon: <HomeIcon className="h-4 w-4" /> },
    {
      href: "/search",
      label: "Pesquisar",
      icon: <SearchIcon className="h-4 w-4" />,
    },
    {
      href: "/saved",
      label: "Salvos",
      icon: <BookmarkIcon className="h-4 w-4" />,
    },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-b shadow-sm dark:bg-slate-900/90 dark:border-slate-800"
          : "bg-white dark:bg-slate-900 border-b dark:border-slate-800"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-primary transition-colors hover:text-primary/90 dark:text-primary-foreground"
            >
              MedSearch
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "default" : "ghost"}
                size="sm"
                asChild
                className={cn(
                  "rounded-full transition-all",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-2 px-4"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <XIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden"
              onClick={handleResetApp}
              title="Resetar aplicação em caso de problemas"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t dark:border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "justify-start",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Link
                    href={item.href}
                    className="flex items-center space-x-2"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
