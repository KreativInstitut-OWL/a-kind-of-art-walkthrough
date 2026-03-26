let baseUrl = "";

export function setAssetBaseUrl(url: string) {
  baseUrl = url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getAssetUrl(path?: string) {
  return baseUrl ? `${baseUrl}${path}` : path;
}
