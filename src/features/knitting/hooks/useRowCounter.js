// src/features/knitting/hooks/useRowCounter.js
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';
import { useCallback } from 'react';

export const useRowCounter = (projectId, componentId, stepIndex, step) => {
    const storageKey = `row-counter-${projectId}-${componentId}-${stepIndex}`;

    const [rowState, setRowState] = useLocalStorage(storageKey, {
        currentRow: 1,
        stitchCount: step.startingStitches || 0,
        lastUpdated: Date.now()
    });

    const updateRow = useCallback((newRow) => {
        setRowState(prev => ({
            ...prev,
            currentRow: newRow,
            lastUpdated: Date.now()
        }));
    }, [setRowState]);

    const updateStitchCount = useCallback((newCount) => {
        setRowState(prev => ({
            ...prev,
            stitchCount: newCount,
            lastUpdated: Date.now()
        }));
    }, [setRowState]);

    const resetCounter = useCallback(() => {
        setRowState({
            currentRow: 1,
            stitchCount: step.startingStitches || 0,
            lastUpdated: Date.now()
        });
    }, [setRowState, step.startingStitches]);

    const incrementRow = useCallback(() => {
        updateRow(Math.min(rowState.currentRow + 1, step.totalRows || 999));
    }, [rowState.currentRow, step.totalRows, updateRow]);

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