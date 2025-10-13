// src/shared/utils/KnittingInstructionService.js
import { getStepPatternName } from './stepDisplayUtils';
import { getAlgorithmicRowInstruction, isAlgorithmicPattern } from './AlgorithmicPatterns';
import { calculateRowStitches } from './stitchCalculatorUtils';
import { formatKnittingInstruction } from './../../shared/utils/knittingNotation'
import { generateMarkerInstructionPreview } from './markerInstructionUtils';
import { getAdjustedColorRow, getAdjustedPatternRow } from './progressTracking';
import { getCastOnDisplayName, getBindOffDisplayName } from './constants';  // ✅ ADD THIS
import { getYarnByLetter } from './colorworkDisplayUtils';

/**
 * Smart Instruction Generation - Phase 2 implementation
 * Generates proper knitting instructions based on step configuration
 */
export const getRowInstruction = (step, currentRow, currentStitchCount, project = null, component = null, stepIndex = null) => {
    try {
        // Get basic step info
        const construction = step.construction || 'flat';
        const rowTerm = construction === 'round' ? 'Round' : 'Row';

        // Route to appropriate instruction type
        const instructionResult = routeInstruction(step, currentRow, currentStitchCount, construction, project, component, stepIndex);

        // Add row number prefix for multi-row steps
        // if (step.totalRows > 1 && instructionResult.instruction) {
        //  instructionResult.instruction = `${rowTerm} ${currentRow}: ${instructionResult.instruction}`;
        //  }

        return instructionResult;

    } catch (error) {
        console.error('Error generating instruction:', error);
        return {
            instruction: `${step.construction === 'round' ? 'Round' : 'Row'} ${currentRow}: Work in pattern`,
            isSupported: false,
            needsHelp: false,
            helpTopic: null
        };
    }
};

/**
 * Route instruction generation based on step type and configuration
 */
function routeInstruction(step, currentRow, currentStitchCount, construction, project, component = null, stepIndex = null) {
    const patternName = getStepPatternName(step);
    const hasShaping = step.wizardConfig?.hasShaping || step.advancedWizardConfig?.hasShaping;

    // 🆕 PRIORITY 0: 2-color Brioche (before everything else)
    if (isTwoColorBrioche(step)) {
        return getTwoColorBriocheInstruction(step, currentRow, construction, project);
    }

    // Priority 1: Construction patterns (Cast On, Bind Off)
    if (isConstructionPattern(patternName)) {
        return getConstructionInstruction(step, patternName);
    }

    // Priority 2: Steps with shaping
    if (hasShaping) {
        return getShapingInstruction(step, currentRow, currentStitchCount, construction, project);
    }

    // Priority 3: Colorwork patterns (before algorithmic check)
    if (isColorworkPattern(patternName, step)) {
        const colorworkResult = getColorworkInstruction(step, currentRow, currentStitchCount, construction, patternName, project, component, stepIndex);
        if (colorworkResult?.instruction) {
            return {
                ...colorworkResult,
                instruction: colorworkResult.instruction.replace(/^(?:Row|Round)\s+\d+:\s*/, '')
            };
        }
    }
    // Priority 4: Basic algorithmic patterns
    if (isAlgorithmicPattern(patternName)) {
        return getAlgorithmicInstruction(step, currentRow, currentStitchCount, construction, patternName);
    }

    // Priority 5: Fallback
    return getFallbackInstruction(step, currentRow, currentStitchCount, patternName);
}

/**
 * Determine step type for counter behavior
 */
export const getStepType = (step, totalRows, duration) => {
    // Cast-on, bind-off, and other single-action steps
    if (totalRows === 1) {
        return 'single_action';
    }

    // Length-based steps (work until measurement)
    if (duration?.type === 'length' || duration?.type === 'until_length') {
        return 'length_based';
    }

    // Steps that can be completed at any time
    if (duration?.type === 'stitches' && duration?.value === 'all') {
        return 'completion_when_ready';
    }

    // Standard multi-row steps
    return 'fixed_multi_row';
};

/**
 * Helper Functions for Instruction Generation
 */

/**
 * Check if pattern is a construction pattern (Cast On, Bind Off, etc.)
 */
function isConstructionPattern(patternName) {
    const constructionPatterns = [
        'Cast On', 'Bind Off', 'Pick Up & Knit', 'Continue from Stitches',
        'Put on Holder', 'Attach to Piece', 'Custom Initialization'
    ];
    return constructionPatterns.includes(patternName);
}

/**
 * Generate instructions for construction patterns
 */
function getConstructionInstruction(step, patternName) {
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

    switch (patternName) {
        case 'Cast On':
            return getCastOnInstruction(step, stitchPattern);

        case 'Bind Off':
            return getBindOffInstruction(step, stitchPattern);

        case 'Pick Up & Knit':
            return getPickUpInstruction(step, stitchPattern);

        case 'Put on Holder':
            return getHolderInstruction(step, stitchPattern);

        case 'Attach to Piece':
            return getAttachInstruction(step, stitchPattern);

        default:
            return {
                instruction: step.description || 'Complete this step',
                isSupported: true,
                needsHelp: false,
                helpTopic: null
            };
    }
}

// ========================================
// ADD THIS SECTION to KnittingInstructionService.js
// Place it right after the isColorworkPattern function (around line 735)
// ========================================

/**
 * Check if pattern is 2-color Brioche
 */
function isTwoColorBrioche(step) {
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

    // Check if it's Brioche pattern with customSequence
    if (stitchPattern?.pattern === 'Two-Color Brioche' && stitchPattern?.customSequence?.rows) {
        const rows = stitchPattern.customSequence.rows;
        const rowKeys = Object.keys(rows);

        // 2-color brioche has rows with 'a' and 'b' suffixes (e.g., "1a", "1b", "2a", "2b")
        const hasTwoColorStructure = rowKeys.some(key => key.endsWith('a') || key.endsWith('b'));

        return hasTwoColorStructure;
    }

    return false;
}

/**
 * Get 2-color brioche instruction for current row
 * Returns both 'a' and 'b' instructions together
 */
function getTwoColorBriocheInstruction(step, currentRow, construction, project) {
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;
    const rows = stitchPattern?.customSequence?.rows;



    if (!rows) {
        return {
            instruction: 'Work in 2-color brioche as established',
            isSupported: false,
            needsHelp: true,
            helpTopic: 'brioche_help'
        };
    }

    // Get the color data - using letters array (correct data structure)
    const colorwork = step.wizardConfig?.colorwork || step.advancedWizardConfig?.colorwork;
    const colorForRowA = colorwork?.rowAColor ? getYarnByLetter(project?.yarns || [], colorwork.rowAColor) : null;
    const colorForRowB = colorwork?.rowBColor ? getYarnByLetter(project?.yarns || [], colorwork.rowBColor) : null;
    // Determine side (RS/WS) based on row number and construction
    const side = construction === 'round' ? 'Round' : (currentRow % 2 === 1 ? 'RS' : 'WS');

    // Get both 'a' and 'b' instructions for this row number
    const rowKeyA = `${currentRow}a`;
    const rowKeyB = `${currentRow}b`;

    const instructionA = rows[rowKeyA]?.instruction || 'Work row as established';
    const instructionB = rows[rowKeyB]?.instruction || 'Work row as established';

    console.log('BRIOCHE COLORS:', {
        letters: colorwork?.letters,
        colorForRowA_letter: colorForRowA?.letter,
        colorForRowB_letter: colorForRowB?.letter
    });

    // Format color labels - Row A uses first selected color, Row B uses second selected color
    const colorLabelA = colorForRowA
        ? (colorForRowA.color && colorForRowA.color !== `Color ${colorForRowA.letter}`)
            ? `${colorForRowA.letter} (${colorForRowA.color})`
            : colorForRowA.letter
        : 'A';

    const colorLabelB = colorForRowB
        ? (colorForRowB.color && colorForRowB.color !== `Color ${colorForRowB.letter}`)
            ? `${colorForRowB.letter} (${colorForRowB.color})`
            : colorForRowB.letter
        : 'B';

    // Format the combined instruction with visual separation
    const combinedInstruction = [
        `Row ${currentRow}a - Color ${colorLabelA}:`,
        instructionA,
        '',  // Blank line for separation
        `Row ${currentRow}b - Color ${colorLabelB}:`,
        instructionB
    ].join('\n');

    return {
        instruction: combinedInstruction,
        isSupported: true,
        needsHelp: true,
        helpTopic: 'brioche_help',
        isBrioche: true  // Flag to help with formatting
    };
}


/**
 * Cast On instruction generation
 * ✅ MIGRATED: Now uses constants.js
 */
function getCastOnInstruction(step, stitchPattern) {
    const method = stitchPattern?.method || 'long_tail';
    const stitchCount = stitchPattern?.stitchCount || step.endingStitches || '0';

    const methodName = getCastOnDisplayName(method) || 'Cast On';

    return {
        instruction: `Using ${methodName}, cast on ${stitchCount} stitches`,
        isSupported: true,
        needsHelp: method === 'provisional' || method === 'judy' || method === 'garter_tab' || method === 'tubular',
        helpTopic: method === 'provisional' ? 'provisional_cast_on'
            : method === 'judy' ? 'magic_cast_on'
                : method === 'garter_tab' ? 'garter_tab_cast_on'
                    : method === 'tubular' ? 'tubular_cast_on'
                        : null
    };
}

/**
 * Bind Off instruction generation
 * ✅ MIGRATED: Now uses constants.js
 */
function getBindOffInstruction(step, stitchPattern) {
    const method = stitchPattern?.method || 'standard';
    const stitchCount = stitchPattern?.stitchCount || 'all';

    const methodName = getBindOffDisplayName(method) || 'Standard Bind Off';
    const stitchText = stitchCount === 'all' ? 'all stitches' : `${stitchCount} stitches`;

    return {
        instruction: `Bind off ${stitchText} using ${methodName}`,
        isSupported: true,
        needsHelp: method === 'three_needle' || method === 'sewn' || method === 'stretchy' || method === 'picot',
        helpTopic: method === 'three_needle' ? 'three_needle_bindoff'
            : method === 'sewn' ? 'sewn_bindoff'
                : method === 'stretchy' ? 'jssbo_bindoff'
                    : method === 'picot' ? 'picot_bindoff'
                        : null
    };
}

/**
 * Pick Up & Knit instruction generation
 */
function getPickUpInstruction(step, stitchPattern) {
    const stitchCount = stitchPattern?.stitchCount || step.endingStitches || '0';
    const customDetails = stitchPattern?.customDetails || '';

    let instruction = `Pick up and knit ${stitchCount} stitches`;
    if (customDetails) {
        instruction += ` ${customDetails}`;
    }

    return {
        instruction,
        isSupported: true,
        needsHelp: true,
        helpTopic: 'pick_up_knit'
    };
}

/**
 * Put on Holder instruction generation
 */
function getHolderInstruction(step, stitchPattern) {
    const stitchCount = stitchPattern?.stitchCount || step.startingStitches || 'remaining';

    return {
        instruction: `Put ${stitchCount} stitches on stitch holder`,
        isSupported: true,
        needsHelp: false,
        helpTopic: null
    };
}

/**
 * Attach to Piece instruction generation
 */
function getAttachInstruction(step, stitchPattern) {
    const method = stitchPattern?.method || 'mattress_stitch';

    const methodNames = {
        'mattress_stitch': 'Mattress Stitch',
        'backstitch': 'Backstitch',
        'kitchener_stitch': 'Kitchener Stitch',
        'three_needle': 'Three Needle Bind Off'
    };

    const methodName = methodNames[method] || 'seaming';

    return {
        instruction: `Attach to piece using ${methodName}`,
        isSupported: true,
        needsHelp: method === 'kitchener_stitch',
        helpTopic: method === 'kitchener_stitch' ? 'kitchener_stitch' : null
    };
}

/**
 * Generate instructions for steps with shaping
 */
function getShapingInstruction(step, currentRow, currentStitchCount, construction, project) {
    const shapingConfig = step.wizardConfig?.shapingConfig || step.advancedWizardConfig?.shapingConfig;

    if (!shapingConfig) {
        return getFallbackInstruction(step, currentRow, currentStitchCount);
    }

    // For even distribution shaping
    if (shapingConfig.type === 'even_distribution') {
        const calculation = shapingConfig.config?.calculation;
        if (calculation?.instruction) {
            // Use the existing formatKnittingInstruction to clean up repetitive instructions
            const smartInstruction = formatKnittingInstruction(calculation.instruction);
            return {
                instruction: smartInstruction,
                isSupported: true,
                needsHelp: false,
                helpTopic: null
            };
        }
    }

    // For sequential phases shaping - multi row with intelligent phase detection
    if (shapingConfig.type === 'phases') {
        return getSequentialPhaseInstruction(step, currentRow, currentStitchCount, construction, shapingConfig, project);
    }

    // For marker phases shaping - row-by-row marker instructions
    if (shapingConfig.type === 'marker_phases') {
        return getMarkerPhaseInstruction(step, currentRow, currentStitchCount, construction, shapingConfig, project);
    }

    // For bind-off shaping - multi-phase bind-off sequences
    if (shapingConfig.type === 'bind_off_shaping') {
        return getBindOffShapingInstruction(step, currentRow, currentStitchCount, construction, shapingConfig, project);
    }

    // Fallback for unknown shaping types
    const patternName = getStepPatternName(step);
    return {
        instruction: `Work in ${patternName} with shaping as established`,
        isSupported: false,
        needsHelp: true,
        helpTopic: 'shaping_help'
    };
}

/**
 * Generate smart even distribution instruction using sections data
 * Converts sections array like [11, 11, 11, 11, 10, 10, 10] into readable format
 */
function generateSmartEvenDistributionInstruction(calculation, construction) {
    const { sections, changeCount, startingStitches, endingStitches } = calculation;

    if (!sections || sections.length === 0) {
        // Fallback to stored instruction if sections not available
        return calculation.instruction || 'Work with shaping as established';
    }

    const action = startingStitches > endingStitches ? 'K2tog' : 'inc';
    const isDecrease = startingStitches > endingStitches;

    // Group consecutive identical sections
    const groupedSections = groupConsecutiveSections(sections);

    // Generate instruction parts
    const parts = [];
    for (let i = 0; i < groupedSections.length; i++) {
        const group = groupedSections[i];

        if (group.size > 0) {
            parts.push(`K${group.size}`);
        }

        // Add shaping action after each section except possibly the last
        const needsShaping = shouldAddShapingAfterSection(i, groupedSections.length, construction);
        if (needsShaping) {
            parts.push(action);
        }
    }

    // Format with smart repeating
    return formatWithRepeats(parts, groupedSections);
}

/**
 * Group consecutive sections of the same size
 * [11, 11, 11, 11, 10, 10, 10] → [{size: 11, count: 4}, {size: 10, count: 3}]
 */
function groupConsecutiveSections(sections) {
    if (!sections || sections.length === 0) return [];

    const groups = [];
    let currentGroup = { size: sections[0], count: 1 };

    for (let i = 1; i < sections.length; i++) {
        if (sections[i] === currentGroup.size) {
            currentGroup.count++;
        } else {
            groups.push(currentGroup);
            currentGroup = { size: sections[i], count: 1 };
        }
    }
    groups.push(currentGroup);

    return groups;
}

/**
 * Determine if shaping action should be added after this section
 */
function shouldAddShapingAfterSection(sectionIndex, totalGroups, construction) {
    if (construction === 'round') {
        // In circular knitting, add shaping after every section (including last)
        return true;
    } else {
        // In flat knitting, add shaping after every section except the last
        return sectionIndex < totalGroups - 1;
    }
}

/**
 * Format instruction with smart repeat notation
 */
function formatWithRepeats(parts, groupedSections) {
    if (groupedSections.length === 1) {
        // All sections same size - simple format
        const group = groupedSections[0];
        if (group.count === 1) {
            return parts.join(', ');
        } else {
            // Find the repeating pattern
            const patternLength = parts.length / group.count;
            if (Number.isInteger(patternLength) && patternLength > 1) {
                const pattern = parts.slice(0, patternLength);
                return `[${pattern.join(', ')}] ${group.count} times`;
            }
        }
    }

    // Mixed sizes or complex pattern - use the parts as-is but look for sub-patterns
    if (parts.length > 6) {
        // For longer instructions, try to find repeating patterns
        const pattern = findRepeatingPattern(parts);
        if (pattern) {
            return pattern;
        }
    }

    return parts.join(', ');
}

/**
 * Find repeating patterns in instruction parts
 */
function findRepeatingPattern(parts) {
    // Try different pattern lengths starting from 2
    for (let patternLen = 2; patternLen <= Math.floor(parts.length / 2); patternLen++) {
        const pattern = parts.slice(0, patternLen);
        let repeatCount = 1;
        let isRepeating = true;

        // Check how many times this pattern repeats
        for (let i = patternLen; i < parts.length; i += patternLen) {
            const segment = parts.slice(i, i + patternLen);
            if (arraysEqual(pattern, segment)) {
                repeatCount++;
            } else if (i + patternLen >= parts.length) {
                // Partial pattern at end - that's okay
                break;
            } else {
                isRepeating = false;
                break;
            }
        }

        if (isRepeating && repeatCount >= 2) {
            const remainder = parts.slice(repeatCount * patternLen);
            const basePattern = `[${pattern.join(', ')}] ${repeatCount} times`;
            return remainder.length > 0 ? `${basePattern}, ${remainder.join(', ')}` : basePattern;
        }
    }

    return null;
}

/**
 * Helper function to compare arrays
 */
function arraysEqual(a, b) {
    return a.length === b.length && a.every((val, i) => val === b[i]);
}

/**
 * Generate instruction for specific row in sequential phases shaping
 */
function getSequentialPhaseInstruction(step, currentRow, currentStitchCount, construction, shapingConfig, project) {
    const calculation = shapingConfig.config?.calculation;

    if (!calculation?.phases) {
        return getFallbackInstruction(step, currentRow, currentStitchCount);
    }

    // Generate rowRange data on the fly since existing steps don't have it
    let currentRowPosition = 1;
    const phasesWithRowRange = [];

    for (const phase of calculation.phases) {
        const phaseRows = phase.rows || 1;
        const startRow = currentRowPosition;
        const endRow = currentRowPosition + phaseRows - 1;

        phasesWithRowRange.push({
            ...phase,
            rowRange: `${startRow}-${endRow}`,
            startRow,
            endRow
        });

        currentRowPosition += phaseRows;
    }

    // Find which phase we're in
    for (const phase of phasesWithRowRange) {
        if (currentRow >= phase.startRow && currentRow <= phase.endRow) {
            return getPhaseRowInstruction(phase, currentRow, currentStitchCount, construction, step, project);
        }
    }

    // Fallback: generate a basic instruction based on pattern
    const patternName = getStepPatternName(step);
    return {
        instruction: `Work in ${patternName}`,
        isSupported: true,
        needsHelp: false,
        helpTopic: null
    };
}

/**
 * Updated getPhaseRowInstruction function with proper project parameter handling
 */
function getPhaseRowInstruction(phase, currentRow, currentStitchCount, construction, step, project) {
    const phaseType = phase.type || 'setup';
    const patternName = getStepPatternName(step);

    // Generate base pattern instruction
    const getBaseInstruction = () => {
        if (isAlgorithmicPattern(patternName)) {
            const result = getAlgorithmicRowInstruction(patternName, currentRow, currentStitchCount, construction);
            if (result) {
                // Fix the "K all" -> "Knit all" issue
                return result.replace(/^K all$/, 'Knit all').replace(/^P all$/, 'Purl all');
            }
        }
        return `Work in ${patternName}`;
    };

    const baseInstruction = getBaseInstruction();

    // Helper function: Smart stitch text addition
    const addStitchesIfNeeded = (instruction) => {
        if (instruction.toLowerCase().endsWith('stitches')) {
            return instruction;
        }
        return `${instruction} stitches`;
    };

    switch (phaseType) {
        case 'setup':
            const coloredSetupInstruction = addColorToInstruction(baseInstruction, step, currentRow, construction, project);
            return {
                instruction: addStitchesIfNeeded(coloredSetupInstruction),
                isSupported: true,
                needsHelp: false,
                helpTopic: null
            };

        case 'decrease':
            const isDecreaseRow = shouldBeShapingRow(phase, currentRow);

            if (isDecreaseRow) {
                const shapingText = generateShapingTextWithColor(phase, 'decrease', step, currentRow, currentStitchCount, construction, project);
                return {
                    instruction: shapingText,
                    isSupported: true,
                    needsHelp: false,
                    helpTopic: null
                };
            } else {
                const coloredBaseInstruction = addColorToInstruction(baseInstruction, step, currentRow, construction, project);
                return {
                    instruction: addStitchesIfNeeded(coloredBaseInstruction),
                    isSupported: true,
                    needsHelp: false,
                    helpTopic: null
                };
            }

        case 'increase':
            const isIncreaseRow = shouldBeShapingRow(phase, currentRow);

            if (isIncreaseRow) {
                const shapingText = generateShapingTextWithColor(phase, 'increase', step, currentRow, currentStitchCount, construction, project);
                return {
                    instruction: shapingText,
                    isSupported: true,
                    needsHelp: false,
                    helpTopic: null
                };
            } else {
                const coloredBaseInstruction = addColorToInstruction(baseInstruction, step, currentRow, construction, project);
                return {
                    instruction: addStitchesIfNeeded(coloredBaseInstruction),
                    isSupported: true,
                    needsHelp: false,
                    helpTopic: null
                };
            }

        case 'bind_off':
            const bindOffAmount = phase.amount || 1;
            const baseBindOffText = `Bind off ${bindOffAmount} stitches`;
            const coloredBindOffText = addColorToInstruction(baseBindOffText, step, currentRow, construction, project);

            return {
                instruction: coloredBindOffText,
                isSupported: true,
                needsHelp: false,
                helpTopic: null
            };

        default:
            return {
                instruction: `${baseInstruction} (${currentStitchCount} stitches)`,
                isSupported: true,
                needsHelp: false,
                helpTopic: null
            };
    }
}


/**
 * Generate instruction for setup phases
 * Shows "Work in pattern (setup phase)"
 */
function generateSetupPhaseInstruction(step, currentRow, currentStitchCount, construction, project) {
    const basePattern = getBasePatternForCurrentRow(step, currentRow, currentStitchCount, construction, project);
    const stitchCountText = ` (${currentStitchCount} stitches)`;

    return {
        instruction: basePattern,
        isSupported: true,
        needsHelp: false,
        helpTopic: null
    };
}

/**
 * Generate instruction for shaping phases (decrease/increase)
 * Shows intelligent shaping instructions with stitch counts
 */
function generateShapingPhaseInstruction(phase, currentRow, currentStitchCount, rowStitchCount, construction, startRow, step, project) {
    // Check if this is actually a shaping row or a between-shaping row
    const isShapingRowActual = isShapingRow(phase, currentRow, startRow);

    if (!isShapingRowActual) {
        // This is a "between" row - work in pattern
        const basePattern = getBasePatternForCurrentRow(step, currentRow, currentStitchCount, construction, project);
        return {
            instruction: basePattern,
            isSupported: true,
            needsHelp: false,
            helpTopic: null
        };
    }

    // This IS a shaping row - extract and show the shaping instruction
    const shapingInstruction = extractShapingInstruction(phase.description, construction);
    const phaseType = extractPhaseType(phase.description);
    const actionText = phaseType === 'decrease' ? 'decrease' : 'increase';

    if (shapingInstruction) {
        // Show the actual shaping instruction
        return {
            instruction: `${shapingInstruction} (${actionText} row - ${rowStitchCount} stitches)`,
            isSupported: true,
            needsHelp: false,
            helpTopic: null
        };
    } else {
        // Fallback with phase context
        const basePattern = getBasePatternForCurrentRow(step, currentRow, currentStitchCount, construction, project);
        return {
            instruction: `${basePattern} with ${actionText} (${actionText} row - ${rowStitchCount} stitches)`,
            isSupported: true,
            needsHelp: false,
            helpTopic: null
        };
    }
}

/**
 * Generate instruction for bind-off phases
 */
function generateBindOffPhaseInstruction(phase, currentRow, currentStitchCount, rowStitchCount, construction, startRow) {
    const bindOffInstruction = extractShapingInstruction(phase.description, construction);

    if (bindOffInstruction) {
        return {
            instruction: `${bindOffInstruction} (bind-off row - ${rowStitchCount} stitches)`,
            isSupported: true,
            needsHelp: false,
            helpTopic: null
        };
    } else {
        return {
            instruction: `Bind off stitches as established (bind-off row - ${rowStitchCount} stitches)`,
            isSupported: true,
            needsHelp: false,
            helpTopic: null
        };
    }
}

/**
 * Determine if current row is a shaping row within the phase
 * This is a simplified implementation - you may need to enhance based on phase config
 */
function isShapingRow(phase, currentRow, startRow) {
    const description = phase.description || '';
    const rowInPhase = currentRow - startRow + 1;

    // For setup phases, no rows are shaping rows
    if (extractPhaseType(description) === 'setup') {
        return false;
    }

    // Check for "every other row" pattern
    if (description.toLowerCase().includes('every other row')) {
        // Assume shaping happens on odd rows within the phase (1, 3, 5...)
        return rowInPhase % 2 === 1;
    }

    // Check for "every row" pattern  
    if (description.toLowerCase().includes('every row')) {
        return true;
    }

    // For bind-off phases, assume every row is a bind-off row
    if (extractPhaseType(description) === 'bind_off') {
        return true;
    }

    // Default: assume it's a shaping row (conservative approach)
    return true;
}

/**
 * Calculate stitch change for current row
 * This is a simplified implementation
 */
function getRowStitchChange(phase, currentRow, startRow) {
    const phaseType = extractPhaseType(phase.description || '');
    const description = phase.description || '';

    if (!isShapingRow(phase, currentRow, startRow)) {
        return 0; // No change on non-shaping rows
    }

    // Extract stitch change from description patterns
    if (phaseType === 'decrease') {
        // Look for patterns like "decrease 1 stitch at each end" = -2 per row
        if (description.toLowerCase().includes('each end')) {
            return -2; // Common decrease pattern
        }
        return -1; // Default single decrease
    }

    if (phaseType === 'increase') {
        if (description.toLowerCase().includes('each end')) {
            return 2; // Common increase pattern  
        }
        return 1; // Default single increase
    }

    if (phaseType === 'bind_off') {
        // Try to extract bind-off amount from description
        const match = description.match(/bind off (\d+)/i);
        if (match) {
            return -parseInt(match[1]);
        }
        return -1; // Default single bind-off
    }

    return 0; // Fallback
}

/**
 * Extract phase type from phase description
 * Returns: 'setup', 'decrease', 'increase', 'bind_off', or 'unknown'
 */
function extractPhaseType(description) {
    if (!description) return 'unknown';

    const lowerDesc = description.toLowerCase();

    if (lowerDesc.includes('setup') || lowerDesc.includes('plain')) return 'setup';
    if (lowerDesc.includes('decrease')) return 'decrease';
    if (lowerDesc.includes('increase')) return 'increase';
    if (lowerDesc.includes('bind off') || lowerDesc.includes('bind-off')) return 'bind_off';

    return 'unknown';
}


/**
 * Extract the specific shaping instruction from phase description
 * Converts "K1, ssk, work to last 3 sts, k2tog, k1 every other row 6 times" 
 * to "K1, ssk, work to last 3 sts, k2tog, k1"
 */
/**
 * Enhanced extractShapingInstruction function
 * Better extraction of actual knitting instructions from phase descriptions
 */
function extractShapingInstruction(description, construction) {
    if (!description) return null;

    // Remove phase type prefix (e.g., "Decrease phase: ", "Setup: ")
    let instruction = description.replace(/^[^:]+:\s*/, '');

    // Remove frequency information (e.g., "every other row 6 times")
    instruction = instruction.replace(/\s+every\s+other\s+row\s+\d+\s+times?$/i, '');
    instruction = instruction.replace(/\s+every\s+row\s+\d+\s+times?$/i, '');
    instruction = instruction.replace(/\s+\d+\s+times?$/i, '');

    // Clean up any remaining text artifacts
    instruction = instruction.trim();

    // Only return if it contains actual knitting instructions
    if (/\b(K\d*|P\d*|ssk|k2tog|inc|yo|sl|knit|purl)\b/i.test(instruction)) {
        return instruction;
    }

    return null;
}

/**
 * Generate instructions for basic algorithmic patterns
 */
function getAlgorithmicInstruction(step, currentRow, currentStitchCount, construction, patternName) {
    // Standard algorithmic pattern processing (colorwork handled separately above)
    const rowInstruction = getAlgorithmicRowInstruction(patternName, currentRow, currentStitchCount, construction);

    if (!rowInstruction) {
        return getFallbackInstruction(step, currentRow, currentStitchCount, patternName);
    }

    // Add stitch count if it stays the same
    const stitchCountText = shouldShowStitchCount(step) ? ` (${currentStitchCount} stitches)` : '';

    return {
        instruction: `${rowInstruction}${stitchCountText}`,
        isSupported: true,
        needsHelp: false,
        helpTopic: null
    };
}

/**
 * Check if pattern is colorwork/striping
 */
function isColorworkPattern(patternName, step) {
    const colorworkPatterns = ['Stripes', 'Fair Isle', 'Intarsia', 'Stranded Colorwork', 'Mosaic'];

    if (colorworkPatterns.includes(patternName)) {
        return true;
    }

    const colorwork = step?.colorwork ||
        step?.wizardConfig?.colorwork ||
        step?.advancedWizardConfig?.colorwork;

    const hasStripes = colorwork?.type === 'stripes' || colorwork?.advancedType === 'stripes';

    return hasStripes;
}

/**
 * Generate colorwork instructions with intelligent color tracking
 */
function getColorworkInstruction(step, currentRow, currentStitchCount, construction, patternName, project, component = null, stepIndex = null) {

    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

    // ✅ FIX: Check for stripe colorwork data, not pattern name
    const colorwork = step.colorwork || step.wizardConfig?.colorwork || step.advancedWizardConfig?.colorwork;

    if (patternName === 'Stripes' || colorwork?.type === 'stripes' || colorwork?.advancedType === 'stripes') {
        return getStripeInstruction(step, currentRow, currentStitchCount, construction, stitchPattern, project, component, stepIndex);
    }

    // Other colorwork patterns - basic handling for now
    const customText = stitchPattern?.customText || stitchPattern?.customDetails || '';
    if (customText) {
        return {
            instruction: `Work in ${patternName}: ${customText}`,
            isSupported: true,
            needsHelp: true,
            helpTopic: 'colorwork_help'
        };
    }

    return getFallbackInstruction(step, currentRow, currentStitchCount, patternName);
}

/**
 * Generate intelligent stripe instructions with current color tracking 
 */
function getStripeInstruction(step, currentRow, currentStitchCount, construction, stitchPattern, project, component = null, stepIndex = null) {

    // ✅ FIX: Get stripe sequence from colorwork, not stitchPattern
    const colorwork = step.colorwork || step.wizardConfig?.colorwork || step.advancedWizardConfig?.colorwork;
    const stripeSequence = colorwork?.stripeSequence;

    if (!stripeSequence || stripeSequence.length === 0) {
        return {
            instruction: 'Work in stripe pattern',
            isSupported: false,
            needsHelp: true,
            helpTopic: 'stripe_setup_help'
        };
    }

    // ✅ NEW: Use adjusted row number that accounts for continuation
    const adjustedRow = component && stepIndex !== null && project
        ? getAdjustedColorRow(currentRow, step, component, stepIndex, project.id)
        : currentRow;

    // Calculate which color should be used for the adjusted row
    const currentColor = getCurrentStripeColor(adjustedRow, stripeSequence);

    if (!currentColor) {
        return {
            instruction: 'Work in stripe pattern (color sequence error)',
            isSupported: false,
            needsHelp: true,
            helpTopic: 'stripe_setup_help'
        };
    }

    // Get display name for the color
    const colorDisplay = getColorDisplayName(currentColor.color, project);

    // ✅ FIX: Get the actual base pattern from the step instead of hardcoding
    const basePattern = step.wizardConfig?.stitchPattern?.pattern || 'Stockinette';
    const baseInstruction = getAlgorithmicRowInstruction(basePattern, currentRow, currentStitchCount, construction);

    if (!baseInstruction) {
        return {
            instruction: `Using ${colorDisplay}, work in pattern`,
            isSupported: true,
            needsHelp: false,
            helpTopic: null
        };
    }

    // Fix capitalization
    const formattedInstruction = formatBaseInstruction(baseInstruction);

    const stitchCountText = shouldShowStitchCount(step) ? ` (${currentStitchCount} stitches)` : '';

    return {
        instruction: `Using ${colorDisplay}, ${formattedInstruction}${stitchCountText}`,
        isSupported: true,
        needsHelp: false,
        helpTopic: null
    };
}

/**
 * Calculate which stripe color should be used for the current row
 */
function getCurrentStripeColor(currentRow, stripeSequence) {
    if (!stripeSequence || stripeSequence.length === 0) {
        return null;
    }

    // Calculate total pattern repeat length
    const patternLength = stripeSequence.reduce((total, stripe) => total + stripe.rows, 0);

    if (patternLength === 0) {
        return null;
    }

    // Find position within the pattern repeat (1-indexed)
    const positionInPattern = ((currentRow - 1) % patternLength) + 1;

    // Find which stripe this position falls into
    let accumulatedRows = 0;
    for (const stripe of stripeSequence) {
        accumulatedRows += stripe.rows;
        if (positionInPattern <= accumulatedRows) {
            return stripe;
        }
    }

    // Fallback to first color if calculation fails
    return stripeSequence[0];
}

/**
 * Fallback instruction generation
 */
function getFallbackInstruction(step, currentRow, currentStitchCount, patternName) {
    // Try to generate a specific instruction based on pattern name
    if (isAlgorithmicPattern(patternName)) {
        const algorithmicResult = getAlgorithmicInstruction(step, currentRow, currentStitchCount, step.construction || 'flat', patternName);
        if (algorithmicResult) {
            return algorithmicResult;
        }
    }

    // For custom patterns, try to extract from step configuration
    const customText = step.wizardConfig?.stitchPattern?.customText;
    if (customText && customText.trim()) {
        return {
            instruction: customText.trim(),
            isSupported: true,
            needsHelp: false,
            helpTopic: null
        };
    }

    // Final fallback - but more specific
    const pattern = patternName || 'pattern';
    const construction = step.construction || 'flat';
    const rowTerm = construction === 'round' ? 'round' : 'row';

    return {
        instruction: `Continue in ${pattern} as established`,
        isSupported: false,
        needsHelp: true,
        helpTopic: 'pattern_help'
    };
}


/**
 * Determine if stitch count should be shown in instruction
 */
function shouldShowStitchCount(step) {
    // Show stitch count for non-shaping steps that maintain stitch count
    //const hasShaping = step.wizardConfig?.hasShaping || step.advancedWizardConfig?.hasShaping;
    //const isConstructionPattern = step.wizardConfig?.stitchPattern?.category === 'construction';

    // return !hasShaping && !isConstructionPattern && step.startingStitches === step.endingStitches;
    return false;
}

/**
 * Get display name for stripe color (yarn name, color mapping, or letter fallback)
 */
function getColorDisplayName(colorLetter, project) {
    // Check if we have actual yarn data
    const yarn = project?.yarns?.find(y => y.letter === colorLetter);
    if (yarn?.color) {
        return `${yarn.color} (Color ${colorLetter})`; // "Mauve (Color A)"
    }

    // Check color mapping
    const colorMapping = project?.colorMapping || {};
    if (colorMapping[colorLetter]) {
        return `${colorMapping[colorLetter]} (Color ${colorLetter})`;
    }

    // Fallback to letter
    return `Color ${colorLetter}`;
}

/**
 * Format base knitting instruction with proper capitalization
 */
function formatBaseInstruction(instruction) {
    return instruction
        .replace(/^K all$/, 'Knit all stitches')
        .replace(/^P all$/, 'Purl all stitches')
        .replace(/^k all$/, 'knit all stitches')
        .replace(/^p all$/, 'purl all stitches');
}

/**
 * Get base pattern instruction for the current step/row (handles colorwork, basic patterns)
 */
function getBasePatternForCurrentRow(step, currentRow, currentStitchCount, construction, project) {
    const patternName = getStepPatternName(step);

    // Handle colorwork patterns (like striping)
    if (isColorworkPattern(patternName, step)) {
        const colorworkResult = getColorworkInstruction(step, currentRow, currentStitchCount, construction, patternName, project);
        if (colorworkResult?.instruction) {
            // Strip the "Row X:" prefix if it exists
            return colorworkResult.instruction.replace(/^(?:Row|Round)\s+\d+:\s*/, '');
        }
    }

    // Handle basic algorithmic patterns
    if (isAlgorithmicPattern(patternName)) {
        const algorithmicResult = getAlgorithmicInstruction(step, currentRow, currentStitchCount, construction, patternName);
        if (algorithmicResult?.instruction) {
            return algorithmicResult.instruction.replace(/^(?:Row|Round)\s+\d+:\s*/, '');
        }
    }

    // Fallback
    return 'work in pattern';
}

/**
 * Extract core shaping instruction from phase description
 */
function extractShapingFromPhase(phase) {
    const description = phase.description;
    if (!description) return null;

    // Remove phase type prefix
    let instruction = description.replace(/^[^:]+:\s*/, '');

    // Look for actual knitting instructions (contains knitting abbreviations)
    const hasKnittingInstructions = /\b(K\d*|P\d*|ssk|k2tog|inc|yo|sl)\b/i.test(instruction);

    if (!hasKnittingInstructions) {
        return null; // No actual knitting instructions found
    }

    // Extract the core instruction before frequency information
    const match = instruction.match(/^(.+?)\s+every\s+(?:other\s+)?(?:row|round)\s+\d+\s+times?$/i);
    if (match) {
        return match[1].trim();
    }

    // Remove trailing frequency info
    instruction = instruction.replace(/\s+every\s+\w+\s+(?:row|round)\s+\d+\s+times?$/i, '');

    return instruction.trim() || null;
}

/**
 * Combine base pattern instruction with shaping instruction
 */
function combinePatternWithShaping(basePattern, shapingInstruction) {
    // If base pattern is colorwork (starts with "Using Color"), integrate shaping
    const colorMatch = basePattern.match(/^(Using .+?),\s*(.+)$/);
    if (colorMatch) {
        const colorPrefix = colorMatch[1];
        return `${colorPrefix}, ${shapingInstruction}`;
    }

    // For regular patterns, replace the base instruction with shaping
    // This handles cases where shaping overrides the basic pattern
    if (shapingInstruction.toLowerCase().includes('work') || shapingInstruction.toLowerCase().includes('knit') || shapingInstruction.toLowerCase().includes('purl')) {
        return shapingInstruction;
    }

    // Fallback: combine them
    return `${shapingInstruction}, ${basePattern}`;
}

function shouldBeShapingRow(phase, currentRow) {
    if (!phase.frequency) return true;

    // For phases with frequency > 1, check if current row should have shaping
    const rowInPhase = currentRow - phase.startRow + 1;
    return (rowInPhase - 1) % phase.frequency === 0;
}

/**
 * Generate shaping instruction with color integration (realistic approach)
 * Only handles color scenarios that actually exist in the codebase
 */
/**
 * Generate shaping instruction with color integration (realistic approach)
 * Only handles color scenarios that actually exist in the codebase
 */
function generateShapingTextWithColor(phase, action, step, currentRow, currentStitchCount, construction, project) {
    // Get the base shaping instruction (without color)
    const baseShapingText = generateShapingText(phase, action);

    // Check if this step has stripe pattern (the main color scenario that exists)
    const patternName = getStepPatternName(step);

    if (patternName === 'Stripes') {
        const colorwork = step.wizardConfig?.colorwork || step.advancedWizardConfig?.colorwork;
        const stripeSequence = colorwork?.stripeSequence;

        if (stripeSequence && stripeSequence.length > 0) {
            const currentColor = getCurrentStripeColor(currentRow, stripeSequence);
            if (currentColor) {
                const colorDisplay = getColorDisplayName(currentColor.color, project);
                return `Using ${colorDisplay}, ${baseShapingText}`;
            }
        }
    }

    // Future: Add other colorwork patterns here as they get implemented
    // if (patternName === 'Fair Isle') { ... }
    // if (patternName === 'Intarsia') { ... }

    // No color information found, return basic shaping
    return baseShapingText;
}

/**
 * Add color to non-shaping instructions (realistic approach)
 */
/**
 * Add color to non-shaping instructions (realistic approach)
 */
function addColorToInstruction(instruction, step, currentRow, construction, project) {
    const patternName = getStepPatternName(step);

    // Handle stripes (the main implemented color feature)
    if (patternName === 'Stripes') {
        const colorwork = step.wizardConfig?.colorwork || step.advancedWizardConfig?.colorwork;
        const stripeSequence = colorwork?.stripeSequence;

        if (stripeSequence && stripeSequence.length > 0) {
            const currentColor = getCurrentStripeColor(currentRow, stripeSequence);
            if (currentColor) {
                const colorDisplay = getColorDisplayName(currentColor.color, project);
                return `Using ${colorDisplay}, ${instruction}`;
            }
        }
    }

    // No color integration needed/available
    return instruction;
}

/**
 * Enhanced generateShapingText with consistent formatting
 */
function generateShapingText(phase, action) {
    const position = phase.position || 'both_ends';
    const amount = phase.amount || 1;

    if (position === 'both_ends') {
        if (action === 'decrease') {
            return `K1, SSK, Knit to last 3 sts, K2tog, K1`;
        } else {
            return `K1, M1, knit to last stitch, M1, K1`;
        }
    } else if (position === 'beginning') {
        return action === 'decrease' ? `SSK, Knit to end` : `M1, Knit to end`;
    } else { // 'end'
        return action === 'decrease' ? `Knit to last 2 sts, K2tog` : `Knit to last stitch, M1, K1`;
    }
}

function getStitchChangeForRow(phase) {
    const amount = phase.amount || 1;
    const position = phase.position || 'both_ends';
    return position === 'both_ends' ? amount * 2 : amount;
}

/**
 * Generate instruction for specific row in marker phases shaping
 */
function getMarkerPhaseInstruction(step, currentRow, currentStitchCount, construction, shapingConfig, project) {
    const config = shapingConfig.config;
    const sequences = config?.phases;

    if (!sequences || sequences.length === 0) {
        return getFallbackInstruction(step, currentRow, currentStitchCount);
    }

    const sequence = sequences[0]; // Use first sequence
    const instructionData = sequence.instructionData;

    if (!instructionData?.actions || !instructionData?.phases) {
        return getFallbackInstruction(step, currentRow, currentStitchCount);
    }

    // Determine if this is a shaping row based on phases
    const isShapingRow = isMarkerShapingRow(currentRow, instructionData.phases);

    if (isShapingRow) {
        // Generate marker shaping instruction
        const basePattern = getStepPatternName(step);
        const dummyTiming = { frequency: 1, times: 1, amountMode: 'times' };
        const markerArray = config.markerSetup?.stitchArray || [];

        const instruction = generateMarkerInstructionPreview(
            instructionData.actions,
            dummyTiming,
            markerArray,
            construction,
            basePattern
        );

        // Clean up the instruction (remove stitch count)
        const cleanInstruction = instruction.replace(/\s*\([+\-]?\d+\s*sts?\)\s*$/i, '');

        return {
            instruction: cleanInstruction,
            isSupported: true,
            needsHelp: false,
            helpTopic: null
        };
    } else {
        // Non-shaping row - work in pattern
        const basePattern = getStepPatternName(step);
        const baseInstruction = getBasePatternForCurrentRow(step, currentRow, currentStitchCount, construction, project);

        return {
            instruction: baseInstruction,
            isSupported: true,
            needsHelp: false,
            helpTopic: null
        };
    }
}

/**
 * Determine if current row is a shaping row for marker phases
 * FIXED: Properly handles marker phase frequency calculation
 */
function isMarkerShapingRow(currentRow, phases) {
    let totalRows = 0;

    for (const phase of phases) {
        if (phase.type === 'initial') {
            totalRows += 1;
            if (currentRow === totalRows) return true;
        } else if (phase.type === 'repeat') {
            // FIXED: Use regularRows directly as the frequency interval
            const frequency = phase.regularRows; // No +1 needed - this IS the frequency
            const times = phase.times || 1;

            for (let i = 0; i < times; i++) {
                // The shaping row comes at the END of each frequency interval
                totalRows += frequency;
                if (currentRow === totalRows) return true;
            }
        } else if (phase.type === 'finish') {
            totalRows += phase.regularRows || 1;
            // Finish rows are never shaping rows
        }
    }

    return false;
}

/**
 * Generate instruction for specific row in bind-off shaping
 * Handles multi-phase bind-off sequences (e.g., shoulder shaping)
 */
function getBindOffShapingInstruction(step, currentRow, currentStitchCount, construction, shapingConfig, project) {
    const calculation = shapingConfig.config?.calculation;

    if (!calculation?.phases) {
        return getFallbackInstruction(step, currentRow, currentStitchCount);
    }

    // Find which phase we're in using rowRange
    for (const phase of calculation.phases) {
        if (isRowInRange(currentRow, phase.rowRange)) {
            return getBindOffPhaseRowInstruction(phase, currentRow, construction, step, project);
        }
    }

    // Fallback if somehow no phase matches
    return getFallbackInstruction(step, currentRow, currentStitchCount);
}

/**
 * Helper: Check if current row falls within a phase's row range
 * Handles both single rows ("5") and ranges ("5-8")
 */
function isRowInRange(currentRow, rowRange) {
    if (!rowRange) return false;

    if (rowRange.includes('-')) {
        const [start, end] = rowRange.split('-').map(n => parseInt(n.trim()));
        return currentRow >= start && currentRow <= end;
    } else {
        return currentRow === parseInt(rowRange);
    }
}

/**
 * Generate instruction for a specific row within a bind-off phase
 * First row of phase = bind-off row, remaining rows = work in pattern
 */
function getBindOffPhaseRowInstruction(phase, currentRow, construction, step, project) {
    const rowRange = phase.rowRange;
    const startRow = rowRange.includes('-')
        ? parseInt(rowRange.split('-')[0])
        : parseInt(rowRange);

    const isBindOffRow = currentRow === startRow;

    if (isBindOffRow) {
        // This is the bind-off row - extract the bind-off instruction with pattern
        const bindOffInstruction = extractBindOffInstruction(phase.description, construction, step, project, currentRow);
        const hasSloped = phase.description?.toLowerCase().includes('sloped') || false;

        return {
            instruction: bindOffInstruction,
            isSupported: true,
            needsHelp: hasSloped,
            helpTopic: hasSloped ? 'sloped_bindoff' : null
        };
    } else {
        // Work in pattern row between bind-offs
        const baseInstruction = getBasePatternForCurrentRow(step, currentRow, currentRow, construction, project);

        return {
            instruction: baseInstruction,
            isSupported: true,
            needsHelp: false,
            helpTopic: null
        };
    }
}

/**
 * Extract clean bind-off instruction from phase description with pattern context
 * Converts "BO 5 sts at beg of next 2 rows" to "Bind off 5 stitches at beginning of row, then work in pattern"
 */
function extractBindOffInstruction(description, construction, step, project, currentRow) {
    if (!description) return 'Bind off stitches as established';

    // Parse the phase description
    // Format: "BO X sts at beg of next Y rows [using sloped bind-off]"
    const match = description.match(/BO (\d+) sts at beg of/i);

    if (match) {
        const stitchCount = match[1];
        const hasSloped = description.toLowerCase().includes('sloped');
        const methodText = hasSloped ? ' using sloped bind-off' : '';

        // Construction-aware instruction
        const position = construction === 'round'
            ? 'at beginning of round'
            : 'at beginning of row';

        // Get the base pattern the knitter is working in
        const patternName = getStepPatternName(step);
        const basePattern = getBasePatternForCurrentRow(step, currentRow, currentRow, construction, project);

        // Combine bind-off with pattern instruction
        return `Bind off ${stitchCount} stitches ${position}${methodText}, then ${basePattern}`;
    }

    // Fallback
    return description;
}
