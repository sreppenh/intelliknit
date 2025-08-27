// src/shared/utils/AlgorithmicPatterns.js
/**
 * Algorithmic Pattern Engine for IntelliKnit
 * 
 * Calculates row-by-row instructions for patterns that can be generated
 * mathematically rather than requiring lookup tables.
 */

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
                return adjustedRow === 1 ? 'K all' : 'P all';
            } else {
                return 'K all'; // All rounds are knit in circular
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
                return adjustedRow === 1 ? 'K all' : 'P all';
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
                return adjustedRow === 1 ? 'P all' : 'K all'; // Opposite of stockinette
            } else {
                return 'P all'; // All rounds are purl in circular
            }
        },
        rowHeight: 2,
        stitchMultiple: 1,
        description: 'Purl side showing - opposite of stockinette'
    },

    'Seed Stitch': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 2) + 1;
            const isEvenStitchCount = stitchCount % 2 === 0;

            if (construction === 'flat') {
                if (isEvenStitchCount) {
                    // Even stitches: both rows identical for seed effect
                    return generateAlternatingPattern('K1, P1', stitchCount);
                } else {
                    // Odd stitches: rows alternate to maintain seed pattern
                    return adjustedRow === 1
                        ? generateAlternatingPattern('K1, P1', stitchCount)
                        : generateAlternatingPattern('P1, K1', stitchCount);
                }
            } else {
                // Round: always alternates every round for seed effect
                return adjustedRow === 1
                    ? generateAlternatingPattern('K1, P1', stitchCount)
                    : generateAlternatingPattern('P1, K1', stitchCount);
            }
        },
        rowHeight: 2,
        stitchMultiple: 1,
        description: 'Bumpy alternating texture - knits and purls checkerboard'
    },

    'Moss Stitch': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            // British moss = 4-row pattern, different from American seed stitch
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 4) + 1;

            switch (adjustedRow) {
                case 1:
                case 2:
                    return generateAlternatingPattern('K1, P1', stitchCount);
                case 3:
                case 4:
                    return generateAlternatingPattern('P1, K1', stitchCount);
                default:
                    return generateAlternatingPattern('K1, P1', stitchCount);
            }
        },
        rowHeight: 4,
        stitchMultiple: 2,
        description: 'British seed stitch - 4-row pattern with doubled rows'
    },

    'Double Seed': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            // 4-row pattern alternating 2x2 blocks
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 4) + 1;

            switch (adjustedRow) {
                case 1:
                case 2:
                    return generateAlternatingPattern('K2, P2', stitchCount);
                case 3:
                case 4:
                    return generateAlternatingPattern('P2, K2', stitchCount);
                default:
                    return generateAlternatingPattern('K2, P2', stitchCount);
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
                    ? generateAlternatingPattern('K1, P1', stitchCount)
                    : generateAlternatingPattern('P1, K1', stitchCount);
            } else {
                // In round: same pattern every round
                return generateAlternatingPattern('K1, P1', stitchCount);
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
                    ? generateAlternatingPattern('K2, P2', stitchCount)
                    : generateAlternatingPattern('P2, K2', stitchCount);
            } else {
                return generateAlternatingPattern('K2, P2', stitchCount);
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
                    ? generateAlternatingPattern('K3, P3', stitchCount)
                    : generateAlternatingPattern('P3, K3', stitchCount);
            } else {
                return generateAlternatingPattern('K3, P3', stitchCount);
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
                    ? generateAlternatingPattern('K2, P1', stitchCount)
                    : generateAlternatingPattern('P2, K1', stitchCount);
            } else {
                return generateAlternatingPattern('K2, P1', stitchCount);
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
                    ? generateAlternatingPattern('K1tbl, P1', stitchCount)
                    : generateAlternatingPattern('P1tbl, K1', stitchCount);
            } else {
                return generateAlternatingPattern('K1tbl, P1', stitchCount);
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
                    ? generateAlternatingPattern('K2tbl, P2', stitchCount)
                    : generateAlternatingPattern('P2tbl, K2', stitchCount);
            } else {
                return generateAlternatingPattern('K2tbl, P2', stitchCount);
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
                    ? generateAlternatingPattern('K1, P1', stitchCount)
                    : generateAlternatingPattern('K1, P1', stitchCount); // Same both rows
            } else {
                return generateAlternatingPattern('K1, P1', stitchCount);
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
                    return 'P all';
                case 2:
                    return generateTrinityRow2(stitchCount); // (K1, P1, K1) in next st, P3tog
                case 3:
                    return 'P all';
                case 4:
                    return generateTrinityRow4(stitchCount); // P3tog, (K1, P1, K1) in next st
                default:
                    return 'P all';
            }
        },
        rowHeight: 4,
        stitchMultiple: 4,
        description: 'Bobble-like texture with alternating clusters'
    },

    'Broken Rib': {
        calculateRow: (rowNum, stitchCount, construction, startingRowInPattern = 1) => {
            const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % 4) + 1;

            switch (adjustedRow) {
                case 1:
                    return generateAlternatingPattern('K1, P1', stitchCount);
                case 2:
                    if (construction === 'flat') {
                        return generateAlternatingPattern('P1, K1', stitchCount);
                    } else {
                        return generateAlternatingPattern('K1, P1', stitchCount);
                    }
                case 3:
                case 4:
                    return construction === 'flat' ? 'P all' : 'K all';
                default:
                    return generateAlternatingPattern('K1, P1', stitchCount);
            }
        },
        rowHeight: 4,
        stitchMultiple: 2,
        description: 'Interrupted ribbing pattern with plain rows'
    }
};

/**
 * UTILITY FUNCTIONS FOR PATTERN GENERATION
 */

/**
 * Generate alternating pattern like "K1, P1" across exact stitch count
 * Returns smart formatted instruction with repeats
 */
function generateAlternatingPattern(basePattern, stitchCount) {
    const parts = basePattern.split(', ');
    const patternLength = parts.length;

    // Calculate full repeats and remainder
    const fullRepeats = Math.floor(stitchCount / patternLength);
    const remainder = stitchCount % patternLength;

    let instruction = '';

    if (fullRepeats > 0) {
        if (fullRepeats === 1) {
            instruction = basePattern;
        } else {
            instruction = `[${basePattern}] ${fullRepeats} times`;
        }
    }

    if (remainder > 0) {
        const remainderParts = parts.slice(0, remainder);
        const remainderText = remainderParts.join(', ');

        if (instruction) {
            instruction += `, ${remainderText}`;
        } else {
            instruction = remainderText;
        }
    }

    return instruction || basePattern;
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
    if (stitchCount < 2) return 'K all';

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
    if (stitchCount < 2) return 'P all';

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