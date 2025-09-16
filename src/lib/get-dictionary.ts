
import 'server-only';

const dictionaries: Record<string, () => Promise<any>> = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  pt: () => import('@/dictionaries/pt.json').then((module) => module.default),
  es: () => import('@/dictionaries/es.json').then((module) => module.default),
};

export const getDictionary = async (locale: string) => {
    // Ajusta para suportar variações como 'en-US' -> 'en'
    const lang = locale.split('-')[0];
    const dictionaryLoader = dictionaries[lang] || dictionaries.pt;
    return dictionaryLoader();
};
