// src/features/knitting/hooks/useRowCounter.js
import { useState, useCallback, useEffect } from 'react';

/**
 * Enhanced useRowCounter with Automatic Activity Tracking
 * 
 * NEW FEATURES:
 * - Updates project.lastActivityAt on every row increment/decrement
 * - Adds today's date to project.activityLog for streak tracking
 * - Auto-creates "Started Knitting" timeline entry on first row
 * - Integrates with ProjectsContext for seamless persistence
 */
export const useRowCounter = (projectId, componentId, stepIndex, step, isNotepadMode = false, updateProject = null) => {
    const keyIdentifier = isNotepadMode ? stepIndex : step.id;
    const storageKey = `row-counter-${projectId}-${componentId}-${keyIdentifier}`;

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

    // ✨ NEW: Activity tracking helper
    const trackActivity = useCallback((currentProject) => {
        if (!updateProject || !currentProject) return;

        const today = new Date().toISOString().split('T')[0];
        const activityLog = currentProject.activityLog || [];

        // Only add today if it's not already in the log
        const updatedActivityLog = activityLog.includes(today)
            ? activityLog
            : [...activityLog, today];

        // ✨ NEW: Auto-detect "Started Knitting" date
        // If this is the first activity ever recorded, set startedAt
        const shouldSetStartedAt = !currentProject.startedAt && updatedActivityLog.length > 0;

        const updates = {
            lastActivityAt: new Date().toISOString(),
            activityLog: updatedActivityLog
        };

        // Add startedAt if this is the first time knitting
        if (shouldSetStartedAt) {
            updates.startedAt = today;
            console.log('🎉 Auto-detected first knitting session! Setting startedAt:', today);
        }

        // Update the project with activity tracking
        updateProject({
            ...currentProject,
            ...updates
        });

        console.log('📊 Activity tracked:', {
            date: today,
            lastActivityAt: updates.lastActivityAt,
            activityLogLength: updatedActivityLog.length,
            autoSetStartedAt: shouldSetStartedAt
        });
    }, [updateProject]);

    const updateState = useCallback((newState, currentProject = null) => {
        setRowState(prev => {
            const updatedState = typeof newState === 'function' ? newState(prev) : newState;
            try {
                window.localStorage.setItem(storageKey, JSON.stringify(updatedState));

                // ✨ NEW: Track activity whenever row state changes
                if (currentProject) {
                    trackActivity(currentProject);
                }
            } catch (error) {
                console.warn(`Error saving to localStorage:`, error);
            }
            return updatedState;
        });
    }, [storageKey, trackActivity]);

    // ✨ ENHANCED: Row update methods now accept optional currentProject
    const updateRow = useCallback((newRow, currentProject = null) => {
        updateState(prev => ({
            ...prev,
            currentRow: newRow,
            lastUpdated: Date.now()
        }), currentProject);
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

    // ✨ ENHANCED: Increment/decrement now trigger activity tracking
    const incrementRow = useCallback((currentProject = null) => {
        updateRow(rowState.currentRow + 1, currentProject);
    }, [rowState.currentRow, updateRow]);

    const decrementRow = useCallback((currentProject = null) => {
        updateRow(Math.max(1, rowState.currentRow - 1), currentProject);
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