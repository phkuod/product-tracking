import { useState, useMemo } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types';
import { Search, Plus, BarChart3, Settings, ArrowRight, Menu, X, Grid, List } from 'lucide-react';
import { AddProductForm } from '@/components/AddProductForm';
import { AdvancedFilters, FilterOptions } from '@/components/AdvancedFilters';
import { BulkOperations } from '@/components/BulkOperations';
import { useAppContext } from '@/contexts/AppContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface DashboardProps {
  onProductClick: (product: Product) => void;
  onAnalyticsClick: () => void;
  onStationsClick: () => void;
  onRoutesClick: () => void;
}

export function Dashboard({ onProductClick, onAnalyticsClick, onStationsClick, onRoutesClick }: DashboardProps) {
  const { state, addProduct } = useAppContext();
  const { handleError } = useErrorHandler();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    progress: { min: 0, max: 100 },
    dateRange: { start: '', end: '' },
    owner: '',
    route: '',
    station: ''
  });

  const filteredProducts = useMemo(() => {
    return state.products.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = filters.status === 'all' || product.status === filters.status;
      
      // Progress filter
      const matchesProgress = product.progress >= filters.progress.min && 
                             product.progress <= filters.progress.max;
      
      // Date range filter
      let matchesDateRange = true;
      if (filters.dateRange.start || filters.dateRange.end) {
        const productDate = product.createdAt.toISOString().split('T')[0];
        if (filters.dateRange.start && productDate < filters.dateRange.start) {
          matchesDateRange = false;
        }
        if (filters.dateRange.end && productDate > filters.dateRange.end) {
          matchesDateRange = false;
        }
      }
      
      // Owner filter
      const matchesOwner = !filters.owner || 
                          product.route.stations.some(station => 
                            station.owner === filters.owner
                          );
      
      // Route filter
      const matchesRoute = !filters.route || product.route.id === filters.route;
      
      // Station filter
      const matchesStation = !filters.station || product.currentStation === filters.station;

      return matchesSearch && matchesStatus && matchesProgress && 
             matchesDateRange && matchesOwner && matchesRoute && matchesStation;
    });
  }, [state.products, searchTerm, filters]);

  const stats = {
    total: state.products.length,
    normal: state.products.filter(p => p.status === 'normal').length,
    overdue: state.products.filter(p => p.status === 'overdue').length,
    inProgress: state.products.filter(p => p.progress < 100).length
  };

  const handleProductClick = (product: Product) => {
    onProductClick(product);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      progress: { min: 0, max: 100 },
      dateRange: { start: '', end: '' },
      owner: '',
      route: '',
      station: ''
    });
    setSearchTerm('');
  };

  const handleBulkUpdate = () => {
    // Refresh data after bulk operations
    setSelectedProducts([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
          <div className="fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <button
                onClick={() => {
                  onAnalyticsClick();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors btn-touch"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Analytics Report
              </button>
              <button
                onClick={() => {
                  onStationsClick();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors btn-touch"
              >
                <Settings className="w-5 h-5 mr-3" />
                Manage Stations
              </button>
              <button
                onClick={() => {
                  onRoutesClick();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center px-4 py-3 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors btn-touch"
              >
                <ArrowRight className="w-5 h-5 mr-3" />
                Manage Routes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <header className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
              Product Process Tracking System
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 hidden sm:block">
              Real-time monitoring of product manufacturing progress and status
            </p>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            <button 
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors btn-touch focus-enhanced"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
            <button 
              onClick={onAnalyticsClick}
              className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors btn-touch focus-enhanced"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics Report
            </button>
            <button 
              onClick={onStationsClick}
              className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors btn-touch focus-enhanced"
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage Stations
            </button>
            <button 
              onClick={onRoutesClick}
              className="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors btn-touch focus-enhanced"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Manage Routes
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="flex lg:hidden items-center space-x-2">
            <button 
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors btn-touch focus-enhanced"
              title="Add Product"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMobileMenu(true)}
              className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors btn-touch focus-enhanced"
              title="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="card-enhanced rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-scale-in">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Total Products</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="card-enhanced rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Normal</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.normal}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 dark:bg-green-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="card-enhanced rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Overdue</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 dark:bg-red-400 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="card-enhanced rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">In Progress</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 dark:bg-blue-400 rounded-full pulse-slow"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar and View Toggle */}
        <div className="card-enhanced rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-slide-in">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search product name or model..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus-enhanced theme-transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors btn-touch ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors btn-touch ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={resetFilters}
        />

        {/* Bulk Operations */}
        {(selectedProducts.length > 0 || filteredProducts.length > 0) && (
          <BulkOperations
            products={filteredProducts}
            selectedProducts={selectedProducts}
            onSelectionChange={setSelectedProducts}
            onBulkUpdate={handleBulkUpdate}
          />
        )}

        {/* Products Grid */}
        <div className="card-enhanced rounded-xl sm:rounded-2xl p-4 sm:p-6 animate-slide-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Products ({filteredProducts.length})
            </h3>
            {filteredProducts.length !== state.products.length && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredProducts.length} of {state.products.length} products
              </span>
            )}
          </div>

          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
              : "space-y-3"
          }>
            {filteredProducts.map(product => (
              <div key={product.id} className="relative">
                <div 
                  className={`absolute ${viewMode === 'grid' ? 'top-2 left-2' : 'top-1 left-1'} z-10 ${
                    selectedProducts.includes(product.id) ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                  } transition-opacity`}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedProducts.includes(product.id)) {
                        setSelectedProducts(prev => prev.filter(id => id !== product.id));
                      } else {
                        setSelectedProducts(prev => [...prev, product.id]);
                      }
                    }}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors btn-touch ${
                      selectedProducts.includes(product.id)
                        ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    {selectedProducts.includes(product.id) && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
                <ProductCard
                  product={product}
                  onClick={() => handleProductClick(product)}
                  viewMode={viewMode === 'list' ? 'compact' : 'card'}
                  showQuickActions={viewMode === 'grid'}
                />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No products found matching criteria</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>

        {showAddForm && (
          <AddProductForm
            onSubmit={(newProduct) => {
              try {
                const productData = {
                  ...newProduct,
                  stationHistory: [{
                    id: `history_${Date.now()}`,
                    stationId: newProduct.currentStation,
                    stationName: newProduct.route.stations[0]?.name || 'Unknown',
                    owner: newProduct.route.stations[0]?.owner || 'Unassigned',
                    startTime: new Date(),
                    status: 'pending' as const,
                    formData: {}
                  }]
                };
                addProduct(productData);
                setShowAddForm(false);
              } catch (error) {
                handleError(error as Error, 'Add Product Form');
                // Keep form open so user can correct the error
              }
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
      </div>
    </div>
  );
}