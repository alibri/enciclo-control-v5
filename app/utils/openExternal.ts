import { currentDomain } from './api';

export const getPageLink = (collection: string, title: string): string => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public?.PAGE_BASE_URL
    ?.replace('{collection}', collection)
    ?.replace('{title}', title)
    ?.replace('{domain}', currentDomain()) ||
    '';
};

export const getEditorLink = (collection: string, title: string): string => {
  const runtimeConfig = useRuntimeConfig();
  return runtimeConfig.public?.EDITOR_BASE_URL
    ?.replace('{collection}', collection)
    ?.replace('{title}', title)
    ?.replace('{domain}', currentDomain()) ||
    '';
};

export const openPage = (url: string) => {
  console.log(url);
  window.open(url, '_blank', 'noreferrer');
};
