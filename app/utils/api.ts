let apiBaseUrl: string | null = null;

export const currentDomain = () => {
  let hostname = window.location.hostname;
  const hostnameParts = hostname.split('.');
  if (hostnameParts.length > 2) {
    hostnameParts.shift();
  }
  hostname = hostnameParts.join('.');
  const currentDomain = (['80', '443'].includes(window.location.port))
    ? `${hostname}`
    : `${hostname}:${window.location.port}`;
  return currentDomain;
};

export const getApiUrl = () => {
  if (apiBaseUrl) {
    return apiBaseUrl;
  }
  const runtimeConfig = useRuntimeConfig();
  apiBaseUrl = runtimeConfig.public?.API_BASE_URL.replace('{domain}', currentDomain());

  return apiBaseUrl;
};
