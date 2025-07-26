import { Dashboard } from './pages/Dashboard';
import { ProductDetail } from './pages/ProductDetail';
import { Analytics } from './pages/Analytics';
import { StationManagement } from './pages/StationManagement';
import { RouteManagement } from './pages/RouteManagement';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { NotificationCenter } from './components/NotificationCenter';

function AppContent() {
  const { state, setCurrentView, setSelectedProduct } = useAppContext();

  const handleProductClick = (product: any) => {
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
    <div className="App relative">
      <div className="fixed top-4 right-4 z-50">
        <NotificationCenter />
      </div>
      
      {state.currentView === 'dashboard' && (
        <Dashboard 
          onProductClick={handleProductClick}
          onAnalyticsClick={handleAnalyticsClick}
          onStationsClick={handleStationsClick}
          onRoutesClick={handleRoutesClick}
        />
      )}
      {state.currentView === 'detail' && state.selectedProduct && (
        <ProductDetail 
          product={state.selectedProduct} 
          onBack={handleBackToDashboard} 
        />
      )}
      {state.currentView === 'analytics' && (
        <Analytics onBack={handleBackToDashboard} />
      )}
      {state.currentView === 'stations' && (
        <StationManagement onBack={handleBackToDashboard} />
      )}
      {state.currentView === 'routes' && (
        <RouteManagement onBack={handleBackToDashboard} />
      )}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;