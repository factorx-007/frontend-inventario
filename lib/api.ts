const API_BASE_URL = 'https://backend-inventario-ttsr.onrender.com/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const errorData = await response.json();
    return { success: false, error: errorData.error?.message || errorData.message || 'Something went wrong' };
  }
  const data = await response.json();
  return { success: true, data };
}

export const api = {
  get: async <T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> => {
    const url = new URL(`${API_BASE_URL}${path}`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },

  post: async <T>(path: string, body: any): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  put: async <T>(path: string, body: any): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return handleResponse<T>(response);
  },

  delete: async <T>(path: string): Promise<ApiResponse<T>> => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },
};

