import { useEffect, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface UseAutoSaveOptions {
  key: string;
  data: any;
  delay?: number; // Auto-save delay in milliseconds
  enabled?: boolean;
}

export function useAutoSave({ key, data, delay = 2000, enabled = true }: UseAutoSaveOptions) {
  const [savedData, setSavedData] = useLocalStorage(key, null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');

  // Auto-save function with debouncing
  const saveData = useCallback(() => {
    if (!enabled) return;
    
    const dataString = JSON.stringify(data);
    
    // Only save if data has actually changed
    if (dataString !== lastSavedRef.current && dataString !== '{}' && dataString !== 'null') {
      setSavedData({
        data,
        timestamp: new Date().toISOString(),
        version: '1.0'
      });
      lastSavedRef.current = dataString;
    }
  }, [data, enabled, setSavedData]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(saveData, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, enabled, saveData]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    setSavedData(null);
    lastSavedRef.current = '';
  }, [setSavedData]);

  // Force save immediately
  const forceSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    saveData();
  }, [saveData]);

  // Load saved data
  const loadSavedData = useCallback(() => {
    return savedData?.data || null;
  }, [savedData]);

  // Check if there's saved data available
  const hasSavedData = useCallback(() => {
    return savedData && savedData.data && Object.keys(savedData.data).length > 0;
  }, [savedData]);

  // Get saved data timestamp
  const getSavedTimestamp = useCallback(() => {
    return savedData?.timestamp ? new Date(savedData.timestamp) : null;
  }, [savedData]);

  return {
    hasSavedData: hasSavedData(),
    loadSavedData,
    clearSavedData,
    forceSave,
    savedTimestamp: getSavedTimestamp(),
  };
}

export default useAutoSave;