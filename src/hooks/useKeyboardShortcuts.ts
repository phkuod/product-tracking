import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  callback: () => void;
  description: string;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when user is typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        // Allow Escape key to blur input fields
        if (event.key === 'Escape') {
          target.blur();
        }
        return;
      }

      shortcuts.forEach((shortcut) => {
        const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
        const ctrlMatch = !shortcut.ctrl || event.ctrlKey;
        const shiftMatch = !shortcut.shift || event.shiftKey;
        const altMatch = !shortcut.alt || event.altKey;

        // Ensure we don't trigger when modifier keys don't match exactly
        const ctrlRequired = shortcut.ctrl && event.ctrlKey;
        const shiftRequired = shortcut.shift && event.shiftKey;
        const altRequired = shortcut.alt && event.altKey;
        const noUnwantedModifiers = 
          (!shortcut.ctrl ? !event.ctrlKey : true) &&
          (!shortcut.shift ? !event.shiftKey : true) &&
          (!shortcut.alt ? !event.altKey : true);

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && 
            (ctrlRequired || shiftRequired || altRequired || noUnwantedModifiers)) {
          event.preventDefault();
          shortcut.callback();
        }
      });
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);

  return shortcuts;
}

// Pre-defined common shortcuts
export const createCommonShortcuts = (callbacks: {
  onNewProduct?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
  onSave?: () => void;
  onHelp?: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'n',
    ctrl: true,
    callback: callbacks.onNewProduct || (() => {}),
    description: 'Create new product (Ctrl+N)',
  },
  {
    key: '/',
    callback: callbacks.onSearch || (() => {}),
    description: 'Focus search (Press /)',
  },
  {
    key: 'Escape',
    callback: callbacks.onEscape || (() => {}),
    description: 'Close modals/clear selection (Esc)',
  },
  {
    key: 's',
    ctrl: true,
    callback: callbacks.onSave || (() => {}),
    description: 'Save changes (Ctrl+S)',
  },
  {
    key: '?',
    shift: true,
    callback: callbacks.onHelp || (() => {}),
    description: 'Show keyboard shortcuts (?)',
  },
];

export default useKeyboardShortcuts;