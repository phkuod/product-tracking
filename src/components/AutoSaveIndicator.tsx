import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, X, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  hasSavedData: boolean;
  savedTimestamp: Date | null;
  onRestore: () => void;
  onDiscard: () => void;
  className?: string;
}

export const AutoSaveIndicator = memo(function AutoSaveIndicator({
  hasSavedData,
  savedTimestamp,
  onRestore,
  onDiscard,
  className = ''
}: AutoSaveIndicatorProps) {
  if (!hasSavedData) return null;

  const timeAgo = savedTimestamp ? getTimeAgo(savedTimestamp) : 'unknown time';

  return (
    <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4 animate-slide-in ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Save className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Auto-saved data available
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
              <Clock className="w-3 h-3 mr-1" />
              Saved {timeAgo}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onRestore}
            className="text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800/50"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Restore
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDiscard}
            className="text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/50"
          >
            <X className="w-3 h-3 mr-1" />
            Discard
          </Button>
        </div>
      </div>
    </div>
  );
});

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return `on ${formatDate(date)}`;
  }
}

export default AutoSaveIndicator;