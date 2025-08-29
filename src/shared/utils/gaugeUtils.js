// src/shared/utils/gaugeUtils.js

/**
 * Gauge-Aware Length Calculation Utilities
 * 
 * Transforms "work until X inches" from guesswork into intelligent, 
 * gauge-aware progress tracking with adaptive learning.
 */

// ===== STEP TYPE DETECTION =====

/**
 * Determine if a step is length-based
 */
export const isLengthBasedStep = (step) => {
    const duration = step.wizardConfig?.duration;
    return duration?.type === 'length' || duration?.type === 'until_length';
};

/**
 * Get length target information from step
 */
export const getLengthTarget = (step) => {
    const duration = step.wizardConfig?.duration;

    if (!isLengthBasedStep(step)) {
        return null;
    }

    return {
        value: parseFloat(duration.value) || 0,
        units: duration.units || 'inches',
        type: duration.type // 'length' or 'until_length'
    };
};

// ===== GAUGE CALCULATIONS =====

/**
 * Get row gauge from project in rows per inch
 */
export const getRowGaugePerInch = (project) => {
    const rowGauge = project?.gauge?.rowGauge;

    if (!rowGauge?.rows) return null;

    const rows = parseFloat(rowGauge.rows);
    const measurement = parseFloat(rowGauge.measurement) || 4;

    return rows / measurement; // rows per inch
};

/**
 * Convert length to estimated rows using project gauge
 */
export const estimateRowsFromLength = (targetLength, targetUnits, project) => {
    const rowGaugePerInch = getRowGaugePerInch(project);

    if (!rowGaugePerInch) return null;

    // Convert target to inches if needed
    const targetInches = targetUnits === 'cm' ? targetLength / 2.54 : targetLength;

    return Math.round(targetInches * rowGaugePerInch);
};

/**
 * Convert current row to estimated length using project gauge  
 */
export const estimateLengthFromRows = (currentRow, estimatedTotalRows, targetLength, targetUnits) => {
    if (!estimatedTotalRows || estimatedTotalRows === 0) return 0;

    const progress = currentRow / estimatedTotalRows;
    return targetLength * progress;
};

/**
 * Calculate progress percentage for length-based steps
 */
export const calculateLengthProgress = (currentRow, estimatedTotalRows, targetLength) => {
    if (!estimatedTotalRows || estimatedTotalRows === 0) return 0;

    return Math.min((currentRow / estimatedTotalRows) * 100, 100);
};

// ===== DISPLAY UTILITIES =====

/**
 * Get gauge-aware display text for length-based steps
 */
export const getLengthProgressDisplay = (step, currentRow, project) => {
    const lengthTarget = getLengthTarget(step);
    if (!lengthTarget) return null;

    const estimatedRows = estimateRowsFromLength(lengthTarget.value, lengthTarget.units, project);

    if (!estimatedRows) {
        // No gauge available - show basic info
        return {
            hasGauge: false,
            targetLength: lengthTarget.value,
            targetUnits: lengthTarget.units,
            currentRow,
            showEstimate: false
        };
    }

    const currentLength = estimateLengthFromRows(currentRow, estimatedRows, lengthTarget.value, lengthTarget.units);
    const progressPercent = calculateLengthProgress(currentRow, estimatedRows, lengthTarget.value);

    return {
        hasGauge: true,
        targetLength: lengthTarget.value,
        targetUnits: lengthTarget.units,
        estimatedRows,
        currentRow,
        currentLength: Math.round(currentLength * 10) / 10, // 1 decimal place
        progressPercent: Math.round(progressPercent),
        showEstimate: true,
        isNearTarget: currentRow >= estimatedRows * 0.9, // 90% threshold
        hasReachedEstimate: currentRow >= estimatedRows,
        shouldShowNearAlert: currentRow >= estimatedRows * 0.9 && currentRow < estimatedRows,
        shouldShowTargetAlert: currentRow >= estimatedRows
    };
};

/**
 * Format length progress for counter display
 */
export const formatLengthCounterDisplay = (progressData, construction) => {
    if (!progressData) return null;

    const rowTerm = construction === 'round' ? 'Round' : 'Row';

    if (!progressData.showEstimate) {
        // No gauge - basic display
        return {
            rowText: `${rowTerm} ${progressData.currentRow}`,
            progressText: `Target: ${progressData.targetLength} ${progressData.targetUnits}`,
            showProgressBar: false
        };
    }

    // With gauge - intelligent display
    const lengthText = `~${progressData.currentLength} ${progressData.targetUnits}`;
    const targetText = `${progressData.targetLength} ${progressData.targetUnits}`;

    return {
        rowText: `${rowTerm} ${progressData.currentRow}`,
        progressText: `${lengthText} of ${targetText} (${progressData.progressPercent}%)`,
        showProgressBar: true,
        progressPercent: progressData.progressPercent,
        isNearTarget: progressData.isNearTarget,
        hasReachedEstimate: progressData.hasReachedEstimate
    };
};

/**
 * Format length progress for modal header
 */
export const formatLengthHeaderDisplay = (step, currentRow, project, construction) => {
    const progressData = getLengthProgressDisplay(step, currentRow, project);
    if (!progressData) return null;

    const rowTerm = construction === 'round' ? 'Round' : 'Row';

    if (!progressData.showEstimate) {
        return `${rowTerm} ${currentRow} • ${progressData.targetLength} ${progressData.targetUnits} target`;
    }

    return `${rowTerm} ${currentRow} • ~${progressData.currentLength}" of ${progressData.targetLength}" target`;
};

// ===== COMPLETION SUGGESTIONS =====

/**
 * Determine if step should show completion suggestion
 */
export const shouldSuggestCompletion = (step, currentRow, project) => {
    const progressData = getLengthProgressDisplay(step, currentRow, project);
    if (!progressData?.showEstimate) return false;

    return progressData.hasReachedEstimate;
};

/**
 * Get completion suggestion text
 */
export const getCompletionSuggestionText = (step, currentRow, project) => {
    const lengthTarget = getLengthTarget(step);
    if (!lengthTarget) return '';

    return `🎯 You've likely reached ${lengthTarget.value} ${lengthTarget.units}. Measure to confirm!`;
};

// ===== ADAPTIVE LEARNING =====

/**
 * Calculate measured gauge from completed length step
 */
export const calculateMeasuredGauge = (actualRows, targetLength, targetUnits) => {
    const targetInches = targetUnits === 'cm' ? targetLength / 2.54 : targetLength;
    return actualRows / targetInches; // rows per inch
};

/**
 * Check if step completion should prompt for gauge update
 */
export const shouldPromptGaugeUpdate = (step, actualRows, project) => {
    const lengthTarget = getLengthTarget(step);
    if (!lengthTarget || !actualRows) return false;

    const measuredGauge = calculateMeasuredGauge(actualRows, lengthTarget.value, lengthTarget.units);
    const currentGauge = getRowGaugePerInch(project);

    // Only prompt if there's a meaningful difference (>5% change)
    if (!currentGauge) return true; // No existing gauge - always prompt

    const percentDifference = Math.abs((measuredGauge - currentGauge) / currentGauge) * 100;
    return percentDifference > 5;
};

/**
 * Get gauge update prompt data for user display
 */
export const getGaugeUpdatePromptData = (actualRows, step, project) => {
    const lengthTarget = getLengthTarget(step);
    if (!lengthTarget) return null;

    const measuredGauge = calculateMeasuredGauge(actualRows, lengthTarget.value, lengthTarget.units);
    const currentGauge = getRowGaugePerInch(project);

    // Convert back to project's measurement format (4" or 10cm)
    const gaugeMeasurement = project?.gauge?.rowGauge?.measurement || 4;
    const newRowsForMeasurement = Math.round(measuredGauge * gaugeMeasurement);

    return {
        measuredGauge: Math.round(measuredGauge * 10) / 10, // 1 decimal
        newRowsForMeasurement,
        measurement: gaugeMeasurement,
        units: project?.defaultUnits === 'cm' ? 'cm' : 'inches',
        hasExistingGauge: !!currentGauge,
        oldRowsForMeasurement: currentGauge ? Math.round(currentGauge * gaugeMeasurement) : null
    };
};

/**
 * Update project gauge with measured data
 */
export const updateProjectGaugeFromMeasurement = (project, gaugeData) => {
    return {
        ...project,
        gauge: {
            ...project.gauge,
            rowGauge: {
                rows: gaugeData.newRowsForMeasurement,
                measurement: gaugeData.measurement
            }
        }
    };
};

// ===== VALIDATION UTILITIES =====

/**
 * Check if project has sufficient gauge data for length calculations
 */
export const hasValidGaugeForLength = (project) => {
    const rowGauge = project?.gauge?.rowGauge;
    return !!(rowGauge?.rows && parseFloat(rowGauge.rows) > 0);
};

/**
 * Get gauge availability message for user
 */
export const getGaugeAvailabilityMessage = (project) => {
    if (hasValidGaugeForLength(project)) {
        const rowGaugePerInch = getRowGaugePerInch(project);
        return {
            hasGauge: true,
            message: `Using gauge: ${project.gauge.rowGauge.rows} rows = ${project.gauge.rowGauge.measurement || 4} inches`
        };
    }

    return {
        hasGauge: false,
        message: 'Add row gauge to your project for intelligent length tracking!'
    };
};

// ===== STEP DESCRIPTION FIXES =====

/**
 * Get corrected duration display for length steps
 * Fixes the issue where "2 inches" shows as "2 rows"
 */
export const getCorrectDurationDisplay = (step, project) => {
    const duration = step.wizardConfig?.duration;
    const construction = step.construction || 'flat';
    const rowTerm = construction === 'round' ? 'rounds' : 'rows';

    if (!duration?.type) {
        return step.totalRows ? `${step.totalRows} ${rowTerm}` : null;
    }

    // Handle length-based steps correctly
    if (duration.type === 'length') {
        const estimatedRows = estimateRowsFromLength(
            parseFloat(duration.value) || 0,
            duration.units || 'inches',
            project
        );

        if (estimatedRows) {
            return `${duration.value} ${duration.units} (~${estimatedRows} ${rowTerm})`;
        }

        return `${duration.value} ${duration.units}`;
    }

    if (duration.type === 'until_length') {
        const referenceText = duration.reference ? ` from ${duration.reference}` : '';
        return `until ${duration.value} ${duration.units}${referenceText}`;
    }

    // Handle other types normally
    switch (duration.type) {
        case 'rows':
        case 'rounds':
            return `${duration.value} ${rowTerm}`;
        case 'repeats':
            return `${duration.value} repeats`;
        case 'stitches':
            return `${duration.value || 'all'} stitches`;
        default:
            return null;
    }
};