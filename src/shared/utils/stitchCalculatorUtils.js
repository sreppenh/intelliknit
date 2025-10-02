// src/shared/utils/stitchCalculatorUtils.js
/**
 * Smart Stitch Calculator for Pattern Rows
 * Calculates stitch counts and running totals for lace patterns
 */

// ===== STITCH OPERATION VALUES =====
const STITCH_VALUES = {
    // Basic stitches (consume and produce 1)
    'K': { consumes: 1, produces: 1 },
    'P': { consumes: 1, produces: 1 },
    'K1': { consumes: 1, produces: 1 },
    'P1': { consumes: 1, produces: 1 },

    // Decreases (consume more than they produce)
    'K2tog': { consumes: 2, produces: 1 },
    'SSK': { consumes: 2, produces: 1 },
    'K3tog': { consumes: 3, produces: 1 },
    'SSSK': { consumes: 2, produces: 1 },
    'CDD': { consumes: 3, produces: 1 }, // Central Double Decrease
    'S2KP': { consumes: 3, produces: 1 }, // Slip 2, K1, Pass over
    'SK2P': { consumes: 3, produces: 1 },
    'P2tog': { consumes: 2, produces: 1 },
    'SSP': { consumes: 2, produces: 1 },
    'K2tog tbl': { consumes: 2, produces: 1 },
    'SSK tbl': { consumes: 2, produces: 1 },

    // Increases (produce more than they consume)
    'YO': { consumes: 0, produces: 1 }, // Yarn Over
    'M1': { consumes: 0, produces: 1 }, // Make 1
    'M1L': { consumes: 0, produces: 1 },
    'M1R': { consumes: 0, produces: 1 },
    'KFB': { consumes: 1, produces: 2 }, // Knit Front and Back

    // Brioche
    'brk1': { consumes: 2, produced: 1 },
    'brp1': { consumes: 2, produced: 1 },
    'sl1yo': { consumes: 1, produced: 2 },

    // Special operations
    'Sl1': { consumes: 1, produces: 1 }, // Slip stitch
    'Sl1 wyif': { consumes: 1, produces: 1 }, // Slip stitch
    'BO': { consumes: 1, produces: 0 }, // Bind off (for partial bind-offs)

    // Cable operations (neutral)
    'C4F': { consumes: 4, produces: 4 },
    'C4B': { consumes: 4, produces: 4 },
    'C6F': { consumes: 6, produces: 6 },
    'C6B': { consumes: 6, produces: 6 },
    'T2F': { consumes: 2, produces: 2 },
    'T2B': { consumes: 2, produces: 2 },
    'T4F': { consumes: 4, produces: 4 },
    'T4B': { consumes: 4, produces: 4 },
    'RT': { consumes: 2, produces: 2 },
    'LT': { consumes: 2, produces: 2 },
    '1/1 LC': { consumes: 2, produces: 2 },
    '2/2 LC': { consumes: 4, produces: 4 },
    '3/3 LC': { consumes: 6, produces: 6 },
    '1/1 RC': { consumes: 2, produces: 2 },
    '2/2 RC': { consumes: 4, produces: 4 },
    '3/3 RC': { consumes: 6, produces: 6 },
    '4/4 LC': { consumes: 8, produces: 8 },
    '4/4 RC': { consumes: 8, produces: 8 },
    '1/2 LC': { consumes: 3, produces: 3 },
    '2/1 LPC': { consumes: 3, produces: 3 },
    '2/1 RPC': { consumes: 3, produces: 3 },
    '1/2 RC': { consumes: 3, produces: 3 },
    '6/6 LC': { consumes: 12, produces: 12 },
    '6/6 RC': { consumes: 12, produces: 12 },
    '8/8 LC': { consumes: 16, produces: 16 },
    '8/8 RC': { consumes: 16, produces: 16 },
    '1/1 LPC': { consumes: 2, produces: 2 },
    '2/2 LPC': { consumes: 4, produces: 4 },
    '2/2 RPC': { consumes: 4, produces: 4 },
    '1/1 RPC': { consumes: 2, produces: 2 },
};

const hasWorkToEndAction = (instruction) => {
    return /k\s+to\s+end/gi.test(instruction) ||
        /p\s+to\s+end/gi.test(instruction) ||
        /k\/p\s+as\s+set/gi.test(instruction);
};

/**
 * Parse a row instruction and calculate total stitches worked
 * @param {string} instruction - Row instruction (e.g., "[(K2tog)2, P]3")
 * @param {number} startingStitches - Stitches available at start of row
 * @returns {Object} - { totalStitches, stitchChange, breakdown, isValid }
 */
export const calculateRowStitches = (instruction, startingStitches = 0, customActionsData = {}) => {

    if (!instruction || !instruction.trim()) {
        // ... rest of function
        return {
            previousStitches: startingStitches,
            totalStitches: 0,
            stitchesConsumed: 0,
            stitchChange: -startingStitches,
            breakdown: [],
            isValid: true
        };
    }

    // SMART "TO END" PREPROCESSING
    // Calculate what "to end" means, but keep the original instruction for display
    let processedInstruction = preprocessToEndInstructions(instruction, startingStitches, customActionsData);

    let totalProduced = 0;
    let totalConsumed = 0;

    // Handle legacy "K all" and "P all" (keeping for backward compatibility)
    if (processedInstruction.toLowerCase().includes('k all') || processedInstruction.toLowerCase().includes('knit all')) {
        return {
            previousStitches: startingStitches,
            totalStitches: startingStitches,
            stitchesConsumed: startingStitches,
            stitchChange: 0,
            breakdown: [],
            isValid: true
        };
    }

    if (processedInstruction.toLowerCase().includes('p all') || processedInstruction.toLowerCase().includes('purl all')) {
        return {
            previousStitches: startingStitches,
            totalStitches: startingStitches,
            stitchesConsumed: startingStitches,
            stitchChange: 0,
            breakdown: [],
            isValid: true
        };
    }

    // Helper function to get stitch value (checks custom actions first)
    const getStitchValue = (operation) => {
        // Check custom actions first
        if (customActionsData[operation]) {
            const customAction = customActionsData[operation];

            // Handle new format: { consumes: 5, produces: 1 }
            if (typeof customAction === 'object' && customAction.consumes !== undefined && customAction.produces !== undefined) {
                return { consumes: customAction.consumes, produces: customAction.produces };
            }

            // Handle legacy format: just a number (assumes 1:1 consumption)
            if (typeof customAction === 'number') {
                return { consumes: 1, produces: customAction };
            }

            // Fallback for malformed custom actions
            return { consumes: 1, produces: 1 };
        }
        // Fall back to standard lookup
        return STITCH_VALUES[operation] || { consumes: 1, produces: 1 }; // Default to 1:1
    };

    // FIXED: Parse bracketed repeats - handles both [...]3 and [...] × 3 and incomplete [...]
    const bracketPattern = /\[([^\]]*)\](?:\s*(?:×\s*)?(\d+))?/g;
    let remainingInstruction = processedInstruction;
    let match;

    while ((match = bracketPattern.exec(processedInstruction)) !== null) {
        const [fullMatch, bracketContent, repeatCount] = match;
        const count = repeatCount ? parseInt(repeatCount) : 1; // Default to 1 for incomplete brackets

        // Parse content inside brackets (can contain parentheses)
        const bracketResult = parseBracketContent(bracketContent, getStitchValue);

        const consumedInRepeat = bracketResult.consumed * count;
        const producedInRepeat = bracketResult.produced * count;

        totalConsumed += consumedInRepeat;
        totalProduced += producedInRepeat;

        // Remove this bracket from remaining instruction
        remainingInstruction = remainingInstruction.replace(fullMatch, '');
    }

    // FIXED: Parse parentheses repeats that are NOT inside brackets - (K2tog)3 and incomplete (K2tog
    const parenPattern = /\(([^)]*)\)(?:\s*(?:×\s*)?(\d+))?/g;
    while ((match = parenPattern.exec(remainingInstruction)) !== null) {
        const [fullMatch, parenContent, repeatCount] = match;
        const count = repeatCount ? parseInt(repeatCount) : 1; // Default to 1 for incomplete parens

        // Parse content inside parentheses (can be complex like brackets)
        if (parenContent.trim()) {
            const parenResult = parseBracketContent(parenContent, getStitchValue);
            const consumedInRepeat = parenResult.consumed * count;
            const producedInRepeat = parenResult.produced * count;

            totalConsumed += consumedInRepeat;
            totalProduced += producedInRepeat;
        }

        // Remove this paren from remaining instruction
        remainingInstruction = remainingInstruction.replace(fullMatch, '');
    }

    // Parse remaining operations (split by commas)
    const remainingOps = remainingInstruction.split(',')
        .map(op => op.trim())
        .filter(op => op.length > 0);

    for (const operation of remainingOps) {

        // FIXED: Handle × multiplier operations like "K2tog × 10", "SSK × 5"
        const multiplierMatch = operation.match(/^(.+?)\s*×\s*(\d+)$/);
        if (multiplierMatch) {
            const [, stitchOp, repeatNum] = multiplierMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp.trim());

            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
            continue;
        }

        // Handle numbered operations like "K37", "K3", etc.
        const numberedMatch = operation.match(/^([A-Za-z]+)(\d+)$/);
        if (numberedMatch) {
            const [, stitchOp, repeatNum] = numberedMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp);
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
        } else if (operation.trim()) {
            // Single operation like "K", "YO", "SSK"

            const stitchValue = getStitchValue(operation); // REMOVED .toUpperCase()

            totalConsumed += stitchValue.consumes;
            totalProduced += stitchValue.produces;
        }
    }

    const stitchChange = totalProduced - totalConsumed;

    return {
        previousStitches: startingStitches,
        totalStitches: totalProduced,
        stitchesConsumed: totalConsumed,
        stitchChange: stitchChange,
        breakdown: [],
        isValid: true
    };
};

/**
 * DEBUG VERSION: Process "K to end" and "P to end" instructions for calculation only
 * Returns processed instruction for math, but doesn't change the display
 */
/**
 * FIXED: Process "K to end" and "P to end" instructions for calculation only
 * Returns processed instruction for math, but doesn't change the display
 * NOW WITH SMART COMMA SPLITTING that respects brackets and parentheses
 */
const preprocessToEndInstructions = (instruction, startingStitches, customActionsData = {}) => {
    if (!hasWorkToEndAction(instruction)) {
        return instruction; // No "to end" patterns, return as-is
    }

    // ✨ NEW: Smart comma splitting that respects brackets and parentheses
    const smartSplit = (text) => {
        const parts = [];
        let currentPart = '';
        let bracketDepth = 0;
        let parenDepth = 0;

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (char === '[') {
                bracketDepth++;
            } else if (char === ']') {
                bracketDepth--;
            } else if (char === '(') {
                parenDepth++;
            } else if (char === ')') {
                parenDepth--;
            } else if (char === ',' && bracketDepth === 0 && parenDepth === 0) {
                // Only split on commas that are outside brackets and parentheses
                parts.push(currentPart.trim());
                currentPart = '';
                continue;
            }

            currentPart += char;
        }

        // Don't forget the last part
        if (currentPart.trim()) {
            parts.push(currentPart.trim());
        }

        return parts;
    };

    // Parse everything BEFORE the "to end" commands to calculate consumed stitches
    let tempConsumed = 0;
    const parts = smartSplit(instruction);
    const processedParts = [];

    for (const part of parts) {
        if (/k\s+to\s+end/gi.test(part)) {
            // Calculate remaining stitches for K to end
            const remainingStitches = startingStitches - tempConsumed;
            processedParts.push(remainingStitches > 0 ? `K${remainingStitches}` : 'K0');
        } else if (/p\s+to\s+end/gi.test(part)) {
            // Calculate remaining stitches for P to end
            const remainingStitches = startingStitches - tempConsumed;
            processedParts.push(remainingStitches > 0 ? `P${remainingStitches}` : 'P0');
        } else if (/k\/p\s+as\s+set/gi.test(part)) {
            // Calculate remaining stitches for K/P as set (works like K to end)
            const remainingStitches = startingStitches - tempConsumed;
            processedParts.push(remainingStitches > 0 ? `K${remainingStitches}` : 'K0');
        } else {
            // Regular part - calculate its consumption and add to processed parts
            const partResult = calculatePartialStitches(part, customActionsData);
            tempConsumed += partResult.consumed;
            processedParts.push(part);
        }
    }

    return processedParts.join(', ');
};

/**
 * FIXED: Parse content inside brackets (can contain parentheses)
 * Handles: "K2, (P2tog)3, YO" inside [...] and incomplete content
 */
// In src/shared/utils/stitchCalculatorUtils.js
// Replace the parseBracketContent function with this fixed version:

const parseBracketContent = (content, getStitchValue) => {
    let totalConsumed = 0;
    let totalProduced = 0;

    if (!content || !content.trim()) {
        return { consumed: 0, produced: 0 }; // Empty brackets
    }

    // First, handle any parentheses inside the bracket content
    const parenPattern = /\(([^)]*)\)(?:\s*(?:×\s*)?(\d+))?/g;
    let workingContent = content;
    let match;

    while ((match = parenPattern.exec(content)) !== null) {
        const [fullMatch, parenContent, repeatCount] = match;
        const count = repeatCount ? parseInt(repeatCount) : 1; // Default to 1 for incomplete

        // Parse the operation inside parentheses (recursive call)
        if (parenContent.trim()) {
            const parenResult = parseBracketContent(parenContent, getStitchValue);
            totalConsumed += parenResult.consumed * count;
            totalProduced += parenResult.produced * count;
        }

        // Remove this paren from working content
        workingContent = workingContent.replace(fullMatch, '');
    }

    // Then handle remaining comma-separated operations
    const operations = workingContent.split(',')
        .map(op => op.trim())
        .filter(op => op.length > 0);

    for (const operation of operations) {
        // FIXED: Handle standalone multiplier operations like "K2tog × 10", "SSK × 5"
        const multiplierMatch = operation.match(/^(.+?)\s*×\s*(\d+)$/);
        if (multiplierMatch) {
            const [, stitchOp, repeatNum] = multiplierMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp.trim());
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
            continue;
        }

        // Handle numbered operations like "K5", "P3"
        const numberedMatch = operation.match(/^([A-Za-z]+)(\d+)$/);
        if (numberedMatch) {
            const [, stitchOp, repeatNum] = numberedMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp);
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
        } else if (operation.trim()) {
            // Single operation like "K", "YO", "SSK"
            const stitchValue = getStitchValue(operation);
            totalConsumed += stitchValue.consumes;
            totalProduced += stitchValue.produces;
        }
    }

    return { consumed: totalConsumed, produced: totalProduced };
};

/**
 * Helper function to calculate stitch consumption for a partial instruction
 * Used for "to end" calculations
 */
/**
 * ✨ FIXED: Helper function to calculate stitch consumption for a partial instruction
 * Now handles ALL patterns including brackets with multipliers!
 * Used for "to end" calculations in preprocessToEndInstructions
 */
const calculatePartialStitches = (partialInstruction, customActionsData = {}) => {
    let totalConsumed = 0;
    let totalProduced = 0;

    if (!partialInstruction || !partialInstruction.trim()) {
        return { consumed: 0, produced: 0 };
    }

    // Helper function to get stitch value (same as main function)
    const getStitchValue = (operation) => {
        if (customActionsData[operation]) {
            const customAction = customActionsData[operation];
            if (typeof customAction === 'object' && customAction.consumes !== undefined && customAction.produces !== undefined) {
                return { consumes: customAction.consumes, produces: customAction.produces };
            }
            if (typeof customAction === 'number') {
                return { consumes: 1, produces: customAction };
            }
            return { consumes: 1, produces: 1 };
        }
        return STITCH_VALUES[operation] || { consumes: 1, produces: 1 };
    };

    // ✅ NEW: Handle bracketed repeats - [K2, P2] × 2
    const bracketPattern = /\[([^\]]*)\](?:\s*(?:×\s*)?(\d+))?/g;
    let remainingInstruction = partialInstruction;
    let match;

    while ((match = bracketPattern.exec(partialInstruction)) !== null) {
        const [fullMatch, bracketContent, repeatCount] = match;
        const count = repeatCount ? parseInt(repeatCount) : 1;

        // Parse content inside brackets using existing helper
        const bracketResult = parseBracketContent(bracketContent, getStitchValue);

        totalConsumed += bracketResult.consumed * count;
        totalProduced += bracketResult.produced * count;

        // Remove this bracket from remaining instruction
        remainingInstruction = remainingInstruction.replace(fullMatch, '');
    }

    // ✅ NEW: Handle parentheses repeats - (K2tog)3
    const parenPattern = /\(([^)]*)\)(?:\s*(?:×\s*)?(\d+))?/g;
    while ((match = parenPattern.exec(remainingInstruction)) !== null) {
        const [fullMatch, parenContent, repeatCount] = match;
        const count = repeatCount ? parseInt(repeatCount) : 1;

        if (parenContent.trim()) {
            const parenResult = parseBracketContent(parenContent, getStitchValue);
            totalConsumed += parenResult.consumed * count;
            totalProduced += parenResult.produced * count;
        }

        remainingInstruction = remainingInstruction.replace(fullMatch, '');
    }

    // Handle remaining operations (comma-separated)
    const remainingOps = remainingInstruction.split(',')
        .map(op => op.trim())
        .filter(op => op.length > 0);

    for (const operation of remainingOps) {
        // Handle × multiplier operations like "K2tog × 10", "SSK × 5"
        const multiplierMatch = operation.match(/^(.+?)\s*×\s*(\d+)$/);
        if (multiplierMatch) {
            const [, stitchOp, repeatNum] = multiplierMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp.trim());
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
            continue;
        }

        // Handle numbered operations like "K5", "P3"
        const numberedMatch = operation.match(/^([A-Za-z\/]+)(\d+)$/);
        if (numberedMatch) {
            const [, stitchOp, repeatNum] = numberedMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp);
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
        } else if (operation.trim()) {
            // Single operation like "1/1 LC", "K2tog", "K", etc.
            const stitchValue = getStitchValue(operation);
            totalConsumed += stitchValue.consumes;
            totalProduced += stitchValue.produces;
        }
    }

    return { consumed: totalConsumed, produced: totalProduced };
};

/**
 * Format stitch change for display
 * @param {number} change - Stitch change (+/-)
 * @returns {Object} - { text, color }
 */
export const formatRunningTotal = (startStitches, endStitches, change) => {
    const baseText = `${startStitches} sts → ${endStitches} sts`;

    if (change === 0) {
        return {
            baseText,
            changeText: null,
            changeColor: null
        };
    }

    const changeText = change > 0 ? `(+${change} sts)` : `(${change} sts)`;
    const changeColor = change > 0 ? 'text-green-600' : 'text-red-500';

    return {
        baseText,
        changeText,
        changeColor
    };
};

/**
 * Live calculation wrapper - auto-completes incomplete brackets/parens for real-time validation
 * @param {string} instruction - Raw instruction (may have unclosed brackets/parens)
 * @param {number} startingStitches - Starting stitch count
 * @param {Object} customActionsData - Custom actions lookup
 * @returns {Object} - Same as calculateRowStitches but for incomplete instructions
 */
export const calculateRowStitchesLive = (instruction, startingStitches = 0, customActionsData = {}) => {
    if (!instruction || !instruction.trim()) {
        return calculateRowStitches(instruction, startingStitches, customActionsData);
    }

    let calculationText = instruction;

    // ONLY auto-close incomplete brackets/parens - NO expansion
    let openBrackets = 0;
    let openParens = 0;

    for (const char of calculationText) {
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
        if (char === '(') openParens++;
        if (char === ')') openParens--;
    }

    calculationText += ']'.repeat(Math.max(0, openBrackets));
    calculationText += ')'.repeat(Math.max(0, openParens));

    // Let the main parser handle all the nested multiplier expansion correctly
    return calculateRowStitches(calculationText, startingStitches, customActionsData);
};


// Add this function to the end of stitchCalculatorUtils.js, before the getPreviousRowStitches function:

/**
 * Get stitch consumption for a single action
 * @param {string} action - The stitch action (e.g., 'K', 'K2tog', 'YO')
 * @param {Object} customActionsData - Custom actions lookup from project data
 * @returns {number} - Number of stitches this action consumes
 */
export const getStitchConsumption = (action, customActionsData = {}) => {
    // Check custom actions first
    if (customActionsData[action]) {
        const customAction = customActionsData[action];

        // Handle new format: { consumes: 5, produces: 1 }
        if (typeof customAction === 'object' && customAction.consumes !== undefined) {
            return customAction.consumes;
        }

        // Handle legacy format: just a number (assumes 1:1 consumption)
        if (typeof customAction === 'number') {
            return 1; // Legacy custom actions assumed 1 consumed
        }

        // Fallback for malformed custom actions
        return 1;
    }

    // Use existing STITCH_VALUES lookup
    const stitchValue = STITCH_VALUES[action];
    return stitchValue ? stitchValue.consumes : 1; // Default to 1 if unknown
};

export const getMaxSafeMultiplier = (action, remainingStitches, customActionsData = {}) => {

    if (remainingStitches <= 0) return 1; // Can't do anything with no stitches

    const singleActionConsumption = getStitchConsumption(action, customActionsData);

    if (singleActionConsumption === 0) {
        return 999; // Non-consuming actions like YO can be done many times
    }

    // Calculate max without overconsumption
    const maxMultiplier = Math.floor(remainingStitches / singleActionConsumption);

    // Clamp between 1 and 999
    return Math.max(1, Math.min(999, maxMultiplier));

    //return 3;
};


/**
 * Get previous row stitch count for smart calculations
 * @param {Array} rowInstructions - All row instructions
 * @param {number} currentRowIndex - Index of current row being calculated
 * @param {number} componentStartingStitches - Stitches at component start
 * @returns {number} - Stitch count available for current row
 */
export const getPreviousRowStitches = (rowInstructions, currentRowIndex, componentStartingStitches, customActionsData = {}) => {
    if (currentRowIndex === 0) {
        return componentStartingStitches;
    }

    let currentStitches = componentStartingStitches;

    for (let i = 0; i < currentRowIndex; i++) {
        const result = calculateRowStitches(rowInstructions[i], currentStitches, customActionsData);
        currentStitches = result.totalStitches;
    }

    return currentStitches;
};

/**
 * Determine if a row instruction is complete and ready to save
 * @param {string} instruction - Row instruction text
 * @param {number} startingStitches - Stitches available at start of row
 * @param {Object} customActionsData - Custom actions lookup
 * @returns {Object} - { isComplete, reason, remaining? }
 */
export const isRowComplete = (instruction, startingStitches, customActionsData = {}) => {
    if (!instruction || !instruction.trim()) {
        return { isComplete: false, reason: 'empty' };
    }

    // Check for "to end" commands first - these are always complete
    if (instruction.includes('K to end') || instruction.includes('P to end') ||
        instruction.includes('K/P as set') ||
        instruction.includes('K all') || instruction.includes('P all')) {
        return { isComplete: true, reason: 'to_end_command' };
    }

    // Check stitch consumption
    const calculation = calculateRowStitchesLive(instruction, startingStitches, customActionsData);
    if (!calculation || !calculation.isValid) {
        return { isComplete: false, reason: 'invalid' };
    }

    // Row complete when all stitches consumed
    if (calculation.stitchesConsumed === startingStitches) {
        return { isComplete: true, reason: 'all_stitches_consumed' };
    }

    // Row incomplete - provide remaining count
    return {
        isComplete: false,
        reason: 'incomplete',
        remaining: startingStitches - calculation.stitchesConsumed,
        consumed: calculation.stitchesConsumed,
        total: startingStitches
    };
};

/**
 * Calculate final stitch count after processing all row instructions
 * @param {Array} rowInstructions - Array of row instruction strings
 * @param {number} startingStitches - Initial stitch count
 * @param {Object} customActionsData - Custom actions lookup from project
 * @returns {number} - Final stitch count after all rows
 */
export const calculateFinalStitchCount = (rowInstructions, startingStitches, customActionsData = {}) => {
    if (!rowInstructions || rowInstructions.length === 0) {
        return startingStitches;
    }

    let currentStitches = startingStitches;

    for (const instruction of rowInstructions) {
        const result = calculateRowStitches(instruction, currentStitches, customActionsData);
        currentStitches = result.totalStitches;
    }

    return currentStitches;
};