// src/features/knitting/hooks/useRowCounter.js
import { useState, useCallback, useEffect } from 'react';

export const useRowCounter = (projectId, componentId, stepIndex, step) => {
    const storageKey = `row-counter-${projectId}-${componentId}-${stepIndex}`;

    const getDefaultState = () => ({
        currentRow: 1,
        stitchCount: step.startingStitches || 0,
        lastUpdated: Date.now()
    });

    // Manual localStorage state management that responds to key changes
    const [rowState, setRowState] = useState(() => {
        try {
            const item = window.localStorage.getItem(storageKey);
            // Check for null, empty string, or "undefined" string
            if (!item || item === 'undefined' || item === 'null') {
                return getDefaultState();
            }
            return JSON.parse(item);
        } catch (error) {
            console.warn(`Error reading localStorage for key "${storageKey}":`, error);
            return getDefaultState();
        }
    });

    // Watch for storage key changes and reload state
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(storageKey);
            // Check for null, empty string, or "undefined" string
            if (!item || item === 'undefined' || item === 'null') {
                setRowState(getDefaultState());
                return;
            }
            const newState = JSON.parse(item);
            setRowState(newState);
        } catch (error) {
            console.warn(`Error reading localStorage for key "${storageKey}":`, error);
            setRowState(getDefaultState());
        }
    }, [storageKey, step.startingStitches]);

    // Save to localStorage whenever state changes
    const updateState = useCallback((newState) => {
        const updatedState = typeof newState === 'function' ? newState(rowState) : newState;
        setRowState(updatedState);
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(updatedState));
        } catch (error) {
            console.warn(`Error saving to localStorage:`, error);
        }
    }, [storageKey, rowState]);

    // Rest of methods stay the same...
    const updateRow = useCallback((newRow) => {
        updateState(prev => ({
            ...prev,
            currentRow: newRow,
            lastUpdated: Date.now()
        }));
    }, [updateState]);

    const updateStitchCount = useCallback((newCount) => {
        updateState(prev => ({
            ...prev,
            stitchCount: newCount,
            lastUpdated: Date.now()
        }));
    }, [updateState]);

    const resetCounter = useCallback(() => {
        updateState(getDefaultState());
    }, [updateState]);

    const incrementRow = useCallback(() => {
        updateRow(rowState.currentRow + 1);
    }, [rowState.currentRow, updateRow]);

    const decrementRow = useCallback(() => {
        updateRow(Math.max(1, rowState.currentRow - 1));
    }, [rowState.currentRow, updateRow]);

    return {
        currentRow: rowState.currentRow,
        stitchCount: rowState.stitchCount,
        updateRow,
        updateStitchCount,
        resetCounter,
        incrementRow,
        decrementRow
    };
};