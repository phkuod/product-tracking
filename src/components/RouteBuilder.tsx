import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Route, Station } from '@/types';
import { X, Plus, Trash2, ArrowRight, ArrowUp, ArrowDown, Clock, User } from 'lucide-react';

interface RouteBuilderProps {
  route?: Route | null;
  availableStations: Station[];
  onSave: (route: Omit<Route, 'id'>) => void;
  onCancel: () => void;
}

export function RouteBuilder({ route, availableStations, onSave, onCancel }: RouteBuilderProps) {
  const [formData, setFormData] = useState({
    name: route?.name || '',
    description: route?.description || '',
    stations: route?.stations || [] as Station[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.stations.length === 0) {
      alert('Please provide a route name and add at least one station');
      return;
    }
    onSave(formData);
  };

  const addStation = (station: Station) => {
    if (!formData.stations.find(s => s.id === station.id)) {
      setFormData(prev => ({
        ...prev,
        stations: [...prev.stations, station]
      }));
    }
  };

  const removeStation = (stationId: string) => {
    setFormData(prev => ({
      ...prev,
      stations: prev.stations.filter(s => s.id !== stationId)
    }));
  };

  const moveStation = (stationId: string, direction: 'up' | 'down') => {
    setFormData(prev => {
      const stations = [...prev.stations];
      const currentIndex = stations.findIndex(s => s.id === stationId);
      
      if (direction === 'up' && currentIndex > 0) {
        [stations[currentIndex], stations[currentIndex - 1]] = [stations[currentIndex - 1], stations[currentIndex]];
      } else if (direction === 'down' && currentIndex < stations.length - 1) {
        [stations[currentIndex], stations[currentIndex + 1]] = [stations[currentIndex + 1], stations[currentIndex]];
      }
      
      return { ...prev, stations };
    });
  };

  const getTotalDuration = () => {
    return formData.stations.reduce((total, station) => total + station.estimatedDuration, 0);
  };

  const getUniqueOwners = () => {
    return Array.from(new Set(formData.stations.map(s => s.owner)));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto theme-transition">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {route ? 'Edit Route' : 'Create New Route'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors btn-touch"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Route Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Route Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter route name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter route description"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Available Stations</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableStations.map(station => {
                    const isAdded = formData.stations.find(s => s.id === station.id);
                    return (
                      <div
                        key={station.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          isAdded 
                            ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                        }`}
                        onClick={() => !isAdded && addStation(station)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{station.name}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{station.owner}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{station.estimatedDuration}min</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {station.fields.length} fields
                              </Badge>
                            </div>
                          </div>
                          {isAdded ? (
                            <Badge variant="default" className="bg-green-600">
                              Added
                            </Badge>
                          ) : (
                            <button
                              type="button"
                              className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Route Flow</h3>
                
                {formData.stations.length > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formData.stations.length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Stations</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{getTotalDuration()}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Minutes</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{getUniqueOwners().length}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Unique Owners</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {formData.stations.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="font-medium">No stations added yet</p>
                      <p className="text-sm">Select stations from the left panel to build your route</p>
                    </div>
                  ) : (
                    formData.stations.map((station, index) => (
                      <div key={station.id} className="relative">
                        <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-sm font-medium text-blue-700 dark:text-blue-400">
                            {index + 1}
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">{station.name}</h4>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{station.owner}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{station.estimatedDuration}min</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {station.fields.length} fields
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => moveStation(station.id, 'up')}
                              disabled={index === 0}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveStation(station.id, 'down')}
                              disabled={index === formData.stations.length - 1}
                              className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeStation(station.id)}
                              className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {index < formData.stations.length - 1 && (
                          <div className="flex justify-center py-2">
                            <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {getUniqueOwners().length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Route Owners</h4>
                  <div className="flex flex-wrap gap-2">
                    {getUniqueOwners().map(owner => (
                      <Badge key={owner} variant="secondary" className="text-sm">
                        {owner}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {route ? 'Update Route' : 'Create Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}