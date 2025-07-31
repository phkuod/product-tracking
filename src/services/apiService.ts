import { Product, Route, Station } from '@/types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 10000; // 10 seconds

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API Request Function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408, 'TIMEOUT');
    }

    throw new ApiError(
      error.message || 'Network error occurred',
      0,
      'NETWORK_ERROR'
    );
  }
}

// Product API
export const productApi = {
  // Get all products with optional filtering
  async getProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    route?: string;
    owner?: string;
  }): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/products${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiRequest<PaginatedResponse<Product>>(endpoint);
    return response.data;
  },

  // Get single product
  async getProduct(id: string): Promise<Product> {
    const response = await apiRequest<Product>(`/products/${id}`);
    return response.data;
  },

  // Create new product
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const response = await apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return response.data;
  },

  // Update product
  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await apiRequest<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return response.data;
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    await apiRequest<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Bulk operations
  async bulkUpdateProducts(ids: string[], updates: Partial<Product>): Promise<Product[]> {
    const response = await apiRequest<Product[]>('/products/bulk', {
      method: 'PATCH',
      body: JSON.stringify({ ids, updates }),
    });
    return response.data;
  },

  // Advance product to next station
  async advanceProduct(id: string, notes?: string): Promise<Product> {
    const response = await apiRequest<Product>(`/products/${id}/advance`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
    return response.data;
  },
};

// Route API
export const routeApi = {
  async getRoutes(): Promise<Route[]> {
    const response = await apiRequest<Route[]>('/routes');
    return response.data;
  },

  async getRoute(id: string): Promise<Route> {
    const response = await apiRequest<Route>(`/routes/${id}`);
    return response.data;
  },

  async createRoute(route: Omit<Route, 'id'>): Promise<Route> {
    const response = await apiRequest<Route>('/routes', {
      method: 'POST',
      body: JSON.stringify(route),
    });
    return response.data;
  },

  async updateRoute(id: string, route: Partial<Route>): Promise<Route> {
    const response = await apiRequest<Route>(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(route),
    });
    return response.data;
  },

  async deleteRoute(id: string): Promise<void> {
    await apiRequest<void>(`/routes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Station API
export const stationApi = {
  async getStations(): Promise<Station[]> {
    const response = await apiRequest<Station[]>('/stations');
    return response.data;
  },

  async getStation(id: string): Promise<Station> {
    const response = await apiRequest<Station>(`/stations/${id}`);
    return response.data;
  },

  async createStation(station: Omit<Station, 'id'>): Promise<Station> {
    const response = await apiRequest<Station>('/stations', {
      method: 'POST',
      body: JSON.stringify(station),
    });
    return response.data;
  },

  async updateStation(id: string, station: Partial<Station>): Promise<Station> {
    const response = await apiRequest<Station>(`/stations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(station),
    });
    return response.data;
  },

  async deleteStation(id: string): Promise<void> {
    await apiRequest<void>(`/stations/${id}`, {
      method: 'DELETE',
    });
  },
};

// Analytics API
export const analyticsApi = {
  async getAnalytics(dateRange?: { start: string; end: string }) {
    const queryParams = new URLSearchParams();
    if (dateRange) {
      queryParams.append('start', dateRange.start);
      queryParams.append('end', dateRange.end);
    }
    
    const endpoint = `/analytics${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await apiRequest<any>(endpoint);
    return response.data;
  },

  async getStationUtilization() {
    const response = await apiRequest<any>('/analytics/stations');
    return response.data;
  },

  async getOwnerPerformance() {
    const response = await apiRequest<any>('/analytics/owners');
    return response.data;
  },
};

// Export all APIs
export const api = {
  products: productApi,
  routes: routeApi,
  stations: stationApi,
  analytics: analyticsApi,
};

// Retry mechanism for failed requests
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError!;
}