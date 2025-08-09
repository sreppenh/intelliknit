// src/shared/utils/knittingNotation.js

/**
 * Knitting Notation Formatter
 * 
 * Transforms raw calculated instructions into proper knitting notation.
 * Respects the math completely - only improves display formatting.
 * 
 * Examples:
 * Input:  "K4, inc, K4, inc, K4, inc, K4, inc, K4"
 * Output: "(K4, inc) 4 times, K4"
 * 
 * Input:  "K3, K2tog, K3, K2tog, K3, K2tog, K3"
 * Output: "(K3, K2tog) 3 times, K3"
 */

/**
 * Main formatting function - extensible for future pattern types
 * @param {string} rawInstruction - The calculated instruction string
 * @returns {string} - Formatted instruction or original if no pattern detected
 */
export const formatKnittingInstruction = (rawInstruction) => {
    if (!rawInstruction || typeof rawInstruction !== 'string') {
        return rawInstruction;
    }

    // Phase 1: Handle Even Distribution patterns
    const evenDistributionResult = formatEvenDistribution(rawInstruction);
    if (evenDistributionResult !== rawInstruction) {
        return evenDistributionResult;
    }

    // Future pattern handlers can be added here:
    // const cableResult = formatCablePattern(rawInstruction);
    // const laceResult = formatLacePattern(rawInstruction);
    // const colorworkResult = formatColorworkPattern(rawInstruction);

    // Fallback: return original if no pattern detected
    return rawInstruction;
};

/**
 * Format Even Distribution patterns
 * Detects repeating knit + shaping operations and formats them properly
 */
const formatEvenDistribution = (instruction) => {
    try {
        // Split instruction into individual operations
        const operations = instruction.split(', ').map(op => op.trim());

        if (operations.length < 3) {
            return instruction; // Too short to have a meaningful pattern
        }

        // Try to detect repeating patterns
        const pattern = detectRepeatingPattern(operations);

        if (pattern) {
            return formatRepeatingPattern(pattern, operations);
        }

        return instruction;
    } catch (error) {
        console.warn('Error formatting knitting instruction:', error);
        return instruction; // Safe fallback
    }
};

/**
 * Detect repeating patterns in operations array
 * Returns pattern info or null if no clear pattern found
 */
const detectRepeatingPattern = (operations) => {
    // Look for patterns of length 2 first (most common for even distribution)
    // Example: ["K4", "inc", "K4", "inc", "K4", "inc", "K4", "inc", "K4"]

    for (let patternLength = 2; patternLength <= 4; patternLength++) {
        const pattern = findPatternOfLength(operations, patternLength);
        if (pattern) {
            return pattern;
        }
    }

    return null;
};

/**
 * Find repeating pattern of specific length
 */
const findPatternOfLength = (operations, patternLength) => {
    if (operations.length < patternLength * 2) {
        return null; // Not enough operations for meaningful repetition
    }

    // Extract potential pattern from the beginning
    const candidatePattern = operations.slice(0, patternLength);

    // Count how many times this pattern repeats
    let repetitions = 0;
    let index = 0;

    while (index + patternLength <= operations.length) {
        const currentSegment = operations.slice(index, index + patternLength);

        if (arraysEqual(currentSegment, candidatePattern)) {
            repetitions++;
            index += patternLength;
        } else {
            break;
        }
    }

    // Need at least 2 repetitions to be worth formatting
    if (repetitions >= 2) {
        const remainingOps = operations.slice(repetitions * patternLength);

        return {
            pattern: candidatePattern,
            repetitions: repetitions,
            remainder: remainingOps
        };
    }

    return null;
};

/**
 * Format detected pattern into knitting notation
 */
const formatRepeatingPattern = (patternInfo, originalOps) => {
    const { pattern, repetitions, remainder } = patternInfo;

    // Format the repeating part
    const patternText = pattern.join(', ');
    const repetitionText = `(${patternText}) ${repetitions} times`;

    // Add remainder if exists
    if (remainder.length > 0) {
        const remainderText = remainder.join(', ');
        return `${repetitionText}, ${remainderText}`;
    }

    return repetitionText;
};

/**
 * Helper function to compare arrays for equality
 */
const arraysEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val === arr2[index]);
};

// ===== FUTURE PATTERN FORMATTERS =====

/**
 * Format cable patterns (future implementation)
 * @param {string} instruction 
 * @returns {string}
 */
const formatCablePattern = (instruction) => {
    // Future: Handle cable crossing notations
    // Example: "C4F, K8, C4B" -> more readable cable notation
    return instruction;
};

/**
 * Format lace patterns (future implementation)
 * @param {string} instruction 
 * @returns {string}
 */
const formatLacePattern = (instruction) => {
    // Future: Handle lace repeat brackets and yarn-over sequences
    return instruction;
};

/**
 * Format colorwork patterns (future implementation)
 * @param {string} instruction 
 * @returns {string}
 */
const formatColorworkPattern = (instruction) => {
    // Future: Handle color changes and stranding notations
    return instruction;
};

// ===== UTILITY FUNCTIONS =====

/**
 * Normalize knitting abbreviations for consistency
 * @param {string} operation - Single knitting operation
 * @returns {string} - Normalized operation
 */
export const normalizeKnittingAbbreviation = (operation) => {
    // Future: Standardize abbreviations (inc vs inc1, k vs K, etc.)
    return operation;
};

/**
 * Validate that an instruction string looks like valid knitting notation
 * @param {string} instruction 
 * @returns {boolean}
 */
export const isValidKnittingInstruction = (instruction) => {
    if (!instruction || typeof instruction !== 'string') return false;

    // Basic validation - contains knitting operations
    const knittingTerms = /\b(K|k|inc|dec|K2tog|ssk|yo|sl|p|P)\d*/;
    return knittingTerms.test(instruction);
};

// ===== TESTING HELPERS =====

/**
 * Test the formatter with common even distribution examples
 * Useful for development and debugging
 */
export const testFormatter = () => {
    const testCases = [
        "K4, inc, K4, inc, K4, inc, K4, inc, K4",
        "K3, K2tog, K3, K2tog, K3, K2tog, K3",
        "K2, inc, K2, inc, K2, inc, K2, inc, K2, inc, K2",
        "K5, K2tog, K5, K2tog, K5",
        "inc, K4, inc, K4, inc, K4, inc",
        "K1, K2tog, K1, K2tog, K1, K2tog, K1, K2tog, K1"
    ];

    console.log('🧶 Testing Knitting Notation Formatter:');
    testCases.forEach(test => {
        const result = formatKnittingInstruction(test);
        console.log(`Input:  ${test}`);
        console.log(`Output: ${result}`);
        console.log('---');
    });
};

export default formatKnittingInstruction;