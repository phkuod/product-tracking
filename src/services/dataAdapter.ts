import { Product, Route, Station } from '@/types';
import { mockProducts, mockRoutes, mockStations } from './mockData';
import { api, withRetry } from './apiService';

// Configuration for data source
const USE_API = process.env.REACT_APP_USE_API === 'true';

// Data Adapter Interface
export interface DataAdapter {
  // Product operations
  getProducts: (params?: any) => Promise<Product[]>;
  getProduct: (id: string) => Promise<Product>;
  createProduct: (product: any) => Promise<Product>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  bulkUpdateProducts: (ids: string[], updates: Partial<Product>) => Promise<Product[]>;

  // Route operations
  getRoutes: () => Promise<Route[]>;
  getRoute: (id: string) => Promise<Route>;
  createRoute: (route: any) => Promise<Route>;
  updateRoute: (id: string, updates: Partial<Route>) => Promise<Route>;
  deleteRoute: (id: string) => Promise<void>;

  // Station operations
  getStations: () => Promise<Station[]>;
  getStation: (id: string) => Promise<Station>;
  createStation: (station: any) => Promise<Station>;
  updateStation: (id: string, updates: Partial<Station>) => Promise<Station>;
  deleteStation: (id: string) => Promise<void>;
}

// Mock Data Adapter (Current Implementation)
class MockDataAdapter implements DataAdapter {
  private products: Product[] = [...mockProducts];
  private routes: Route[] = [...mockRoutes];
  private stations: Station[] = [...mockStations];

  // Simulate API delay for realistic testing
  private async delay(ms: number = 200): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Product operations
  async getProducts(params?: any): Promise<Product[]> {
    await this.delay();
    let filtered = [...this.products];

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.model.toLowerCase().includes(search)
      );
    }

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(p => p.status === params.status);
    }

    if (params?.route) {
      filtered = filtered.filter(p => p.route.id === params.route);
    }

    return filtered;
  }

  async getProduct(id: string): Promise<Product> {
    await this.delay();
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    return { ...product };
  }

  async createProduct(productData: any): Promise<Product> {
    await this.delay();
    const product: Product = {
      ...productData,
      id: `product-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: 0,
      status: 'normal' as const,
      stationHistory: []
    };
    this.products.push(product);
    return { ...product };
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    await this.delay();
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }
    
    this.products[index] = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date()
    };
    
    return { ...this.products[index] };
  }

  async deleteProduct(id: string): Promise<void> {
    await this.delay();
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Product with id ${id} not found`);
    }
    this.products.splice(index, 1);
  }

  async bulkUpdateProducts(ids: string[], updates: Partial<Product>): Promise<Product[]> {
    await this.delay();
    const updatedProducts: Product[] = [];
    
    for (const id of ids) {
      const index = this.products.findIndex(p => p.id === id);
      if (index !== -1) {
        this.products[index] = {
          ...this.products[index],
          ...updates,
          updatedAt: new Date()
        };
        updatedProducts.push({ ...this.products[index] });
      }
    }
    
    return updatedProducts;
  }

  // Route operations
  async getRoutes(): Promise<Route[]> {
    await this.delay();
    return [...this.routes];
  }

  async getRoute(id: string): Promise<Route> {
    await this.delay();
    const route = this.routes.find(r => r.id === id);
    if (!route) {
      throw new Error(`Route with id ${id} not found`);
    }
    return { ...route };
  }

  async createRoute(routeData: any): Promise<Route> {
    await this.delay();
    const route: Route = {
      ...routeData,
      id: `route-${Date.now()}`
    };
    this.routes.push(route);
    return { ...route };
  }

  async updateRoute(id: string, updates: Partial<Route>): Promise<Route> {
    await this.delay();
    const index = this.routes.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Route with id ${id} not found`);
    }
    
    this.routes[index] = { ...this.routes[index], ...updates };
    return { ...this.routes[index] };
  }

  async deleteRoute(id: string): Promise<void> {
    await this.delay();
    const index = this.routes.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error(`Route with id ${id} not found`);
    }
    this.routes.splice(index, 1);
  }

  // Station operations
  async getStations(): Promise<Station[]> {
    await this.delay();
    return [...this.stations];
  }

  async getStation(id: string): Promise<Station> {
    await this.delay();
    const station = this.stations.find(s => s.id === id);
    if (!station) {
      throw new Error(`Station with id ${id} not found`);
    }
    return { ...station };
  }

  async createStation(stationData: any): Promise<Station> {
    await this.delay();
    const station: Station = {
      ...stationData,
      id: `station-${Date.now()}`
    };
    this.stations.push(station);
    return { ...station };
  }

  async updateStation(id: string, updates: Partial<Station>): Promise<Station> {
    await this.delay();
    const index = this.stations.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Station with id ${id} not found`);
    }
    
    this.stations[index] = { ...this.stations[index], ...updates };
    return { ...this.stations[index] };
  }

  async deleteStation(id: string): Promise<void> {
    await this.delay();
    const index = this.stations.findIndex(s => s.id === id);
    if (index === -1) {
      throw new Error(`Station with id ${id} not found`);
    }
    this.stations.splice(index, 1);
  }
}

// API Data Adapter (Future Implementation)
class ApiDataAdapter implements DataAdapter {
  async getProducts(params?: any): Promise<Product[]> {
    const response = await withRetry(() => api.products.getProducts(params));
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    return withRetry(() => api.products.getProduct(id));
  }

  async createProduct(product: any): Promise<Product> {
    return withRetry(() => api.products.createProduct(product));
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return withRetry(() => api.products.updateProduct(id, updates));
  }

  async deleteProduct(id: string): Promise<void> {
    return withRetry(() => api.products.deleteProduct(id));
  }

  async bulkUpdateProducts(ids: string[], updates: Partial<Product>): Promise<Product[]> {
    return withRetry(() => api.products.bulkUpdateProducts(ids, updates));
  }

  async getRoutes(): Promise<Route[]> {
    return withRetry(() => api.routes.getRoutes());
  }

  async getRoute(id: string): Promise<Route> {
    return withRetry(() => api.routes.getRoute(id));
  }

  async createRoute(route: any): Promise<Route> {
    return withRetry(() => api.routes.createRoute(route));
  }

  async updateRoute(id: string, updates: Partial<Route>): Promise<Route> {
    return withRetry(() => api.routes.updateRoute(id, updates));
  }

  async deleteRoute(id: string): Promise<void> {
    return withRetry(() => api.routes.deleteRoute(id));
  }

  async getStations(): Promise<Station[]> {
    return withRetry(() => api.stations.getStations());
  }

  async getStation(id: string): Promise<Station> {
    return withRetry(() => api.stations.getStation(id));
  }

  async createStation(station: any): Promise<Station> {
    return withRetry(() => api.stations.createStation(station));
  }

  async updateStation(id: string, updates: Partial<Station>): Promise<Station> {
    return withRetry(() => api.stations.updateStation(id, updates));
  }

  async deleteStation(id: string): Promise<void> {
    return withRetry(() => api.stations.deleteStation(id));
  }
}

// Export the appropriate adapter based on configuration
export const dataAdapter: DataAdapter = USE_API 
  ? new ApiDataAdapter() 
  : new MockDataAdapter();

// Export both adapters for testing purposes
export { MockDataAdapter, ApiDataAdapter };