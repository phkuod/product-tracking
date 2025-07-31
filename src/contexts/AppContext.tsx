import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import { Product, Route, Station } from '@/types';
import { apiService, ApiError, ProductFilters, CreateProductRequest, UpdateProductRequest, BulkUpdateRequest } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface AppState {
  products: Product[];
  routes: Route[];
  stations: Station[];
  notifications: Notification[];
  currentView: 'dashboard' | 'detail' | 'analytics' | 'stations' | 'routes';
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

type AppAction =
  | { type: 'SET_PRODUCTS'; payload: { products: Product[]; pagination: AppState['pagination'] } }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_ROUTES'; payload: Route[] }
  | { type: 'ADD_ROUTE'; payload: Route }
  | { type: 'UPDATE_ROUTE'; payload: Route }
  | { type: 'DELETE_ROUTE'; payload: string }
  | { type: 'SET_STATIONS'; payload: Station[] }
  | { type: 'ADD_STATION'; payload: Station }
  | { type: 'UPDATE_STATION'; payload: Station }
  | { type: 'DELETE_STATION'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'SET_CURRENT_VIEW'; payload: AppState['currentView'] }
  | { type: 'SET_SELECTED_PRODUCT'; payload: Product | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: AppState = {
  products: [],
  routes: [],
  stations: [],
  notifications: [],
  currentView: 'dashboard',
  selectedProduct: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { 
        ...state, 
        products: action.payload.products, 
        pagination: action.payload.pagination 
      };
    
    case 'ADD_PRODUCT':
      return { 
        ...state, 
        products: [...state.products, action.payload] 
      };
    
    case 'UPDATE_PRODUCT': {
      const updatedProducts = state.products.map(product =>
        product.id === action.payload.id ? action.payload : product
      );
      return { 
        ...state, 
        products: updatedProducts,
        selectedProduct: state.selectedProduct?.id === action.payload.id 
          ? action.payload 
          : state.selectedProduct
      };
    }
    
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload),
        selectedProduct: state.selectedProduct?.id === action.payload 
          ? null 
          : state.selectedProduct
      };
    
    case 'SET_ROUTES':
      return { ...state, routes: action.payload };
    
    case 'ADD_ROUTE':
      return { ...state, routes: [...state.routes, action.payload] };
    
    case 'UPDATE_ROUTE': {
      const updatedRoutes = state.routes.map(route =>
        route.id === action.payload.id ? action.payload : route
      );
      return { ...state, routes: updatedRoutes };
    }
    
    case 'DELETE_ROUTE':
      return {
        ...state,
        routes: state.routes.filter(route => route.id !== action.payload)
      };
    
    case 'SET_STATIONS':
      return { ...state, stations: action.payload };
    
    case 'ADD_STATION':
      return { ...state, stations: [...state.stations, action.payload] };
    
    case 'UPDATE_STATION': {
      const updatedStations = state.stations.map(station =>
        station.id === action.payload.id ? action.payload : station
      );
      return { ...state, stations: updatedStations };
    }
    
    case 'DELETE_STATION':
      return {
        ...state,
        stations: state.stations.filter(station => station.id !== action.payload)
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, read: true }
            : notification
        )
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    
    case 'SET_SELECTED_PRODUCT':
      return { ...state, selectedProduct: action.payload };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  loadProducts: (filters?: ProductFilters) => Promise<void>;
  loadRoutes: () => Promise<void>;
  loadStations: () => Promise<void>;
  addProduct: (product: CreateProductRequest) => Promise<void>;
  updateProduct: (id: string, updates: UpdateProductRequest) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  bulkUpdateProducts: (bulkUpdate: BulkUpdateRequest) => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  setCurrentView: (view: AppState['currentView']) => void;
  setSelectedProduct: (product: Product | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Memoized notification function (no dependencies)
  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  }, []);

  // Memoized error handler (depends on addNotification)
  const handleApiError = useCallback((error: unknown, operation: string) => {
    let errorMessage = `Failed to ${operation}`;
    
    if (error instanceof ApiError) {
      switch (error.type) {
        case 'network_error':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'authentication':
          errorMessage = 'Authentication failed. Please login again.';
          break;
        case 'authorization':
          errorMessage = 'You do not have permission to perform this action.';
          break;
        default:
          errorMessage = error.message;
      }
    }

    dispatch({ type: 'SET_ERROR', payload: errorMessage });
    addNotification({
      type: 'error',
      title: 'Error',
      message: errorMessage
    });
  }, [addNotification]);

  // Memoized load functions (depend on handleApiError)
  const loadProducts = useCallback(async (filters?: ProductFilters) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const response = await apiService.getProducts(filters);
      dispatch({ 
        type: 'SET_PRODUCTS', 
        payload: {
          products: response.products,
          pagination: response.pagination
        }
      });
    } catch (error) {
      handleApiError(error, 'load products');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [handleApiError]);

  const loadRoutes = useCallback(async () => {
    try {
      const routes = await apiService.getRoutes();
      dispatch({ type: 'SET_ROUTES', payload: routes });
    } catch (error) {
      handleApiError(error, 'load routes');
    }
  }, [handleApiError]);

  const loadStations = useCallback(async () => {
    try {
      const stations = await apiService.getStations();
      dispatch({ type: 'SET_STATIONS', payload: stations });
    } catch (error) {
      handleApiError(error, 'load stations');
    }
  }, [handleApiError]);

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('AppContext: User authenticated, loading initial data...');
      
      const loadInitialData = async () => {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          dispatch({ type: 'SET_ERROR', payload: null });
          
          // Load data sequentially with individual timeouts
          console.log('AppContext: Loading products...');
          await loadProducts();
          
          console.log('AppContext: Loading routes...');
          await loadRoutes();
          
          console.log('AppContext: Loading stations...');
          await loadStations();
          
          console.log('AppContext: Initial data loading complete');
        } catch (error) {
          console.error('AppContext: Initial data loading failed:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load initial data. Please try logging in again.' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      };

      loadInitialData();
    }
  }, [isAuthenticated, loadProducts, loadRoutes, loadStations]);

  const addProduct = async (productData: CreateProductRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const newProduct = await apiService.createProduct(productData);
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      
      addNotification({
        type: 'success',
        title: 'Product Added',
        message: `${newProduct.name} has been added to the tracking system.`
      });
    } catch (error) {
      handleApiError(error, 'add product');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateProduct = async (id: string, updates: UpdateProductRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const updatedProduct = await apiService.updateProduct(id, updates);
      dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      
      addNotification({
        type: 'info',
        title: 'Product Updated',
        message: `${updatedProduct.name} has been updated.`
      });
    } catch (error) {
      handleApiError(error, 'update product');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const product = state.products?.find(p => p.id === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      await apiService.deleteProduct(productId);
      dispatch({ type: 'DELETE_PRODUCT', payload: productId });
      
      addNotification({
        type: 'warning',
        title: 'Product Deleted',
        message: `${product.name} has been removed from the tracking system.`
      });
    } catch (error) {
      handleApiError(error, 'delete product');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const bulkUpdateProducts = async (bulkUpdate: BulkUpdateRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const result = await apiService.bulkUpdateProducts(bulkUpdate);
      
      // Reload products to get updated data
      await loadProducts();
      
      addNotification({
        type: 'success',
        title: 'Bulk Update Complete',
        message: `${result.updated_count} products have been updated.`
      });
    } catch (error) {
      handleApiError(error, 'bulk update products');
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const markNotificationRead = (notificationId: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const setCurrentView = (view: AppState['currentView']) => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view });
  };

  const setSelectedProduct = (product: Product | null) => {
    dispatch({ type: 'SET_SELECTED_PRODUCT', payload: product });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    loadProducts,
    loadRoutes,
    loadStations,
    addProduct,
    updateProduct,
    deleteProduct,
    bulkUpdateProducts,
    addNotification,
    markNotificationRead,
    clearNotifications,
    setCurrentView,
    setSelectedProduct,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}