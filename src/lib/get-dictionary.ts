
import 'server-only';
import type { Locale } from '@/../i18n.config';

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  pt: () => import('@/dictionaries/pt.json').then((module) => module.default),
  es: () => import('@/dictionaries/es.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
    // Fallback to 'pt' if the locale is not found
    const lang = locale.split('-')[0] as keyof typeof dictionaries;
    const dictionaryLoader = dictionaries[lang] || dictionaries.pt;
    return dictionaryLoader();
};
