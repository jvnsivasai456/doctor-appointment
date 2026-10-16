"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type Language = "en" | "ta" | "te";
type FontSize = "small" | "normal" | "large";

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Core trilingual dictionary
import { translations } from "@/i18n/translations";

export function Providers({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");

  useEffect(() => {
    const savedLang = localStorage.getItem("medibook_lang") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "ta" || savedLang === "te")) {
      setLangState(savedLang);
    }
    const savedFontSize = localStorage.getItem("medibook_font_size") as FontSize;
    if (savedFontSize) {
      setFontSizeState(savedFontSize);
      applyFontSize(savedFontSize);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("medibook_lang", newLang);
  };

  const applyFontSize = (size: FontSize) => {
    const root = document.documentElement;
    if (size === "small") root.style.setProperty("--font-scale", "0.9rem");
    else if (size === "large") root.style.setProperty("--font-scale", "1.15rem");
    else root.style.setProperty("--font-scale", "1rem");
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem("medibook_font_size", size);
    applyFontSize(size);
  };

  const t = (key: string): string => {
    const dict = translations[lang] || translations.en;
    return dict[key] || translations.en[key] || key;
  };

  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <AppContext.Provider value={{ lang, setLang, fontSize, setFontSize, t }}>
          {children}
        </AppContext.Provider>
      </NextThemesProvider>
    </SessionProvider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within Providers");
  }
  return context;
}
