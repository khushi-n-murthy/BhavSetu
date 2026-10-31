// Tiny, dependency-free language helpers shared by server and client code.

export const LANGS = ["en", "kn", "hi"] as const;
export type Lang = (typeof LANGS)[number];
export type LocalText = Record<Lang, string>;
export type MaybeLocal = string | LocalText;

export const LANG_LABEL: Record<Lang, { short: string; name: string }> = {
  en: { short: "EN", name: "English" },
  kn: { short: "ಕನ್ನಡ", name: "Kannada" },
  hi: { short: "हिंदी", name: "Hindi" },
};

export function pick(t: MaybeLocal | undefined, lang: Lang): string {
  if (t === undefined) return "";
  return typeof t === "string" ? t : t[lang];
}

/** Fill {placeholders} from a map; unknown keys are left as-is so they are easy to spot. */
export function fill(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? vars[k] : m));
}
