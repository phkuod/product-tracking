import { useState } from 'react';
import { CheckSquare, Square, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { Product } from '@/types';

interface BulkOperationsProps {
  products: Product[];
  selectedProducts: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkUpdate: () => void;
}

export function BulkOperations({ 
  products, 
  selectedProducts, 
  onSelectionChange, 
  onBulkUpdate 
}: BulkOperationsProps) {
  const { updateProduct, deleteProduct, addNotification } = useAppContext();
  const { handleError } = useErrorHandler();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({
    status: '',
    progress: '',
    currentStation: ''
  });

  const allSelected = products.length > 0 && selectedProducts.length === products.length;
  const someSelected = selectedProducts.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(products.map(p => p.id));
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkUpdateData.status) return;
    
    setIsLoading(true);
    
    try {
      const updatedProducts = products.filter(p => selectedProducts.includes(p.id));
      
      if (updatedProducts.length === 0) {
        throw new Error('No products selected for update');
      }

      // Validate status
      if (!['normal', 'overdue'].includes(bulkUpdateData.status)) {
        throw new Error('Invalid status value');
      }
      
      // Update products one by one with error handling
      let successCount = 0;
      let errorCount = 0;
      
      for (const product of updatedProducts) {
        try {
          const updatedProduct = {
            ...product,
            status: bulkUpdateData.status as 'normal' | 'overdue',
            updatedAt: new Date()
          };
          updateProduct(updatedProduct);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to update product ${product.name}:`, error);
        }
      }
      
      if (successCount > 0) {
        addNotification({
          type: 'success',
          title: 'Bulk Update Complete',
          message: `Updated status for ${successCount} products to ${bulkUpdateData.status}${errorCount > 0 ? ` (${errorCount} failed)` : ''}`
        });
      }

      if (errorCount > 0 && successCount === 0) {
        throw new Error(`Failed to update all ${errorCount} products`);
      }
      
      setShowUpdateForm(false);
      setBulkUpdateData({ status: '', progress: '', currentStation: '' });
      onSelectionChange([]);
      onBulkUpdate();
    } catch (error) {
      handleError(error as Error, 'Bulk Status Update');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkProgressUpdate = async () => {
    if (!bulkUpdateData.progress) return;
    
    setIsLoading(true);
    
    try {
      const updatedProducts = products.filter(p => selectedProducts.includes(p.id));
      const progressValue = parseInt(bulkUpdateData.progress);
      
      if (updatedProducts.length === 0) {
        throw new Error('No products selected for update');
      }

      // Validate progress value
      if (isNaN(progressValue) || progressValue < 0 || progressValue > 100) {
        throw new Error('Progress must be between 0 and 100');
      }
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const product of updatedProducts) {
        try {
          const updatedProduct = {
            ...product,
            progress: progressValue,
            updatedAt: new Date()
          };
          updateProduct(updatedProduct);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to update product ${product.name}:`, error);
        }
      }
      
      if (successCount > 0) {
        addNotification({
          type: 'success',
          title: 'Bulk Update Complete',
          message: `Updated progress for ${successCount} products to ${progressValue}%${errorCount > 0 ? ` (${errorCount} failed)` : ''}`
        });
      }

      if (errorCount > 0 && successCount === 0) {
        throw new Error(`Failed to update all ${errorCount} products`);
      }
      
      setShowUpdateForm(false);
      setBulkUpdateData({ status: '', progress: '', currentStation: '' });
      onSelectionChange([]);
      onBulkUpdate();
    } catch (error) {
      handleError(error as Error, 'Bulk Progress Update');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      handleError('No products selected for deletion', 'Bulk Delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} products? This action cannot be undone.`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      const deletedProducts: string[] = [];
      
      for (const productId of selectedProducts) {
        try {
          deleteProduct(productId);
          deletedProducts.push(productId);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Failed to delete product ${productId}:`, error);
        }
      }
      
      if (successCount > 0) {
        addNotification({
          type: 'warning',
          title: 'Bulk Delete Complete',
          message: `Deleted ${successCount} products from the system${errorCount > 0 ? ` (${errorCount} failed)` : ''}`
        });
      }

      if (errorCount > 0 && successCount === 0) {
        throw new Error(`Failed to delete all ${errorCount} products`);
      }
      
      onSelectionChange([]);
      onBulkUpdate();
    } catch (error) {
      handleError(error as Error, 'Bulk Delete');
    } finally {
      setIsLoading(false);
    }
  };

  if (!someSelected) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={handleSelectAll}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {allSelected ? (
            <CheckSquare className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
          <span>Select All</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-sm font-medium text-blue-900"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>{selectedProducts.length} selected</span>
          </button>
          
          <div className="h-4 w-px bg-blue-300" />
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpdateForm(true)}
              disabled={isLoading}
              className="h-8"
            >
              <Edit className="w-3 h-3 mr-1" />
              Update
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isLoading}
              className="h-8 text-red-600 hover:text-red-700 disabled:text-gray-400"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
        
        <button
          onClick={() => onSelectionChange([])}
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {showUpdateForm && (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Bulk Update Options</h4>
            <button
              onClick={() => setShowUpdateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bulk-status">Status</Label>
              <select
                id="bulk-status"
                value={bulkUpdateData.status}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select status...</option>
                <option value="normal">Normal</option>
                <option value="overdue">Overdue</option>
              </select>
              {bulkUpdateData.status && (
                <Button
                  size="sm"
                  onClick={handleBulkStatusUpdate}
                  disabled={isLoading}
                  className="w-full mt-2"
                >
                  {isLoading ? 'Updating...' : 'Update Status'}
                </Button>
              )}
            </div>
            
            <div>
              <Label htmlFor="bulk-progress">Progress (%)</Label>
              <Input
                id="bulk-progress"
                type="number"
                min="0"
                max="100"
                value={bulkUpdateData.progress}
                onChange={(e) => setBulkUpdateData(prev => ({ ...prev, progress: e.target.value }))}
                placeholder="Enter progress..."
                className="mt-1"
              />
              {bulkUpdateData.progress && (
                <Button
                  size="sm"
                  onClick={handleBulkProgressUpdate}
                  disabled={isLoading}
                  className="w-full mt-2"
                >
                  {isLoading ? 'Updating...' : 'Update Progress'}
                </Button>
              )}
            </div>
            
            <div>
              <Label htmlFor="bulk-notes">Bulk Notes</Label>
              <Input
                id="bulk-notes"
                placeholder="Add notes to all selected..."
                className="mt-1"
              />
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                disabled
              >
                Add Notes (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}