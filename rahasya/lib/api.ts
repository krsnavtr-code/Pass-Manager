export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  sessionId?: string;
  user?: { id: string; name: string; email: string };
  passwords?: any[];
  password?: any;
  count?: number;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export type ApiClientOptions = {
  baseUrl?: string;
  getAuthToken?: () => Promise<string | null>;
  onUnauthorized?: () => void;
};

export function getDefaultBaseUrl(): string {
  return (
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    "https://rahasya.trivixa.in/api"
  );
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? getDefaultBaseUrl();

  async function request<T>(
    endpoint: string,
    init: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    };

    const token = options.getAuthToken ? await options.getAuthToken() : null;
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${baseUrl}${endpoint}`, {
      ...init,
      headers,
    });

    let payload: any = null;
    try {
      payload = await res.json();
    } catch {
      payload = null;
    }

    if (!res.ok) {
      if (res.status === 401 && options.onUnauthorized)
        options.onUnauthorized();
      throw new ApiError(
        payload?.message || `HTTP ${res.status}`,
        res.status,
        payload,
      );
    }

    return payload as ApiResponse<T>;
  }

  return {
    baseUrl,
    request,
    login: (body: { email: string; password: string }) =>
      request<{
        user: { id: string; name: string; email: string };
        token: string;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    register: (body: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
      masterPassword: string;
    }) =>
      request<{
        user: { id: string; name: string; email: string };
        token: string;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    getProfile: () =>
      request<{
        user: { id: string; name: string; email: string; createdAt: string };
      }>("/auth/profile"),
    validateSession: () =>
      request<{
        session: {
          id: string;
          loginTime: string;
          expiryTime: string;
          timeRemaining: number;
        };
      }>("/auth/session"),
    getPasswords: () =>
      request<{ passwords: any[]; count: number }>("/passwords"),
    createPassword: (body: {
      website: string;
      username: string;
      password: string;
      masterPassword: string;
      category?: string;
      notes?: string;
      url?: string;
      tags?: string[];
      isFavorite?: boolean;
    }) =>
      request<{ password: any }>("/passwords", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    decryptPassword: (id: string, masterPassword: string) =>
      request<{ password: string }>(`/passwords/${id}/decrypt`, {
        method: "POST",
        body: JSON.stringify({ masterPassword }),
      }),
    deletePassword: (id: string) =>
      request(`/passwords/${id}`, { method: "DELETE" }),
  };
}
