import React, { useEffect, useState, memo } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  position: ToastPosition;
}

const ToastItem = memo(function ToastItem({ toast, onRemove, position }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.persistent || toast.type === 'loading') return;

    const duration = toast.duration ?? getDefaultDuration(toast.type);
    const timer = setTimeout(() => {
      handleRemove();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      case 'loading':
        return <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'loading':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'info':
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  const getSlideDirection = () => {
    if (position.includes('right')) return isRemoving ? 'translate-x-full' : 'translate-x-0';
    if (position.includes('left')) return isRemoving ? '-translate-x-full' : 'translate-x-0';
    return isRemoving ? 'translate-y-full' : 'translate-y-0';
  };

  return (
    <div
      className={cn(
        'flex items-start space-x-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ease-out max-w-sm',
        getColorClasses(),
        isVisible ? `opacity-100 ${getSlideDirection()}` : 'opacity-0 translate-x-full',
        isRemoving && 'opacity-0 scale-95'
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {toast.title}
        </div>
        {toast.message && (
          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {toast.message}
          </div>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      {!toast.persistent && toast.type !== 'loading' && (
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
  position?: ToastPosition;
}

export const ToastContainer = memo(function ToastContainer({ 
  toasts, 
  onRemove, 
  position = 'top-right' 
}: ToastContainerProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4 items-end';
      case 'top-left':
        return 'top-4 left-4 items-start';
      case 'bottom-right':
        return 'bottom-4 right-4 items-end';
      case 'bottom-left':
        return 'bottom-4 left-4 items-start';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2 items-center';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2 items-center';
      default:
        return 'top-4 right-4 items-end';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className={cn('fixed z-50 flex flex-col space-y-3', getPositionClasses())}>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
          position={position}
        />
      ))}
    </div>
  );
});

function getDefaultDuration(type: ToastType): number {
  switch (type) {
    case 'error':
      return 7000; // 7 seconds for errors
    case 'warning':
      return 5000; // 5 seconds for warnings
    case 'info':
      return 4000; // 4 seconds for info
    case 'success':
      return 3000; // 3 seconds for success
    case 'loading':
      return 0; // Loading toasts don't auto-dismiss
    default:
      return 4000;
  }
}

export default ToastItem;