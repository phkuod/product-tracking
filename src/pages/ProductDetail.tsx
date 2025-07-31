import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RouteProgress } from '@/components/RouteProgress';
import { Product, StationHistoryEntry } from '@/types';
import { formatDate, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useBreadcrumb } from '@/components/Breadcrumbs';
import { ArrowLeft, Clock, User, Package, CheckCircle, AlertCircle, PlayCircle } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

export function ProductDetail({ product, onBack }: ProductDetailProps) {
  // Set breadcrumbs for this page
  useBreadcrumb([
    {
      label: 'Products',
      onClick: onBack
    },
    {
      label: product.name,
      icon: <Package className="w-4 h-4" />,
      current: true
    }
  ]);
  const getStatusIcon = (status: StationHistoryEntry['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'skipped':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: StationHistoryEntry['status']) => {
    const variants = {
      completed: 'success',
      in_progress: 'default',
      pending: 'secondary',
      skipped: 'warning'
    } as const;

    const labels = {
      completed: 'Completed',
      in_progress: 'In Progress',
      pending: 'Pending',
      skipped: 'Skipped'
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 theme-transition">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="inline-flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors btn-touch focus-enhanced"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Detailed product tracking information</p>
          </div>
          <Badge 
            variant={product.status === "overdue" ? "destructive" : "default"}
            className={getStatusColor(product.status)}
          >
            {getStatusLabel(product.status)}
          </Badge>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-enhanced rounded-2xl animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="w-5 h-5" />
                  <span>Product Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Product Name</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product Model</p>
                  <p className="font-medium">{product.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Manufacturing Route</p>
                  <p className="font-medium">{product.route?.name ?? 'No route assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="font-medium">{product.progress}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Created At</p>
                  <p className="font-medium">{formatDate(product.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">{formatDate(product.updatedAt)}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced rounded-2xl animate-scale-in">
              <CardHeader>
                <CardTitle>Manufacturing Process Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {product.route?.stations ? (
                  <RouteProgress 
                    stations={product.route.stations}
                    currentStationId={product.currentStation}
                    className="justify-center"
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No route stations available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-enhanced rounded-2xl animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Station History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {product.stationHistory?.length > 0 ? product.stationHistory.map((entry, index) => (
                    <div key={entry.id} className="relative">
                      {index < (product.stationHistory?.length ?? 0) - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-full flex items-center justify-center">
                          {getStatusIcon(entry.status)}
                        </div>
                        
                        <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{entry.stationName}</h4>
                            {getStatusBadge(entry.status)}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Owner: </span>
                              <span className="font-medium">{entry.owner}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Start Time: </span>
                              <span>{formatDate(entry.startTime)}</span>
                            </div>
                            {entry.endTime && (
                              <div>
                                <span className="text-gray-600">End Time: </span>
                                <span>{formatDate(entry.endTime)}</span>
                              </div>
                            )}
                            {entry.endTime && (
                              <div>
                                <span className="text-gray-600">Duration: </span>
                                <span>
                                  {Math.round((entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60))} minutes
                                </span>
                              </div>
                            )}
                          </div>

                          {entry.formData && Object.keys(entry.formData).length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Form Data:</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {Object.entries(entry.formData).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="text-gray-500">{key}: </span>
                                    <span className="font-medium">{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {entry.notes && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</p>
                              <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No station history available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="card-enhanced rounded-2xl animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Current Owner</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const currentStation = product.route?.stations?.find(s => s.id === product.currentStation);
                  return currentStation ? (
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                        <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-lg">{currentStation.owner}</p>
                        <p className="text-sm text-gray-600">{currentStation.name}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">No current owner</p>
                  );
                })()}
              </CardContent>
            </Card>

            <Card className="card-enhanced rounded-2xl animate-scale-in">
              <CardHeader>
                <CardTitle>Route Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Route Name</p>
                  <p className="font-medium">{product.route?.name ?? 'No route assigned'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Route Description</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{product.route?.description ?? 'No description available'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Stations</p>
                  <p className="font-medium">{product.route?.stations?.length ?? 0} stations</p>
                </div>
              </CardContent>
            </Card>

            <Card className="card-enhanced rounded-2xl animate-scale-in">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Update Status
                </button>
                <button className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  Edit Information
                </button>
                <button className="w-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 py-2 px-4 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors">
                  Export Report
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}