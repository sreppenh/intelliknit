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
 * Enhanced through mathematical experimentation and edge case discovery!
 * @param {string} rawInstruction - The calculated instruction string
 * @returns {string} - Formatted instruction or original if no pattern detected
 */
export const formatKnittingInstruction = (rawInstruction) => {
    if (!rawInstruction || typeof rawInstruction !== 'string') {
        return rawInstruction;
    }

    try {
        const operations = rawInstruction.split(', ').map(op => op.trim());

        if (operations.length < 3) {
            return rawInstruction;
        }

        // Phase -1: Multi-pattern sectional (discovered through experimentation!)
        const multiPatternResult = detectMultiPatternSectional(operations);
        if (multiPatternResult) {
            return multiPatternResult;
        }

        // Phase 0: Leading + repeating + remainder patterns (most common!)
        const leadingPatternResult = detectLeadingPatternRemainder(operations);
        if (leadingPatternResult) {
            return leadingPatternResult;
        }

        // Phase 1: Pattern-based sectional notation (handles complex sectional patterns)
        const patternSectionalResult = detectPatternSections(operations);
        if (patternSectionalResult) {
            return patternSectionalResult;
        }

        // Phase 2: Enhanced sectional notation (handles consecutive operations)
        const sectionalResult = detectSectionsFromEnds(operations);
        if (sectionalResult) {
            return sectionalResult;
        }

        // Phase 3: Simple repeating patterns (fallback)
        const simplePatternResult = formatSimplePattern(operations);
        if (simplePatternResult) {
            return simplePatternResult;
        }

        // Future pattern handlers can be added here as you discover them:
        // const cableResult = formatCablePattern(rawInstruction);
        // const laceResult = formatLacePattern(rawInstruction);
        // const colorworkResult = formatColorworkPattern(rawInstruction);

        // Fallback: return original if no pattern detected
        return rawInstruction;
    } catch (error) {
        console.warn('Error formatting knitting instruction:', error);
        return rawInstruction; // Safe fallback
    }
};

/**
 * Multi-pattern sectional detection - discovered through mathematical experimentation!
 * Handles complex symmetric patterns with multiple distinct sections
 * Examples: (K2, inc) 3 times, (K3, inc) 2 times, (K2, inc) 3 times, K2
 *           (K1, inc) 2 times, (K3, inc) 3 times, (K1, inc) 2 times
 */
const detectMultiPatternSectional = (operations) => {
    if (operations.length < 8) return null; // Need enough for multiple sections

    // Strategy: Scan through and identify distinct pattern sections
    const sections = [];
    let currentIndex = 0;

    while (currentIndex < operations.length) {
        // Try to find a repeating pattern starting at current position
        let bestPattern = null;
        let bestRepetitions = 0;

        // Try pattern lengths 2 and 3 (most common for even distribution)
        for (let patternLength = 2; patternLength <= 3; patternLength++) {
            if (currentIndex + patternLength > operations.length) continue;

            const candidatePattern = operations.slice(currentIndex, currentIndex + patternLength);

            // Count how many times this pattern repeats consecutively
            let repetitions = 0;
            let testIndex = currentIndex;

            while (testIndex + patternLength <= operations.length) {
                const segment = operations.slice(testIndex, testIndex + patternLength);
                if (arraysEqual(segment, candidatePattern)) {
                    repetitions++;
                    testIndex += patternLength;
                } else {
                    break;
                }
            }

            // Use this pattern if it has more repetitions (prioritize longer sequences)
            if (repetitions >= 2 && repetitions > bestRepetitions) {
                bestPattern = candidatePattern;
                bestRepetitions = repetitions;
            }
        }

        if (bestPattern && bestRepetitions >= 2) {
            // Found a repeating pattern
            sections.push({
                type: 'pattern',
                pattern: bestPattern,
                repetitions: bestRepetitions,
                text: `(${bestPattern.join(', ')}) ${bestRepetitions} times`
            });
            currentIndex += bestRepetitions * bestPattern.length;
        } else {
            // No repeating pattern found, collect individual operations until we find one
            const individualOps = [];

            while (currentIndex < operations.length) {
                // Check if a new pattern starts here
                let foundNewPattern = false;

                for (let patternLength = 2; patternLength <= 3; patternLength++) {
                    if (currentIndex + patternLength > operations.length) continue;

                    const candidatePattern = operations.slice(currentIndex, currentIndex + patternLength);
                    let repetitions = 0;
                    let testIndex = currentIndex;

                    while (testIndex + patternLength <= operations.length) {
                        const segment = operations.slice(testIndex, testIndex + patternLength);
                        if (arraysEqual(segment, candidatePattern)) {
                            repetitions++;
                            testIndex += patternLength;
                        } else {
                            break;
                        }
                    }

                    if (repetitions >= 2) {
                        foundNewPattern = true;
                        break;
                    }
                }

                if (foundNewPattern) {
                    break; // Exit and let the main loop handle the new pattern
                }

                individualOps.push(operations[currentIndex]);
                currentIndex++;
            }

            if (individualOps.length > 0) {
                sections.push({
                    type: 'individual',
                    text: individualOps.join(', ')
                });
            }
        }
    }

    // Only return if we found at least 2 pattern sections (making it worthwhile)
    const patternSections = sections.filter(s => s.type === 'pattern');
    if (patternSections.length >= 2) {
        return sections.map(s => s.text).join(', ');
    }

    return null;
};
/**
 * Leading + repeating + remainder pattern detection
 * Perfect for most Even Distribution patterns!
 * Examples: K1, inc, (K2, inc) 9 times, K1
 *           (K4, inc) 4 times, K4
 *           K3, (K2, inc) 5 times, K1, K1
 */
const detectLeadingPatternRemainder = (operations) => {
    // Look for: some leading ops + repeated pattern + some remainder ops

    if (operations.length < 6) return null; // Need enough for meaningful pattern

    // Try different pattern lengths (2 is most common for even distribution)
    for (let patternLength = 2; patternLength <= 3; patternLength++) {

        // Try different starting positions for the repeating pattern
        for (let startPos = 0; startPos <= 4; startPos += 2) { // Even positions for 2-op patterns

            if (startPos + patternLength >= operations.length) continue;

            const candidatePattern = operations.slice(startPos, startPos + patternLength);

            // Count consecutive repetitions from this position
            let repetitions = 0;
            let index = startPos;

            while (index + patternLength <= operations.length) {
                const segment = operations.slice(index, index + patternLength);
                if (arraysEqual(segment, candidatePattern)) {
                    repetitions++;
                    index += patternLength;
                } else {
                    break;
                }
            }

            // Need at least 3 repetitions to be worth formatting
            if (repetitions >= 3) {
                const leadingOps = operations.slice(0, startPos);
                const patternEndIndex = startPos + (repetitions * patternLength);
                const remainderOps = operations.slice(patternEndIndex);

                const sections = [];

                // Add leading operations
                if (leadingOps.length > 0) {
                    sections.push(leadingOps.join(', '));
                }

                // Add repeating pattern
                sections.push(`(${candidatePattern.join(', ')}) ${repetitions} times`);

                // Add remainder operations
                if (remainderOps.length > 0) {
                    sections.push(remainderOps.join(', '));
                }

                return sections.join(', ');
            }
        }
    }

    return null;
};
/**
 * Pattern-based sectional notation - handles asymmetric increase/decrease patterns
 * Perfect for flat knitting where end sections may have remainders
 * Example: (K1, inc) 2 times, (K2, inc) 8 times, K1, inc, K1
 */
const detectPatternSections = (operations) => {
    // Try to detect sections based on repeating patterns (like K1,inc vs K2,inc)
    // This handles flat knitting asymmetric patterns beautifully!

    if (operations.length >= 8) { // Need enough operations for meaningful sections

        // Check for 2-operation patterns (most common in even distribution)
        const startPattern = operations.slice(0, 2);

        // Count how many times the start pattern repeats from the beginning
        let startRepeats = 0;
        for (let i = 0; i < operations.length; i += 2) {
            const segment = operations.slice(i, i + 2);
            if (arraysEqual(segment, startPattern)) {
                startRepeats++;
            } else {
                break;
            }
        }

        // If we have at least 2 repeats of the start pattern, look for sections
        if (startRepeats >= 2) {
            const afterStartIndex = startRepeats * 2;
            const remainingOps = operations.slice(afterStartIndex);

            if (remainingOps.length >= 4) { // Enough for a middle section

                // Try to find a different pattern in the middle
                const middlePattern = remainingOps.slice(0, 2);

                // Only proceed if middle pattern is different from start
                if (!arraysEqual(middlePattern, startPattern)) {

                    let middleRepeats = 0;
                    for (let i = 0; i < remainingOps.length; i += 2) {
                        const segment = remainingOps.slice(i, i + 2);
                        if (arraysEqual(segment, middlePattern)) {
                            middleRepeats++;
                        } else {
                            break;
                        }
                    }

                    if (middleRepeats >= 2) { // Meaningful middle section
                        const afterMiddleIndex = afterStartIndex + (middleRepeats * 2);
                        const endOps = operations.slice(afterMiddleIndex);

                        const sections = [];

                        // Format start section
                        sections.push(`(${startPattern.join(', ')}) ${startRepeats} times`);

                        // Format middle section
                        sections.push(`(${middlePattern.join(', ')}) ${middleRepeats} times`);

                        // Format end section (may be asymmetric remainder)
                        if (endOps.length > 0) {
                            const formattedEnd = formatMiddleSection(endOps);
                            sections.push(formattedEnd);
                        }

                        return sections.join(', ');
                    }
                }
            }
        }
    }

    return null;
};
/**
 * Enhanced sectional notation - detects patterns from both ends with lower minimums
 * Handles edge cases like: K2tog 2 times, (K1, K2tog) 3 times, K1, K2tog 3 times
 */
const detectSectionsFromEnds = (operations) => {
    // Find consecutive operations at the start
    let startConsecutive = 0;
    const firstOp = operations[0];
    for (let i = 0; i < operations.length; i++) {
        if (operations[i] === firstOp) {
            startConsecutive++;
        } else {
            break;
        }
    }

    // Find consecutive operations at the end
    let endConsecutive = 0;
    const lastOp = operations[operations.length - 1];
    for (let i = operations.length - 1; i >= 0; i--) {
        if (operations[i] === lastOp) {
            endConsecutive++;
        } else {
            break;
        }
    }

    // ENHANCED: Lower requirements (2+ consecutive on each end)
    // AND make sure we have meaningful sections
    const hasStartSection = startConsecutive >= 2;
    const hasEndSection = endConsecutive >= 2;
    const hasMiddleSection = startConsecutive + endConsecutive < operations.length;

    if (hasStartSection && hasEndSection && hasMiddleSection) {
        const middleSection = operations.slice(startConsecutive, operations.length - endConsecutive);

        const sections = [];

        // Format start section (always show count for 2+)
        sections.push(`${firstOp} ${startConsecutive} times`);

        // Format middle section
        if (middleSection.length > 0) {
            const formattedMiddle = formatMiddleSection(middleSection);
            sections.push(formattedMiddle);
        }

        // Format end section (always show count for 2+)
        sections.push(`${lastOp} ${endConsecutive} times`);

        return sections.join(', ');
    }

    // Try partial sectional (just start OR just end)
    if (hasStartSection && startConsecutive >= 3) {
        const remainder = operations.slice(startConsecutive);
        const formattedRemainder = formatMiddleSection(remainder);
        return `${firstOp} ${startConsecutive} times, ${formattedRemainder}`;
    }

    if (hasEndSection && endConsecutive >= 3) {
        const beginning = operations.slice(0, operations.length - endConsecutive);
        const formattedBeginning = formatMiddleSection(beginning);
        return `${formattedBeginning}, ${lastOp} ${endConsecutive} times`;
    }

    return null;
};

/**
 * Format the middle section between consecutive operations
 * Enhanced to handle repeated single operations
 */
const formatMiddleSection = (section) => {
    // Try to find repeating patterns in the middle
    for (let patternLength = 2; patternLength <= Math.floor(section.length / 2); patternLength++) {
        const candidatePattern = section.slice(0, patternLength);
        let repetitions = 0;
        let index = 0;

        while (index + patternLength <= section.length) {
            const currentSegment = section.slice(index, index + patternLength);

            if (arraysEqual(currentSegment, candidatePattern)) {
                repetitions++;
                index += patternLength;
            } else {
                break;
            }
        }

        if (repetitions >= 2) {
            const remainder = section.slice(repetitions * patternLength);
            let result = `(${candidatePattern.join(', ')}) ${repetitions} times`;
            if (remainder.length > 0) {
                result += `, ${remainder.join(', ')}`;
            }
            return result;
        }
    }

    // Check for repeated single operations (avoid K2tog, K2tog, K2tog)
    if (section.length >= 2 && section.every(op => op === section[0])) {
        return `${section[0]} ${section.length} times`;
    }

    // No pattern found, return as-is
    return section.join(', ');
};

/**
 * Simple repeating pattern detection (original algorithm)
 * Handles cases like: (K4, inc) 4 times, K4
 */
const formatSimplePattern = (operations) => {
    for (let patternLength = 2; patternLength <= 4; patternLength++) {
        if (operations.length < patternLength * 2) continue;

        const candidatePattern = operations.slice(0, patternLength);
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

        if (repetitions >= 2) {
            const remainingOps = operations.slice(repetitions * patternLength);
            const patternText = candidatePattern.join(', ');
            const repetitionText = `(${patternText}) ${repetitions} times`;

            if (remainingOps.length > 0) {
                const remainderText = remainingOps.join(', ');
                return `${repetitionText}, ${remainderText}`;
            }

            return repetitionText;
        }
    }

    return null;
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
 * Test the formatter with comprehensive examples including experimental discoveries!
 * Shows the evolution from simple patterns to mathematical poetry through experimentation
 */
export const testFormatter = () => {
    const testCases = [
        // EXPERIMENTAL DISCOVERIES: Multi-pattern sectional (Phase -1)
        "K2, inc, K2, inc, K2, inc, K3, inc, K3, inc, K2, inc, K2, inc, K2, inc, K2",
        "K1, inc, K1, inc, K3, inc, K3, inc, K3, inc, K1, inc, K1, inc",

        // LEARNED PATTERNS: Leading + pattern + remainder (Phase 0)
        "K1, inc, K2, inc, K2, inc, K2, inc, K2, inc, K2, inc, K2, inc, K2, inc, K2, inc, K2, inc, K1",
        "K3, K2, inc, K2, inc, K2, inc, K2, inc",

        // Basic even distribution patterns (classic)
        "K4, inc, K4, inc, K4, inc, K4, inc, K4",
        "K3, K2tog, K3, K2tog, K3, K2tog, K3",

        // Flat knitting asymmetric patterns (Phase 1)
        "K1, inc, K1, inc, K2, inc, K2, inc, K2, inc, K2, inc, K2, inc, K2, inc, K2, inc, K2, inc, K1, inc, K1",
        "K2tog, K2tog, K1, K2tog, K1, K2tog, K1, K2tog, K1, K2tog, K2tog, K2tog",

        // Enhanced sectional patterns (edge cases - Phase 2)
        "K2tog, K2tog, K2tog, K2tog, K1, K2tog, K1, K2tog, K1, K2tog, K2tog, K2tog, K2tog",
        "inc, inc, inc, K3, inc, K3, inc, K3, inc, K2tog, K2tog, K2tog",

        // Regular patterns (should still work - Phase 3)
        "K2, inc, K2, inc, K2, inc, K2, inc, K2, inc, K2",
        "K5, K2tog, K5, K2tog, K5",

        // Consecutive operation patterns
        "K2tog, K2tog, K2tog, K2tog, K2tog",
        "inc, inc, inc, inc, K4, K4, K4",

        // Edge cases that should stay original
        "K1, K2tog, K1, K2tog, K1, K2tog, K1, K2tog, K1",
        "K10, inc", // Too short
        "K3, inc, K5, K2tog, K7, inc" // No clear pattern
    ];

    console.log('🧶 Testing EXPERIMENTAL Knitting Notation Formatter:');
    console.log('🎨 Patterns discovered through mathematical experimentation!');
    console.log('🎯 Phase -1: Multi-Pattern Sectional (NEWEST!)');
    console.log('🎯 Phase 0: Leading + Pattern + Remainder');
    console.log('🎯 Phase 1: Pattern Sectional Notation');
    console.log('🎯 Phase 2: Enhanced Sectional Notation');
    console.log('🎯 Phase 3: Simple Pattern Fallback');
    console.log('='.repeat(70));
    testCases.forEach((test, i) => {
        const result = formatKnittingInstruction(test);
        const improved = result !== test;
        console.log(`${i + 1}. ${improved ? '✅' : 'ℹ️'} ${test}`);
        console.log(`   → ${result}`);
        console.log('');
    });

    console.log('🎵 Keep experimenting with the math - each weird pattern teaches us more!');
};

export default formatKnittingInstruction;