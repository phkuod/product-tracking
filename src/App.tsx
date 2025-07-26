import { Dashboard } from './pages/Dashboard';
import { ProductDetail } from './pages/ProductDetail';
import { Analytics } from './pages/Analytics';
import { StationManagement } from './pages/StationManagement';
import { RouteManagement } from './pages/RouteManagement';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { NotificationCenter } from './components/NotificationCenter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setupGlobalErrorHandlers } from './hooks/useErrorHandler';

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
        <ErrorBoundary fallback={
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            Notification system error
          </div>
        }>
          <NotificationCenter />
        </ErrorBoundary>
      </div>
      
      <ErrorBoundary>
        {state.currentView === 'dashboard' && (
          <Dashboard 
            onProductClick={handleProductClick}
            onAnalyticsClick={handleAnalyticsClick}
            onStationsClick={handleStationsClick}
            onRoutesClick={handleRoutesClick}
          />
        )}
      </ErrorBoundary>

      <ErrorBoundary>
        {state.currentView === 'detail' && state.selectedProduct && (
          <ProductDetail 
            product={state.selectedProduct} 
            onBack={handleBackToDashboard} 
          />
        )}
      </ErrorBoundary>

      <ErrorBoundary>
        {state.currentView === 'analytics' && (
          <Analytics onBack={handleBackToDashboard} />
        )}
      </ErrorBoundary>

      <ErrorBoundary>
        {state.currentView === 'stations' && (
          <StationManagement onBack={handleBackToDashboard} />
        )}
      </ErrorBoundary>

      <ErrorBoundary>
        {state.currentView === 'routes' && (
          <RouteManagement onBack={handleBackToDashboard} />
        )}
      </ErrorBoundary>
    </div>
  );
}

function App() {
  // Set up global error handlers
  setupGlobalErrorHandlers();

  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;