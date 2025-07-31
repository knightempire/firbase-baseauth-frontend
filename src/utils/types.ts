export interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  json: () => Promise<T>;
  statusText: string;
}
