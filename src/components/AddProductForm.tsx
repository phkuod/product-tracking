import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product, Route } from '@/types';
import { mockRoutes } from '@/services/mockData';
import { X, Plus } from 'lucide-react';

interface AddProductFormProps {
  onSubmit: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'stationHistory'>) => void;
  onCancel: () => void;
}

export function AddProductForm({ onSubmit, onCancel }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    routeId: '',
    status: 'normal' as const,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Product model is required';
    }

    if (!formData.routeId) {
      newErrors.routeId = 'Route selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const selectedRoute = mockRoutes.find(r => r.id === formData.routeId);
    if (!selectedRoute) {
      setErrors({ routeId: 'Invalid route selected' });
      return;
    }

    const newProduct = {
      name: formData.name.trim(),
      model: formData.model.trim(),
      currentStation: selectedRoute.stations[0]?.id || '',
      progress: 0,
      status: formData.status,
      route: selectedRoute
    };

    onSubmit(newProduct);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add New Product</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Product Model */}
            <div className="space-y-2">
              <Label htmlFor="model">Product Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="Enter product model"
                className={errors.model ? 'border-red-500' : ''}
              />
              {errors.model && (
                <p className="text-sm text-red-600">{errors.model}</p>
              )}
            </div>

            {/* Route Selection */}
            <div className="space-y-2">
              <Label htmlFor="route">Manufacturing Route *</Label>
              <Select
                id="route"
                value={formData.routeId}
                onChange={(e) => handleInputChange('routeId', e.target.value)}
                className={errors.routeId ? 'border-red-500' : ''}
              >
                <option value="">Select a route</option>
                {mockRoutes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.name} ({route.stations.length} stations)
                  </option>
                ))}
              </Select>
              {errors.routeId && (
                <p className="text-sm text-red-600">{errors.routeId}</p>
              )}
            </div>

            {/* Route Preview */}
            {formData.routeId && (
              <div className="space-y-2">
                <Label>Route Preview</Label>
                <div className="bg-gray-50 rounded-lg p-4">
                  {(() => {
                    const selectedRoute = mockRoutes.find(r => r.id === formData.routeId);
                    return selectedRoute ? (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">{selectedRoute.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{selectedRoute.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedRoute.stations.map((station, index) => (
                            <div
                              key={station.id}
                              className="flex items-center space-x-2 bg-white rounded-lg px-3 py-2 border"
                            >
                              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span className="text-sm font-medium">{station.name}</span>
                              <span className="text-xs text-gray-500">({station.owner})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="normal">Normal</option>
                <option value="overdue">Overdue</option>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about this product"
                rows={3}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Product
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}