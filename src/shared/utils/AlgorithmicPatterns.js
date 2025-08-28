// src/shared/utils/AlgorithmicPatterns.js
/**
 * Algorithmic Pattern Engine for IntelliKnit
 * 
 * Calculates row-by-row instructions for patterns that can be generated
 * mathematically rather than requiring lookup tables.
 */

import { calculateRowStitches } from './stitchCalculatorUtils';

/**
 * ALGORITHMIC PATTERN DEFINITIONS
 * Each pattern includes calculation logic and metadata
 */
export const ALGORITHMIC_PATTERNS = {
    // ===== BASIC TEXTURE PATTERNS =====

    'Stockinette': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;

            if (construction === 'flat') {
                return adjustedRow === 1 ? 'Knit all' : 'Purl all';
            } else {
                return 'Knit all'; // All rounds are knit in circular
            }
        },
        rowHeight: 2,
        stitchMultiple: 1,
        description: 'Classic smooth fabric with RS knit, WS purl'
    },

    'Garter': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            if (construction === 'flat') {
                return 'K all'; // Every row knit when flat
            } else {
                // In round: alternate knit/purl to create garter effect
                const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;
                return adjustedRow === 1 ? 'Knit all' : 'Purl all';
            }
        },
        rowHeight: 2,
        stitchMultiple: 1,
        description: 'Bumpy stretchy fabric'
    },

    'Reverse Stockinette': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;

            if (construction === 'flat') {
                return adjustedRow === 1 ? 'Purl all' : 'Knit all'; // Opposite of stockinette
            } else {
                return 'Purl all'; // All rounds are purl in circular
            }
        },
        rowHeight: 2,
        stitchMultiple: 1,
        description: 'Purl side showing - opposite of stockinette'
    },

    'Seed Stitch': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            if (construction === 'flat') {
                const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;
                return adjustedRow === 1
                    ? generateTexturedPattern('K1, P1', stitchCount, 'RS')
                    : generateTexturedPattern('K1, P1', stitchCount, 'WS');
            } else {
                // Round: always alternates every round for seed effect
                const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;
                return adjustedRow === 1
                    ? generateSmartPattern('K1, P1', stitchCount)
                    : generateSmartPattern('P1, K1', stitchCount);
            }
        },
        rowHeight: 2,
        stitchMultiple: 1,
        description: 'Bumpy alternating texture - knits and purls checkerboard'
    },

    'Moss Stitch': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 4) + 1;

            if (construction === 'flat') {
                switch (adjustedRow) {
                    case 1:
                        return generateTexturedPattern('K1, P1', stitchCount, 'RS');
                    case 2:
                        return generateTexturedPattern('K1, P1', stitchCount, 'WS');
                    case 3:
                        return generateTexturedPattern('P1, K1', stitchCount, 'RS');
                    case 4:
                        return generateTexturedPattern('P1, K1', stitchCount, 'WS');
                    default:
                        return generateTexturedPattern('K1, P1', stitchCount, 'RS');
                }
            } else {
                // Round: standard alternating pattern
                switch (adjustedRow) {
                    case 1:
                    case 2:
                        return generateSmartPattern('K1, P1', stitchCount);
                    case 3:
                    case 4:
                        return generateSmartPattern('P1, K1', stitchCount);
                    default:
                        return generateSmartPattern('K1, P1', stitchCount);
                }
            }
        },
        rowHeight: 4,
        stitchMultiple: 2,
        description: 'British seed stitch - 4-row pattern with doubled rows'
    },

    'Double Seed': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 4) + 1;

            if (construction === 'flat') {
                switch (adjustedRow) {
                    case 1:
                        return generateTexturedPattern('K2, P2', stitchCount, 'RS');
                    case 2:
                        return generateTexturedPattern('K2, P2', stitchCount, 'WS');
                    case 3:
                        return generateTexturedPattern('P2, K2', stitchCount, 'RS');
                    case 4:
                        return generateTexturedPattern('P2, K2', stitchCount, 'WS');
                    default:
                        return generateTexturedPattern('K2, P2', stitchCount, 'RS');
                }
            } else {
                // Round: standard alternating pattern
                switch (adjustedRow) {
                    case 1:
                    case 2:
                        return generateSmartPattern('K2, P2', stitchCount);
                    case 3:
                    case 4:
                        return generateSmartPattern('P2, K2', stitchCount);
                    default:
                        return generateSmartPattern('K2, P2', stitchCount);
                }
            }
        },
        rowHeight: 4,
        stitchMultiple: 4,
        description: '2x2 seed stitch variation with doubled rows'
    },

    'Basketweave': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            // Classic 8-stitch, 6-row basketweave pattern
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 6) + 1;

            if (adjustedRow <= 3) {
                // First 3 rows: K4, P4 blocks
                return generateBlockPattern(['K4', 'P4'], stitchCount);
            } else {
                // Next 3 rows: P4, K4 blocks (offset)
                return generateBlockPattern(['P4', 'K4'], stitchCount);
            }
        },
        rowHeight: 6,
        stitchMultiple: 8,
        description: 'Alternating knit/purl blocks creating basket weave effect'
    },

    // ===== RIBBING PATTERNS =====

    '1x1 Rib': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            if (construction === 'flat') {
                const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;
                return adjustedRow === 1
                    ? generateRibPattern('K1, P1', stitchCount, 'RS')
                    : generateRibPattern('K1, P1', stitchCount, 'WS');
            } else {
                return generateSmartPattern('K1, P1', stitchCount);
            }
        },
        rowHeight: 2,
        stitchMultiple: 2,
        description: 'Classic stretchy ribbing, K1 P1 alternating'
    },

    '2x2 Rib': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            if (construction === 'flat') {
                const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;
                return adjustedRow === 1
                    ? generateRibPattern('K2, P2', stitchCount, 'RS')
                    : generateRibPattern('K2, P2', stitchCount, 'WS');
            } else {
                return generateSmartPattern('K2, P2', stitchCount);
            }
        },
        rowHeight: 2,
        stitchMultiple: 4,
        description: 'Wider ribbing with 2-stitch columns'
    },

    '3x3 Rib': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            if (construction === 'flat') {
                const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;
                return adjustedRow === 1
                    ? generateRibPattern('K3, P3', stitchCount, 'RS')
                    : generateRibPattern('K3, P3', stitchCount, 'WS');
            } else {
                return generateSmartPattern('K3, P3', stitchCount);
            }
        },
        rowHeight: 2,
        stitchMultiple: 6,
        description: 'Wide ribbing with 3-stitch columns'
    },

    '2x1 Rib': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            if (construction === 'flat') {
                const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;
                return adjustedRow === 1
                    ? generateRibPattern('K2, P1', stitchCount, 'RS')
                    : generateRibPattern('K2, P1', stitchCount, 'WS');
            } else {
                return generateSmartPattern('K2, P1', stitchCount);
            }
        },
        rowHeight: 2,
        stitchMultiple: 3,
        description: 'Uneven ribbing - K2, P1 alternating'
    },

    '1x1 Twisted Rib': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            if (construction === 'flat') {
                const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;
                return adjustedRow === 1
                    ? generateRibPattern('K1tbl, P1', stitchCount, 'RS')
                    : generateRibPattern('K1tbl, P1', stitchCount, 'WS');
            } else {
                return generateSmartPattern('K1tbl, P1', stitchCount);
            }
        },
        rowHeight: 2,
        stitchMultiple: 2,
        description: 'Twisted knit stitches create tighter ribbing'
    },

    '2x2 Twisted Rib': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            if (construction === 'flat') {
                const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;
                return adjustedRow === 1
                    ? generateRibPattern('K2tbl, P2', stitchCount, 'RS')
                    : generateRibPattern('K2tbl, P2', stitchCount, 'WS');
            } else {
                return generateSmartPattern('K2tbl, P2', stitchCount);
            }
        },
        rowHeight: 2,
        stitchMultiple: 4,
        description: 'Twisted knit stitches in wider ribbing'
    },

    // ===== ADVANCED TEXTURED PATTERNS =====

    'Linen Stitch': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;

            if (adjustedRow === 1) {
                // Row 1: K1, *sl1 wyif, K1; repeat from *
                return generateLinenStitchRow1(stitchCount);
            } else {
                // Row 2: P1, *sl1 wyib, P1; repeat from *
                return generateLinenStitchRow2(stitchCount);
            }
        },
        rowHeight: 2,
        stitchMultiple: 2,
        description: 'Slip stitch texture resembling woven fabric'
    },

    'Rice Stitch': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;

            if (construction === 'flat') {
                return adjustedRow === 1
                    ? generateSmartPattern('K1, P1', stitchCount)
                    : generateSmartPattern('K1, P1', stitchCount); // Same both rows
            } else {
                return generateSmartPattern('K1, P1', stitchCount);
            }
        },
        rowHeight: 2,
        stitchMultiple: 2,
        description: 'Seed stitch variation with consistent texture'
    },

    'Trinity Stitch': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 4) + 1;

            switch (adjustedRow) {
                case 1:
                    return 'Purl all';
                case 2:
                    return generateTrinityRow2(stitchCount); // (K1, P1, K1) in next st, P3tog
                case 3:
                    return 'Purl all';
                case 4:
                    return generateTrinityRow4(stitchCount); // P3tog, (K1, P1, K1) in next st
                default:
                    return 'Purl all';
            }
        },
        rowHeight: 4,
        stitchMultiple: 4,
        description: 'Bobble-like texture with alternating clusters'
    },

    'Broken Rib': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 4) + 1;

            if (construction === 'flat') {
                switch (adjustedRow) {
                    case 1:
                        return generateTexturedPattern('K1, P1', stitchCount, 'RS');
                    case 2:
                        return generateTexturedPattern('K1, P1', stitchCount, 'WS');
                    case 3:
                    case 4:
                        return construction === 'flat' ? 'Purl all' : 'Knit all';
                    default:
                        return generateTexturedPattern('K1, P1', stitchCount, 'RS');
                }
            } else {
                switch (adjustedRow) {
                    case 1:
                        return generateSmartPattern('K1, P1', stitchCount);
                    case 2:
                        return generateSmartPattern('K1, P1', stitchCount);
                    case 3:
                    case 4:
                        return 'Knit all';
                    default:
                        return generateSmartPattern('K1, P1', stitchCount);
                }
            }
        },
        rowHeight: 4,
        stitchMultiple: 2,
        description: 'Interrupted ribbing pattern with plain rows'
    }
};

/**
 * FIXED: Smart Pattern Generator - Uses existing stitch calculation system
 * This replaces the old generateAlternatingPattern with proper pattern math
 */
function generateSmartPattern(basePattern, stitchCount) {
    // For simple "all" patterns, return directly
    if (basePattern === 'Knit all' || basePattern === 'Purl all') {
        return basePattern;
    }

    try {
        // Test the pattern against the total stitch count to see how it should repeat
        const testResult = calculateRowStitches(basePattern, stitchCount);

        if (!testResult.isValid || testResult.stitchesConsumed === 0) {
            // Can't determine consumption - fall back to generic format
            return `Work in [${basePattern}] pattern across row`;
        }

        const stitchesPerRepeat = testResult.stitchesConsumed;

        if (stitchesPerRepeat === stitchCount) {
            // One complete repeat uses all stitches
            return basePattern;
        }

        if (stitchesPerRepeat > stitchCount) {
            // Pattern is bigger than available stitches - work partial
            return `Work ${basePattern} pattern as fits`;
        }

        // Calculate full repeats
        const fullRepeats = Math.floor(stitchCount / stitchesPerRepeat);
        const remainingStitches = stitchCount % stitchesPerRepeat;

        let instruction = '';

        if (fullRepeats > 1) {
            instruction = `[${basePattern}] ${fullRepeats} times`;
        } else if (fullRepeats === 1) {
            instruction = basePattern;
        }

        if (remainingStitches > 0) {
            // For partial repeats, we'd need more complex logic
            // For now, just note the remainder
            const remainderText = remainingStitches === 1 ? '1 st' : `${remainingStitches} sts`;
            instruction += instruction ? `, work remaining ${remainderText}` : `Work ${remainderText}`;
        }

        return instruction || basePattern;

    } catch (error) {
        // Fallback for any calculation errors
        console.warn(`Pattern calculation error for "${basePattern}":`, error);
        return `Work in ${basePattern} pattern`;
    }
}

/**
 * NEW: Textured pattern generator for flat knitting
 * Handles the proper "work as they appear" logic for seed, moss, etc.
 */
function generateTexturedPattern(basePattern, stitchCount, side) {
    // For textured patterns like seed stitch, we work stitches "as they appear"
    // This means we need to track the actual stitch sequence when the work is flipped

    const patternParts = basePattern.split(', ').map(part => part.trim());

    // Calculate pattern repeat length
    let stitchesPerRepeat = 0;
    for (const part of patternParts) {
        const match = part.match(/(\d+)/);
        stitchesPerRepeat += match ? parseInt(match[1]) : 1;
    }

    if (stitchesPerRepeat === 0) {
        return `Work in ${basePattern} pattern`;
    }

    const fullRepeats = Math.floor(stitchCount / stitchesPerRepeat);
    const remainingStitches = stitchCount % stitchesPerRepeat;

    if (side === 'RS') {
        // RS: Standard pattern logic
        return generateSmartPattern(basePattern, stitchCount);
    }

    // WS: Work stitches as they appear (flip K/P for each individual stitch)
    if (remainingStitches === 0) {
        // Even number of repeats - standard WS conversion
        const wsPattern = generateWSTexturedPattern(patternParts);
        return fullRepeats === 1 ? wsPattern : `[${wsPattern}] ${fullRepeats} times`;
    }

    // Partial pattern on WS - need to consider where the pattern falls
    const wsBasePattern = generateWSTexturedPattern(patternParts);
    const partialWS = generatePartialTexturedFromWS(patternParts, remainingStitches);

    if (fullRepeats === 0) {
        return partialWS;
    } else if (fullRepeats === 1) {
        return `${partialWS}, ${wsBasePattern}`;
    } else {
        return `${partialWS}, [${wsBasePattern}] ${fullRepeats} times`;
    }
}

/**
 * Generate WS version of textured pattern by flipping each stitch type
 */
function generateWSTexturedPattern(patternParts) {
    const flippedParts = patternParts.map(part => {
        // Handle single stitches and numbered stitches
        if (part.startsWith('K')) {
            return part.replace('K', 'P');
        } else if (part.startsWith('P')) {
            return part.replace('P', 'K');
        }
        return part;
    });

    return flippedParts.join(', ');
}

/**
 * Generate partial textured pattern from WS perspective
 * For textured patterns, we work backwards through the pattern
 */
function generatePartialTexturedFromWS(patternParts, remainingStitches) {
    const partialParts = [];
    let stitchesNeeded = remainingStitches;

    // Work backwards through the pattern to find the partial sequence
    for (let i = patternParts.length - 1; i >= 0 && stitchesNeeded > 0; i--) {
        const part = patternParts[i];
        const match = part.match(/([KP])(\d+)?/);

        if (match) {
            const stitchType = match[1];
            const count = match[2] ? parseInt(match[2]) : 1;

            if (stitchesNeeded >= count) {
                // Use the full part, flipped
                const flippedType = stitchType === 'K' ? 'P' : 'K';
                partialParts.unshift(count > 1 ? `${flippedType}${count}` : flippedType);
                stitchesNeeded -= count;
            } else {
                // Use partial count
                const flippedType = stitchType === 'K' ? 'P' : 'K';
                partialParts.unshift(`${flippedType}${stitchesNeeded}`);
                stitchesNeeded = 0;
            }
        }
    }

    return partialParts.join(', ');
}

/**
 * NEW: Specialized ribbing pattern generator that handles partial patterns correctly
 * Generates proper flat knitting instructions with correct WS alignment
 */
function generateRibPattern(basePattern, stitchCount, side) {
    // Parse the base pattern (e.g., "K3, P3" -> ["K3", "P3"])
    const patternParts = basePattern.split(', ').map(part => part.trim());

    // Calculate stitch consumption per repeat
    let stitchesPerRepeat = 0;
    for (const part of patternParts) {
        const match = part.match(/(\d+)/);
        stitchesPerRepeat += match ? parseInt(match[1]) : 1;
    }

    if (stitchesPerRepeat === 0) {
        return `Work in ${basePattern} pattern`;
    }

    // Calculate full repeats and remainder
    const fullRepeats = Math.floor(stitchCount / stitchesPerRepeat);
    const remainingStitches = stitchCount % stitchesPerRepeat;

    if (side === 'RS' || remainingStitches === 0) {
        // RS or no remainder: use standard smart pattern logic
        return generateSmartPattern(basePattern, stitchCount);
    }

    // WS with remainder: need to flip the starting pattern
    if (fullRepeats === 0) {
        // Only partial pattern - work what fits from the flipped perspective
        return generatePartialRibFromWS(patternParts, remainingStitches);
    }

    // WS: Full repeats + remainder
    // The remainder comes at the beginning when viewed from WS
    const remainderParts = generatePartialRibFromWS(patternParts, remainingStitches);
    const fullRepeatPattern = generateWSRibPattern(patternParts);

    if (fullRepeats === 1) {
        return `${remainderParts}, ${fullRepeatPattern}`;
    } else {
        return `${remainderParts}, [${fullRepeatPattern}] ${fullRepeats} times`;
    }
}

/**
 * Generate WS rib pattern by flipping K/P for each stitch type
 */
function generateWSRibPattern(patternParts) {
    const flippedParts = patternParts.map(part => {
        if (part.startsWith('K')) {
            return part.replace('K', 'P');
        } else if (part.startsWith('P')) {
            return part.replace('P', 'K');
        }
        return part; // Handle special cases like 'K1tbl'
    });

    return flippedParts.join(', ');
}

/**
 * Generate partial rib pattern from WS perspective
 * For 31-st 3x3 rib: RS ends with K1, so WS starts with P1
 */
function generatePartialRibFromWS(patternParts, remainingStitches) {
    // Work backwards through the pattern to find what the remainder should be
    let totalStitches = 0;
    for (const part of patternParts) {
        const match = part.match(/(\d+)/);
        totalStitches += match ? parseInt(match[1]) : 1;
    }

    // Find where we are in the pattern cycle for the remainder
    const partialParts = [];
    let stitchesNeeded = remainingStitches;

    // Start from the end of the pattern (since we're flipping)
    for (let i = patternParts.length - 1; i >= 0 && stitchesNeeded > 0; i--) {
        const part = patternParts[i];
        const match = part.match(/([KP]\d*(?:tbl)?)\s*(\d+)?/);

        if (match) {
            const stitchType = match[1];
            const count = match[2] ? parseInt(match[2]) : (match[1].match(/\d+/) ? parseInt(match[1].match(/\d+/)[0]) : 1);

            if (stitchesNeeded >= count) {
                // Use the full part, but flip K/P
                const flippedType = stitchType.startsWith('K') ? stitchType.replace('K', 'P') : stitchType.replace('P', 'K');
                partialParts.unshift(count > 1 ? `${flippedType.replace(/\d+/, '')}${count}` : flippedType);
                stitchesNeeded -= count;
            } else {
                // Use partial count
                const flippedType = stitchType.startsWith('K') ? stitchType.replace('K', 'P') : stitchType.replace('P', 'K');
                partialParts.unshift(`${flippedType.replace(/\d+/, '')}${stitchesNeeded}`);
                stitchesNeeded = 0;
            }
        }
    }

    return partialParts.join(', ');
}

/**
 * Generate block pattern like "K4, P4" with smart repeat handling
 */
function generateBlockPattern(blocks, stitchCount) {
    const sequence = [];
    let remaining = stitchCount;
    let blockIndex = 0;

    while (remaining > 0) {
        const currentBlock = blocks[blockIndex % blocks.length];
        const blockStitch = currentBlock.charAt(0); // K or P
        const blockSize = parseInt(currentBlock.match(/\d+/)[0]);

        if (remaining >= blockSize) {
            sequence.push(currentBlock);
            remaining -= blockSize;
        } else {
            // Partial block at end
            sequence.push(`${blockStitch}${remaining}`);
            remaining = 0;
        }
        blockIndex++;
    }

    return formatInstructionSequence(sequence);
}

/**
 * Generate linen stitch row 1 pattern
 */
function generateLinenStitchRow1(stitchCount) {
    if (stitchCount < 2) return 'Knit all';

    const pairs = Math.floor(stitchCount / 2);
    let instruction = '';

    if (pairs > 1) {
        instruction = `K1, [sl1 wyif, K1] ${pairs - 1} times`;
    } else {
        instruction = 'K1, sl1 wyif';
    }

    if (stitchCount % 2 === 1) {
        instruction += ', K1';
    }

    return instruction;
}

/**
 * Generate linen stitch row 2 pattern  
 */
function generateLinenStitchRow2(stitchCount) {
    if (stitchCount < 2) return 'Purl all';

    const pairs = Math.floor(stitchCount / 2);
    let instruction = '';

    if (pairs > 1) {
        instruction = `P1, [sl1 wyib, P1] ${pairs - 1} times`;
    } else {
        instruction = 'P1, sl1 wyib';
    }

    if (stitchCount % 2 === 1) {
        instruction += ', P1';
    }

    return instruction;
}

/**
 * Generate Trinity stitch row 2 pattern
 */
function generateTrinityRow2(stitchCount) {
    const groups = Math.floor(stitchCount / 4);
    if (groups === 0) return 'Work as established';

    return `[(K1, P1, K1) in next st, P3tog] ${groups} times`;
}

/**
 * Generate Trinity stitch row 4 pattern
 */
function generateTrinityRow4(stitchCount) {
    const groups = Math.floor(stitchCount / 4);
    if (groups === 0) return 'Work as established';

    return `[P3tog, (K1, P1, K1) in next st] ${groups} times`;
}

/**
 * Format instruction sequence with smart combining
 */
function formatInstructionSequence(sequence) {
    if (sequence.length === 0) return '';
    if (sequence.length === 1) return sequence[0];

    // Combine consecutive identical instructions
    const combined = [];
    let current = { instruction: sequence[0], count: 1 };

    for (let i = 1; i < sequence.length; i++) {
        if (sequence[i] === current.instruction) {
            current.count++;
        } else {
            if (current.count === 1) {
                combined.push(current.instruction);
            } else {
                combined.push(`[${current.instruction}] ${current.count} times`);
            }
            current = { instruction: sequence[i], count: 1 };
        }
    }

    // Add final group
    if (current.count === 1) {
        combined.push(current.instruction);
    } else {
        combined.push(`[${current.instruction}] ${current.count} times`);
    }

    return combined.join(', ');
}

/**
 * MAIN PATTERN RESOLVER FUNCTION
 */
export const getAlgorithmicRowInstruction = (patternName, rowNum, stitchCount, construction = 'flat', startingRowInPattern = 1) => {
    const pattern = ALGORITHMIC_PATTERNS[patternName];

    if (!pattern) {
        return null; // Pattern not found in algorithmic patterns
    }

    try {
        return pattern.calculateRow(rowNum, stitchCount, construction, startingRowInPattern);
    } catch (error) {
        console.error(`Error calculating row for pattern ${patternName}:`, error);
        return `Work row ${rowNum} of ${patternName} pattern`;
    }
};

/**
 * GET PATTERN METADATA
 */
export const getPatternMetadata = (patternName) => {
    const pattern = ALGORITHMIC_PATTERNS[patternName];

    if (!pattern) return null;

    return {
        rowHeight: pattern.rowHeight,
        stitchMultiple: pattern.stitchMultiple,
        description: pattern.description,
        hasAlgorithmicSupport: true
    };
};

/**
 * CHECK IF PATTERN IS SUPPORTED
 */
export const isAlgorithmicPattern = (patternName) => {
    return ALGORITHMIC_PATTERNS.hasOwnProperty(patternName);
};

/**
 * GET ALL SUPPORTED PATTERNS
 */
export const getSupportedPatterns = () => {
    return Object.keys(ALGORITHMIC_PATTERNS);
};