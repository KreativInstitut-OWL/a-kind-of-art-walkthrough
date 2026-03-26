import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./i18n";

export function initI18nForWebComponent(lang?: string) {
  return i18n.use(initReactI18next).init({
    resources,
    lng: lang || "en", // Use provided lang or fallback
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });
}
