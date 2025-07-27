import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route, Station } from '@/types';
import { Plus, Edit, Trash2, ArrowLeft, ArrowRight, Clock, Users, Settings } from 'lucide-react';
import { RouteBuilder } from '@/components/RouteBuilder';

interface RouteManagementProps {
  onBack: () => void;
}

export function RouteManagement({ onBack }: RouteManagementProps) {
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: 'route_1',
      name: 'Standard Assembly Line',
      description: 'Complete assembly process for standard products',
      stations: [
        {
          id: 'station_1',
          name: 'Assembly',
          owner: 'John Smith',
          completionRule: 'all_filled',
          estimatedDuration: 120,
          fields: [
            { id: 'field_1', name: 'Component Check', type: 'checkbox', required: true },
            { id: 'field_2', name: 'Quality Notes', type: 'textarea', required: false }
          ]
        },
        {
          id: 'station_2',
          name: 'Quality Control',
          owner: 'Sarah Johnson',
          completionRule: 'custom',
          estimatedDuration: 60,
          fields: [
            { id: 'field_3', name: 'Test Result', type: 'select', required: true, options: ['Pass', 'Fail', 'Retest'] },
            { id: 'field_4', name: 'Inspector ID', type: 'text', required: true }
          ]
        },
        {
          id: 'station_3',
          name: 'Packaging',
          owner: 'Mike Wilson',
          completionRule: 'all_filled',
          estimatedDuration: 30,
          fields: [
            { id: 'field_5', name: 'Package Type', type: 'select', required: true, options: ['Standard', 'Premium', 'Custom'] },
            { id: 'field_6', name: 'Weight Check', type: 'number', required: true }
          ]
        }
      ]
    },
    {
      id: 'route_2',
      name: 'Express Processing',
      description: 'Fast-track route for urgent orders',
      stations: [
        {
          id: 'station_1',
          name: 'Assembly',
          owner: 'John Smith',
          completionRule: 'all_filled',
          estimatedDuration: 90,
          fields: [
            { id: 'field_1', name: 'Component Check', type: 'checkbox', required: true }
          ]
        },
        {
          id: 'station_3',
          name: 'Packaging',
          owner: 'Mike Wilson',
          completionRule: 'all_filled',
          estimatedDuration: 20,
          fields: [
            { id: 'field_5', name: 'Package Type', type: 'select', required: true, options: ['Standard', 'Express'] }
          ]
        }
      ]
    }
  ]);

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const availableStations: Station[] = [
    {
      id: 'station_1',
      name: 'Assembly',
      owner: 'John Smith',
      completionRule: 'all_filled',
      estimatedDuration: 120,
      fields: [
        { id: 'field_1', name: 'Component Check', type: 'checkbox', required: true },
        { id: 'field_2', name: 'Quality Notes', type: 'textarea', required: false }
      ]
    },
    {
      id: 'station_2',
      name: 'Quality Control',
      owner: 'Sarah Johnson',
      completionRule: 'custom',
      estimatedDuration: 60,
      fields: [
        { id: 'field_3', name: 'Test Result', type: 'select', required: true, options: ['Pass', 'Fail', 'Retest'] },
        { id: 'field_4', name: 'Inspector ID', type: 'text', required: true }
      ]
    },
    {
      id: 'station_3',
      name: 'Packaging',
      owner: 'Mike Wilson',
      completionRule: 'all_filled',
      estimatedDuration: 30,
      fields: [
        { id: 'field_5', name: 'Package Type', type: 'select', required: true, options: ['Standard', 'Premium', 'Custom'] },
        { id: 'field_6', name: 'Weight Check', type: 'number', required: true }
      ]
    },
    {
      id: 'station_4',
      name: 'Final Inspection',
      owner: 'Lisa Chen',
      completionRule: 'all_filled',
      estimatedDuration: 45,
      fields: [
        { id: 'field_7', name: 'Final Check', type: 'checkbox', required: true },
        { id: 'field_8', name: 'Certification', type: 'text', required: true }
      ]
    }
  ];

  const handleAddRoute = () => {
    setEditingRoute(null);
    setShowBuilder(true);
  };

  const handleEditRoute = (route: Route) => {
    setEditingRoute(route);
    setShowBuilder(true);
  };

  const handleDeleteRoute = (routeId: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      setRoutes(prev => prev.filter(r => r.id !== routeId));
    }
  };

  const handleSaveRoute = (routeData: Omit<Route, 'id'>) => {
    if (editingRoute) {
      setRoutes(prev => prev.map(r => 
        r.id === editingRoute.id 
          ? { ...routeData, id: editingRoute.id }
          : r
      ));
    } else {
      const newRoute: Route = {
        ...routeData,
        id: `route_${Date.now()}`
      };
      setRoutes(prev => [...prev, newRoute]);
    }
    setShowBuilder(false);
    setEditingRoute(null);
  };

  const getTotalDuration = (stations: Station[]) => {
    return stations.reduce((total, station) => total + station.estimatedDuration, 0);
  };

  const getUniqueOwners = (stations: Station[]) => {
    return Array.from(new Set(stations.map(s => s.owner))).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 theme-transition">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="inline-flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors btn-touch focus-enhanced"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Route Management</h1>
              <p className="text-gray-600 mt-1">Design and manage manufacturing routes</p>
            </div>
          </div>
          <button
            onClick={handleAddRoute}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Route
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes.map(route => (
            <Card key={route.id} className="rounded-2xl hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{route.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{route.description}</p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditRoute(route)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(route.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Settings className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{route.stations.length}</p>
                    <p className="text-xs text-gray-600">Stations</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{getTotalDuration(route.stations)}</p>
                    <p className="text-xs text-gray-600">Minutes</p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{getUniqueOwners(route.stations)}</p>
                    <p className="text-xs text-gray-600">Owners</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Station Flow</p>
                  <div className="space-y-2">
                    {route.stations.map((station, index) => (
                      <div key={station.id} className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-700">
                          {index + 1}
                        </div>
                        <div className="flex-1 flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{station.name}</p>
                            <p className="text-xs text-gray-600">{station.owner}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{station.estimatedDuration}min</p>
                            <Badge variant="outline" className="text-xs">
                              {station.fields.length} fields
                            </Badge>
                          </div>
                        </div>
                        {index < route.stations.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card 
            className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer" 
            onClick={handleAddRoute}
          >
            <CardContent className="flex flex-col items-center justify-center h-80 space-y-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-600">Create New Route</p>
                <p className="text-sm text-gray-500">Design a custom manufacturing flow</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {showBuilder && (
          <RouteBuilder
            route={editingRoute}
            availableStations={availableStations}
            onSave={handleSaveRoute}
            onCancel={() => {
              setShowBuilder(false);
              setEditingRoute(null);
            }}
          />
        )}
      </div>
    </div>
  );
}