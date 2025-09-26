// src/shared/utils/PhaseCalculationService.js
import IntelliKnitLogger from './ConsoleLogging';
import { getConstructionTerms } from './ConstructionTerminology';

/**
 * Phase Calculation Service
 * Handles all mathematical calculations for Sequential Phases shaping
 * Extracted from PhaseConfig.jsx to reduce component bloat
 */
export class PhaseCalculationService {

  /**
   * Calculate available stitches for a specific phase position
   * @param {Array} phases - Array of existing phases
   * @param {string|null} editingPhaseId - ID of phase being edited (null for new phase)
   * @param {number} currentStitches - Starting stitch count for the entire step
   * @returns {Object} - { availableStitches, phaseNumber, totalPhases }
   */
  static calculateStitchContext(phases, editingPhaseId, currentStitches) {

    let currentStitchCount = currentStitches;
    let phaseNumber = 1;

    if (editingPhaseId) {
      const editingIndex = phases.findIndex(p => p.id === editingPhaseId);
      phaseNumber = editingIndex + 1;

      // Calculate stitches consumed by previous phases only
      for (let i = 0; i < editingIndex; i++) {
        const stitchChange = PhaseCalculationService.calculatePhaseStitchChange(phases[i]); // ✅ CORRECT
        currentStitchCount += stitchChange;
      }
    } else {
      // Adding new phase - calculate stitches after all existing phases
      phaseNumber = phases.length + 1;

      for (let i = 0; i < phases.length; i++) {
        const stitchChange = PhaseCalculationService.calculatePhaseStitchChange(phases[i]); // ✅ CORRECT
        currentStitchCount += stitchChange;
      }
    }

    const result = {
      availableStitches: Math.max(0, currentStitchCount),
      phaseNumber,
      totalPhases: editingPhaseId ? phases.length : phases.length + 1
    };

    return result;
  }

  /**
   * Calculate stitch change for a single phase
   * @param {Object} phase - Phase object with type and config
   * @returns {number} - Net stitch change (positive for increases, negative for decreases)
   */
  static calculatePhaseStitchChange(phase) {
    const { type, config } = phase;

    switch (type) {
      case 'decrease':
        const decStitchChangePerRow = config.position === 'both_ends' ?
          config.amount * 2 : config.amount;
        return -(decStitchChangePerRow * config.times);

      case 'increase':
        const incStitchChangePerRow = config.position === 'both_ends' ?
          config.amount * 2 : config.amount;
        return incStitchChangePerRow * config.times;

      case 'bind_off':
        return -(config.amount * config.frequency);

      case 'setup':
        return 0; // Setup rows don't change stitch count

      default:
        IntelliKnitLogger.warn('Unknown phase type in stitch calculation', type);
        return 0;
    }
  }

  /**
   * Calculate the complete sequential phases result
   * @param {Array} phases - Array of phase objects
   * @param {number} currentStitches - Starting stitch count
   * @param {string} construction - 'flat' or 'round'
   * @returns {Object} - Complete calculation result with instruction, stitch counts, etc.
   */
  static calculateSequentialPhases(phases, currentStitches, construction) {
    if (phases.length === 0) {
      return {
        error: 'Please add at least one phase',
        instruction: '',
        startingStitches: currentStitches,
        endingStitches: currentStitches,
        totalRows: 0,
        netStitchChange: 0,
        phases: []
      };
    }

    let currentStitchCount = currentStitches;
    let totalRows = 0;
    let instructions = [];
    let netStitchChange = 0;
    let phaseDetails = [];
    let currentRowPosition = 1; // NEW: Track row position for rowRange generation

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const { type, config } = phase;

      if (type === 'setup') {
        const phaseRows = config.rows;
        const startRow = currentRowPosition;
        const endRow = currentRowPosition + phaseRows - 1;

        totalRows += phaseRows;
        instructions.push(`work ${phaseRows} plain rows`);

        const terms = getConstructionTerms(construction);
        phaseDetails.push({
          type: 'setup',
          description: `Setup: Work ${phaseRows} plain ${phaseRows === 1 ? terms.row : terms.rows}`,
          rowRange: `${startRow}-${endRow}`,
          rows: phaseRows,
          startingStitches: currentStitchCount,
          endingStitches: currentStitchCount,
          stitchChange: 0
        });

        currentRowPosition += phaseRows; // NEW: Update row position

      } else if (type === 'bind_off') {
        const totalBindOff = config.amount * config.frequency;
        const phaseRows = config.frequency;
        const startRow = currentRowPosition;
        const endRow = currentRowPosition + phaseRows - 1;

        currentStitchCount -= totalBindOff;
        totalRows += phaseRows;
        netStitchChange -= totalBindOff;

        const positionText = config.position === 'beginning' ? 'at beginning' : 'at end';
        instructions.push(`bind off ${config.amount} stitches ${positionText} of next ${config.frequency} rows`);

        const bindTerms = getConstructionTerms(construction);
        phaseDetails.push({
          type: 'bind_off',
          description: `Bind off ${config.amount} stitches ${positionText} of next ${config.frequency} ${config.frequency === 1 ? bindTerms.row : bindTerms.rows}`,
          rowRange: `${startRow}-${endRow}`,
          amount: config.amount,
          frequency: config.frequency,
          position: config.position,
          rows: phaseRows,
          stitchChange: -totalBindOff,
          startingStitches: currentStitchCount + totalBindOff,
          endingStitches: currentStitchCount
        });

        currentRowPosition += phaseRows; // NEW: Update row position

      } else if (type === 'decrease' || type === 'increase') {
        const isDecrease = type === 'decrease';

        // Calculate stitch change per shaping row
        const stitchChangePerRow = config.position === 'both_ends' ?
          config.amount * 2 : config.amount;

        // Calculate total stitch change for this phase
        const totalStitchChangeForPhase = stitchChangePerRow * config.times * (isDecrease ? -1 : 1);

        const phaseRows = config.times * config.frequency;
        const startRow = currentRowPosition;
        const endRow = currentRowPosition + phaseRows - 1;

        // Update counters
        currentStitchCount += totalStitchChangeForPhase;
        totalRows += phaseRows;
        netStitchChange += totalStitchChangeForPhase;

        // Generate instruction text
        const actionText = isDecrease ? 'decrease' : 'increase';
        const positionText = config.position === 'both_ends' ? 'at each end' :
          config.position === 'beginning' ? 'at beginning' :
            'at end';
        const terms = getConstructionTerms(construction);
        const frequencyText = config.frequency === 1 ? terms.everyRow :
          config.frequency === 2 ? terms.everyOtherRow :
            terms.everyNthRow(config.frequency);

        instructions.push(`${actionText} ${config.amount} stitch ${positionText} ${frequencyText} ${config.times} times`);

        // NEW: Generate detailed phase description with knitting instructions
        const phaseDescription = PhaseCalculationService.getPhaseDescription(phase, construction);

        phaseDetails.push({
          type: type,
          description: `${isDecrease ? 'Decrease' : 'Increase'} phase: ${phaseDescription}`,
          rowRange: `${startRow}-${endRow}`, // NEW: Add rowRange
          amount: config.amount,
          frequency: config.frequency,
          times: config.times,
          position: config.position,
          rows: phaseRows,
          stitchChange: totalStitchChangeForPhase,
          startingStitches: currentStitchCount - totalStitchChangeForPhase,
          endingStitches: currentStitchCount
        });

        currentRowPosition += phaseRows; // NEW: Update row position
      }
    }

    // Check for impossible scenarios
    if (currentStitchCount < 0) {
      return {
        error: `Calculation results in ${currentStitchCount} stitches - cannot bind off more stitches than available`,
        instruction: '',
        startingStitches: currentStitches,
        endingStitches: currentStitches,
        totalRows: 0,
        netStitchChange: 0,
        phases: []
      };
    }

    // Only log major calculation results, not every re-render
    if (phases.length > 0 && currentStitches !== currentStitchCount) {
      IntelliKnitLogger.success(`Sequential phases calculated: ${phases.length} phases, ${currentStitches} → ${currentStitchCount} stitches`);
    }

    return {
      instruction: instructions.join(', then '),
      startingStitches: currentStitches,
      endingStitches: currentStitchCount,
      totalRows: totalRows,
      netStitchChange: netStitchChange,
      phases: phaseDetails, // Now includes rowRange data!
      construction: construction
    };
  }

  /**
   * Generate human-readable description for a phase
   * @param {Object} phase - Phase object with type and config
   * @param {string} construction - Construction type ('flat' or 'round')
   * @returns {string} - Formatted description
   */
  static getPhaseDescription(phase, construction = 'flat') {
    const { type, config } = phase;
    const terms = getConstructionTerms(construction);

    switch (type) {
      case 'decrease':
        const decFreqText = config.frequency === 1 ? terms.everyRow :
          config.frequency === 2 ? terms.everyOtherRow :
            terms.everyNthRow(config.frequency);
        const decPosText = config.position === 'both_ends' ? terms.atBothEnds :
          config.position === 'beginning' ? 'at beginning' : 'at end';
        const decTotalRows = config.times * config.frequency;
        const stitchWord = config.amount === 1 ? 'stitch' : 'stitches';
        return `Decrease ${config.amount} ${stitchWord} ${decPosText} ${decFreqText} ${config.times} times (${decTotalRows} ${terms.rows})`;

      case 'increase':
        const incFreqText = config.frequency === 1 ? terms.everyRow :
          config.frequency === 2 ? terms.everyOtherRow :
            terms.everyNthRow(config.frequency);
        const incPosText = config.position === 'both_ends' ? terms.atBothEnds :
          config.position === 'beginning' ? 'at beginning' : 'at end';
        const incTotalRows = config.times * config.frequency;
        const incStitchWord = config.amount === 1 ? 'stitch' : 'stitches';
        return `Increase ${config.amount} ${incStitchWord} ${incPosText} ${incFreqText} ${config.times} times (${incTotalRows} ${terms.rows})`;
      case 'setup':
        return `Work ${config.rows} plain ${config.rows === 1 ? terms.row : terms.rows}`;

      case 'bind_off':
        const bindPosText = config.position === 'beginning' ? 'at beginning' : 'at end';
        const bindTotalStitches = config.amount * config.frequency;
        return `Bind off ${config.amount} stitches ${bindPosText} of next ${config.frequency} ${config.frequency === 1 ? terms.row : terms.rows} (${bindTotalStitches} stitches total)`;

      default:
        return 'Unknown phase';
    }
  }

  /**
   * Get default configuration for a phase type
   * @param {string} type - Phase type ('decrease', 'increase', 'setup', 'bind_off')
   * @returns {Object} - Default configuration object
   */
  static getDefaultConfigForType(type) {
    switch (type) {
      case 'decrease':
        return {
          amount: 1,
          frequency: 2, // every other row
          times: 1,
          position: 'both_ends'
        };
      case 'increase':
        return {
          amount: 1,
          frequency: 2, // every other row  
          times: 1,
          position: 'both_ends'
        };
      case 'setup':
        return {
          rows: 1
        };
      case 'bind_off':
        return {
          amount: 1,
          frequency: 1,
          position: 'beginning' // Only beginning for bind-offs
        };
      default:
        return {};
    }
  }
}



