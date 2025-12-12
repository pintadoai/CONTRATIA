import React, { useState, useEffect, useCallback } from 'react';

function useAutoSave<T>(
    data: T,
    setData: React.Dispatch<React.SetStateAction<T>>,
    storageKey: string,
    debounceMs = 500
) {
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                setData(JSON.parse(savedData));
            }
        } catch (error) {
            console.error("Error loading data from localStorage", error);
        }
        setIsInitialLoad(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [storageKey]);

    useEffect(() => {
        if (isInitialLoad) {
            return;
        }

        const handler = setTimeout(() => {
            try {
                localStorage.setItem(storageKey, JSON.stringify(data));
            } catch (error) {
                console.error("Error saving data to localStorage", error);
            }
        }, debounceMs);

        return () => {
            clearTimeout(handler);
        };
    }, [data, storageKey, debounceMs, isInitialLoad]);

    const clearDraft = useCallback(() => {
        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
            console.error("Error clearing data from localStorage", error);
        }
    }, [storageKey]);

    return { clearDraft };
}

export default useAutoSave;