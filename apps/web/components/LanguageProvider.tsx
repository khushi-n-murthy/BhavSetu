"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { LANGS, LANG_LABEL, type Lang } from "@/lib/i18n";

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "en", setLang: () => {} });

const KEY = "bhavsetu-lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(KEY) as Lang | null;
      if (saved && LANGS.includes(saved)) setLangState(saved);
    } catch {
      /* storage unavailable: stay in English */
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(KEY, l);
    } catch {
      /* ignore */
    }
  };

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** BCP-47 tag for the `lang` attribute on translated text. */
export const langTag = (l: Lang) => (l === "en" ? "en-IN" : l);

export function LangSwitch({ label = "Language", compact = false }: { label?: string; compact?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full border border-line bg-paper p-0.5">
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={lang === l}
          lang={langTag(l)}
          title={LANG_LABEL[l].name}
          onClick={() => setLang(l)}
          className={`min-h-[36px] rounded-full px-3 text-sm font-medium transition-colors ${compact ? "px-2.5" : ""} ${
            lang === l ? "bg-ink text-white" : "text-ink-soft hover:bg-surface"
          }`}
        >
          {LANG_LABEL[l].short}
        </button>
      ))}
    </div>
  );
}
