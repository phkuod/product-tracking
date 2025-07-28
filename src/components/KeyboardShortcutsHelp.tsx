import { X, Keyboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
}

interface KeyboardShortcutsHelpProps {
  shortcuts: KeyboardShortcut[];
  isOpen: boolean;
  onClose: () => void;
}

const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  
  // Format special keys
  let key = shortcut.key;
  switch (key.toLowerCase()) {
    case 'escape':
      key = 'Esc';
      break;
    case ' ':
      key = 'Space';
      break;
    case 'arrowup':
      key = '↑';
      break;
    case 'arrowdown':
      key = '↓';
      break;
    case 'arrowleft':
      key = '←';
      break;
    case 'arrowright':
      key = '→';
      break;
    default:
      key = key.length === 1 ? key.toUpperCase() : key;
  }
  
  parts.push(key);
  return parts.join(' + ');
};

export function KeyboardShortcutsHelp({ shortcuts, isOpen, onClose }: KeyboardShortcutsHelpProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 shadow-xl animate-scale-in">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Keyboard Shortcuts</span>
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors btn-touch focus-enhanced"
            aria-label="Close shortcuts help"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>
        
        <CardContent className="space-y-3 max-h-96 overflow-y-auto scrollbar-styled">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                {shortcut.description.split('(')[0].trim()}
              </span>
              <div className="flex items-center space-x-1">
                {formatShortcut(shortcut).split(' + ').map((part, partIndex) => (
                  <span key={partIndex} className="flex items-center">
                    {partIndex > 0 && <span className="mx-1 text-gray-400">+</span>}
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
                      {part}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
          
          {/* Additional tips */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd> to close this dialog
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default KeyboardShortcutsHelp;