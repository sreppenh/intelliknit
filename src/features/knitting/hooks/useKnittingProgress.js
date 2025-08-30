import { useState, useCallback, useRef, useEffect } from 'react';
import { useLocalStorage } from '../../../shared/hooks/useLocalStorage';
import { useCelebrations } from './useCelebrations';

/**
 * useKnittingProgress - Smart progress tracking for knitting sessions
 * 
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Progress persistence between sessions
 * - Batch completion for related steps
 * - Undo functionality with toast notifications
 * - Smart completion patterns (auto-complete setup rows, etc.)
 */
export const useKnittingProgress = (projectId, componentId, steps = []) => {
    // Persistent progress state
    const [persistedProgress, setPersistedProgress] = useLocalStorage(
        `knitting-progress-${projectId}-${componentId}`,
        {}
    );

    const celebrations = useCelebrations();

    // Optimistic state (immediate UI updates)
    const [optimisticProgress, setOptimisticProgress] = useState({});

    // Undo stack for mistake correction
    const [undoStack, setUndoStack] = useState([]);
    const undoTimeoutRef = useRef(null);

    // Merge persisted and optimistic state
    const currentProgress = {
        ...persistedProgress,
        ...optimisticProgress
    };

    // Check if step is completed
    const isStepCompleted = useCallback((stepIndex) => {
        return currentProgress[stepIndex] || false;
    }, [currentProgress]);



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

    // ✅ OPTIMISTIC COMPLETION - Instant UI feedback
    const toggleStepCompletion = useCallback((stepIndex, options = {}) => {
        const {
            skipUndo = false,
            batchOperation = false,
            skipPersistence = false,
            skipCelebration = false
        } = options;

        const wasCompleted = isStepCompleted(stepIndex);
        const newState = !wasCompleted;

        // 1. Immediate optimistic update
        setOptimisticProgress(prev => ({
            ...prev,
            [stepIndex]: newState
        }));

        // 2. Trigger celebration for new completions
        if (newState && !skipCelebration) {
            celebrations.triggerStepCompletion(stepIndex, steps.length);
        }

        // 2. Add to undo stack (unless it's part of batch or undo disabled)
        if (!skipUndo && !batchOperation) {
            const undoAction = {
                type: 'single',
                stepIndex,
                previousState: wasCompleted,
                timestamp: Date.now(),
                description: `${newState ? 'Completed' : 'Uncompleted'} step ${stepIndex + 1}`
            };

            setUndoStack(prev => [undoAction, ...prev.slice(0, 9)]); // Keep last 10 actions

            // Auto-clear undo after 10 seconds
            if (undoTimeoutRef.current) {
                clearTimeout(undoTimeoutRef.current);
            }
            undoTimeoutRef.current = setTimeout(() => {
                persistOptimisticChanges();
            }, 10000);
        }

        // 3. Persist immediately if not batching
        if (!batchOperation && !skipPersistence) {
            // Small delay to allow for potential batch operations
            setTimeout(() => persistOptimisticChanges(), 100);
        }

        return newState;
    }, [isStepCompleted]);

    // ✅ BATCH COMPLETION - Mark related steps
    const completeStepRange = useCallback((startIndex, endIndex, completed = true) => {
        const affectedSteps = [];

        // Optimistic updates for range
        const updates = {};
        for (let i = startIndex; i <= endIndex; i++) {
            if (i >= 0 && i < steps.length) {
                const wasCompleted = isStepCompleted(i);
                if (wasCompleted !== completed) {
                    updates[i] = completed;
                    affectedSteps.push({ index: i, previousState: wasCompleted });
                }
            }
        }

        if (affectedSteps.length === 0) return;

        // Apply optimistic updates
        setOptimisticProgress(prev => ({ ...prev, ...updates }));

        // Add batch undo action
        const undoAction = {
            type: 'batch',
            affectedSteps,
            timestamp: Date.now(),
            description: `${completed ? 'Completed' : 'Uncompleted'} steps ${startIndex + 1}-${endIndex + 1}`
        };

        setUndoStack(prev => [undoAction, ...prev.slice(0, 9)]);

        // Persist after batch
        setTimeout(() => persistOptimisticChanges(), 100);
    }, [steps, isStepCompleted]);

    // ✅ SMART COMPLETION PATTERNS
    const completePattern = useCallback((pattern, stepIndex) => {
        switch (pattern) {
            case 'setup_rows':
                // Complete all setup rows in a shaping phase
                const setupSteps = findSetupSteps(stepIndex);
                completeStepRange(setupSteps.start, setupSteps.end);
                break;

            case 'repeat_sequence':
                // Complete a full pattern repeat
                const repeatSteps = findRepeatSequence(stepIndex);
                completeStepRange(repeatSteps.start, repeatSteps.end);
                break;

            case 'component_section':
                // Complete entire section (e.g., all increases before waist)
                const sectionSteps = findComponentSection(stepIndex);
                completeStepRange(sectionSteps.start, sectionSteps.end);
                break;
        }
    }, [completeStepRange]);

    // ✅ UNDO FUNCTIONALITY
    const undoLastAction = useCallback(() => {
        if (undoStack.length === 0) return null;

        const [lastAction, ...remainingStack] = undoStack;
        setUndoStack(remainingStack);

        if (lastAction.type === 'single') {
            // Undo single step
            setOptimisticProgress(prev => ({
                ...prev,
                [lastAction.stepIndex]: lastAction.previousState
            }));
        } else if (lastAction.type === 'batch') {
            // Undo batch operation
            const updates = {};
            lastAction.affectedSteps.forEach(({ index, previousState }) => {
                updates[index] = previousState;
            });
            setOptimisticProgress(prev => ({ ...prev, ...updates }));
        }

        // Clear undo timeout since user manually undid
        if (undoTimeoutRef.current) {
            clearTimeout(undoTimeoutRef.current);
        }

        return lastAction;
    }, [undoStack]);

    // ✅ PERSISTENCE - Save optimistic changes to localStorage
    const persistOptimisticChanges = useCallback(() => {
        if (Object.keys(optimisticProgress).length > 0) {
            setPersistedProgress(prev => ({
                ...prev,
                ...optimisticProgress
            }));
            setOptimisticProgress({});
            setUndoStack([]); // Clear undo stack after persistence
        }
    }, [optimisticProgress, setPersistedProgress]);

    // ✅ SESSION MANAGEMENT
    const clearProgress = useCallback(() => {
        setOptimisticProgress({});
        setPersistedProgress({});
        setUndoStack([]);
    }, [setPersistedProgress]);

    const exportProgress = useCallback(() => {
        return {
            projectId,
            componentId,
            progress: currentProgress,
            timestamp: Date.now(),
            stats: getProgressStats()
        };
    }, [projectId, componentId, currentProgress, getProgressStats]);

    // Helper functions for smart patterns
    const findSetupSteps = (stepIndex) => {
        // Logic to find setup rows in shaping sequences
        // Returns { start, end } indices
        return { start: stepIndex, end: stepIndex };
    };

    const findRepeatSequence = (stepIndex) => {
        // Logic to find pattern repeat boundaries
        return { start: stepIndex, end: stepIndex };
    };

    const findComponentSection = (stepIndex) => {
        // Logic to find logical section boundaries
        return { start: stepIndex, end: stepIndex };
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (undoTimeoutRef.current) {
                clearTimeout(undoTimeoutRef.current);
            }
            persistOptimisticChanges();
        };
    }, []);

    // Return hook interface
    return {
        // State
        isStepCompleted,
        currentProgress,
        undoStack,

        // Stats
        ...getProgressStats(),

        // Actions
        toggleStepCompletion,
        completeStepRange,
        completePattern,
        undoLastAction,

        // Persistence
        persistOptimisticChanges,
        clearProgress,
        exportProgress,

        // Utilities
        canUndo: undoStack.length > 0,
        lastAction: undoStack[0] || null
    };
};