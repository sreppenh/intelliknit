import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';
import { useCelebrations } from './useCelebrations';

/**
 * useKnittingProgress - Simple, reliable progress tracking
 * 
 * SIMPLIFIED: No timeouts, no optimistic state conflicts
 * Just direct persistence that actually works!
 */
export const useKnittingProgress = (projectId, componentId, steps = []) => {
    // Single source of truth - direct localStorage
    const [progress, setProgress] = useLocalStorage(
        `knitting-progress-${projectId}-${componentId}`,
        {}
    );

    const celebrations = useCelebrations();

    // Check if step is completed
    const isStepCompleted = useCallback((stepIndex) => {
        return progress[stepIndex] || false;
    }, [progress]);

    // Get completion stats
    const getProgressStats = useCallback(() => {
        const completed = steps.filter((_, index) => isStepCompleted(index)).length;
        const total = steps.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            completed,
            total,
            percentage,
            remaining: total - completed,
            isComplete: completed === total
        };
    }, [steps, isStepCompleted]);

    // ✅ SIMPLE TOGGLE - No timeouts, no optimistic state, just works!
    const toggleStepCompletion = useCallback((stepIndex, options = {}) => {
        const { skipCelebration = false } = options;

        const wasCompleted = isStepCompleted(stepIndex);
        const newState = !wasCompleted;

        // Direct update - no optimistic nonsense
        setProgress(prev => ({
            ...prev,
            [stepIndex]: newState
        }));

        // Trigger celebration for new completions
        if (newState && !skipCelebration) {
            celebrations.triggerStepCompletion(stepIndex, steps.length);
        }

        return newState;
    }, [isStepCompleted, setProgress, celebrations, steps.length]);

    // Batch completion
    const completeStepRange = useCallback((startIndex, endIndex, completed = true) => {
        const updates = {};
        for (let i = startIndex; i <= endIndex; i++) {
            if (i >= 0 && i < steps.length) {
                updates[i] = completed;
            }
        }

        setProgress(prev => ({ ...prev, ...updates }));
    }, [steps.length, setProgress]);

    // Session management
    const clearProgress = useCallback(() => {
        setProgress({});
    }, [setProgress]);

    const exportProgress = useCallback(() => {
        return {
            projectId,
            componentId,
            progress,
            timestamp: Date.now(),
            stats: getProgressStats()
        };
    }, [projectId, componentId, progress, getProgressStats]);

    // Return simplified interface
    return {
        // State
        isStepCompleted,
        currentProgress: progress,

        // Stats
        ...getProgressStats(),

        // Actions
        toggleStepCompletion,
        completeStepRange,
        clearProgress,
        exportProgress,

        // Simplified utilities (no undo needed without timeouts)
        canUndo: false,
        lastAction: null
    };
};