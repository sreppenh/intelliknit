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
export const calculateRowStitches = (instruction, startingStitches = 0) => {
    if (!instruction || !instruction.trim()) {
        return {
            totalStitches: startingStitches,
            stitchChange: 0,
            breakdown: [],
            isValid: true
        };
    }

    try {
        // Handle special cases first
        if (instruction.toLowerCase().includes('k all') || instruction.toLowerCase().includes('knit all')) {
            return {
                totalStitches: startingStitches,
                stitchChange: 0,
                breakdown: [{ operation: 'K all', count: startingStitches, netChange: 0 }],
                isValid: true
            };
        }

        if (instruction.toLowerCase().includes('p all') || instruction.toLowerCase().includes('purl all')) {
            return {
                totalStitches: startingStitches,
                stitchChange: 0,
                breakdown: [{ operation: 'P all', count: startingStitches, netChange: 0 }],
                isValid: true
            };
        }

        const breakdown = [];
        let totalConsumed = 0;
        let totalProduced = 0;

        // Parse bracketed repeats: [(K2tog)2, P]3
        const repeatPattern = /\[([^\]]+)\](\d+)/g;
        let remainingInstruction = instruction;
        let match;

        while ((match = repeatPattern.exec(instruction)) !== null) {
            const [fullMatch, repeatContent, repeatCount] = match;
            const count = parseInt(repeatCount);

            // Parse the content inside brackets
            const repeatResult = parseRepeatContent(repeatContent);

            // Multiply by repeat count
            const totalRepeats = {
                consumed: repeatResult.consumed * count,
                produced: repeatResult.produced * count,
                breakdown: repeatResult.breakdown.map(item => ({
                    ...item,
                    count: item.count * count,
                    netChange: item.netChange * count
                }))
            };

            totalConsumed += totalRepeats.consumed;
            totalProduced += totalRepeats.produced;
            breakdown.push(...totalRepeats.breakdown);

            // Remove this repeat from remaining instruction
            remainingInstruction = remainingInstruction.replace(fullMatch, '');
        }

        // Parse remaining non-bracketed operations
        const remainingResult = parseStitchOperations(remainingInstruction);
        totalConsumed += remainingResult.consumed;
        totalProduced += remainingResult.produced;
        breakdown.push(...remainingResult.breakdown);

        const stitchChange = totalProduced - totalConsumed;
        const totalStitches = startingStitches + stitchChange;

        return {
            totalStitches,
            stitchChange,
            breakdown,
            isValid: true
        };

    } catch (error) {
        console.warn('Error calculating row stitches:', error);
        return {
            totalStitches: startingStitches,
            stitchChange: 0,
            breakdown: [],
            isValid: false,
            error: error.message
        };
    }
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
    if (change === 0) {
        return {
            text: `${startStitches} sts → ${endStitches} sts`,
            color: 'text-wool-600'
        };
    } else if (change > 0) {
        return {
            text: `${startStitches} sts → ${endStitches} sts (+${change} sts)`,
            color: 'text-green-600'
        };
    } else {
        return {
            text: `${startStitches} sts → ${endStitches} sts (${change} sts)`,
            color: 'text-red-500'
        };
    }
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