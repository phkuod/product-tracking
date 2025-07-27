import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RouteProgress } from './RouteProgress';
import { Product } from '@/types';
import { formatDate, getStatusLabel } from '@/lib/utils';
import { useAppContext } from '@/contexts/AppContext';
import { 
  Clock, 
  User, 
  Package, 
  Edit3, 
  Play, 
  CheckCircle, 
  AlertTriangle,
  MapPin,
  Calendar
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  viewMode?: 'card' | 'compact' | 'detailed';
  showQuickActions?: boolean;
}

export function ProductCard({ 
  product, 
  onClick, 
  viewMode = 'card',
  showQuickActions = true 
}: ProductCardProps) {
  const { updateProduct } = useAppContext();
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [isQuickUpdating, setIsQuickUpdating] = useState(false);
  
  const currentStation = product.route.stations.find(s => s.id === product.currentStation);
  const nextStation = product.route.stations[
    product.route.stations.findIndex(s => s.id === product.currentStation) + 1
  ];

  const getStatusIcon = () => {
    switch (product.status) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4" />;
      case 'normal':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getProgressColor = () => {
    if (product.status === 'overdue') return 'bg-red-500 dark:bg-red-400';
    if (product.progress === 100) return 'bg-green-500 dark:bg-green-400';
    return 'bg-blue-500 dark:bg-blue-400';
  };

  const handleQuickAction = async (action: 'advance' | 'complete' | 'pause') => {
    setIsQuickUpdating(true);
    try {
      let updatedProduct = { ...product };
      
      switch (action) {
        case 'advance':
          if (nextStation) {
            updatedProduct.currentStation = nextStation.id;
            updatedProduct.progress = Math.min(100, product.progress + 25);
          }
          break;
        case 'complete':
          updatedProduct.progress = 100;
          updatedProduct.status = 'normal';
          break;
        case 'pause':
          // Toggle status could be implemented here
          break;
      }
      
      updateProduct(updatedProduct);
    } catch (error) {
      console.error('Quick action failed:', error);
    } finally {
      setIsQuickUpdating(false);
    }
  };

  if (viewMode === 'compact') {
    return (
      <div className="card-enhanced p-3 sm:p-4 rounded-lg animate-scale-in cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div className={`w-3 h-3 rounded-full ${getProgressColor()}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {product.name}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="truncate">{product.model}</span>
                <span>•</span>
                <span>{product.progress}%</span>
                <span>•</span>
                <span className="truncate">{currentStation?.name || 'Unknown'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Badge className={`status-${product.status} text-xs px-2 py-1`}>
              {getStatusIcon()}
              <span className="ml-1 hidden sm:inline">{getStatusLabel(product.status)}</span>
            </Badge>
            {showQuickActions && product.progress < 100 && nextStation && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction('advance');
                }}
                disabled={isQuickUpdating}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 btn-touch"
                title="Advance to next station"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Mobile-friendly progress bar */}
        <div className="mt-3 sm:hidden">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{product.progress}%</span>
          </div>
          <div className="relative">
            <div className="progress-enhanced rounded-full h-2">
              <div 
                className={`progress-fill rounded-full h-full ${getProgressColor()}`}
                style={{ width: `${product.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card 
      className="group relative overflow-hidden card-enhanced hover:shadow-xl transition-all duration-300 rounded-2xl animate-scale-in border-l-4"
      style={{
        borderLeftColor: product.status === 'overdue' ? '#ef4444' : 
                        product.progress === 100 ? '#22c55e' : '#3b82f6'
      }}
      onClick={onClick}
    >
      {/* Quick Actions Overlay */}
      {showQuickActions && (
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center space-x-1">
            {product.progress < 100 && nextStation && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction('advance');
                }}
                disabled={isQuickUpdating}
                title="Advance to next station"
              >
                <Play className="h-3 w-3" />
              </Button>
            )}
            {product.progress < 100 && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAction('complete');
                }}
                disabled={isQuickUpdating}
                title="Mark as complete"
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickEdit(!showQuickEdit);
              }}
              title="Quick edit"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {product.name}
            </CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Package className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{product.model}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <div className={`status-${product.status} px-2 py-1 rounded-full flex items-center space-x-1`}>
              {getStatusIcon()}
              <span className="text-xs font-medium">
                {getStatusLabel(product.status)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section with Animation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Progress</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">{product.progress}%</span>
          </div>
          <div className="relative">
            <div className="progress-enhanced rounded-full h-3">
              <div 
                className={`progress-fill rounded-full h-full ${getProgressColor()}`}
                style={{ width: `${product.progress}%` }}
              />
            </div>
            {product.progress > 0 && (
              <div 
                className="absolute top-0 h-3 w-1 bg-white dark:bg-gray-900 rounded-full shadow-sm transition-all duration-300"
                style={{ left: `${Math.max(0, product.progress - 1)}%` }}
              />
            )}
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Owner</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {currentStation?.owner || 'Unassigned'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-green-500 dark:text-green-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Updated</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDate(product.updatedAt)}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-purple-500 dark:text-purple-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Created</span>
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {formatDate(product.createdAt)}
            </span>
          </div>
        </div>

        {/* Route Progress */}
        <div className="pt-2">
          <RouteProgress 
            stations={product.route.stations}
            currentStationId={product.currentStation}
          />
        </div>

        {/* Current Station Highlight */}
        <div className="relative">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Current Station</span>
              </div>
              {isQuickUpdating && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
              )}
            </div>
            <div className="mt-1">
              <p className="text-base font-bold text-blue-900 dark:text-blue-100">
                {currentStation?.name || 'Unknown Station'}
              </p>
              {nextStation && product.progress < 100 && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Next: {nextStation.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Edit Panel */}
        {showQuickEdit && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 animate-slide-down">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Quick Actions
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {product.progress < 100 && nextStation && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAction('advance');
                    }}
                    disabled={isQuickUpdating}
                    className="text-xs"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Advance
                  </Button>
                )}
                {product.progress < 100 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAction('complete');
                    }}
                    disabled={isQuickUpdating}
                    className="text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}