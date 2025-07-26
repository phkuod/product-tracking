import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { ProductDetail } from './pages/ProductDetail';
import { Analytics } from './pages/Analytics';
import { StationManagement } from './pages/StationManagement';
import { RouteManagement } from './pages/RouteManagement';
import { mockProducts } from './services/mockData';
import { Product } from './types';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'detail' | 'analytics' | 'stations' | 'routes'>('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('detail');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProduct(null);
  };

  const handleAnalyticsClick = () => {
    setCurrentView('analytics');
  };

  const handleStationsClick = () => {
    setCurrentView('stations');
  };

  const handleRoutesClick = () => {
    setCurrentView('routes');
  };

  return (
    <div className="App">
      {currentView === 'dashboard' && (
        <Dashboard 
          onProductClick={handleProductClick}
          onAnalyticsClick={handleAnalyticsClick}
          onStationsClick={handleStationsClick}
          onRoutesClick={handleRoutesClick}
        />
      )}
      {currentView === 'detail' && selectedProduct && (
        <ProductDetail 
          product={selectedProduct} 
          onBack={handleBackToDashboard} 
        />
      )}
      {currentView === 'analytics' && (
        <Analytics onBack={handleBackToDashboard} />
      )}
      {currentView === 'stations' && (
        <StationManagement onBack={handleBackToDashboard} />
      )}
      {currentView === 'routes' && (
        <RouteManagement onBack={handleBackToDashboard} />
      )}
    </div>
  );
}

export default App;