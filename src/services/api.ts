import { Product, Route, Station, StationHistoryEntry } from '@/types';

const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    type: string;
    message: string;
    details?: string[];
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    department: string;
  };
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateProductRequest {
  name: string;
  model: string;
  route_id: string;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface UpdateProductRequest {
  name?: string;
  model?: string;
  route_id?: string;
  current_station_id?: string | null;
  progress?: number;
  status?: 'normal' | 'overdue';
  priority?: 'low' | 'medium' | 'high';
}

export interface ProductFilters {
  search?: string;
  status?: 'normal' | 'overdue';
  route_id?: string;
  owner?: string;
  priority?: 'low' | 'medium' | 'high';
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface BulkUpdateRequest {
  product_ids: string[];
  updates: {
    status?: 'normal' | 'overdue';
    priority?: 'low' | 'medium' | 'high';
    current_station_id?: string | null;
  };
}

export interface AdvanceProductRequest {
  notes?: string;
  field_data?: Record<string, any>;
}

export interface CreateRouteRequest {
  name: string;
  description?: string;
  station_ids: string[];
}

export interface CreateStationRequest {
  name: string;
  owner: string;
  completion_rule: 'all_filled' | 'custom';
  estimated_duration: number;
  fields?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea';
    is_required: boolean;
    options?: string[];
    default_value?: string;
    validation_rules?: Record<string, any>;
  }>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public type: string,
    message: string,
    public details?: string[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.error?.type || 'api_error',
          data.error?.message || 'An error occurred',
          data.error?.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          408,
          'timeout_error',
          'Request timed out. Please try again.'
        );
      }
      
      throw new ApiError(
        0,
        'network_error',
        'Network error occurred. Please check your connection.'
      );
    }
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    if (!this.refreshToken) {
      throw new ApiError(401, 'auth_required', 'Authentication required');
    }

    try {
      const response = await this.makeRequest<AuthResponse>('/auth/refresh', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.refreshToken}`,
        },
      });

      this.setTokens(response.data.token, response.data.refreshToken);
    } catch (error) {
      this.clearTokens();
      throw new ApiError(401, 'auth_expired', 'Session expired. Please login again.');
    }
  }

  private setTokens(token: string, refreshToken: string): void {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setTokens(response.data.token, response.data.refreshToken);
    return response.data;
  }

  async logout(): Promise<void> {
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser(): any {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  // Products
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/products${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await this.makeRequest<ProductsResponse>(endpoint);
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.makeRequest<Product>(`/products/${id}`);
    return response.data;
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    const response = await this.makeRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return response.data;
  }

  async updateProduct(id: string, updates: UpdateProductRequest): Promise<Product> {
    const response = await this.makeRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await this.makeRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async advanceProduct(id: string, data: AdvanceProductRequest): Promise<Product> {
    const response = await this.makeRequest<Product>(`/products/${id}/advance`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async bulkUpdateProducts(bulkUpdate: BulkUpdateRequest): Promise<{ updated_count: number }> {
    const response = await this.makeRequest<{ updated_count: number }>('/products/bulk', {
      method: 'POST',
      body: JSON.stringify(bulkUpdate),
    });
    return response.data;
  }

  // Routes
  async getRoutes(): Promise<Route[]> {
    const response = await this.makeRequest<Route[]>('/routes');
    return response.data;
  }

  async getRoute(id: string): Promise<Route> {
    const response = await this.makeRequest<Route>(`/routes/${id}`);
    return response.data;
  }

  async createRoute(route: CreateRouteRequest): Promise<Route> {
    const response = await this.makeRequest<Route>('/routes', {
      method: 'POST',
      body: JSON.stringify(route),
    });
    return response.data;
  }

  async updateRoute(id: string, updates: Partial<CreateRouteRequest>): Promise<Route> {
    const response = await this.makeRequest<Route>(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  async deleteRoute(id: string): Promise<void> {
    await this.makeRequest(`/routes/${id}`, {
      method: 'DELETE',
    });
  }

  // Stations
  async getStations(): Promise<Station[]> {
    const response = await this.makeRequest<Station[]>('/stations');
    return response.data;
  }

  async getStation(id: string): Promise<Station> {
    const response = await this.makeRequest<Station>(`/stations/${id}`);
    return response.data;
  }

  async createStation(station: CreateStationRequest): Promise<Station> {
    const response = await this.makeRequest<Station>('/stations', {
      method: 'POST',
      body: JSON.stringify(station),
    });
    return response.data;
  }

  async updateStation(id: string, updates: Partial<CreateStationRequest>): Promise<Station> {
    const response = await this.makeRequest<Station>(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  async deleteStation(id: string): Promise<void> {
    await this.makeRequest(`/stations/${id}`, {
      method: 'DELETE',
    });
  }

  // Analytics
  async getAnalytics(filters?: { start?: string; end?: string }): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }

    const endpoint = `/analytics${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await this.makeRequest<any>(endpoint);
    return response.data;
  }

  async getStationAnalytics(): Promise<any> {
    const response = await this.makeRequest<any>('/analytics/stations');
    return response.data;
  }

  async getOwnerAnalytics(): Promise<any> {
    const response = await this.makeRequest<any>('/analytics/owners');
    return response.data;
  }

  // Health
  async getHealth(): Promise<any> {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.json();
  }
}

export const apiService = new ApiService();
export { ApiError };