// src/shared/utils/progressTracking.js

/**
 * Progress Tracking Utilities - Sequential Step Completion System
 * 
 * Manages step-by-step progress with:
 * - Sequential enforcement (can't skip steps)
 * - Row-level tracking for in-progress steps
 * - Smart completion inference for checkbox clicks
 * - Frogging protection (can only uncheck most recent)
 */

import { isLengthBasedStep, estimateRowsFromLength } from './gaugeUtils';

// ===== STORAGE KEY GENERATION =====

/**
 * Generate consistent localStorage key for progress tracking
 */
export const getProgressStorageKey = (projectId, componentId) => {
    return `knitting-progress-${projectId}-${componentId}`;
};

/**
 * Get all progress data for a component
 */
export const getAllProgressData = (projectId, componentId) => {
    try {
        const key = getProgressStorageKey(projectId, componentId);
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.warn('Error reading progress data:', error);
        return {};
    }
};

/**
 * Save all progress data for a component
 */
export const saveAllProgressData = (projectId, componentId, progressData) => {
    try {
        const key = getProgressStorageKey(projectId, componentId);
        localStorage.setItem(key, JSON.stringify(progressData));
    } catch (error) {
        console.error('Error saving progress data:', error);
    }
};

// ===== PROGRESS STATE MANAGEMENT =====

/**
 * Progress state types
 */
export const PROGRESS_STATUS = {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed'
};

/**
 * Get progress state for a specific step
 */
export const getStepProgressState = (stepId, componentId, projectId) => {
    const allProgress = getAllProgressData(projectId, componentId);
    return allProgress[stepId] || { status: PROGRESS_STATUS.NOT_STARTED };
};

/**
 * Save progress state for a specific step
 */
export const saveStepProgressState = (stepId, componentId, projectId, progressState) => {
    const allProgress = getAllProgressData(projectId, componentId);
    allProgress[stepId] = {
        ...progressState,
        lastUpdated: new Date().toISOString()
    };
    saveAllProgressData(projectId, componentId, allProgress);
};

/**
 * Clear progress state for a specific step (frogging)
 */
export const clearStepProgressState = (stepId, componentId, projectId, stepIndex = null) => {
    // Clear from progress tracking system
    const allProgress = getAllProgressData(projectId, componentId);
    delete allProgress[stepId];
    saveAllProgressData(projectId, componentId, allProgress);

    // ✅ NEW: Also clear the row counter localStorage if stepIndex provided
    if (stepIndex !== null) {
        const rowCounterKey = `row-counter-${projectId}-${componentId}-${stepIndex}`;
        localStorage.removeItem(rowCounterKey);
    }
};

/**
 * Clear all progress for a component
 */
export const clearAllProgress = (projectId, componentId) => {
    const key = getProgressStorageKey(projectId, componentId);
    localStorage.removeItem(key);
};

// ===== SEQUENTIAL ENFORCEMENT =====

/**
 * Check if a step can be started (previous step must be completed)
 */
export const canStartStep = (stepIndex, steps, componentId, projectId) => {
    // First step can always be started
    if (stepIndex === 0) return true;

    // Check if previous step is completed
    const previousStep = steps[stepIndex - 1];
    if (!previousStep) return false;

    const prevProgress = getStepProgressState(previousStep.id, componentId, projectId);
    return prevProgress.status === PROGRESS_STATUS.COMPLETED;
};

/**
 * Check if a step can be unchecked (only most recent completed step)
 */
export const canUncheckStep = (stepIndex, steps, componentId, projectId) => {
    const step = steps[stepIndex];
    if (!step) return false;

    // Step must be completed to uncheck
    const progress = getStepProgressState(step.id, componentId, projectId);
    if (progress.status !== PROGRESS_STATUS.COMPLETED) return false;

    // All subsequent steps must be not_started
    for (let i = stepIndex + 1; i < steps.length; i++) {
        const nextStep = steps[i];
        const nextProgress = getStepProgressState(nextStep.id, componentId, projectId);
        if (nextProgress.status !== PROGRESS_STATUS.NOT_STARTED) {
            return false;
        }
    }

    return true;
};

/**
 * Get the current active step index (first in-progress or not-started after completed)
 */
export const getCurrentStepIndex = (steps, componentId, projectId) => {
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const progress = getStepProgressState(step.id, componentId, projectId);

        if (progress.status === PROGRESS_STATUS.IN_PROGRESS) {
            return i; // Return first in-progress step
        }

        if (progress.status === PROGRESS_STATUS.NOT_STARTED) {
            // Check if this step can be started
            if (canStartStep(i, steps, componentId, projectId)) {
                return i; // Return first available not-started step
            }
        }
    }

    // All steps completed or no available steps
    return steps.length; // Beyond last step
};

// ===== SMART COMPLETION INFERENCE =====

/**
 * Infer progress data when completing a step via checkbox
 * Handles fixed-row, repeat-based, and length-based steps
 */
export const inferProgressFromStep = (step, project = null) => {
    const result = {
        currentRow: null,
        totalRows: null,
        estimatedRows: null,
        completionMethod: 'checkbox'
    };

    // Length-based steps - estimate using gauge
    if (isLengthBasedStep(step)) {
        const duration = step.wizardConfig?.duration;
        const targetLength = parseFloat(duration?.value) || 0;
        const targetUnits = duration?.units || 'inches';

        const estimatedRows = estimateRowsFromLength(targetLength, targetUnits, project);

        if (estimatedRows) {
            result.estimatedRows = estimatedRows;
            result.currentRow = estimatedRows; // Best guess
            result.totalRows = null; // Unknown actual total
        } else {
            // No gauge - mark as unknown
            result.currentRow = null;
            result.totalRows = null;
            result.estimatedRows = null;
        }

        return result;
    }

    // Fixed row count or repeat-based - use totalRows
    if (step.totalRows) {
        result.currentRow = step.totalRows;
        result.totalRows = step.totalRows;
        return result;
    }

    // Fallback - single row
    result.currentRow = 1;
    result.totalRows = 1;
    return result;
};

/**
 * Check if a step needs row count verification after checkbox completion
 * (primarily for length-based steps with no gauge)
 */
export const needsRowVerification = (step, project = null) => {
    if (!isLengthBasedStep(step)) return false;

    const duration = step.wizardConfig?.duration;
    const targetLength = parseFloat(duration?.value) || 0;
    const targetUnits = duration?.units || 'inches';

    const estimatedRows = estimateRowsFromLength(targetLength, targetUnits, project);

    // Needs verification if we couldn't estimate
    return !estimatedRows;
};

// ===== PROGRESS DISPLAY HELPERS =====

/**
 * Get human-readable progress summary for a step
 */
export const getProgressSummary = (stepId, componentId, projectId, step = null) => {
    const progress = getStepProgressState(stepId, componentId, projectId);

    switch (progress.status) {
        case PROGRESS_STATUS.NOT_STARTED:
            return {
                status: 'not_started',
                text: 'Not started',
                canInteract: true
            };

        case PROGRESS_STATUS.IN_PROGRESS:
            const currentRow = progress.currentRow || 1;
            const totalRows = progress.totalRows || step?.totalRows;

            if (totalRows && totalRows > 1) {
                return {
                    status: 'in_progress',
                    text: `Row ${currentRow} of ${totalRows}`,
                    currentRow,
                    totalRows,
                    canInteract: true
                };
            }

            return {
                status: 'in_progress',
                text: `Row ${currentRow}`,
                currentRow,
                canInteract: true
            };

        case PROGRESS_STATUS.COMPLETED:
            const completedAt = progress.completedAt;
            const wasCheckbox = progress.completionMethod === 'checkbox';

            return {
                status: 'completed',
                text: 'Completed',
                completedAt,
                wasCheckbox,
                canInteract: true
            };

        default:
            return {
                status: 'unknown',
                text: 'Unknown',
                canInteract: false
            };
    }
};

/**
 * Get progress statistics for a component
 */
export const getComponentProgressStats = (steps, componentId, projectId) => {
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;

    steps.forEach(step => {
        const progress = getStepProgressState(step.id, componentId, projectId);
        switch (progress.status) {
            case PROGRESS_STATUS.COMPLETED:
                completed++;
                break;
            case PROGRESS_STATUS.IN_PROGRESS:
                inProgress++;
                break;
            case PROGRESS_STATUS.NOT_STARTED:
                notStarted++;
                break;
        }
    });

    const total = steps.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
        completed,
        inProgress,
        notStarted,
        total,
        percentage,
        isComplete: completed === total
    };
};

// ===== MIGRATION HELPERS =====

/**
 * Migrate old completion flags to new progress system
 * Call this once to migrate existing projects
 */
export const migrateOldCompletionFlags = (component, projectId) => {
    const componentId = component.id;
    const allProgress = getAllProgressData(projectId, componentId);

    component.steps.forEach((step, index) => {
        // Skip if already has progress state
        if (allProgress[step.id]) return;

        // Migrate old completed flag
        if (step.completed) {
            allProgress[step.id] = {
                status: PROGRESS_STATUS.COMPLETED,
                currentRow: step.totalRows || 1,
                totalRows: step.totalRows || 1,
                completionMethod: 'migrated',
                completedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
        }
    });

    saveAllProgressData(projectId, componentId, allProgress);
};

// ===== VALIDATION UTILITIES =====

/**
 * Validate progress state consistency
 * Returns array of issues found
 */
export const validateProgressState = (steps, componentId, projectId) => {
    const issues = [];
    let lastCompletedIndex = -1;

    steps.forEach((step, index) => {
        const progress = getStepProgressState(step.id, componentId, projectId);

        // Check for gaps in completion
        if (progress.status === PROGRESS_STATUS.COMPLETED) {
            lastCompletedIndex = index;
        } else if (progress.status === PROGRESS_STATUS.IN_PROGRESS ||
            progress.status === PROGRESS_STATUS.NOT_STARTED) {
            if (index > 0 && lastCompletedIndex < index - 1) {
                issues.push({
                    stepIndex: index,
                    issue: 'gap_in_completion',
                    message: `Step ${index + 1} is accessible but previous steps aren't complete`
                });
            }
        }

        // Validate row counts
        if (progress.currentRow && progress.totalRows) {
            if (progress.currentRow > progress.totalRows) {
                issues.push({
                    stepIndex: index,
                    issue: 'invalid_row_count',
                    message: `Current row (${progress.currentRow}) exceeds total rows (${progress.totalRows})`
                });
            }
        }
    });

    return issues;
};

// ===== EXPORT ALL =====

export default {
    // Storage
    getProgressStorageKey,
    getAllProgressData,
    saveAllProgressData,

    // State Management
    PROGRESS_STATUS,
    getStepProgressState,
    saveStepProgressState,
    clearStepProgressState,
    clearAllProgress,

    // Sequential Enforcement
    canStartStep,
    canUncheckStep,
    getCurrentStepIndex,

    // Smart Completion
    inferProgressFromStep,
    needsRowVerification,

    // Display Helpers
    getProgressSummary,
    getComponentProgressStats,

    // Migration
    migrateOldCompletionFlags,

    // Validation
    validateProgressState
};