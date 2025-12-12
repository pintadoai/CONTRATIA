import { useState, useEffect, useCallback } from 'react';
import { CONFIG } from '../utils/constants';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveReturn {
    clearDraft: () => void;
    saveStatus: SaveStatus;
    lastSaved: Date | null;
}

function useAutoSave<T>(
    data: T,
    setData: React.Dispatch<React.SetStateAction<T>>,
    storageKey: string,
    debounceMs = CONFIG.AUTOSAVE_DEBOUNCE_MS
): UseAutoSaveReturn {
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Load saved data on mount
    useEffect(() => {
        try {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                setData(JSON.parse(savedData));
            }
        } catch (error) {
            console.error("Error loading data from localStorage", error);
            setSaveStatus('error');
        }
        setIsInitialLoad(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);

    // Save data with debounce
    useEffect(() => {
        if (isInitialLoad) {
            return;
        }

        setSaveStatus('saving');

        const handler = setTimeout(() => {
            try {
                localStorage.setItem(storageKey, JSON.stringify(data));
                setSaveStatus('saved');
                setLastSaved(new Date());

                // Return to idle after 2 seconds
                setTimeout(() => {
                    setSaveStatus('idle');
                }, 2000);
            } catch (error) {
                console.error("Error saving data to localStorage", error);
                setSaveStatus('error');
            }
        }, debounceMs);

        return () => {
            clearTimeout(handler);
        };
    }, [data, storageKey, debounceMs, isInitialLoad]);

    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
            setSaveStatus('idle');
            setLastSaved(null);
        } catch (error) {
            console.error("Error clearing data from localStorage", error);
            setSaveStatus('error');
        }
    }, [storageKey]);

    return { clearDraft, saveStatus, lastSaved };
}

export default useAutoSave;
