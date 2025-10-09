// src/shared/utils/stitchCalculatorUtils.js
/**
 * Smart Stitch Calculator for Pattern Rows
 * CLEANED VERSION - Custom action support removed
 */

// ===== STITCH OPERATION VALUES =====
const STITCH_VALUES = {
    // Basic stitches
    'K': { consumes: 1, produces: 1 },
    'P': { consumes: 1, produces: 1 },
    'K1': { consumes: 1, produces: 1 },
    'P1': { consumes: 1, produces: 1 },

    // Decreases
    'K2tog': { consumes: 2, produces: 1 },
    'SSK': { consumes: 2, produces: 1 },
    'K3tog': { consumes: 3, produces: 1 },
    'SSSK': { consumes: 2, produces: 1 },
    'CDD': { consumes: 3, produces: 1 },
    'S2KP': { consumes: 3, produces: 1 },
    'SK2P': { consumes: 3, produces: 1 },
    'P2tog': { consumes: 2, produces: 1 },
    'SSP': { consumes: 2, produces: 1 },
    'K2tog tbl': { consumes: 2, produces: 1 },
    'SSK tbl': { consumes: 2, produces: 1 },

    // Increases
    'YO': { consumes: 0, produces: 1 },
    'M1': { consumes: 0, produces: 1 },
    'M1L': { consumes: 0, produces: 1 },
    'M1R': { consumes: 0, produces: 1 },
    'KFB': { consumes: 1, produces: 2 },

    // Brioche
    'brk1': { consumes: 2, produces: 1 },
    'brp1': { consumes: 2, produces: 1 },
    'sl1yo': { consumes: 1, produces: 2 },

    // Special operations
    'Sl1': { consumes: 1, produces: 1 },
    'Sl1 wyif': { consumes: 1, produces: 1 },
    'BO': { consumes: 1, produces: 0 },

    // Cable operations (all neutral)
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
    'Bobble': { consumes: 1, produces: 1 },
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
export const calculateRowStitches = (instruction, startingStitches = 0) => {
    if (!instruction || !instruction.trim()) {
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
    let processedInstruction = preprocessToEndInstructions(instruction, startingStitches);

    let totalProduced = 0;
    let totalConsumed = 0;

    // Handle legacy "K all" and "P all"
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

    // Helper function to get stitch value
    const getStitchValue = (operation) => {
        return STITCH_VALUES[operation] || { consumes: 1, produces: 1 };
    };

    // FIXED: Parse bracketed repeats - handles both [...]3 and [...] × 3 and incomplete [...]
    const bracketPattern = /\[([^\]]*)\](?:\s*(?:×\s*)?(\d+))?/g;
    let remainingInstruction = processedInstruction;
    let match;

    while ((match = bracketPattern.exec(processedInstruction)) !== null) {
        const [fullMatch, bracketContent, repeatCount] = match;
        const count = repeatCount ? parseInt(repeatCount) : 1;

        const bracketResult = parseBracketContent(bracketContent, getStitchValue);

        const consumedInRepeat = bracketResult.consumed * count;
        const producedInRepeat = bracketResult.produced * count;

        totalConsumed += consumedInRepeat;
        totalProduced += producedInRepeat;

        remainingInstruction = remainingInstruction.replace(fullMatch, '');
    }

    // FIXED: Parse parentheses repeats that are NOT inside brackets
    const parenPattern = /\(([^)]*)\)(?:\s*(?:×\s*)?(\d+))?/g;
    while ((match = parenPattern.exec(remainingInstruction)) !== null) {
        const [fullMatch, parenContent, repeatCount] = match;
        const count = repeatCount ? parseInt(repeatCount) : 1;

        if (parenContent.trim()) {
            const parenResult = parseBracketContent(parenContent, getStitchValue);
            const consumedInRepeat = parenResult.consumed * count;
            const producedInRepeat = parenResult.produced * count;

            totalConsumed += consumedInRepeat;
            totalProduced += producedInRepeat;
        }

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
            const stitchValue = getStitchValue(operation);
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
 * Process "K to end" and "P to end" instructions for calculation only
 * Returns processed instruction for math, but doesn't change the display
 */
const preprocessToEndInstructions = (instruction, startingStitches) => {
    if (!hasWorkToEndAction(instruction)) {
        return instruction;
    }

    // Smart comma splitting that respects brackets and parentheses
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
                parts.push(currentPart.trim());
                currentPart = '';
                continue;
            }

            currentPart += char;
        }

        if (currentPart.trim()) {
            parts.push(currentPart.trim());
        }

        return parts;
    };

    // Parse everything BEFORE the "to end" commands
    let tempConsumed = 0;
    const parts = smartSplit(instruction);
    const processedParts = [];

    for (const part of parts) {
        if (/k\s+to\s+end/gi.test(part)) {
            const remainingStitches = startingStitches - tempConsumed;
            processedParts.push(remainingStitches > 0 ? `K${remainingStitches}` : 'K0');
        } else if (/p\s+to\s+end/gi.test(part)) {
            const remainingStitches = startingStitches - tempConsumed;
            processedParts.push(remainingStitches > 0 ? `P${remainingStitches}` : 'P0');
        } else if (/k\/p\s+as\s+set/gi.test(part)) {
            const remainingStitches = startingStitches - tempConsumed;
            processedParts.push(remainingStitches > 0 ? `K${remainingStitches}` : 'K0');
        } else {
            const partResult = calculatePartialStitches(part);
            tempConsumed += partResult.consumed;
            processedParts.push(part);
        }
    }

    return processedParts.join(', ');
};

/**
 * Parse content inside brackets (can contain parentheses)
 */
const parseBracketContent = (content, getStitchValue) => {
    let totalConsumed = 0;
    let totalProduced = 0;

    if (!content || !content.trim()) {
        return { consumed: 0, produced: 0 };
    }

    // First, handle any parentheses inside the bracket content
    const parenPattern = /\(([^)]*)\)(?:\s*(?:×\s*)?(\d+))?/g;
    let workingContent = content;
    let match;

    while ((match = parenPattern.exec(content)) !== null) {
        const [fullMatch, parenContent, repeatCount] = match;
        const count = repeatCount ? parseInt(repeatCount) : 1;

        if (parenContent.trim()) {
            const parenResult = parseBracketContent(parenContent, getStitchValue);
            totalConsumed += parenResult.consumed * count;
            totalProduced += parenResult.produced * count;
        }

        workingContent = workingContent.replace(fullMatch, '');
    }

    // Then handle remaining comma-separated operations
    const operations = workingContent.split(',')
        .map(op => op.trim())
        .filter(op => op.length > 0);

    for (const operation of operations) {
        // Handle standalone multiplier operations
        const multiplierMatch = operation.match(/^(.+?)\s*×\s*(\d+)$/);
        if (multiplierMatch) {
            const [, stitchOp, repeatNum] = multiplierMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp.trim());
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
            continue;
        }

        // Handle numbered operations
        const numberedMatch = operation.match(/^([A-Za-z]+)(\d+)$/);
        if (numberedMatch) {
            const [, stitchOp, repeatNum] = numberedMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp);
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
        } else if (operation.trim()) {
            const stitchValue = getStitchValue(operation);
            totalConsumed += stitchValue.consumes;
            totalProduced += stitchValue.produces;
        }
    }

    return { consumed: totalConsumed, produced: totalProduced };
};

/**
 * Helper function to calculate stitch consumption for a partial instruction
 */
const calculatePartialStitches = (partialInstruction) => {
    let totalConsumed = 0;
    let totalProduced = 0;

    if (!partialInstruction || !partialInstruction.trim()) {
        return { consumed: 0, produced: 0 };
    }

    const getStitchValue = (operation) => {
        return STITCH_VALUES[operation] || { consumes: 1, produces: 1 };
    };

    // Handle bracketed repeats
    const bracketPattern = /\[([^\]]*)\](?:\s*(?:×\s*)?(\d+))?/g;
    let remainingInstruction = partialInstruction;
    let match;

    while ((match = bracketPattern.exec(partialInstruction)) !== null) {
        const [fullMatch, bracketContent, repeatCount] = match;
        const count = repeatCount ? parseInt(repeatCount) : 1;

        const bracketResult = parseBracketContent(bracketContent, getStitchValue);

        totalConsumed += bracketResult.consumed * count;
        totalProduced += bracketResult.produced * count;

        remainingInstruction = remainingInstruction.replace(fullMatch, '');
    }

    // Handle parentheses repeats
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

    // Handle remaining operations
    const remainingOps = remainingInstruction.split(',')
        .map(op => op.trim())
        .filter(op => op.length > 0);

    for (const operation of remainingOps) {
        const multiplierMatch = operation.match(/^(.+?)\s*×\s*(\d+)$/);
        if (multiplierMatch) {
            const [, stitchOp, repeatNum] = multiplierMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp.trim());
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
            continue;
        }

        const numberedMatch = operation.match(/^([A-Za-z\/]+)(\d+)$/);
        if (numberedMatch) {
            const [, stitchOp, repeatNum] = numberedMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp);
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
        } else if (operation.trim()) {
            const stitchValue = getStitchValue(operation);
            totalConsumed += stitchValue.consumes;
            totalProduced += stitchValue.produces;
        }
    }

    return { consumed: totalConsumed, produced: totalProduced };
};

/**
 * Format stitch change for display
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
 * Live calculation wrapper - auto-completes incomplete brackets/parens
 */
export const calculateRowStitchesLive = (instruction, startingStitches = 0) => {
    if (!instruction || !instruction.trim()) {
        return calculateRowStitches(instruction, startingStitches);
    }

    let calculationText = instruction;

    // Auto-close incomplete brackets/parens
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

    return calculateRowStitches(calculationText, startingStitches);
};

/**
 * Get previous row stitch count for smart calculations
 */
export const getPreviousRowStitches = (rowInstructions, currentRowIndex, componentStartingStitches) => {
    if (currentRowIndex === 0) {
        return componentStartingStitches;
    }

    let currentStitches = componentStartingStitches;

    for (let i = 0; i < currentRowIndex; i++) {
        const result = calculateRowStitches(rowInstructions[i], currentStitches);
        currentStitches = result.totalStitches;
    }

    return currentStitches;
};

/**
 * Determine if a row instruction is complete and ready to save
 */
export const isRowComplete = (instruction, startingStitches) => {
    if (!instruction || !instruction.trim()) {
        return { isComplete: false, reason: 'empty' };
    }

    // Check for "to end" commands first
    if (instruction.includes('K to end') || instruction.includes('P to end') ||
        instruction.includes('K/P as set') ||
        instruction.includes('K all') || instruction.includes('P all')) {
        return { isComplete: true, reason: 'to_end_command' };
    }

    // Check stitch consumption
    const calculation = calculateRowStitchesLive(instruction, startingStitches);
    if (!calculation || !calculation.isValid) {
        return { isComplete: false, reason: 'invalid' };
    }

    // Row complete when all stitches consumed
    if (calculation.stitchesConsumed === startingStitches) {
        return { isComplete: true, reason: 'all_stitches_consumed' };
    }

    // Row incomplete
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
 */
export const calculateFinalStitchCount = (rowInstructions, startingStitches) => {
    if (!rowInstructions || rowInstructions.length === 0) {
        return startingStitches;
    }

    let currentStitches = startingStitches;

    for (const instruction of rowInstructions) {
        const result = calculateRowStitches(instruction, currentStitches);
        currentStitches = result.totalStitches;
    }

    return currentStitches;
};

/**
 * Get stitch consumption for a single action
 * Used by marker instructions to calculate stitch placement
 */
export const getStitchConsumption = (action) => {
    const stitchValue = STITCH_VALUES[action];
    return stitchValue ? stitchValue.consumes : 1; // Default to 1 if unknown
};

export default {
    calculateRowStitches,
    calculateRowStitchesLive,
    formatRunningTotal,
    getPreviousRowStitches,
    isRowComplete,
    calculateFinalStitchCount,
    getStitchConsumption  // Add to exports
};