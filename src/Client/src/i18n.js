// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import el from "./locales/el.json"; // Import the Greek translation file
import en from "./locales/en.json";

const resources = {
  en: {
    translation: en,
  },
  gr: {
    translation: el,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
