let apiBaseUrl: string | null = null;
let apiBaseUrlLongTask: string | null = null;

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

export const getApiUrl = (longTask: boolean = false) => {
  if (longTask) {
    if (apiBaseUrlLongTask) {
      return apiBaseUrlLongTask;
    }
    const runtimeConfig = useRuntimeConfig();
    apiBaseUrlLongTask = (runtimeConfig.public?.API_BASE_URL_LONG_TASK as string).replace('{domain}', currentDomain());
    return apiBaseUrlLongTask;
  } else {
    if (apiBaseUrl) {
      return apiBaseUrl;
    }
    const runtimeConfig = useRuntimeConfig();
    apiBaseUrl = (runtimeConfig.public?.API_BASE_URL as string).replace('{domain}', currentDomain());
    return apiBaseUrl;
  }
};
