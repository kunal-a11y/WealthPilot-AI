let _baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (_baseUrl.endsWith('/')) _baseUrl = _baseUrl.slice(0, -1);
if (!_baseUrl.endsWith('/api')) _baseUrl += '/api';

export const API_URL = _baseUrl;

export async function fetchWithAuth(
  endpoint: string, 
  getToken: () => Promise<string | null>, 
  options: RequestInit = {}
) {
  const token = await getToken();
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'An error occurred during the request');
  }

  return response.json();
}
