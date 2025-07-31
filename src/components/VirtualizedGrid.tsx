import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface VirtualizedGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  viewMode?: 'grid' | 'list';
  selectedProducts?: string[];
  onProductSelect?: (productId: string) => void;
  itemHeight?: number;
  itemWidth?: number;
  gap?: number;
}

export function VirtualizedGrid({
  products,
  onProductClick,
  viewMode = 'grid',
  selectedProducts = [],
  onProductSelect,
  itemHeight = 400,
  itemWidth = 350,
  gap = 16
}: VirtualizedGridProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions
  const { columnsCount, rowsCount, visibleItems } = useMemo(() => {
    if (containerSize.width === 0) return { columnsCount: 1, rowsCount: 0, visibleItems: [] };

    const availableWidth = containerSize.width - gap;
    const columnsCount = Math.max(1, Math.floor(availableWidth / (itemWidth + gap)));
    const rowsCount = Math.ceil(products.length / columnsCount);
    
    // Calculate visible range
    const startRow = Math.floor(scrollTop / (itemHeight + gap));
    const endRow = Math.min(
      rowsCount - 1,
      Math.ceil((scrollTop + containerSize.height) / (itemHeight + gap))
    );
    
    const visibleItems = [];
    for (let row = Math.max(0, startRow - 1); row <= endRow + 1; row++) {
      for (let col = 0; col < columnsCount; col++) {
        const index = row * columnsCount + col;
        if (index < products.length) {
          visibleItems.push({
            index,
            product: products[index],
            top: row * (itemHeight + gap),
            left: col * (itemWidth + gap)
          });
        }
      }
    }

    return { columnsCount, rowsCount, visibleItems };
  }, [containerSize, scrollTop, products, itemHeight, itemWidth, gap]);

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Total height for scrollbar
  const totalHeight = rowsCount * (itemHeight + gap);

  // Fallback for small lists (no virtualization needed)
  if (products.length <= 20) {
    return (
      <div className={`grid gap-4 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {products.map(product => (
          <div key={product.id} className="relative">
            {onProductSelect && (
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => onProductSelect(product.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}
            <ProductCard
              product={product}
              onClick={() => onProductClick(product)}
              viewMode={viewMode === 'list' ? 'compact' : 'card'}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto"
      style={{ height: '600px' }}
      onScroll={handleScroll}
    >
      <div
        className="relative"
        style={{ height: totalHeight }}
      >
        {visibleItems.map(({ index, product, top, left }) => (
          <div
            key={`${product.id}-${index}`}
            className="absolute"
            style={{
              top: `${top}px`,
              left: `${left}px`,
              width: `${itemWidth}px`,
              height: `${itemHeight}px`
            }}
          >
            {onProductSelect && (
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => onProductSelect(product.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}
            <ProductCard
              product={product}
              onClick={() => onProductClick(product)}
              viewMode={viewMode === 'list' ? 'compact' : 'card'}
            />
          </div>
        ))}
      </div>
      
      {/* Loading indicator for large lists */}
      {products.length > 100 && (
        <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg text-sm text-gray-600 dark:text-gray-400">
          {visibleItems.length} of {products.length} visible
        </div>
      )}
    </div>
  );
}