/**
 * Utilidades para manejo de idiomas y banderas
 */

export interface LanguageFlag {
  type: 'fi' | 'img';
  value: string;
}

/**
 * Obtiene la configuración de la bandera para un idioma dado
 * @param lang - Código del idioma (es, en, fr, pt, cat, eu, gl)
 * @returns Objeto con el tipo de bandera y su valor
 */
export const getLanguageFlag = (lang: string): LanguageFlag => {
  const flagMap: { [key: string]: LanguageFlag } = {
    'es': { type: 'fi', value: 'es' },
    'en': { type: 'fi', value: 'gb' },
    'fr': { type: 'fi', value: 'fr' },
    'pt': { type: 'fi', value: 'pt' },
    'cat': { type: 'img', value: '/flags/catalonia.svg' },
    'eu': { type: 'img', value: '/flags/basque.svg' },
    'gl': { type: 'img', value: '/flags/galicia.svg' }
  };
  return flagMap[lang] || { type: 'fi', value: 'es' };
};

