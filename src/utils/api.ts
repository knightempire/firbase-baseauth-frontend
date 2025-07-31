import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiRequestOptions, ApiResponse } from './types';

export async function refreshAccessToken(): Promise<string | null> {
  const endpoint = process.env.NEXT_PUBLIC_BACKEND_URL + '/refresh';
  try {
    const res = await axios.post(endpoint, {}, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.data && res.data.accessToken) {
      localStorage.setItem('accessToken', res.data.accessToken);
      return res.data.accessToken;
    } else {
      localStorage.removeItem('accessToken');
      return null;
    }
  } catch (err) {
    localStorage.removeItem('accessToken');
    return null;
  }
}



export async function apiRequest<T = any>(url: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || '') + url;
  const token = localStorage.getItem('accessToken');

  const axiosConfig: AxiosRequestConfig = {
    url: backendUrl,
    method: options.method || 'GET',
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    data: options.body ? JSON.parse(options.body) : undefined,
    withCredentials: true,
  };

  let res: AxiosResponse<T>;
  try {
    res = await axios(axiosConfig);
    return {
      ok: true,
      status: res.status,
      json: async () => res.data,
      statusText: res.statusText,
    };
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        throw new Error('Session expired. Could not refresh token.');
      }
      axiosConfig.headers = {
        ...(axiosConfig.headers as Record<string, string>),
        Authorization: `Bearer ${newToken}`,
      };
      try {
        res = await axios(axiosConfig);
        return {
          ok: true,
          status: res.status,
          json: async () => res.data,
          statusText: res.statusText,
        };
      } catch (retryError: any) {
        return {
          ok: false,
          status: retryError.response?.status || 500,
          json: async () => retryError.response?.data || {},
          statusText: retryError.response?.statusText || 'Unknown error',
        };
      }
    }
    return {
      ok: false,
      status: error.response?.status || 500,
      json: async () => error.response?.data || {},
      statusText: error.response?.statusText || 'Unknown error',
    };
  }
}
