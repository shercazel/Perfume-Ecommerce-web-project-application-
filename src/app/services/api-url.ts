export function apiUrl(path = ''): string {
  const hostname = typeof window !== 'undefined' && window.location.hostname
    ? window.location.hostname
    : 'localhost';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `http://${hostname}:3000${normalizedPath}`;
}
