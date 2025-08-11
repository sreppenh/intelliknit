// src/shared/utils/PhaseCalculationService.js
import IntelliKnitLogger from './ConsoleLogging';
import { getConstructionTerms } from './ConstructionTerminology';
console.log('🧶 PhaseCalculationService loaded');

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

      console.log('🔍 Editing phase at index:', editingIndex);

      // Calculate stitches consumed by previous phases only
      for (let i = 0; i < editingIndex; i++) {
        const stitchChange = PhaseCalculationService.calculatePhaseStitchChange(phases[i]); // ✅ CORRECT
        console.log(`🔍 Phase ${i} stitch change:`, stitchChange);
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

    console.log('🔍 calculateStitchContext result:', result);

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

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const { type, config } = phase;

      if (type === 'setup') {
        totalRows += config.rows;
        instructions.push(`work ${config.rows} plain rows`);
        phaseDetails.push({
          type: 'setup',
          rows: config.rows,
          startingStitches: currentStitchCount,
          endingStitches: currentStitchCount,
          stitchChange: 0
        });

      } else if (type === 'bind_off') {
        const totalBindOff = config.amount * config.frequency;
        const phaseRows = config.frequency;

        currentStitchCount -= totalBindOff;
        totalRows += phaseRows;
        netStitchChange -= totalBindOff;

        const positionText = config.position === 'beginning' ? 'at beginning' : 'at end';
        instructions.push(`bind off ${config.amount} sts ${positionText} of next ${config.frequency} rows`);

        phaseDetails.push({
          type: 'bind_off',
          amount: config.amount,
          frequency: config.frequency,
          position: config.position,
          rows: phaseRows,
          stitchChange: -totalBindOff,
          startingStitches: currentStitchCount + totalBindOff,
          endingStitches: currentStitchCount
        });

      } else if (type === 'decrease' || type === 'increase') {
        const isDecrease = type === 'decrease';

        // Calculate stitch change per shaping row
        const stitchChangePerRow = config.position === 'both_ends' ?
          config.amount * 2 : config.amount;

        // Calculate total stitch change for this phase
        const totalStitchChangeForPhase = stitchChangePerRow * config.times * (isDecrease ? -1 : 1);

        // FIX: Calculate total rows for this phase correctly
        // If you do something "every other row" 5 times, that's:
        // Row 1 (shaping), Row 2 (plain), Row 3 (shaping), Row 4 (plain), Row 5 (shaping) = 9 rows total
        // const phaseRows = config.frequency === 1 ? 
        //  config.times : // Every row = times
        //   (config.times - 1) * config.frequency + 1; // Every other/nth row
        const phaseRows = config.times * config.frequency;

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

        instructions.push(`${actionText} ${config.amount} st ${positionText} ${frequencyText} ${config.times} times`);

        phaseDetails.push({
          type: type,
          amount: config.amount,
          frequency: config.frequency,
          times: config.times,
          position: config.position,
          rows: phaseRows,
          stitchChange: totalStitchChangeForPhase,
          startingStitches: currentStitchCount - totalStitchChangeForPhase,
          endingStitches: currentStitchCount
        });
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

    IntelliKnitLogger.debug('Sequential Phases', {
      totalPhases: phases.length,
      startingStitches: currentStitches,
      endingStitches: currentStitchCount,
      totalRows,
      netStitchChange
    });

    return {
      instruction: instructions.join(', then '),
      startingStitches: currentStitches,
      endingStitches: currentStitchCount,
      totalRows: totalRows,
      netStitchChange: netStitchChange,
      phases: phaseDetails,
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
          config.position === 'beginning' ? 'at beginning' :
            'at end';
        const decTotalRows = config.times * config.frequency;
        return `Dec ${config.amount} st ${decPosText} ${decFreqText} ${config.times} times (${decTotalRows} ${terms.rows})`;

      case 'increase':
        const incFreqText = config.frequency === 1 ? terms.everyRow :
          config.frequency === 2 ? terms.everyOtherRow :
            terms.everyNthRow(config.frequency);
        const incPosText = config.position === 'both_ends' ? terms.atBothEnds :
          config.position === 'beginning' ? 'at beginning' :
            'at end';
        const incTotalRows = config.times * config.frequency;
        return `Inc ${config.amount} st ${incPosText} ${incFreqText} ${config.times} times (${incTotalRows} ${terms.rows})`;

      case 'setup':
        return `Work ${config.rows} plain ${config.rows === 1 ? terms.row : terms.rows}`;

      case 'bind_off':
        const bindPosText = config.position === 'beginning' ? 'at beginning' : 'at end';
        const bindTotalStitches = config.amount * config.frequency;
        return `Bind off ${config.amount} sts ${bindPosText} of next ${config.frequency} ${config.frequency === 1 ? terms.row : terms.rows} (${bindTotalStitches} sts total)`;

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



