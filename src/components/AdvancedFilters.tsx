import { useState } from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';

export interface FilterOptions {
  status: 'all' | 'normal' | 'overdue';
  progress: {
    min: number;
    max: number;
  };
  dateRange: {
    start: string;
    end: string;
  };
  owner: string;
  route: string;
  station: string;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

export function AdvancedFilters({ filters, onFiltersChange, onReset }: AdvancedFiltersProps) {
  const { state } = useAppContext();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const allOwners = Array.from(new Set(
    state.stations.map(station => station.owner)
  )).sort();

  const allRoutes = state.routes.map(route => ({
    id: route.id,
    name: route.name
  }));

  const allStations = Array.from(new Set(
    state.routes.flatMap(route => route.stations.map(station => station.name))
  )).sort();

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.progress.min > 0 ||
    filters.progress.max < 100 ||
    filters.dateRange.start !== '' ||
    filters.dateRange.end !== '' ||
    filters.owner !== '' ||
    filters.route !== '' ||
    filters.station !== '';

  return (
    <div className="card-enhanced rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 animate-slide-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-gray-100">Filters</span>
          {hasActiveFilters && (
            <span className="status-info text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs"
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
          </Button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <Label htmlFor="status-filter" className="text-gray-700 dark:text-gray-300">Status</Label>
          <div className="flex space-x-2 mt-1">
            <button
              onClick={() => updateFilter('status', 'all')}
              className={`px-3 py-1 rounded-full text-sm transition-colors btn-touch ${
                filters.status === 'all' 
                  ? 'status-info' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => updateFilter('status', 'normal')}
              className={`px-3 py-1 rounded-full text-sm transition-colors btn-touch ${
                filters.status === 'normal' 
                  ? 'status-normal' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => updateFilter('status', 'overdue')}
              className={`px-3 py-1 rounded-full text-sm transition-colors btn-touch ${
                filters.status === 'overdue' 
                  ? 'status-overdue' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Overdue
            </button>
          </div>
        </div>

        {/* Progress Filter */}
        <div>
          <Label htmlFor="progress-filter">Progress Range</Label>
          <div className="flex items-center space-x-2 mt-1">
            <Input
              type="number"
              min="0"
              max="100"
              value={filters.progress.min}
              onChange={(e) => updateFilter('progress', {
                ...filters.progress,
                min: parseInt(e.target.value) || 0
              })}
              className="w-20 text-sm"
              placeholder="Min"
            />
            <span className="text-gray-500">to</span>
            <Input
              type="number"
              min="0"
              max="100"
              value={filters.progress.max}
              onChange={(e) => updateFilter('progress', {
                ...filters.progress,
                max: parseInt(e.target.value) || 100
              })}
              className="w-20 text-sm"
              placeholder="Max"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">%</span>
          </div>
        </div>

        {/* Owner Filter */}
        <div>
          <Label htmlFor="owner-filter" className="text-gray-700 dark:text-gray-300">Owner</Label>
          <select
            value={filters.owner}
            onChange={(e) => updateFilter('owner', e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-sm focus-enhanced theme-transition"
          >
            <option value="">All Owners</option>
            {allOwners.map(owner => (
              <option key={owner} value={owner}>{owner}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range Filter */}
            <div className="md:col-span-2">
              <Label className="text-gray-700 dark:text-gray-300">Date Range</Label>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex-1">
                  <Input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      start: e.target.value
                    })}
                    className="text-sm"
                  />
                </div>
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => updateFilter('dateRange', {
                      ...filters.dateRange,
                      end: e.target.value
                    })}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Route Filter */}
            <div>
              <Label htmlFor="route-filter" className="text-gray-700 dark:text-gray-300">Route</Label>
              <select
                value={filters.route}
                onChange={(e) => updateFilter('route', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-sm focus-enhanced theme-transition"
              >
                <option value="">All Routes</option>
                {allRoutes.map(route => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Current Station Filter */}
            <div>
              <Label htmlFor="station-filter" className="text-gray-700 dark:text-gray-300">Current Station</Label>
              <select
                value={filters.station}
                onChange={(e) => updateFilter('station', e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-sm focus-enhanced theme-transition"
              >
                <option value="">All Stations</option>
                {allStations.map(station => (
                  <option key={station} value={station}>{station}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}