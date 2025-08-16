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
const STITCH_PRODUCES = {
    'K': 1, 'P': 1, 'K1': 1, 'P1': 1,
    'K2tog': 1, 'SSK': 1, 'K3tog': 1, 'CDD': 1, 'S2KP': 1, 'SK2P': 1,
    'P2tog': 1, 'SSP': 1, 'K2tog tbl': 1, 'SSK tbl': 1,
    'YO': 1, 'M1': 1, 'M1L': 1, 'M1R': 1, 'KFB': 2,
    'Sl1': 1, 'BO': 0,
    'C4F': 4, 'C4B': 4, 'C6F': 6, 'C6B': 6,
    'T2F': 2, 'T2B': 2, 'T4F': 4, 'T4B': 4, 'RT': 2, 'LT': 2
};

export const calculateRowStitches = (instruction, startingStitches = 0, customActionsData = {}) => {
    if (!instruction || !instruction.trim()) {
        return {
            previousStitches: startingStitches,
            totalStitches: 0,
            stitchesConsumed: 0,  // ← ADD THIS FIELD
            stitchChange: -startingStitches,
            breakdown: [],
            isValid: true
        };
    }

    let totalProduced = 0;
    let totalConsumed = 0;  // ← TRACK CONSUMED SEPARATELY

    // Handle special cases
    if (instruction.toLowerCase().includes('k all') || instruction.toLowerCase().includes('knit all')) {
        return {
            previousStitches: startingStitches,
            totalStitches: startingStitches,
            stitchesConsumed: startingStitches,  // ← K all consumes all stitches
            stitchChange: 0,
            breakdown: [],
            isValid: true
        };
    }

    if (instruction.toLowerCase().includes('p all') || instruction.toLowerCase().includes('purl all')) {
        return {
            previousStitches: startingStitches,
            totalStitches: startingStitches,
            stitchesConsumed: startingStitches,  // ← P all consumes all stitches
            stitchChange: 0,
            breakdown: [],
            isValid: true
        };
    }

    // Helper function to get stitch value (checks custom actions first)
    const getStitchValue = (operation) => {
        // Check custom actions first
        if (customActionsData[operation]) {
            // Custom actions return produced count, need to add consumed logic
            return { consumes: 1, produces: customActionsData[operation] }; // Default assumption
        }
        // Fall back to standard lookup
        return STITCH_VALUES[operation] || { consumes: 1, produces: 1 }; // Default to 1:1
    };

    // Parse bracketed repeats like [K, yo, ssk] × 3
    const repeatPattern = /\[([^\]]+)\]\s*×?\s*(\d+)/g;
    let remainingInstruction = instruction;
    let match;

    while ((match = repeatPattern.exec(instruction)) !== null) {
        const [fullMatch, repeatContent, repeatCount] = match;
        const count = parseInt(repeatCount);

        const operations = repeatContent.split(',').map(op => op.trim()).filter(op => op.length > 0);
        let consumedInRepeat = 0;
        let producedInRepeat = 0;

        for (const operation of operations) {
            const stitchValue = getStitchValue(operation.toUpperCase());
            consumedInRepeat += stitchValue.consumes;
            producedInRepeat += stitchValue.produces;
        }

        totalConsumed += consumedInRepeat * count;
        totalProduced += producedInRepeat * count;
        remainingInstruction = remainingInstruction.replace(fullMatch, '');
    }

    // Parse remaining operations (split by commas)
    const remainingOps = remainingInstruction.split(',').map(op => op.trim()).filter(op => op.length > 0);

    for (const operation of remainingOps) {
        // Handle numbered operations like "K37"
        const numberedMatch = operation.match(/^([A-Za-z]+)(\d+)$/);
        if (numberedMatch) {
            const [, stitchOp, repeatNum] = numberedMatch;
            const count = parseInt(repeatNum);
            const stitchValue = getStitchValue(stitchOp.toUpperCase());
            totalConsumed += stitchValue.consumes * count;
            totalProduced += stitchValue.produces * count;
        } else {
            // Single operation like "K", "yo", "ssk"
            const stitchValue = getStitchValue(operation.toUpperCase());
            totalConsumed += stitchValue.consumes;
            totalProduced += stitchValue.produces;
        }
    }

    const stitchChange = totalProduced - totalConsumed;

    return {
        previousStitches: startingStitches,
        totalStitches: totalProduced,
        stitchesConsumed: totalConsumed,  // ← RETURN ACTUAL CONSUMED COUNT
        stitchChange: stitchChange,
        breakdown: [],
        isValid: true
    };
};

/**
 * Parse content inside brackets for repeats
 */
const parseRepeatContent = (content) => {
    let totalConsumed = 0;
    let totalProduced = 0;
    const breakdown = [];

    // Split by commas to get individual operations
    const operations = content.split(',').map(op => op.trim());

    for (const operation of operations) {
        // Handle parenthetical repeats within brackets: (K2tog)2
        const parenPattern = /\(([^)]+)\)(\d+)/;
        const parenMatch = operation.match(parenPattern);

        if (parenMatch) {
            const [, stitchOp, count] = parenMatch;
            const repeatCount = parseInt(count);
            const stitchValue = STITCH_VALUES[stitchOp];

            if (stitchValue) {
                const consumed = stitchValue.consumes * repeatCount;
                const produced = stitchValue.produces * repeatCount;
                totalConsumed += consumed;
                totalProduced += produced;
                breakdown.push({
                    operation: `(${stitchOp})${repeatCount}`,
                    count: repeatCount,
                    netChange: produced - consumed
                });
            }
        } else {
            // Single operation
            const stitchValue = STITCH_VALUES[operation];
            if (stitchValue) {
                totalConsumed += stitchValue.consumes;
                totalProduced += stitchValue.produces;
                breakdown.push({
                    operation,
                    count: 1,
                    netChange: stitchValue.produces - stitchValue.consumes
                });
            }
        }
    }

    return { consumed: totalConsumed, produced: totalProduced, breakdown };
};

/**
 * Parse individual stitch operations
 */
const parseStitchOperations = (instruction) => {
    let totalConsumed = 0;
    let totalProduced = 0;
    const breakdown = [];

    // Clean up instruction and split by commas
    const cleanInstruction = instruction.replace(/[,\s]+/g, ' ').trim();
    if (!cleanInstruction) return { consumed: 0, produced: 0, breakdown: [] };

    // Split by spaces to get individual operations
    const operations = cleanInstruction.split(/\s+/).filter(op => op.length > 0);

    for (const operation of operations) {
        // Handle numbered operations like "K2", "K3", "P5", etc.
        const numberedMatch = operation.match(/^([A-Za-z]+)(\d+)$/);

        if (numberedMatch) {
            const [, stitchOp, count] = numberedMatch;
            const repeatCount = parseInt(count);
            const stitchValue = STITCH_VALUES[stitchOp];

            if (stitchValue) {
                const consumed = stitchValue.consumes * repeatCount;
                const produced = stitchValue.produces * repeatCount;
                totalConsumed += consumed;
                totalProduced += produced;
                breakdown.push({
                    operation: `${stitchOp}${repeatCount}`,
                    count: repeatCount,
                    netChange: produced - consumed
                });
            }
        } else {
            // Single operation without number
            const stitchValue = STITCH_VALUES[operation];
            if (stitchValue) {
                totalConsumed += stitchValue.consumes;
                totalProduced += stitchValue.produces;
                breakdown.push({
                    operation,
                    count: 1,
                    netChange: stitchValue.produces - stitchValue.consumes
                });
            }
        }
    }

    return { consumed: totalConsumed, produced: totalProduced, breakdown };
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