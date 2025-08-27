// src/shared/utils/ReferencePatterns.js
/**
 * Reference Pattern Library for IntelliKnit
 * 
 * Lookup tables for complex patterns that can't be calculated algorithmically.
 * Includes lace, cables, colorwork, and other advanced patterns.
 */

/**
 * LACE PATTERN LIBRARY
 * Common lace patterns with stitch-by-stitch definitions
 */
export const LACE_PATTERNS = {
    'Feather and Fan': {
        stitchMultiple: 18,
        rowHeight: 4,
        description: 'Classic wavy lace with scalloped edge',
        techniques: ['K2tog', 'YO'],
        blockingRequired: true,
        rowDefinitions: {
            1: {
                instruction: 'K all',
                type: 'setup',
                stitchChange: 0
            },
            2: {
                instruction: 'P all',
                type: 'setup',
                stitchChange: 0
            },
            3: {
                pattern: '[(K2tog) 3 times, (YO, K1) 6 times, (K2tog) 3 times]',
                type: 'lace',
                stitchChange: 0,
                expansion: 'Decrease 6, increase 6 - net neutral'
            },
            4: {
                instruction: 'K all',
                type: 'setup',
                stitchChange: 0
            }
        }
    },

    'Old Shale': {
        stitchMultiple: 18,
        rowHeight: 4,
        description: 'Traditional Shetland lace pattern',
        techniques: ['K2tog', 'YO'],
        blockingRequired: true,
        rowDefinitions: {
            1: {
                pattern: '[(K2tog) 3 times, (YO, K1) 6 times, (K2tog) 3 times]',
                type: 'lace',
                stitchChange: 0
            },
            2: { instruction: 'P all', type: 'setup', stitchChange: 0 },
            3: { instruction: 'K all', type: 'setup', stitchChange: 0 },
            4: { instruction: 'P all', type: 'setup', stitchChange: 0 }
        }
    },

    'Simple Lace Mesh': {
        stitchMultiple: 4,
        rowHeight: 4,
        description: 'Basic allover lace mesh',
        techniques: ['K2tog', 'YO'],
        blockingRequired: true,
        rowDefinitions: {
            1: {
                pattern: '[K1, YO, K2tog, K1]',
                type: 'lace',
                stitchChange: 0
            },
            2: { instruction: 'P all', type: 'setup', stitchChange: 0 },
            3: {
                pattern: '[K2tog, YO, K1, YO]',
                type: 'lace',
                stitchChange: 0,
                note: 'Offset holes from previous lace row'
            },
            4: { instruction: 'P all', type: 'setup', stitchChange: 0 }
        }
    },

    'Horseshoe Lace': {
        stitchMultiple: 10,
        rowHeight: 8,
        description: 'Horseshoe-shaped lace motifs',
        techniques: ['K2tog', 'SSK', 'YO'],
        blockingRequired: true,
        rowDefinitions: {
            1: {
                pattern: '[YO, K3, SSK, K2tog, K3, YO]',
                type: 'lace',
                stitchChange: 0
            },
            2: { instruction: 'P all', type: 'setup', stitchChange: 0 },
            3: {
                pattern: '[K1, YO, K2, SSK, K2tog, K2, YO, K1]',
                type: 'lace',
                stitchChange: 0
            },
            4: { instruction: 'P all', type: 'setup', stitchChange: 0 },
            5: {
                pattern: '[K2, YO, K1, SSK, K2tog, K1, YO, K2]',
                type: 'lace',
                stitchChange: 0
            },
            6: { instruction: 'P all', type: 'setup', stitchChange: 0 },
            7: {
                pattern: '[K3, YO, SSK, K2tog, YO, K3]',
                type: 'lace',
                stitchChange: 0
            },
            8: { instruction: 'P all', type: 'setup', stitchChange: 0 }
        }
    }
};

/**
 * CABLE PATTERN LIBRARY
 * Standard cable crossings and combinations
 */
export const CABLE_PATTERNS = {
    '6-Stitch Cable': {
        stitchMultiple: 6,
        rowHeight: 6,
        description: 'Basic 6-stitch cable with background',
        techniques: ['C6F', 'C6B'],
        cableNeedleRequired: true,
        rowDefinitions: {
            1: { instruction: 'K6', type: 'background', stitchChange: 0 },
            2: { instruction: 'P6', type: 'background', stitchChange: 0 },
            3: { instruction: 'K6', type: 'background', stitchChange: 0 },
            4: { instruction: 'P6', type: 'background', stitchChange: 0 },
            5: {
                instruction: 'C6F',
                type: 'cable',
                stitchChange: 0,
                expansion: 'Slip 3 to cable needle, hold front; K3, K3 from cable needle'
            },
            6: { instruction: 'P6', type: 'background', stitchChange: 0 }
        }
    },

    '4-Stitch Cable Panel': {
        stitchMultiple: 8, // 4 cable + 2 purl on each side
        rowHeight: 4,
        description: '4-stitch cable with purl background',
        techniques: ['C4F', 'C4B'],
        cableNeedleRequired: true,
        rowDefinitions: {
            1: { instruction: 'P2, K4, P2', type: 'background', stitchChange: 0 },
            2: { instruction: 'K2, P4, K2', type: 'background', stitchChange: 0 },
            3: {
                instruction: 'P2, C4F, P2',
                type: 'cable',
                stitchChange: 0,
                expansion: 'P2, slip 2 to cable needle hold front, K2, K2 from cable needle, P2'
            },
            4: { instruction: 'K2, P4, K2', type: 'background', stitchChange: 0 }
        }
    },

    'Honeycomb Cable': {
        stitchMultiple: 8,
        rowHeight: 4,
        description: 'Interlocking cable honeycomb pattern',
        techniques: ['C4F', 'C4B'],
        cableNeedleRequired: true,
        rowDefinitions: {
            1: {
                instruction: 'C4B, C4F',
                type: 'cable',
                stitchChange: 0,
                expansion: 'Back cross, front cross alternating'
            },
            2: { instruction: 'P all', type: 'background', stitchChange: 0 },
            3: {
                instruction: 'C4F, C4B',
                type: 'cable',
                stitchChange: 0,
                expansion: 'Front cross, back cross alternating'
            },
            4: { instruction: 'P all', type: 'background', stitchChange: 0 }
        }
    },

    'Aran Twist': {
        stitchMultiple: 4,
        rowHeight: 4,
        description: 'Simple traveling stitch pattern',
        techniques: ['T2F', 'T2B'],
        cableNeedleRequired: false, // Can be done without cable needle
        rowDefinitions: {
            1: {
                instruction: 'T2F, T2B',
                type: 'twist',
                stitchChange: 0,
                expansion: 'Twist 2 front, twist 2 back'
            },
            2: { instruction: 'P all', type: 'background', stitchChange: 0 },
            3: {
                instruction: 'T2B, T2F',
                type: 'twist',
                stitchChange: 0
            },
            4: { instruction: 'P all', type: 'background', stitchChange: 0 }
        }
    }
};

/**
 * COLORWORK PATTERN LIBRARY
 * Fair Isle, intarsia, and stranded colorwork patterns
 */
export const COLORWORK_PATTERNS = {
    'Fair Isle Chevron': {
        stitchMultiple: 12,
        rowHeight: 16,
        colorCount: 2,
        description: 'Classic chevron pattern in two colors',
        techniques: ['Stranded knitting', 'Float management'],
        maxFloatLength: 5,
        rowDefinitions: {
            1: {
                pattern: 'A1, B1, A1, B1, A1, B1, A1, B1, A1, B1, A1, B1',
                colors: ['A', 'B'],
                type: 'stranded'
            },
            2: {
                pattern: 'A1, B2, A1, B2, A1, B2, A1, B2, A1, B2, A1',
                colors: ['A', 'B'],
                type: 'stranded'
            },
            3: {
                pattern: 'A1, B3, A1, B3, A1, B3, A1, B3, A1',
                colors: ['A', 'B'],
                type: 'stranded'
            },
            4: {
                pattern: 'A1, B4, A1, B4, A1, B4, A1',
                colors: ['A', 'B'],
                type: 'stranded'
            },
            5: {
                pattern: 'A1, B5, A1, B5, A1',
                colors: ['A', 'B'],
                type: 'stranded'
            },
            6: {
                pattern: 'A1, B4, A1, B4, A1, B4, A1',
                colors: ['A', 'B'],
                type: 'stranded'
            },
            7: {
                pattern: 'A1, B3, A1, B3, A1, B3, A1, B3, A1',
                colors: ['A', 'B'],
                type: 'stranded'
            },
            8: {
                pattern: 'A1, B2, A1, B2, A1, B2, A1, B2, A1, B2, A1',
                colors: ['A', 'B'],
                type: 'stranded'
            },
            // Rows 9-16 mirror 8-1 for complete chevron
            9: { pattern: 'A1, B1, A1, B1, A1, B1, A1, B1, A1, B1, A1, B1', colors: ['A', 'B'], type: 'stranded' },
            10: { pattern: 'A1, B2, A1, B2, A1, B2, A1, B2, A1, B2, A1', colors: ['A', 'B'], type: 'stranded' },
            11: { pattern: 'A1, B3, A1, B3, A1, B3, A1, B3, A1', colors: ['A', 'B'], type: 'stranded' },
            12: { pattern: 'A1, B4, A1, B4, A1, B4, A1', colors: ['A', 'B'], type: 'stranded' },
            13: { pattern: 'A1, B5, A1, B5, A1', colors: ['A', 'B'], type: 'stranded' },
            14: { pattern: 'A1, B4, A1, B4, A1, B4, A1', colors: ['A', 'B'], type: 'stranded' },
            15: { pattern: 'A1, B3, A1, B3, A1, B3, A1, B3, A1', colors: ['A', 'B'], type: 'stranded' },
            16: { pattern: 'A1, B2, A1, B2, A1, B2, A1, B2, A1, B2, A1', colors: ['A', 'B'], type: 'stranded' }
        }
    },

    'Simple Dotted Pattern': {
        stitchMultiple: 6,
        rowHeight: 4,
        colorCount: 2,
        description: 'Simple dots in contrasting color',
        techniques: ['Stranded knitting'],
        maxFloatLength: 5,
        rowDefinitions: {
            1: {
                pattern: 'A5, B1',
                colors: ['A', 'B'],
                type: 'stranded'
            },
            2: {
                pattern: 'A all',
                colors: ['A'],
                type: 'solid'
            },
            3: {
                pattern: 'A2, B1, A3',
                colors: ['A', 'B'],
                type: 'stranded',
                note: 'Offset dots from previous row'
            },
            4: {
                pattern: 'A all',
                colors: ['A'],
                type: 'solid'
            }
        }
    },

    'Two-Color Brioche': {
        stitchMultiple: 2,
        rowHeight: 4,
        colorCount: 2,
        description: 'Basic two-color brioche stitch',
        techniques: ['Brioche knit (brk)', 'Yarn over slip (yosl)'],
        maxFloatLength: 1,
        specialInstructions: 'Work with two colors, two needles',
        rowDefinitions: {
            1: {
                pattern: '[YO, sl1, K1] with Color A',
                colors: ['A'],
                type: 'setup',
                note: 'Setup row, Color A only'
            },
            2: {
                pattern: '[Brk, yosl] with Color B',
                colors: ['B'],
                type: 'brioche',
                note: 'Work Color B stitches only'
            },
            3: {
                pattern: '[Yosl, brk] with Color A',
                colors: ['A'],
                type: 'brioche',
                note: 'Work Color A stitches only'
            },
            4: {
                pattern: '[Brk, yosl] with Color B',
                colors: ['B'],
                type: 'brioche',
                note: 'Repeat pattern row'
            }
        }
    }
};

/**
 * MOSAIC PATTERN LIBRARY
 * Slip-stitch colorwork patterns
 */
export const MOSAIC_PATTERNS = {
    'Simple Mosaic Checks': {
        stitchMultiple: 6,
        rowHeight: 4,
        colorCount: 2,
        description: 'Basic checkerboard mosaic pattern',
        techniques: ['Slip stitch purlwise', 'Color changes'],
        maxFloatLength: 3,
        rowDefinitions: {
            1: {
                pattern: 'With A: K3, sl3 wyib',
                colors: ['A'],
                type: 'mosaic',
                stitchChange: 0
            },
            2: {
                pattern: 'With A: Sl3 wyif, P3',
                colors: ['A'],
                type: 'mosaic',
                stitchChange: 0,
                note: 'Return row, same color'
            },
            3: {
                pattern: 'With B: Sl3 wyib, K3',
                colors: ['B'],
                type: 'mosaic',
                stitchChange: 0
            },
            4: {
                pattern: 'With B: P3, sl3 wyif',
                colors: ['B'],
                type: 'mosaic',
                stitchChange: 0,
                note: 'Return row, same color'
            }
        }
    }
};

/**
 * UTILITY FUNCTIONS FOR REFERENCE PATTERNS
 */

/**
 * Get reference pattern instruction for specific row
 */
export const getReferencePatternInstruction = (patternLibrary, patternName, rowNum, stitchCount, construction = 'flat', startingRowInPattern = 1) => {
    const pattern = patternLibrary[patternName];

    if (!pattern) {
        return null;
    }

    // Calculate which row in pattern cycle
    const adjustedRow = ((rowNum - 1 + startingRowInPattern - 1) % pattern.rowHeight) + 1;
    const rowDef = pattern.rowDefinitions[adjustedRow];

    if (!rowDef) {
        return `Work row ${adjustedRow} of ${patternName}`;
    }

    // Handle different instruction types
    if (rowDef.instruction) {
        // Simple instruction - just return it
        return formatReferenceInstruction(rowDef.instruction, stitchCount, pattern);
    }

    if (rowDef.pattern) {
        // Pattern with repeats - calculate repeats needed
        return formatPatternWithRepeats(rowDef.pattern, stitchCount, pattern, rowDef);
    }

    return `Work ${patternName} row ${adjustedRow}`;
};

/**
 * Format reference instruction with stitch count
 */
const formatReferenceInstruction = (instruction, stitchCount, patternMeta) => {
    // Handle simple instructions like "K all", "P all"
    if (instruction === 'K all') {
        return 'K all';
    }
    if (instruction === 'P all') {
        return 'P all';
    }

    // For more complex instructions, return as-is
    // (Future: could add more sophisticated formatting here)
    return instruction;
};

/**
 * Format pattern with repeats based on stitch count
 */
const formatPatternWithRepeats = (patternString, stitchCount, patternMeta, rowDef) => {
    const stitchMultiple = patternMeta.stitchMultiple;

    if (stitchCount % stitchMultiple !== 0) {
        // Pattern doesn't fit evenly - show with remainder note
        const fullRepeats = Math.floor(stitchCount / stitchMultiple);
        const remainder = stitchCount % stitchMultiple;

        if (fullRepeats === 0) {
            return `${patternString} (partial repeat for ${stitchCount} sts)`;
        }

        if (fullRepeats === 1) {
            return `${patternString}, work ${remainder} more sts`;
        }

        return `${patternString} ${fullRepeats} times, work ${remainder} more sts`;
    }

    // Pattern fits evenly
    const repeats = stitchCount / stitchMultiple;

    if (repeats === 1) {
        return patternString;
    }

    return `${patternString} ${repeats} times`;
};

/**
 * Get pattern metadata
 */
export const getReferencePatternMetadata = (patternLibrary, patternName) => {
    const pattern = patternLibrary[patternName];

    if (!pattern) return null;

    return {
        stitchMultiple: pattern.stitchMultiple,
        rowHeight: pattern.rowHeight,
        description: pattern.description,
        techniques: pattern.techniques || [],
        colorCount: pattern.colorCount,
        maxFloatLength: pattern.maxFloatLength,
        blockingRequired: pattern.blockingRequired,
        cableNeedleRequired: pattern.cableNeedleRequired,
        specialInstructions: pattern.specialInstructions,
        hasReferenceSupport: true
    };
};

/**
 * Check if pattern exists in reference libraries
 */
export const isReferencePattern = (patternName) => {
    return LACE_PATTERNS[patternName] ||
        CABLE_PATTERNS[patternName] ||
        COLORWORK_PATTERNS[patternName] ||
        MOSAIC_PATTERNS[patternName];
};

/**
 * Get pattern from any library
 */
export const findReferencePattern = (patternName) => {
    if (LACE_PATTERNS[patternName]) return { library: LACE_PATTERNS, type: 'lace' };
    if (CABLE_PATTERNS[patternName]) return { library: CABLE_PATTERNS, type: 'cable' };
    if (COLORWORK_PATTERNS[patternName]) return { library: COLORWORK_PATTERNS, type: 'colorwork' };
    if (MOSAIC_PATTERNS[patternName]) return { library: MOSAIC_PATTERNS, type: 'mosaic' };
    return null;
};

/**
 * Get all supported reference patterns
 */
export const getAllReferencePatterns = () => {
    return {
        lace: Object.keys(LACE_PATTERNS),
        cable: Object.keys(CABLE_PATTERNS),
        colorwork: Object.keys(COLORWORK_PATTERNS),
        mosaic: Object.keys(MOSAIC_PATTERNS)
    };
};