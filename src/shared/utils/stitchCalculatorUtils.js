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

    // Special operations
    'Sl1': { consumes: 1, produces: 1 }, // Slip stitch
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
    'LT': { consumes: 2, produces: 2 }
};

/**
 * Parse a row instruction and calculate total stitches worked
 * @param {string} instruction - Row instruction (e.g., "[(K2tog)2, P]3")
 * @param {number} startingStitches - Stitches available at start of row
 * @returns {Object} - { totalStitches, stitchChange, breakdown, isValid }
 */
export const calculateRowStitches = (instruction, startingStitches = 0, customActionsData = {}) => {
    console.log('🧮 calculateRowStitches input:', instruction, 'starting:', startingStitches);

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

        console.log(`🔧 Found bracket: "${bracketContent}" × ${count}`);

        // Parse content inside brackets (can contain parentheses)
        const bracketResult = parseBracketContent(bracketContent, getStitchValue);

        const consumedInRepeat = bracketResult.consumed * count;
        const producedInRepeat = bracketResult.produced * count;

        console.log(`🔧 Bracket math: ${bracketResult.consumed} × ${count} = ${consumedInRepeat} consumed, ${bracketResult.produced} × ${count} = ${producedInRepeat} produced`);

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

        console.log(`🔧 Found standalone paren: "${parenContent}" × ${count}`);

        // Parse single operation inside parentheses
        if (parenContent.trim()) {
            const stitchValue = getStitchValue(parenContent.trim());
            const consumedInRepeat = stitchValue.consumes * count;
            const producedInRepeat = stitchValue.produces * count;

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

    console.log('🧮 remainingOps:', remainingOps); // ADD THIS LINE

    for (const operation of remainingOps) {
        console.log('🧮 processing operation:', operation); // ADD THIS LINE TOO

        // FIXED: Handle × multiplier operations like "K2tog × 10", "SSK × 5"
        const multiplierMatch = operation.match(/^(.+?)\s*×\s*(\d+)$/);
        if (multiplierMatch) {
            console.log('🧮 matched multiplier pattern');
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
            console.log('🧮 matched numbered pattern:', numberedMatch);
            const [, stitchOp, repeatNum] = numberedMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp);
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
        } else if (operation.trim()) {
            // Single operation like "K", "YO", "SSK"
            console.log('🧮 matched single operation fallback');
            console.log('🧮 operation:', operation);
            console.log('🧮 STITCH_VALUES lookup (original case):', STITCH_VALUES[operation]);
            console.log('🧮 customActionsData lookup (original case):', customActionsData[operation]);

            const stitchValue = getStitchValue(operation); // REMOVED .toUpperCase()
            console.log('🧮 getStitchValue result:', stitchValue);
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
 * FIXED: Process "K to end" and "P to end" instructions for calculation only
 * Returns processed instruction for math, but doesn't change the display
 */
const preprocessToEndInstructions = (instruction, startingStitches, customActionsData = {}) => {
    // Check for "K to end" or "P to end" patterns
    const kToEndPattern = /k\s+to\s+end/gi;
    const pToEndPattern = /p\s+to\s+end/gi;

    if (!kToEndPattern.test(instruction) && !pToEndPattern.test(instruction)) {
        return instruction; // No "to end" patterns, return as-is
    }

    // Parse everything BEFORE the "to end" commands to calculate consumed stitches
    let tempConsumed = 0;
    const parts = instruction.split(',').map(part => part.trim());
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
const parseBracketContent = (content, getStitchValue) => {
    console.log('🔧 parseBracketContent input:', content);
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

        console.log(`🔧 Found paren inside bracket: "${parenContent}" × ${count}`);

        // Parse the operation inside parentheses
        if (parenContent.trim()) {
            const stitchValue = getStitchValue(parenContent.trim();
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
        }

        // Remove this paren from working content
        workingContent = workingContent.replace(fullMatch, '');
    }

    // Then handle remaining comma-separated operations
    const operations = workingContent.split(',')
        .map(op => op.trim())
        .filter(op => op.length > 0);

    for (const operation of operations) {
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
    console.log('🔧 parseBracketContent result:', { consumed: totalConsumed, produced: totalProduced });
    return { consumed: totalConsumed, produced: totalProduced };
};

/**
 * Helper function to calculate stitch consumption for a partial instruction
 * Used for "to end" calculations
 */
const calculatePartialStitches = (partialInstruction, customActionsData = {}) => {
    let consumed = 0;
    let produced = 0;

    // Helper function to get stitch value (same as main function)
    const getStitchValue = (operation) => {
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
        return STITCH_VALUES[operation] || { consumes: 1, produces: 1 };
    };

    // Handle numbered operations like "K5", "P3"
    const numberedMatch = partialInstruction.match(/^([A-Za-z]+)(\d+)$/);
    if (numberedMatch) {
        const [, stitchOp, repeatNum] = numberedMatch;
        const count = parseInt(repeatNum);
        const stitchValue = getStitchValue(stitchOp);
        consumed += stitchValue.consumes * count;
        produced += stitchValue.produces * count;
    } else {
        // Single operation like "K", "YO", "SSK"
        const stitchValue = getStitchValue(partialInstruction);
        consumed += stitchValue.consumes;
        produced += stitchValue.produces;
    }

    return { consumed, produced };
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
 * Get previous row stitch count for smart calculations
 * @param {Array} rowInstructions - All row instructions
 * @param {number} currentRowIndex - Index of current row being calculated
 * @param {number} componentStartingStitches - Stitches at component start
 * @returns {number} - Stitch count available for current row
 */
export const getPreviousRowStitches = (rowInstructions, currentRowIndex, componentStartingStitches) => {
    if (currentRowIndex === 0) {
        return componentStartingStitches;
    }

    // Calculate running totals up to previous row
    let currentStitches = componentStartingStitches;

    for (let i = 0; i < currentRowIndex; i++) {
        const result = calculateRowStitches(rowInstructions[i], currentStitches);
        currentStitches = result.totalStitches;
    }

    return currentStitches;
};