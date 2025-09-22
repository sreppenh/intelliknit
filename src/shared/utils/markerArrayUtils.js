// src/shared/utils/markerArrayUtils.js
import IntelliKnitLogger from './ConsoleLogging';

/**
 * Marker Array Utilities
 * Manages component-level stitch arrays with markers
 * Format: [marker, stitches, marker, stitches, ...] or [stitches, marker, stitches, ...]
 */

// ===== ARRAY CREATION =====

/**
 * Create initial stitch array for component
 */
export const createInitialArray = (totalStitches, construction) => {
    if (construction === 'round') {
        // Round starts with BOR marker
        return ['BOR', totalStitches];
    } else {
        // Flat starts with just stitches
        return [totalStitches];
    }
};

/**
 * Place markers in existing array
 */
export const placeMarkers = (currentArray, markerPlacements, construction) => {
    const totalStitches = sumArrayStitches(currentArray);

    if (construction === 'round') {
        return placeMarkersRound(totalStitches, markerPlacements);
    } else {
        return placeMarkersFlat(totalStitches, markerPlacements);
    }
};

/**
 * Place markers for flat construction
 */
const placeMarkersFlat = (totalStitches, placements) => {
    // placements: [{ name: 'L1', position: 25 }, { name: 'R1', position: 75 }]
    const sorted = [...placements].sort((a, b) => a.position - b.position);
    const result = [];

    let currentPos = 0;

    for (const placement of sorted) {
        const stitchesBeforeMarker = placement.position - currentPos;
        if (stitchesBeforeMarker > 0) {
            result.push(stitchesBeforeMarker);
        }
        result.push(placement.name);
        currentPos = placement.position;
    }

    // Add remaining stitches
    const remaining = totalStitches - currentPos;
    if (remaining > 0) {
        result.push(remaining);
    }

    return result;
};

/**
 * Place markers for round construction  
 */
const placeMarkersRound = (totalStitches, placements) => {
    // Always starts with BOR
    const sorted = [...placements].sort((a, b) => a.position - b.position);
    const result = ['BOR'];

    let currentPos = 0;

    for (const placement of sorted) {
        const stitchesBeforeMarker = placement.position - currentPos;
        if (stitchesBeforeMarker > 0) {
            result.push(stitchesBeforeMarker);
        }
        result.push(placement.name);
        currentPos = placement.position;
    }

    // Add remaining stitches (wraps back to BOR)
    const remaining = totalStitches - currentPos;
    if (remaining > 0) {
        result.push(remaining);
    }

    return result;
};

// ===== ARRAY QUERIES =====

/**
 * Get total stitches in array
 */
export const sumArrayStitches = (stitchArray) => {
    return stitchArray
        .filter(item => typeof item === 'number')
        .reduce((sum, count) => sum + count, 0);
};

/**
 * Get all markers in array
 */
export const getArrayMarkers = (stitchArray) => {
    return stitchArray.filter(item => typeof item === 'string');
};

/**
 * Get marker position (absolute stitch number)
 */
export const getMarkerPosition = (stitchArray, markerName) => {
    let position = 0;

    for (let i = 0; i < stitchArray.length; i++) {
        const item = stitchArray[i];

        if (typeof item === 'string' && item === markerName) {
            return position;
        }

        if (typeof item === 'number') {
            position += item;
        }
    }

    return -1; // Marker not found
};

/**
 * Get stitches in segment before/after marker
 */
export const getMarkerContext = (stitchArray, markerName) => {
    const markerIndex = stitchArray.indexOf(markerName);
    if (markerIndex === -1) return null;

    const segmentBefore = markerIndex > 0 ? stitchArray[markerIndex - 1] : null;
    const segmentAfter = markerIndex < stitchArray.length - 1 ? stitchArray[markerIndex + 1] : null;

    return {
        segmentBefore: typeof segmentBefore === 'number' ? segmentBefore : 0,
        segmentAfter: typeof segmentAfter === 'number' ? segmentAfter : 0,
        markerIndex
    };
};

// ===== ARRAY UPDATES =====

/**
 * Apply marker actions to array
 */
export const applyMarkerActions = (stitchArray, markerActions) => {
    let newArray = [...stitchArray];

    for (const action of markerActions) {
        newArray = applySingleMarkerAction(newArray, action);
    }

    return newArray;
};

/**
 * Apply single marker action
 */
const applySingleMarkerAction = (stitchArray, action) => {
    const { markers, before, after } = action;
    let newArray = [...stitchArray];

    for (const markerName of markers) {
        // Handle edge positions for flat construction
        if (markerName === 'beginning') {
            // Modify first segment
            if (before && before.count !== 0 && newArray.length > 0) {
                const firstSegmentIndex = typeof newArray[0] === 'number' ? 0 : 1;
                if (firstSegmentIndex < newArray.length && typeof newArray[firstSegmentIndex] === 'number') {
                    newArray[firstSegmentIndex] = Math.max(0, newArray[firstSegmentIndex] + before.count);
                }
            }
            continue;
        }

        if (markerName === 'end') {
            // Modify last segment
            if (after && after.count !== 0) {
                const lastSegmentIndex = getLastStitchSegmentIndex(newArray);
                if (lastSegmentIndex >= 0) {
                    newArray[lastSegmentIndex] = Math.max(0, newArray[lastSegmentIndex] + after.count);
                }
            }
            continue;
        }

        // Handle BOR special case for round construction
        if (markerName === 'BOR') {
            // For BOR, "before" means the last segment (wrap around)
            if (before && before.count !== 0) {
                const lastSegmentIndex = getLastStitchSegmentIndex(newArray);
                if (lastSegmentIndex >= 0) {
                    newArray[lastSegmentIndex] = Math.max(0, newArray[lastSegmentIndex] + before.count);
                }
            }
            // For BOR, "after" means the first segment after BOR
            if (after && after.count !== 0) {
                const firstSegmentIndex = 1; // Should be the segment right after BOR
                if (firstSegmentIndex < newArray.length && typeof newArray[firstSegmentIndex] === 'number') {
                    newArray[firstSegmentIndex] = Math.max(0, newArray[firstSegmentIndex] + after.count);
                }
            }
            continue;
        }

        // Handle actual markers (existing logic)
        const context = getMarkerContext(newArray, markerName);
        if (!context) continue;

        const { segmentBefore, segmentAfter, markerIndex } = context;

        // Apply "before" action
        if (before && before.count !== 0) {
            const newSegmentBefore = Math.max(0, segmentBefore + before.count);
            if (markerIndex > 0) {
                newArray[markerIndex - 1] = newSegmentBefore;
            }
        }

        // Apply "after" action  
        if (after && after.count !== 0) {
            const newSegmentAfter = Math.max(0, segmentAfter + after.count);
            if (markerIndex < newArray.length - 1) {
                newArray[markerIndex + 1] = newSegmentAfter;
            }
        }
    }

    return newArray;
};

/**
 * Find index of last stitch segment in array
 */
const getLastStitchSegmentIndex = (array) => {
    for (let i = array.length - 1; i >= 0; i--) {
        if (typeof array[i] === 'number') {
            return i;
        }
    }
    return -1;
};

// ===== NEW: VALIDATION SYSTEM =====

/**
 * Calculate how many times actions can be safely performed
 * @param {Array} actions - Array of action objects
 * @param {Array} startingArray - Starting marker array state (before any phases)
 * @param {Array} completedPhases - Phases already completed
 * @returns {number} Maximum safe iterations
 */
export const getMaxSafeIterations = (actions, startingArray, completedPhases = []) => {
    if (!actions || !startingArray || actions.length === 0) {
        return 1; // Default minimum
    }

    // First, calculate current array state after all completed phases
    let currentArray = [...startingArray];

    // Apply each completed phase
    for (const phase of completedPhases) {
        for (let i = 0; i < phase.times; i++) {
            currentArray = simulateOneIteration(actions, currentArray);
        }
    }

    // Now test how many more iterations we can do from this current state
    let iterations = 0;
    let testArray = [...currentArray];

    // Keep testing until we can't perform the actions safely
    while (canPerformActions(actions, testArray)) {
        testArray = simulateOneIteration(actions, testArray);
        iterations++;

        // Safety break for infinite loops or absurd numbers
        if (iterations > 1000) {
            IntelliKnitLogger.warn('Max iterations safety break hit', { actions, startingArray });
            break;
        }
    }

    return Math.max(1, iterations); // Always allow at least 1
};

/**
 * Calculate stitch change per iteration (for display purposes)
 * @param {Array} actions - Actions to analyze
 * @returns {number} Net stitch change per iteration
 */
export const calculateStitchChangePerIteration = (actions) => {
    let totalChange = 0;

    for (const action of actions) {
        if (action.actionType === 'continue') continue;

        const stitchChange = getStitchChangeForTechnique(action.technique);

        if (action.position === 'both_ends') {
            // Both ends means the technique applies twice
            totalChange += stitchChange * 2;
        } else if (action.position === 'before_and_after') {
            // before_and_after with split technique like 'SSK_K2tog'
            if (action.technique.includes('_')) {
                const techniques = action.technique.split('_');
                totalChange += techniques.reduce((sum, tech) => sum + getStitchChangeForTechnique(tech), 0) * action.targets.length;
            } else {
                totalChange += stitchChange * 2 * action.targets.length; // Both before and after for each target
            }
        } else {
            // Single position action
            totalChange += stitchChange * (action.targets?.length || 1);
        }
    }

    return totalChange;
};

// ===== VALIDATION HELPER FUNCTIONS =====

/**
 * Check if actions can be performed on current array state
 */
const canPerformActions = (actions, testArray) => {
    const segmentAnalysis = calculateSegmentAnalysis(actions, testArray);

    // Check each segment
    for (const [segmentIndex, analysis] of segmentAnalysis.entries()) {
        const segmentStitches = testArray[segmentIndex];

        // Segment must have enough stitches for total consumption
        if (segmentStitches < analysis.totalConsumption) {
            return false;
        }

        // If net change is negative, check if segment will eventually hit minimum viable size  
        if (analysis.netChange < 0) {
            // Minimum viable size = totalConsumption (need enough for the actions)
            const iterationsUntilMinimum = Math.floor((segmentStitches - analysis.totalConsumption) / Math.abs(analysis.netChange));
            if (iterationsUntilMinimum <= 0) {
                return false;
            }
        }
        // If net change >= 0, segment is sustainable indefinitely (as long as it passes consumption check)
    }

    return true;
};

/**
 * Calculate consumption and net change per segment
 */
const calculateSegmentAnalysis = (actions, testArray) => {
    const analysis = new Map();

    for (const action of actions) {
        if (action.actionType === 'continue') continue;

        const actionConsumption = calculateActionConsumption(action);
        const actionNetChange = calculateActionNetChange(action);
        const affectedSegments = findAffectedSegments(action, testArray);

        for (const segmentIndex of affectedSegments) {
            const current = analysis.get(segmentIndex) || { totalConsumption: 0, netChange: 0 };
            analysis.set(segmentIndex, {
                totalConsumption: current.totalConsumption + actionConsumption,
                netChange: current.netChange + actionNetChange
            });
        }
    }

    return analysis;
};

/**
 * Calculate stitch consumption for a single action
 */
const calculateActionConsumption = (action) => {
    const distance = parseInt(action.distance) || 0;
    const techniqueConsumption = getTechniqueConsumption(action.technique);
    return distance + techniqueConsumption;
};

/**
 * Calculate net stitch change for a single action
 */
const calculateActionNetChange = (action) => {
    return getStitchChangeForTechnique(action.technique);
};

/**
 * Get stitch consumption for a technique
 */
const getTechniqueConsumption = (technique) => {
    // Handle combined techniques for before_and_after or both_ends
    if (technique.includes('_')) {
        const techniques = technique.split('_');
        return techniques.reduce((sum, tech) => sum + getSingleTechniqueConsumption(tech), 0);
    }

    return getSingleTechniqueConsumption(technique);
};

/**
 * Get consumption for a single technique
 */
const getSingleTechniqueConsumption = (technique) => {
    const consumptionMap = {
        'K': 1, 'K1': 1, 'P': 1, 'P1': 1,
        'SSK': 2, 'K2tog': 2, 'K3tog': 3, 'CDD': 3,
        'YO': 0, 'M1L': 0, 'M1R': 0, 'KFB': 1
    };
    return consumptionMap[technique] || 1;
};

/**
 * Find which segments are affected by an action
 */
const findAffectedSegments = (action, testArray) => {
    const affectedSegments = [];

    if (action.position === 'both_ends') {
        // Affects first and last segments
        const firstSegmentIndex = findFirstStitchSegmentIndex(testArray);
        const lastSegmentIndex = findLastStitchSegmentIndex(testArray);

        if (firstSegmentIndex >= 0) affectedSegments.push(firstSegmentIndex);
        if (lastSegmentIndex >= 0 && lastSegmentIndex !== firstSegmentIndex) {
            affectedSegments.push(lastSegmentIndex);
        }
    } else {
        // Handle individual targets
        for (const target of action.targets || []) {
            const segmentIndex = getSegmentIndexForTarget(target, action.position, testArray);
            if (segmentIndex >= 0 && !affectedSegments.includes(segmentIndex)) {
                affectedSegments.push(segmentIndex);
            }
        }
    }

    return affectedSegments;
};

/**
 * Get segment index for a specific target and position
 */
const getSegmentIndexForTarget = (target, position, testArray) => {
    if (target === 'beginning') {
        return findFirstStitchSegmentIndex(testArray);
    }

    if (target === 'end') {
        return findLastStitchSegmentIndex(testArray);
    }

    // Find marker in array
    const markerIndex = testArray.indexOf(target);
    if (markerIndex === -1) return -1;

    if (position === 'before') {
        // Before marker = segment to the left
        return markerIndex > 0 && typeof testArray[markerIndex - 1] === 'number' ? markerIndex - 1 : -1;
    } else if (position === 'after') {
        // After marker = segment to the right
        return markerIndex < testArray.length - 1 && typeof testArray[markerIndex + 1] === 'number' ? markerIndex + 1 : -1;
    } else if (position === 'before_and_after') {
        // This will be called twice, once for before and once for after
        // Return the appropriate segment based on the call
        return markerIndex > 0 && typeof testArray[markerIndex - 1] === 'number' ? markerIndex - 1 :
            (markerIndex < testArray.length - 1 && typeof testArray[markerIndex + 1] === 'number' ? markerIndex + 1 : -1);
    }

    return -1;
};

/**
 * Find first stitch segment index
 */
const findFirstStitchSegmentIndex = (array) => {
    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] === 'number') return i;
    }
    return -1;
};

/**
 * Find last stitch segment index
 */
const findLastStitchSegmentIndex = (array) => {
    for (let i = array.length - 1; i >= 0; i--) {
        if (typeof array[i] === 'number') return i;
    }
    return -1;
};

/**
 * Simulate one iteration of actions on array
 */
const simulateOneIteration = (actions, testArray) => {
    const segmentAnalysis = calculateSegmentAnalysis(actions, testArray);
    const newArray = [...testArray];

    // Apply net changes to each affected segment
    for (const [segmentIndex, analysis] of segmentAnalysis.entries()) {
        if (segmentIndex >= 0 && segmentIndex < newArray.length) {
            newArray[segmentIndex] = Math.max(0, newArray[segmentIndex] + analysis.netChange);
        }
    }

    return newArray;
};

/**
 * Get stitch change for a technique (positive = increase, negative = decrease)
 */
const getStitchChangeForTechnique = (technique) => {
    const changeMap = {
        'YO': +1, 'M1L': +1, 'M1R': +1, 'KFB': +1,
        'SSK': -1, 'K2tog': -1, 'K3tog': -2, 'CDD': -2
    };
    return changeMap[technique] || 0;
};

// ===== ARRAY REPAIR =====

/**
 * Repair array when stitch count doesn't match expected
 */
export const repairArray = (stitchArray, actualStitches) => {
    const arrayStitches = sumArrayStitches(stitchArray);
    const difference = actualStitches - arrayStitches;

    if (difference === 0) return stitchArray;

    // Redistribute difference proportionally across segments
    const newArray = [...stitchArray];
    const segments = [];

    // Find all numeric segments
    for (let i = 0; i < newArray.length; i++) {
        if (typeof newArray[i] === 'number') {
            segments.push({ index: i, value: newArray[i] });
        }
    }

    if (segments.length === 0) return newArray;

    // Distribute difference proportionally
    const totalSegmentStitches = segments.reduce((sum, seg) => sum + seg.value, 0);

    for (const segment of segments) {
        const proportion = segment.value / totalSegmentStitches;
        const adjustment = Math.round(difference * proportion);
        newArray[segment.index] = Math.max(0, segment.value + adjustment);
    }

    // Log the repair for debugging
    IntelliKnitLogger.warn('Array repaired', {
        before: stitchArray,
        after: newArray,
        difference,
        actualStitches
    });

    return newArray;
};

// ===== ARRAY VALIDATION =====

/**
 * Validate array structure
 */
export const validateArray = (stitchArray) => {
    const errors = [];

    if (!Array.isArray(stitchArray)) {
        errors.push('Array must be an array');
        return errors;
    }

    if (stitchArray.length === 0) {
        errors.push('Array cannot be empty');
        return errors;
    }

    // Check for negative stitch counts
    for (let i = 0; i < stitchArray.length; i++) {
        const item = stitchArray[i];
        if (typeof item === 'number' && item < 0) {
            errors.push(`Negative stitch count at position ${i}: ${item}`);
        }
    }

    return errors;
};

// ===== DISPLAY HELPERS =====

/**
 * Format array for human display
 */
export const formatArrayForDisplay = (stitchArray, construction = 'flat') => {
    if (!stitchArray || stitchArray.length === 0) {
        return construction === 'round' ? 'BOR [?] ↻' : '[?]';
    }

    const parts = [];

    for (const item of stitchArray) {
        if (typeof item === 'string') {
            parts.push(item);
        } else {
            parts.push(`[${item}]`);
        }
    }

    if (construction === 'round') {
        return parts.join(' ') + ' ↻';
    } else {
        return parts.join(' ');
    }
};

// ===== ARRAY EVOLUTION =====

/**
 * Calculate array evolution through phases
 * Shows how the marker array changes as phases are applied
 */
export const calculateArrayEvolution = (instructionData, startingArray, completedPhases) => {
    if (!instructionData?.actions || !startingArray || !Array.isArray(completedPhases)) {
        return {
            starting: startingArray || [],
            phases: [],
            current: startingArray || [],
            error: 'Invalid parameters'
        };
    }

    const evolution = {
        starting: [...startingArray],
        phases: [],
        current: [...startingArray],
        error: null
    };

    let currentArray = [...startingArray];

    // Apply each completed phase
    for (let i = 0; i < completedPhases.length; i++) {
        const phase = completedPhases[i];

        // Apply the instruction actions the specified number of times
        for (let iteration = 0; iteration < phase.times; iteration++) {
            // Convert instructionData actions to markerActions format
            const markerActions = convertInstructionToMarkerActions(instructionData.actions, currentArray);

            // Apply the actions
            currentArray = applyMarkerActions(currentArray, markerActions);
        }

        // Store the array state after this phase
        evolution.phases.push({
            phaseIndex: i,
            phaseId: phase.id,
            arrayState: [...currentArray],
            totalStitches: sumArrayStitches(currentArray)
        });
    }

    evolution.current = currentArray;
    return evolution;
};

/**
 * Convert instructionData actions to markerActions format
 * This bridges the gap between instruction format and array manipulation format
 */
const convertInstructionToMarkerActions = (actions, currentArray) => {
    const markerActions = [];

    for (const action of actions) {
        if (action.actionType === 'continue') continue;

        // Handle edge targets directly (beginning/end as explicit targets)
        if (action.targets && (action.targets.includes('beginning') || action.targets.includes('end'))) {
            for (const target of action.targets) {
                const stitchChange = getStitchChangeForTechnique(action.technique);
                if (target === 'beginning') {
                    markerActions.push({
                        markers: ['beginning'],
                        before: { count: stitchChange }
                    });
                } else if (target === 'end') {
                    markerActions.push({
                        markers: ['end'],
                        after: { count: stitchChange }
                    });
                }
            }
            continue;
        }

        if (action.position === 'both_ends') {
            // For both_ends, use 'beginning' and 'end' as special markers
            const techniques = action.technique.split('_');

            markerActions.push({
                markers: ['beginning'],
                before: { count: getStitchChangeForTechnique(techniques[0]) }
            });

            if (techniques.length > 1) {
                markerActions.push({
                    markers: ['end'],
                    after: { count: getStitchChangeForTechnique(techniques[1]) }
                });
            }
        } else if (action.position === 'before_and_after') {
            // Handle before_and_after for each target marker
            const techniques = action.technique.split('_');

            for (const target of action.targets) {
                markerActions.push({
                    markers: [target],
                    before: { count: getStitchChangeForTechnique(techniques[0]) },
                    after: { count: getStitchChangeForTechnique(techniques[1]) }
                });
            }
        } else {
            // Handle single position actions (before, after)
            const stitchChange = getStitchChangeForTechnique(action.technique);

            for (const target of action.targets) {
                if (action.position === 'before') {
                    markerActions.push({
                        markers: [target],
                        before: { count: stitchChange }
                    });
                } else if (action.position === 'after') {
                    markerActions.push({
                        markers: [target],
                        after: { count: stitchChange }
                    });
                }
            }
        }
    }

    return markerActions;
};

export default {
    createInitialArray,
    placeMarkers,
    sumArrayStitches,
    getArrayMarkers,
    getMarkerPosition,
    getMarkerContext,
    applyMarkerActions,
    calculateArrayEvolution,
    repairArray,
    validateArray,
    formatArrayForDisplay,
    convertInstructionToMarkerActions,
    // NEW: Validation functions
    getMaxSafeIterations,
    calculateStitchChangePerIteration
};