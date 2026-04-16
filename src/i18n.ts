import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

export const resources = {
  en: {
    translation: {
      controls: {
        move: "Move",
        jump: "Jump",
        space: "Space",
        look: "Use mouse to look around",
        pause: "Menu / Change room",
        exitFullscreen: "Exit fullscreen",
        enter: "Enter",
        useMenuToChangeScenes: "Use menu to change rooms",
        touchAndDragToMove: "Touch and drag here to move",
        touchAndDragToLookAround: "Touch and drag here to look around",
        keyboardControlHints:
          "Click to explore, then use your mouse to look around and your keyboard to move",
        keyboardControlHintsPointerLocked:
          "Look around with your mouse and move with your keyboard",
      },
      menu: {
        clickToExplore: "Click to explore",
        selectScene: "Select Room",
        youAreHere: "You are here",
        continue: "Continue",
        exit: "Exit",
        current: "CURRENT",
        selectQuality: "Select Quality",
        quality: {
          lq: "Low",
          mq: "Standard",
          hq: "High",
        },
      },
      poi: {
        pressKeyToView: "Press <0>{{key}}</0> to view",
        touchToView: "Tap to view",
      },
      intro: {
        welcome: "Experience A Kind Of Art—now in digital form!",
        skipIntro: "Skip Intro",
        discover: "Discover now!",
      },
      loading: "Loading {{sceneName}}...",
    },
  },
  de: {
    translation: {
      controls: {
        move: "Bewegen",
        jump: "Springen",
        space: "Leertaste",
        look: "Mit der Maus umsehen",
        pause: "Menü / Raum wechseln",
        exitFullscreen: "Vollbild verlassen",
        enter: "Enter",
        useMenuToChangeScenes: "Menü verwenden, um Räume zu wechseln",
        touchAndDragToMove: "Hier berühren und ziehen zum bewegen",
        touchAndDragToLookAround: "Hier berühren und ziehen zum umsehen",
        keyboardControlHints:
          "Klicken, um zu erkunden, dann mit der Maus umsehen und mit der Tastatur bewegen",
        keyboardControlHintsPointerLocked:
          "Mit der Maus umsehen und mit der Tastatur bewegen",
      },
      menu: {
        clickToExplore: "Klicken, um zu erkunden",
        selectScene: "Raum auswählen",
        youAreHere: "Sie sind hier",
        continue: "Fortfahren",
        exit: "Beenden",
        current: "AKTUELL",
        selectQuality: "Qualität auswählen",
        quality: {
          lq: "Niedrig",
          mq: "Standard",
          hq: "Hoch",
        },
      },
      poi: {
        pressKeyToView: "Für mehr Infos <0>{{key}}</0> drücken",
        touchToView: "Tippen zum Ansehen",
      },
      intro: {
        welcome: "A Kind Of Art jetzt digital erleben!",
        skipIntro: "Intro überspringen",
        discover: "Jetzt erkunden!",
      },
      loading: "{{sceneName}} lädt...",
    },
  },
} as const;

// Only initialize if not in web component mode
if (!window.customElements.get("a-kind-of-art")) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "en",
      interpolation: { escapeValue: false },

      // Language detection configuration
      detection: {
        // Order of detection methods
        order: [
          "localStorage",
          "navigator", // browser language
          "htmlTag", // <html lang="...">
        ],

        // Keys to lookup language from
        lookupLocalStorage: "i18nextLng",

        // Cache user language on
        caches: ["localStorage"],

        // Optional: exclude certain languages
        excludeCacheFor: ["cimode"], // exclude cache for development mode
      },
    });
}

export default i18n;
