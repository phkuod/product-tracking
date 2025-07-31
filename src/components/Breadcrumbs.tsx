import React, { memo } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  showHome?: boolean;
}

export const Breadcrumbs = memo(function Breadcrumbs({ 
  items, 
  separator = <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />,
  className = '',
  showHome = true
}: BreadcrumbsProps) {
  const allItems = showHome ? [
    {
      label: 'Dashboard',
      icon: <Home className="w-4 h-4" />,
      onClick: () => {}, // This should navigate to dashboard
    },
    ...items
  ] : items;

  return (
    <nav 
      className={cn('flex items-center space-x-2 text-sm', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isCurrent = item.current || isLast;

          return (
            <li key={index} className="flex items-center space-x-2">
              {index > 0 && (
                <span className="flex items-center">
                  {separator}
                </span>
              )}
              
              <div className="flex items-center space-x-1">
                {item.icon && (
                  <span className={cn(
                    'flex items-center',
                    isCurrent 
                      ? 'text-gray-900 dark:text-gray-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {item.icon}
                  </span>
                )}
                
                {isCurrent ? (
                  <span 
                    className="font-medium text-gray-900 dark:text-gray-100"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <button
                    onClick={item.onClick}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-0.5"
                  >
                    {item.label}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

// Context for managing breadcrumbs
export interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  addBreadcrumb: (item: BreadcrumbItem) => void;
  removeBreadcrumb: (index: number) => void;
  clearBreadcrumbs: () => void;
}

const BreadcrumbContext = React.createContext<BreadcrumbContextType | undefined>(undefined);

interface BreadcrumbProviderProps {
  children: React.ReactNode;
}

export function BreadcrumbProvider({ children }: BreadcrumbProviderProps) {
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([]);

  const addBreadcrumb = React.useCallback((item: BreadcrumbItem) => {
    setBreadcrumbs(prev => [...prev, item]);
  }, []);

  const removeBreadcrumb = React.useCallback((index: number) => {
    setBreadcrumbs(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearBreadcrumbs = React.useCallback(() => {
    setBreadcrumbs([]);
  }, []);

  const value: BreadcrumbContextType = {
    breadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,
    removeBreadcrumb,
    clearBreadcrumbs,
  };

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const context = React.useContext(BreadcrumbContext);
  if (context === undefined) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
}

// Hook for managing page breadcrumbs
export function useBreadcrumb(items: BreadcrumbItem[], dependencies: any[] = []) {
  const { setBreadcrumbs } = useBreadcrumbs();

  React.useEffect(() => {
    setBreadcrumbs(items);
    return () => setBreadcrumbs([]);
  }, dependencies);
}

export default Breadcrumbs;