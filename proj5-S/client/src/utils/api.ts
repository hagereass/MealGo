// API utility to handle base URL based on environment
const getApiBaseUrl = (): string => {
  // Production: use Vercel environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://mealgo-production.up.railway.app';
  }

  // Development: use localhost
  return 'http://localhost:4000';
};

export const apiCall = async (
  endpoint: string,
  options?: RequestInit
): Promise<Response> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  return fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for auth
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

export const api = {
  get: (endpoint: string, options?: RequestInit) =>
    apiCall(endpoint, { ...options, method: 'GET' }),

  post: (endpoint: string, body?: unknown, options?: RequestInit) =>
    apiCall(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: (endpoint: string, body?: unknown, options?: RequestInit) =>
    apiCall(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiCall(endpoint, { ...options, method: 'DELETE' }),
};
