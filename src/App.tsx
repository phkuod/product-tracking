import { Dashboard } from './pages/Dashboard';
import { ProductDetail } from './pages/ProductDetail';
import { Analytics } from './pages/Analytics';
import { StationManagement } from './pages/StationManagement';
import { RouteManagement } from './pages/RouteManagement';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationCenter } from './components/NotificationCenter';
import { ThemeToggle } from './components/ThemeToggle';
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
    <div className="App relative min-h-screen bg-background text-foreground theme-transition">
      {/* Fixed Header with Theme Toggle and Notifications */}
      <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 flex items-center space-x-2 sm:space-x-3">
        <ThemeToggle />
        <ErrorBoundary fallback={
          <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
            Notification error
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
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;