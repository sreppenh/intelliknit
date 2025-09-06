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
        const context = getMarkerContext(newArray, markerName);
        if (!context) continue;

        const { segmentBefore, segmentAfter, markerIndex } = context;

        // Apply "before" action
        if (before && before.count > 0) {
            const newSegmentBefore = Math.max(0, segmentBefore - before.count);
            if (markerIndex > 0) {
                newArray[markerIndex - 1] = newSegmentBefore;
            }
        }

        // Apply "after" action  
        if (after && after.count > 0) {
            const newSegmentAfter = Math.max(0, segmentAfter - after.count);
            if (markerIndex < newArray.length - 1) {
                newArray[markerIndex + 1] = newSegmentAfter;
            }
        }
    }

    return newArray;
};

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

    // Check for empty segments
    for (let i = 0; i < stitchArray.length; i++) {
        const item = stitchArray[i];
        if (typeof item === 'number' && item === 0) {
            errors.push(`Zero stitch count at position ${i}`);
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

export default {
    createInitialArray,
    placeMarkers,
    sumArrayStitches,
    getArrayMarkers,
    getMarkerPosition,
    getMarkerContext,
    applyMarkerActions,
    repairArray,
    validateArray,
    formatArrayForDisplay
};