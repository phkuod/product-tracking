import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Badge } from '@/components/ui/badge';

interface NotificationItemProps {
  notification: {
    id: string;
    type: 'success' | 'warning' | 'error' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  };
  onMarkRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'error':
        return 'border-l-red-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  const timeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div
      className={`p-4 border-l-4 ${getBorderColor()} ${
        notification.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'
      } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer`}
      onClick={() => !notification.read && onMarkRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${
              notification.read ? 'text-gray-600' : 'text-gray-900'
            }`}>
              {notification.title}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {timeAgo(notification.timestamp)}
              </span>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
          <p className={`text-sm ${
            notification.read ? 'text-gray-500' : 'text-gray-600'
          } mt-1`}>
            {notification.message}
          </p>
        </div>
      </div>
    </div>
  );
}

export function NotificationCenter() {
  const { state, markNotificationRead, clearNotifications } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  const unreadCount = state.notifications.filter(n => !n.read).length;
  const displayNotifications = showAll 
    ? state.notifications 
    : state.notifications.slice(0, 5);

  // Auto-hide notifications after 5 seconds for success/info types
  useEffect(() => {
    const timer = setTimeout(() => {
      state.notifications
        .filter(n => !n.read && (n.type === 'success' || n.type === 'info'))
        .forEach(n => {
          const notificationAge = Date.now() - n.timestamp.getTime();
          if (notificationAge > 5000) {
            markNotificationRead(n.id);
          }
        });
    }, 5000);

    return () => clearTimeout(timer);
  }, [state.notifications, markNotificationRead]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 card-enhanced rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount} new
                    </Badge>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  {state.notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {state.notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications yet</p>
                </div>
              ) : (
                <>
                  {displayNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markNotificationRead}
                    />
                  ))}
                  
                  {state.notifications.length > 5 && !showAll && (
                    <div className="p-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowAll(true)}
                        className="w-full text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View all {state.notifications.length} notifications
                      </button>
                    </div>
                  )}
                  
                  {showAll && state.notifications.length > 5 && (
                    <div className="p-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowAll(false)}
                        className="w-full text-sm text-gray-600 hover:text-gray-700 transition-colors"
                      >
                        Show less
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}