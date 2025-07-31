import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockProducts } from '@/services/mockData';
import { useBreadcrumb } from '@/components/Breadcrumbs';
import { BarChart3, TrendingUp, Clock, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { memo, useMemo } from 'react';

interface AnalyticsProps {
  onBack: () => void;
}

export const Analytics = memo(function Analytics({ onBack }: AnalyticsProps) {
  const products = mockProducts;

  // Set breadcrumbs for this page
  useBreadcrumb([
    {
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      current: true
    }
  ]);

  // Memoize expensive analytics calculations
  const analytics = useMemo(() => {
    const totalProducts = products.length;
    const normalProducts = products.filter(p => p.status === 'normal').length;
    const overdueProducts = products.filter(p => p.status === 'overdue').length;
    const completedProducts = products.filter(p => p.progress === 100).length;
    const inProgressProducts = products.filter(p => p.progress > 0 && p.progress < 100).length;
    const averageProgress = totalProducts > 0 
      ? Math.round(products.reduce((sum, p) => sum + p.progress, 0) / totalProducts)
      : 0;
    
    // Station analysis
    const stationCounts: Record<string, number> = {};
    products.forEach(p => {
      const station = p.route?.stations?.find(s => s.id === p.currentStation);
      if (station) {
        stationCounts[station.name] = (stationCounts[station.name] || 0) + 1;
      }
    });
    const stationUtilization = Object.entries(stationCounts).map(([name, count]) => ({ name, count }));

    // Route analysis
    const routeCounts: Record<string, number> = {};
    products.forEach(p => {
      routeCounts[p.route.name] = (routeCounts[p.route.name] || 0) + 1;
    });
    const routeUsage = Object.entries(routeCounts).map(([name, count]) => ({ name, count }));

    // Time analysis
    const completedProductsForTime = products.filter(p => p.progress === 100);
    const averageCompletionTime = completedProductsForTime.length === 0 ? 0 : 
      Math.round(completedProductsForTime.reduce((sum, p) => {
        return sum + (p.updatedAt.getTime() - p.createdAt.getTime());
      }, 0) / completedProductsForTime.length / (1000 * 60 * 60)); // hours

    // Performance by owner
    const ownerStats: Record<string, { total: number; completed: number; overdue: number }> = {};
    
    products.forEach(p => {
      p.stationHistory.forEach(entry => {
        if (!ownerStats[entry.owner]) {
          ownerStats[entry.owner] = { total: 0, completed: 0, overdue: 0 };
        }
        ownerStats[entry.owner].total++;
        if (entry.status === 'completed') {
          ownerStats[entry.owner].completed++;
        }
        if (p.status === 'overdue' && entry.status === 'in_progress') {
          ownerStats[entry.owner].overdue++;
        }
      });
    });

    const ownerPerformance = Object.entries(ownerStats).map(([owner, stats]) => ({
      owner,
      completionRate: Math.round((stats.completed / stats.total) * 100),
      ...stats
    }));

    return {
      totalProducts,
      normalProducts,
      overdueProducts,
      completedProducts,
      inProgressProducts,
      averageProgress,
      stationUtilization,
      routeUsage,
      averageCompletionTime,
      ownerPerformance
    };
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 theme-transition">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Production performance metrics and insights</p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors btn-touch focus-enhanced"
          >
            Back to Dashboard
          </button>
        </header>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-enhanced rounded-2xl animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics.totalProducts}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    {analytics.completedProducts} completed
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced rounded-2xl animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Progress</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics.averageProgress}%</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                    {analytics.inProgressProducts} in progress
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced rounded-2xl animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Completion Time</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics.averageCompletionTime}h</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Per product</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-enhanced rounded-2xl animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overdue Items</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{analytics.overdueProducts}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {Math.round((analytics.overdueProducts / analytics.totalProducts) * 100)}% of total
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Station Utilization */}
          <Card className="card-enhanced rounded-2xl animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Station Utilization</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.stationUtilization.map((station, index) => (
                  <div key={station.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{station.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(station.count / analytics.totalProducts) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{station.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Route Usage */}
          <Card className="card-enhanced rounded-2xl animate-scale-in">
            <CardHeader>
              <CardTitle>Route Usage Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.routeUsage.map((route) => (
                  <div key={route.name} className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{route.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(route.count / analytics.totalProducts) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{route.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Owner Performance */}
        <Card className="card-enhanced rounded-2xl animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Owner Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Owner</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Total Tasks</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Completed</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Overdue</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.ownerPerformance.map((owner) => (
                    <tr key={owner.owner} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">{owner.owner}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{owner.total}</td>
                      <td className="py-3 px-4 text-green-600 dark:text-green-400">{owner.completed}</td>
                      <td className="py-3 px-4 text-red-600 dark:text-red-400">{owner.overdue}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${owner.completionRate >= 80 ? 'bg-green-500' : owner.completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${owner.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{owner.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="card-enhanced rounded-2xl animate-scale-in">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Normal Status</h3>
              <p className="text-3xl font-bold text-green-600 mb-1">{analytics.normalProducts}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((analytics.normalProducts / analytics.totalProducts) * 100)}% of products
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced rounded-2xl animate-scale-in">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Overdue Items</h3>
              <p className="text-3xl font-bold text-red-600 mb-1">{analytics.overdueProducts}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((analytics.overdueProducts / analytics.totalProducts) * 100)}% of products
              </p>
            </CardContent>
          </Card>

          <Card className="card-enhanced rounded-2xl animate-scale-in">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">In Progress</h3>
              <p className="text-3xl font-bold text-blue-600 mb-1">{analytics.inProgressProducts}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((analytics.inProgressProducts / analytics.totalProducts) * 100)}% of products
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});