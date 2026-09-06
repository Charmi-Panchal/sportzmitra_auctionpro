export const API_ROOT = (
  import.meta.env.VITE_API_ROOT ||
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000"
).replace(/\/api\/?$/, "").replace(/\/+$/, "");

/**
 * Normalizes relative image paths to full URLs or passes absolute/data/blob URIs through.
 */
export function getImageUrl(url) {
  if (!url) return "";

  const value = String(url).trim();
  if (!value) return "";

  // Support absolute URLs, base64 data URIs, and local blob preview URLs
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  // Ensure relative path starts with a single leading slash
  const cleanPath = value.startsWith("/") ? value : `/${value}`;

  return `${API_ROOT}${cleanPath}`;
}