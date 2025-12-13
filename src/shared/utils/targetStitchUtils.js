// src/shared/utils/targetStitchUtils.js
/**
 * Target Stitch Utilities
 * Handles validation and calculation for target-based pattern repeats
 */

/**
 * Calculate valid target stitch counts for a pattern with net stitch change
 * @param {number} startingStitches - Current stitch count
 * @param {number} stitchChangePerRepeat - Net stitch change per pattern repeat
 * @param {number} maxRepeats - Maximum repeats to calculate (default 100)
 * @returns {Array<number>} - Array of valid target stitch counts
 */
export const getValidTargetStitches = (startingStitches, stitchChangePerRepeat, maxRepeats = 100) => {
    if (!startingStitches || !stitchChangePerRepeat || stitchChangePerRepeat === 0) {
        return [];
    }

    const validTargets = [];
    let currentStitches = startingStitches;

    // Generate valid targets based on direction
    if (stitchChangePerRepeat > 0) {
        // Increasing pattern (lace shawl growth)
        for (let i = 1; i <= maxRepeats; i++) {
            currentStitches += stitchChangePerRepeat;
            validTargets.push(currentStitches);
        }
    } else {
        // Decreasing pattern (sleeve taper, etc.)
        for (let i = 1; i <= maxRepeats; i++) {
            currentStitches += stitchChangePerRepeat; // Adding negative number
            if (currentStitches <= 0) break; // Stop if we hit zero or below
            validTargets.push(currentStitches);
        }
    }

    return validTargets;
};

/**
 * Calculate how many repeats needed to reach target
 * @param {number} startingStitches - Starting stitch count
 * @param {number} targetStitches - Desired ending stitch count
 * @param {number} stitchChangePerRepeat - Net stitch change per repeat
 * @returns {Object} - { repeats, isExact, actualEnding, isValid }
 */
export const calculateRepeatsToTarget = (startingStitches, targetStitches, stitchChangePerRepeat) => {
    if (stitchChangePerRepeat === 0) {
        return { repeats: 0, isExact: false, actualEnding: startingStitches, isValid: false };
    }

    const stitchDifference = targetStitches - startingStitches;

    // ✅ FIX: Validate that the direction makes sense
    // If increasing (positive change), target must be higher than starting
    // If decreasing (negative change), target must be lower than starting
    if ((stitchChangePerRepeat > 0 && stitchDifference <= 0) ||
        (stitchChangePerRepeat < 0 && stitchDifference >= 0)) {
        return {
            repeats: 0,
            isExact: false,
            actualEnding: startingStitches,
            isValid: false,
            error: stitchChangePerRepeat > 0
                ? 'Target must be higher than starting stitches for increasing patterns'
                : 'Target must be lower than starting stitches for decreasing patterns'
        };
    }

    const repeats = Math.abs(Math.floor(stitchDifference / stitchChangePerRepeat));
    const actualEnding = startingStitches + (repeats * stitchChangePerRepeat);
    const isExact = actualEnding === targetStitches;

    return {
        repeats,
        isExact,
        actualEnding,
        isValid: true
    };
};

/**
 * Check if target is valid (achievable with whole repeats)
 * @param {number} startingStitches - Starting stitch count
 * @param {number} targetStitches - Desired target
 * @param {number} stitchChangePerRepeat - Net change per repeat
 * @returns {boolean}
 */
export const isValidTarget = (startingStitches, targetStitches, stitchChangePerRepeat) => {
    if (stitchChangePerRepeat === 0) return false;

    const stitchDifference = targetStitches - startingStitches;

    // ✅ FIX: Check direction validity first
    if ((stitchChangePerRepeat > 0 && stitchDifference <= 0) ||
        (stitchChangePerRepeat < 0 && stitchDifference >= 0)) {
        return false;
    }

    // Check if difference is divisible by change per repeat
    return stitchDifference % stitchChangePerRepeat === 0;
};

/**
 * Calculate stitch change per repeat for a pattern
 * @param {Array} rows - Array of row objects with stitchChange or stitchesRemaining property
 * @param {number} startingStitches - Starting stitch count (needed if rows use stitchesRemaining)
 * @returns {number} - Total stitch change per complete repeat
 */
export const calculateStitchChangePerRepeat = (rows, startingStitches = 0) => {
    if (!rows || rows.length === 0) return 0;

    // If rows use stitchChange property, sum them up
    const hasStitchChange = rows.some(row => row.stitchChange !== null && row.stitchChange !== undefined);
    if (hasStitchChange) {
        return rows.reduce((sum, row) => sum + (row.stitchChange || 0), 0);
    }

    // If rows use stitchesRemaining property, calculate the net change
    const hasStitchesRemaining = rows.some(row => row.stitchesRemaining !== null && row.stitchesRemaining !== undefined);
    if (hasStitchesRemaining) {
        let runningStitches = startingStitches;
        for (const row of rows) {
            if (row.stitchesRemaining !== null && row.stitchesRemaining !== undefined) {
                runningStitches = row.stitchesRemaining;
            }
        }
        // Net change is the difference between where we started and where we ended
        return runningStitches - startingStitches;
    }

    return 0;
};

/**
 * Get pattern repeat info from wizardData
 * @param {Object} stitchPattern - The stitchPattern from wizardData
 * @param {number} startingStitches - Starting stitch count (optional, needed for stitchesRemaining mode)
 * @returns {Object} - { hasRepeat, rowsInPattern, stitchChangePerRepeat }
 */
export const getPatternRepeatInfo = (stitchPattern, startingStitches = 0) => {
    if (!stitchPattern) {
        return { hasRepeat: false, rowsInPattern: 0, stitchChangePerRepeat: 0 };
    }

    const rowsInPattern = parseInt(stitchPattern.rowsInPattern) || 0;
    let stitchChangePerRepeat = 0;

    // Custom pattern (Simple Row) uses customSequence.rows (array)
    if (stitchPattern.pattern === 'Custom' && stitchPattern.customSequence?.rows) {
        stitchChangePerRepeat = calculateStitchChangePerRepeat(stitchPattern.customSequence.rows, startingStitches);
    }
    // Two-Color Brioche uses customSequence.rows (object)
    else if (stitchPattern.pattern === 'Two-Color Brioche' && stitchPattern.customSequence?.rows) {
        const rows = stitchPattern.customSequence.rows;
        const rowValues = Object.values(rows);
        stitchChangePerRepeat = rowValues.reduce((sum, row) => sum + (row.stitchChange || 0), 0);
    }
    // Custom pattern (Description) and other patterns with stored stitchChangePerRepeat
    else if (stitchPattern.stitchChangePerRepeat !== undefined) {
        stitchChangePerRepeat = parseInt(stitchPattern.stitchChangePerRepeat) || 0;
    }
    // Row-by-row patterns use rowInstructions (Lace, Cable, etc.)
    else if (stitchPattern.rowInstructions?.length > 0) {
        stitchChangePerRepeat = parseInt(stitchPattern.stitchChangePerRepeat) || 0;
    }

    const hasRepeat = rowsInPattern > 0 && stitchChangePerRepeat !== 0;

    return {
        hasRepeat,
        rowsInPattern,
        stitchChangePerRepeat
    };
};

/**
 * Calculate total rows needed to reach target
 * @param {number} repeatsNeeded - Number of repeats needed
 * @param {number} rowsPerRepeat - Rows in one pattern repeat
 * @param {boolean} completeSequence - Whether to complete final repeat
 * @param {number} targetStitches - Target stitch count
 * @param {number} startingStitches - Starting stitch count
 * @param {number} stitchChangePerRepeat - Change per repeat
 * @returns {Object} - { totalRows, actualRepeats, endingStitches, reachedOnRow }
 */
export const calculateTargetRows = (
    repeatsNeeded,
    rowsPerRepeat,
    completeSequence,
    targetStitches,
    startingStitches,
    stitchChangePerRepeat
) => {
    // ✅ FIX: Validate inputs to prevent negative rows
    if (repeatsNeeded < 0 || rowsPerRepeat <= 0) {
        return {
            totalRows: 0,
            actualRepeats: 0,
            endingStitches: startingStitches,
            reachedOnRow: 0,
            isValid: false,
            error: 'Invalid calculation parameters'
        };
    }

    const totalStitchChange = targetStitches - startingStitches;

    // ✅ FIX: Validate direction
    if ((stitchChangePerRepeat > 0 && totalStitchChange <= 0) ||
        (stitchChangePerRepeat < 0 && totalStitchChange >= 0)) {
        return {
            totalRows: 0,
            actualRepeats: 0,
            endingStitches: startingStitches,
            reachedOnRow: 0,
            isValid: false,
            error: 'Target stitch count is in wrong direction for this pattern'
        };
    }

    const fullRepeats = Math.floor(Math.abs(totalStitchChange) / Math.abs(stitchChangePerRepeat));
    const remainingStitchChange = totalStitchChange - (fullRepeats * stitchChangePerRepeat);

    let reachedOnRow = null;
    if (remainingStitchChange !== 0) {
        // Target is reached mid-repeat
        // This is simplified - actual calculation would need row-by-row analysis
        reachedOnRow = fullRepeats * rowsPerRepeat + 1; // Approximate
    }

    if (completeSequence || remainingStitchChange === 0) {
        // Complete all repeats
        const actualRepeats = Math.ceil(Math.abs(totalStitchChange) / Math.abs(stitchChangePerRepeat));
        const totalRows = Math.max(0, actualRepeats * rowsPerRepeat); // ✅ Ensure non-negative
        const endingStitches = startingStitches + (actualRepeats * stitchChangePerRepeat);

        return {
            totalRows,
            actualRepeats,
            endingStitches,
            reachedOnRow: reachedOnRow || totalRows,
            isValid: true
        };
    } else {
        // Stop at target (incomplete repeat)
        const totalRows = Math.max(0, reachedOnRow || (repeatsNeeded * rowsPerRepeat)); // ✅ Ensure non-negative

        return {
            totalRows,
            actualRepeats: repeatsNeeded,
            endingStitches: targetStitches,
            reachedOnRow: totalRows,
            isValid: true
        };
    }
};

export default {
    getValidTargetStitches,
    calculateRepeatsToTarget,
    isValidTarget,
    calculateStitchChangePerRepeat,
    getPatternRepeatInfo,
    calculateTargetRows
};