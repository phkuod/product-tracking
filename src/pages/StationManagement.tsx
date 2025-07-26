import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Station, Field } from '@/types';
import { Plus, Edit, Trash2, Settings, ArrowLeft, Clock, User } from 'lucide-react';
import { StationForm } from '@/components/StationForm';

interface StationManagementProps {
  onBack: () => void;
}

export function StationManagement({ onBack }: StationManagementProps) {
  const [stations, setStations] = useState<Station[]>([
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
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);

  const handleAddStation = () => {
    setEditingStation(null);
    setShowForm(true);
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
    setShowForm(true);
  };

  const handleDeleteStation = (stationId: string) => {
    if (confirm('Are you sure you want to delete this station?')) {
      setStations(prev => prev.filter(s => s.id !== stationId));
    }
  };

  const handleSaveStation = (stationData: Omit<Station, 'id'>) => {
    if (editingStation) {
      setStations(prev => prev.map(s => 
        s.id === editingStation.id 
          ? { ...stationData, id: editingStation.id }
          : s
      ));
    } else {
      const newStation: Station = {
        ...stationData,
        id: `station_${Date.now()}`
      };
      setStations(prev => [...prev, newStation]);
    }
    setShowForm(false);
    setEditingStation(null);
  };

  const getCompletionRuleLabel = (rule: Station['completionRule']) => {
    return rule === 'all_filled' ? 'All Fields Required' : 'Custom Logic';
  };

  const getFieldTypeLabel = (type: Field['type']) => {
    const labels = {
      text: 'Text Input',
      textarea: 'Text Area',
      checkbox: 'Checkbox',
      select: 'Dropdown',
      number: 'Number',
      date: 'Date'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Station Management</h1>
              <p className="text-gray-600 mt-1">Define and manage manufacturing stations</p>
            </div>
          </div>
          <button
            onClick={handleAddStation}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Station
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map(station => (
            <Card key={station.id} className="rounded-2xl hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{station.name}</CardTitle>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditStation(station)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteStation(station.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Owner</p>
                    <p className="font-medium">{station.owner}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estimated Duration</p>
                    <p className="font-medium">{station.estimatedDuration} minutes</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Completion Rule</p>
                  <Badge variant={station.completionRule === 'all_filled' ? 'default' : 'secondary'}>
                    {getCompletionRuleLabel(station.completionRule)}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Fields ({station.fields.length})</p>
                  <div className="space-y-2">
                    {station.fields.slice(0, 3).map(field => (
                      <div key={field.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                        <span className="font-medium">{field.name}</span>
                        <div className="flex space-x-1">
                          <Badge variant="outline" className="text-xs">
                            {getFieldTypeLabel(field.type)}
                          </Badge>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {station.fields.length > 3 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{station.fields.length - 3} more fields
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer" onClick={handleAddStation}>
            <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-600">Add New Station</p>
                <p className="text-sm text-gray-500">Define a new manufacturing station</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {showForm && (
          <StationForm
            station={editingStation}
            onSave={handleSaveStation}
            onCancel={() => {
              setShowForm(false);
              setEditingStation(null);
            }}
          />
        )}
      </div>
    </div>
  );
}