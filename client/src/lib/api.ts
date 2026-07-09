export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'An error occurred during the request');
  }

  return response.json();
}
