import { useState, useEffect, useCallback } from 'react';
import { GeneratedLinks, ContractType } from '../types';
import { CONFIG } from '../utils/constants';

export interface ContractHistoryItem {
    id: string;
    contractNumber: string;
    contractType: ContractType;
    clientName: string;
    eventDate: string;
    links: GeneratedLinks;
    createdAt: string;
}

const STORAGE_KEY = 'dshow-contract-history';

interface UseContractHistoryReturn {
    history: ContractHistoryItem[];
    addToHistory: (item: Omit<ContractHistoryItem, 'id' | 'createdAt'>) => void;
    removeFromHistory: (id: string) => void;
    clearHistory: () => void;
}

function useContractHistory(): UseContractHistoryReturn {
    const [history, setHistory] = useState<ContractHistoryItem[]>([]);

    // Load history on mount
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(STORAGE_KEY);
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (error) {
            console.error("Error loading contract history", error);
        }
    }, []);

    // Save history to localStorage whenever it changes
    const saveHistory = useCallback((newHistory: ContractHistoryItem[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        } catch (error) {
            console.error("Error saving contract history", error);
        }
    }, []);

    const addToHistory = useCallback((item: Omit<ContractHistoryItem, 'id' | 'createdAt'>) => {
        const newItem: ContractHistoryItem = {
            ...item,
            id: `${item.contractNumber}-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };

        setHistory(prev => {
            // Add to beginning and limit to max items
            const newHistory = [newItem, ...prev].slice(0, CONFIG.CONTRACT_HISTORY_MAX);
            saveHistory(newHistory);
            return newHistory;
        });
    }, [saveHistory]);

    const removeFromHistory = useCallback((id: string) => {
        setHistory(prev => {
            const newHistory = prev.filter(item => item.id !== id);
            saveHistory(newHistory);
            return newHistory;
        });
    }, [saveHistory]);

    const clearHistory = useCallback(() => {
        setHistory([]);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error("Error clearing contract history", error);
        }
    }, []);

    return { history, addToHistory, removeFromHistory, clearHistory };
}

export default useContractHistory;
