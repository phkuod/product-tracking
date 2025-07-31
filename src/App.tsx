import { Dashboard } from './pages/Dashboard';
import { ProductDetail } from './pages/ProductDetail';
import { Analytics } from './pages/Analytics';
import { StationManagement } from './pages/StationManagement';
import { RouteManagement } from './pages/RouteManagement';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { BreadcrumbProvider, Breadcrumbs, useBreadcrumbs } from './components/Breadcrumbs';
import { NotificationCenter } from './components/NotificationCenter';
import { ThemeToggle } from './components/ThemeToggle';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginForm } from './components/LoginForm';
import { setupGlobalErrorHandlers } from './hooks/useErrorHandler';
import { DebugInfo } from './components/DebugInfo';

function AppContent() {
  const { isAuthenticated, isLoading, error } = useAuth();
  const { state, setCurrentView, setSelectedProduct } = useAppContext();
  const { breadcrumbs } = useBreadcrumbs();

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    );
  }

  // Show authentication error if any
  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-foreground">Authentication Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <LoginForm />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

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
      
      {/* Breadcrumb Navigation */}
      {breadcrumbs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        </div>
      )}
      
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

      {/* Debug Info in Development */}
      <DebugInfo />
    </div>
  );
}

function App() {
  // Set up global error handlers
  setupGlobalErrorHandlers();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider position="top-right" maxToasts={5}>
          <AuthProvider>
            <BreadcrumbProvider>
              <AppProvider>
                <AppContent />
              </AppProvider>
            </BreadcrumbProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;