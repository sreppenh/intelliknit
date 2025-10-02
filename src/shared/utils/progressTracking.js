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

    // Clear the row counter localStorage (uses stepId for project mode)
    const rowCounterKey = `row-counter-${projectId}-${componentId}-${stepId}`;
    localStorage.removeItem(rowCounterKey);

    // Also try with stepIndex as fallback (shouldn't be needed but for safety)
    if (stepIndex !== null) {
        const altKey = `row-counter-${projectId}-${componentId}-${stepIndex}`;
        localStorage.removeItem(altKey);
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

// ===== PATTERN & COLOR CONTINUATION UTILITIES =====

/**
 * Calculate pattern length for a step
 * Returns the number of rows in the pattern repeat
 */
export const getPatternLength = (step) => {
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

    if (!stitchPattern) return null;

    // Row-by-row entry mode
    if (stitchPattern.entryMode === 'row_by_row' && stitchPattern.rowInstructions) {
        return stitchPattern.rowInstructions.length;
    }

    // Description mode with rowsInPattern
    if (stitchPattern.rowsInPattern) {
        return parseInt(stitchPattern.rowsInPattern);
    }

    return null;
};

/**
 * Calculate color sequence length for a step
 * Returns the total number of rows in the stripe sequence
 */
export const getColorSequenceLength = (step) => {
    const colorwork = step.colorwork || step.wizardConfig?.colorwork || step.advancedWizardConfig?.colorwork;

    if (!colorwork || colorwork.type !== 'stripes') return null;

    const stripeSequence = colorwork.stripeSequence;
    if (!stripeSequence || !Array.isArray(stripeSequence) || stripeSequence.length === 0) {
        return null;
    }

    return stripeSequence.reduce((sum, stripe) => sum + (stripe.rows || 0), 0);
};

/**
 * Check if step should ignore pattern/color continuation
 * Returns true for steps with "repeats" or "color_repeats" duration
 */
export const shouldIgnoreContinuation = (step) => {
    const durationType = step.wizardConfig?.duration?.type;
    return durationType === 'repeats' || durationType === 'color_repeats';
};

/**
 * Calculate continuation state when a step is completed
 * Returns object with pattern and color ending positions
 */
export const calculateContinuationState = (step) => {
    // Don't calculate continuation for repeat-based steps
    if (shouldIgnoreContinuation(step)) {
        return null;
    }

    const patternLength = getPatternLength(step);
    const colorLength = getColorSequenceLength(step);
    const totalRows = step.totalRows || 1;

    const continuation = {};

    // Calculate pattern continuation
    if (patternLength && patternLength > 0) {
        continuation.patternRow = (totalRows % patternLength) || patternLength;
        continuation.patternLength = patternLength;
    }

    // Calculate color continuation
    if (colorLength && colorLength > 0) {
        continuation.colorRow = (totalRows % colorLength) || colorLength;
        continuation.colorLength = colorLength;
    }

    // Only return continuation object if we have data
    return (continuation.patternRow || continuation.colorRow) ? continuation : null;
};

/**
 * Get continuation state from previous step
 * Returns continuation offsets for pattern and color, or null if no previous step
 */
export const getPreviousStepContinuation = (component, stepIndex, projectId) => {
    // First step has no previous continuation
    if (stepIndex === 0) return null;

    const prevStep = component.steps[stepIndex - 1];
    if (!prevStep) return null;

    const prevProgress = getStepProgressState(prevStep.id, component.id, projectId);

    // Return continuation data if it exists
    return prevProgress?.continuation || null;
};

/**
 * Get pattern row offset for current step
 * Accounts for previous step continuation and user overrides
 */
export const getPatternRowOffset = (step, component, stepIndex, projectId) => {
    // Check if user wants to reset pattern
    if (step.continuationOverrides?.resetPattern) {
        return 0;
    }

    // Check if this step type should ignore continuation
    if (shouldIgnoreContinuation(step)) {
        return 0;
    }

    // Get continuation from previous step
    const prevContinuation = getPreviousStepContinuation(component, stepIndex, projectId);

    if (!prevContinuation || !prevContinuation.patternRow) {
        return 0;
    }

    // Validate that pattern lengths match (safety check)
    const currentPatternLength = getPatternLength(step);
    if (currentPatternLength && prevContinuation.patternLength !== currentPatternLength) {
        // Pattern changed, don't continue
        console.warn('Pattern length mismatch - resetting pattern continuation');
        return 0;
    }

    return prevContinuation.patternRow;
};

/**
 * Get color row offset for current step
 * Accounts for previous step continuation and user overrides
 */
export const getColorRowOffset = (step, component, stepIndex, projectId) => {
    // Check if user wants to reset color
    if (step.continuationOverrides?.resetColor) {
        return 0;
    }

    // Check if this step type should ignore continuation
    if (shouldIgnoreContinuation(step)) {
        return 0;
    }

    // Get continuation from previous step
    const prevContinuation = getPreviousStepContinuation(component, stepIndex, projectId);

    if (!prevContinuation || !prevContinuation.colorRow) {
        return 0;
    }

    // Validate that color sequence lengths match (safety check)
    const currentColorLength = getColorSequenceLength(step);
    if (currentColorLength && prevContinuation.colorLength !== currentColorLength) {
        // Color sequence changed, don't continue
        console.warn('Color sequence length mismatch - resetting color continuation');
        return 0;
    }

    return prevContinuation.colorRow;
};

/**
 * Calculate adjusted row number for pattern instructions
 * Use this when fetching the current pattern row
 */
export const getAdjustedPatternRow = (currentRow, step, component, stepIndex, projectId) => {
    const patternLength = getPatternLength(step);
    if (!patternLength) return currentRow;

    const offset = getPatternRowOffset(step, component, stepIndex, projectId);
    const adjustedRow = offset + currentRow - 1;

    return (adjustedRow % patternLength) + 1; // Return 1-indexed row number
};

/**
 * Calculate adjusted row number for color instructions
 * Use this when determining current stripe color
 */
export const getAdjustedColorRow = (currentRow, step, component, stepIndex, projectId) => {
    const colorLength = getColorSequenceLength(step);
    if (!colorLength) return currentRow;

    const offset = getColorRowOffset(step, component, stepIndex, projectId);
    const adjustedRow = offset + currentRow - 1;

    return (adjustedRow % colorLength) + 1; // Return 1-indexed row number
};

/**
 * Get display text for continuation status (for debugging/UI)
 */
export const getContinuationStatusText = (step, component, stepIndex, projectId) => {
    const patternOffset = getPatternRowOffset(step, component, stepIndex, projectId);
    const colorOffset = getColorRowOffset(step, component, stepIndex, projectId);

    const parts = [];

    if (patternOffset > 0) {
        const patternLength = getPatternLength(step);
        parts.push(`Pattern continues from row ${patternOffset} of ${patternLength}`);
    }

    if (colorOffset > 0) {
        const colorLength = getColorSequenceLength(step);
        parts.push(`Color continues from row ${colorOffset} of ${colorLength}`);
    }

    return parts.length > 0 ? parts.join(', ') : null;
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
    validateProgressState,

    // ✅ NEW: Pattern & Color Continuation
    getPatternLength,
    getColorSequenceLength,
    shouldIgnoreContinuation,
    calculateContinuationState,
    getPreviousStepContinuation,
    getPatternRowOffset,
    getColorRowOffset,
    getAdjustedPatternRow,
    getAdjustedColorRow,
    getContinuationStatusText
};