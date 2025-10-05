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
 * @returns {Object} - { repeats, isExact, actualEnding }
 */
export const calculateRepeatsToTarget = (startingStitches, targetStitches, stitchChangePerRepeat) => {
    if (stitchChangePerRepeat === 0) {
        return { repeats: 0, isExact: false, actualEnding: startingStitches };
    }

    const stitchDifference = targetStitches - startingStitches;
    const repeats = Math.abs(Math.floor(stitchDifference / stitchChangePerRepeat));
    const actualEnding = startingStitches + (repeats * stitchChangePerRepeat);
    const isExact = actualEnding === targetStitches;

    return {
        repeats,
        isExact,
        actualEnding
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

    // Check if difference is divisible by change per repeat
    return stitchDifference % stitchChangePerRepeat === 0;
};

/**
 * Calculate stitch change per repeat for a pattern
 * @param {Array} rows - Array of row objects with stitchChange property
 * @returns {number} - Total stitch change per complete repeat
 */
export const calculateStitchChangePerRepeat = (rows) => {
    if (!rows || rows.length === 0) return 0;

    return rows.reduce((sum, row) => sum + (row.stitchChange || 0), 0);
};

/**
 * Get pattern repeat info from wizardData
 * @param {Object} stitchPattern - The stitchPattern from wizardData
 * @returns {Object} - { hasRepeat, rowsInPattern, stitchChangePerRepeat }
 */
export const getPatternRepeatInfo = (stitchPattern) => {
    if (!stitchPattern) {
        return { hasRepeat: false, rowsInPattern: 0, stitchChangePerRepeat: 0 };
    }

    const rowsInPattern = parseInt(stitchPattern.rowsInPattern) || 0;
    let stitchChangePerRepeat = 0;

    // Custom pattern uses customSequence.rows
    if (stitchPattern.pattern === 'Custom' && stitchPattern.customSequence?.rows) {
        stitchChangePerRepeat = calculateStitchChangePerRepeat(stitchPattern.customSequence.rows);
    }
    // Row-by-row patterns use rowInstructions (Lace, Cable, etc.)
    else if (stitchPattern.rowInstructions?.length > 0) {
        // For row-by-row, we need to calculate from the actual row instructions
        // This would require the stitch calculator, so for now we'll use the stored value
        stitchChangePerRepeat = parseInt(stitchPattern.stitchChangePerRepeat) || 0;
    }
    // Description mode patterns have stitchChangePerRepeat stored
    else if (stitchPattern.stitchChangePerRepeat !== undefined) {
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
    // Calculate which row within a repeat we hit the target
    const totalStitchChange = targetStitches - startingStitches;
    const fullRepeats = Math.floor(totalStitchChange / stitchChangePerRepeat);
    const remainingStitchChange = totalStitchChange - (fullRepeats * stitchChangePerRepeat);

    let reachedOnRow = null;
    if (remainingStitchChange !== 0) {
        // Target is reached mid-repeat
        // This is simplified - actual calculation would need row-by-row analysis
        reachedOnRow = fullRepeats * rowsPerRepeat + 1; // Approximate
    }

    if (completeSequence || remainingStitchChange === 0) {
        // Complete all repeats
        const actualRepeats = Math.ceil(totalStitchChange / stitchChangePerRepeat);
        const totalRows = actualRepeats * rowsPerRepeat;
        const endingStitches = startingStitches + (actualRepeats * stitchChangePerRepeat);

        return {
            totalRows,
            actualRepeats,
            endingStitches,
            reachedOnRow: reachedOnRow || totalRows
        };
    } else {
        // Stop at target (incomplete repeat)
        const totalRows = reachedOnRow || (repeatsNeeded * rowsPerRepeat);

        return {
            totalRows,
            actualRepeats: repeatsNeeded,
            endingStitches: targetStitches,
            reachedOnRow: totalRows
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