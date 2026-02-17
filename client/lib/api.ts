const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
}

class ApiError extends Error {
  status: number;
  payload: any;

  constructor(message: string, status: number, payload: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  masterPassword: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface PasswordData {
  website: string;
  username: string;
  password: string;
  category?: string;
  notes?: string;
  url?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface Password {
  _id: string;
  user: string;
  website: string;
  username: string;
  encryptedPassword: string;
  category: "social" | "work" | "finance" | "shopping" | "other";
  notes?: string;
  url?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  lastModified: string;
}

export interface SessionInfo {
  id: string;
  loginTime: string;
  expiryTime: string;
  timeRemaining: number;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  getToken(): string | null {
    // Ensure token is synced with localStorage
    if (typeof window !== "undefined" && !this.token) {
      this.loadToken();
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP error! status: ${response.status}`,
          response.status,
          data,
        );
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Test server connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace("/api", "")}`);
      return response.ok;
    } catch (error) {
      console.error("Server connection test failed:", error);
      return false;
    }
  }

  // Auth endpoints
  async login(
    credentials: LoginCredentials,
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
    );

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async register(
    userData: RegisterData,
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await this.request<{ user: User; token: string }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(userData),
      },
    );

    if (response.success && response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async verifyMasterPassword(masterPassword: string): Promise<ApiResponse> {
    return this.request("/auth/verify-master", {
      method: "POST",
      body: JSON.stringify({ masterPassword }),
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request("/auth/profile");
  }

  async validateSession(): Promise<ApiResponse<{ session: SessionInfo }>> {
    return this.request("/auth/session");
  }

  // Password endpoints
  async getPasswords(params?: {
    category?: string;
    search?: string;
  }): Promise<ApiResponse<{ passwords: Password[]; count: number }>> {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== "all") {
      searchParams.append("category", params.category);
    }
    if (params?.search) {
      searchParams.append("search", params.search);
    }

    const endpoint = searchParams.toString()
      ? `/passwords?${searchParams.toString()}`
      : "/passwords";
    return this.request(endpoint);
  }

  async createPassword(
    passwordData: PasswordData,
  ): Promise<ApiResponse<{ password: Password }>> {
    return this.request("/passwords", {
      method: "POST",
      body: JSON.stringify(passwordData),
    });
  }

  async getPassword(id: string): Promise<ApiResponse<{ password: Password }>> {
    return this.request(`/passwords/${id}`);
  }

  async decryptPassword(
    id: string,
    masterPassword: string,
  ): Promise<ApiResponse<{ password: string }>> {
    return this.request(`/passwords/${id}/decrypt`, {
      method: "POST",
      body: JSON.stringify({ masterPassword }),
    });
  }

  async updatePassword(
    id: string,
    passwordData: Partial<PasswordData>,
  ): Promise<ApiResponse<{ password: Password }>> {
    return this.request(`/passwords/${id}`, {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  }

  async deletePassword(id: string): Promise<ApiResponse> {
    return this.request(`/passwords/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
