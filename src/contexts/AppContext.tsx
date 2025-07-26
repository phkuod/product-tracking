import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Product, Route, Station } from '@/types';
import { mockProducts, mockRoutes, mockStations } from '@/services/mockData';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface AppState {
  products: Product[];
  routes: Route[];
  stations: Station[];
  notifications: Notification[];
  currentView: 'dashboard' | 'detail' | 'analytics' | 'stations' | 'routes';
  selectedProduct: Product | null;
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
  | { type: 'SET_PRODUCTS'; payload: Product[] }
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
  | { type: 'SET_SELECTED_PRODUCT'; payload: Product | null };

const initialState: AppState = {
  products: mockProducts,
  routes: mockRoutes,
  stations: mockStations,
  notifications: [],
  currentView: 'dashboard',
  selectedProduct: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    
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
    
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  setCurrentView: (view: AppState['currentView']) => void;
  setSelectedProduct: (product: Product | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [persistedProducts, setPersistedProducts] = useLocalStorage<Product[]>('products', mockProducts);
  const [persistedRoutes, setPersistedRoutes] = useLocalStorage<Route[]>('routes', mockRoutes);
  const [persistedStations, setPersistedStations] = useLocalStorage<Station[]>('stations', mockStations);
  
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    products: persistedProducts,
    routes: persistedRoutes,
    stations: persistedStations,
  });

  // Sync state changes to localStorage
  useEffect(() => {
    setPersistedProducts(state.products);
  }, [state.products, setPersistedProducts]);

  useEffect(() => {
    setPersistedRoutes(state.routes);
  }, [state.routes, setPersistedRoutes]);

  useEffect(() => {
    setPersistedStations(state.stations);
  }, [state.stations, setPersistedStations]);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    
    addNotification({
      type: 'success',
      title: 'Product Added',
      message: `${newProduct.name} has been added to the tracking system.`
    });
  };

  const updateProduct = (product: Product) => {
    const updatedProduct = { ...product, updatedAt: new Date() };
    dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
    
    addNotification({
      type: 'info',
      title: 'Product Updated',
      message: `${product.name} has been updated.`
    });
  };

  const deleteProduct = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    dispatch({ type: 'DELETE_PRODUCT', payload: productId });
    
    if (product) {
      addNotification({
        type: 'warning',
        title: 'Product Deleted',
        message: `${product.name} has been removed from the tracking system.`
      });
    }
  };

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
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
    addProduct,
    updateProduct,
    deleteProduct,
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