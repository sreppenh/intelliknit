import { useMemo } from 'react';
import PatternDetector, { PATTERN_TYPES } from '../../../shared/utils/PatternDetector';
import PatternCalculator from '../../../shared/utils/PatternCalculator';
import { AdvancedPatternCalculator } from '../../../shared/utils/AdvancedPatternCalculator';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import { calculateRepeatsToTarget, calculateTargetRows, calculateStitchChangePerRepeat } from '../../../shared/utils/targetStitchUtils';

export const useStepCalculation = () => {
  const detector = useMemo(() => new PatternDetector(), []);
  const calculator = useMemo(() => new PatternCalculator(), []);
  const advancedCalculator = useMemo(() => new AdvancedPatternCalculator(), []);

  const calculateEffect = useMemo(() => (wizardData, currentStitches, construction) => {
    // Handle Cast On specially - it sets the stitch count from 0
    console.log('🔍 calculateEffect called with:', {
      pattern: wizardData.stitchPattern?.pattern,
      durationType: wizardData.duration?.type,
      durationValue: wizardData.duration?.value,
      rowsInPattern: wizardData.stitchPattern?.rowsInPattern,
      stitchChangePerRepeat: wizardData.stitchPattern?.stitchChangePerRepeat,
      hasShaping: wizardData.hasShaping,
      entryMode: wizardData.stitchPattern?.entryMode
    });

    if (wizardData.stitchPattern.pattern === 'Cast On') {
      const stitchCount = parseInt(wizardData.stitchPattern.stitchCount) || 0;
      return {
        success: true,
        totalRows: 1,
        startingStitches: 0,
        endingStitches: stitchCount,
        isCastOn: true
      };
    }

    // Handle Bind Off specially
    if (wizardData.stitchPattern.pattern === 'Bind Off') {
      const stitchesToBindOff = wizardData.duration.value ? parseInt(wizardData.duration.value) : currentStitches;
      return {
        success: true,
        totalRows: 1,
        startingStitches: currentStitches,
        endingStitches: Math.max(0, currentStitches - stitchesToBindOff),
        isBindOff: true
      };
    }

    // ✅ NEW: Handle target-based pattern repeats
    if (wizardData.duration.type === 'target_repeats' && wizardData.duration.targetStitches) {
      IntelliKnitLogger.debug('Target Repeats Calculation', 'Triggered');

      const targetStitches = parseInt(wizardData.duration.targetStitches);
      const rowsPerRepeat = parseInt(wizardData.stitchPattern.rowsInPattern) || 1;
      const completeSequence = wizardData.duration.completeSequence || false;

      // Calculate stitch change per repeat
      let stitchChangePerRepeat = parseInt(wizardData.stitchPattern.stitchChangePerRepeat) || 0;

      // For Custom pattern, calculate from customSequence.rows
      if ((wizardData.stitchPattern.pattern === 'Custom' || wizardData.stitchPattern.pattern === 'Brioche') && wizardData.stitchPattern.customSequence?.rows) {
        stitchChangePerRepeat = calculateStitchChangePerRepeat(wizardData.stitchPattern.customSequence.rows);
        IntelliKnitLogger.debug('Custom Pattern Stitch Change', { stitchChangePerRepeat });
      }

      // Calculate repeats needed
      const repeatCalc = calculateRepeatsToTarget(
        currentStitches,
        targetStitches,
        stitchChangePerRepeat
      );

      // Calculate total rows
      const rowCalc = calculateTargetRows(
        repeatCalc.repeats,
        rowsPerRepeat,
        completeSequence,
        targetStitches,
        currentStitches,
        stitchChangePerRepeat
      );

      IntelliKnitLogger.success('Target Repeats Calculated', {
        pattern: wizardData.stitchPattern.pattern,
        startingStitches: currentStitches,
        targetStitches,
        stitchChangePerRepeat,
        repeatsNeeded: repeatCalc.repeats,
        totalRows: rowCalc.totalRows,
        endingStitches: rowCalc.endingStitches,
        completeSequence
      });

      return {
        success: true,
        totalRows: rowCalc.totalRows,
        startingStitches: currentStitches,
        endingStitches: rowCalc.endingStitches,
        isTargetRepeat: true,
        targetStitches: targetStitches,
        repeatsNeeded: repeatCalc.repeats,
        actualRepeats: rowCalc.actualRepeats,
        stitchChangePerRepeat: stitchChangePerRepeat,
        completeSequence: completeSequence
      };
    }

    // Handle patterns with repeats (existing code)
    if (wizardData.duration.type === 'repeats' && wizardData.stitchPattern.rowsInPattern) {
      console.log('🎯 PATTERN REPEATS CALCULATION TRIGGERED');
      console.log('📊 Input data:', {
        durationType: wizardData.duration.type,
        durationValue: wizardData.duration.value,
        rowsInPattern: wizardData.stitchPattern.rowsInPattern,
        stitchChangePerRepeat: wizardData.stitchPattern.stitchChangePerRepeat,
        currentStitches: currentStitches
      });

      const rowsPerRepeat = parseInt(wizardData.stitchPattern.rowsInPattern) || 1;
      const numberOfRepeats = parseInt(wizardData.duration.value) || 1;
      const totalRows = rowsPerRepeat * numberOfRepeats;

      // Calculate stitch change for Custom and Brioche patterns from customSequence
      let stitchChangePerRepeat = parseInt(wizardData.stitchPattern.stitchChangePerRepeat) || 0;

      // For Custom pattern (uses array)
      if (wizardData.stitchPattern.pattern === 'Custom' && wizardData.stitchPattern.customSequence?.rows) {
        const rows = wizardData.stitchPattern.customSequence.rows;
        stitchChangePerRepeat = rows.reduce((sum, row) => sum + (row.stitchChange || 0), 0);
        console.log('📊 Custom Pattern - calculated stitchChangePerRepeat:', stitchChangePerRepeat, 'from rows:', rows);
      }

      // For Brioche pattern (uses object - convert to array first)
      if (wizardData.stitchPattern.pattern === 'Brioche' && wizardData.stitchPattern.customSequence?.rows) {
        const rows = wizardData.stitchPattern.customSequence.rows;
        const rowValues = Object.values(rows);
        stitchChangePerRepeat = rowValues.reduce((sum, row) => sum + (row.stitchChange || 0), 0);
        console.log('📊 Brioche Pattern - calculated stitchChangePerRepeat:', stitchChangePerRepeat, 'from rows:', rows);
      }

      const totalStitchChange = stitchChangePerRepeat * numberOfRepeats;
      const endingStitches = currentStitches + totalStitchChange;

      console.log('✅ CALCULATED RESULT:', {
        pattern: wizardData.stitchPattern.pattern,
        totalRows,
        startingStitches: currentStitches,
        endingStitches,
        stitchChangePerRepeat,
        totalStitchChange,
        numberOfRepeats
      });

      return {
        success: true,
        totalRows: totalRows,
        startingStitches: currentStitches,
        endingStitches: endingStitches,
        isPatternRepeat: true,
        stitchChangePerRepeat: stitchChangePerRepeat,
        totalStitchChange: totalStitchChange
      };
    }

    // Handle Custom patterns with duration.type === 'rows'
    if (wizardData.stitchPattern.pattern === 'Custom' &&
      wizardData.duration.type === 'rows' &&
      wizardData.stitchPattern.customSequence?.rows) {

      const totalRows = parseInt(wizardData.duration.value) || 1;
      const rowsInPattern = wizardData.stitchPattern.customSequence.rows.length;

      // Calculate stitch change per repeat
      const stitchChangePerRepeat = wizardData.stitchPattern.customSequence.rows.reduce(
        (sum, row) => sum + (row.stitchChange || 0),
        0
      );

      // Calculate how many complete repeats + partial repeat
      const completeRepeats = Math.floor(totalRows / rowsInPattern);
      const partialRows = totalRows % rowsInPattern;

      // Calculate stitch change from partial repeat
      let partialStitchChange = 0;
      for (let i = 0; i < partialRows; i++) {
        partialStitchChange += wizardData.stitchPattern.customSequence.rows[i].stitchChange || 0;
      }

      const totalStitchChange = (stitchChangePerRepeat * completeRepeats) + partialStitchChange;
      const endingStitches = currentStitches + totalStitchChange;

      IntelliKnitLogger.success('Custom Pattern with Rows Calculated', {
        totalRows,
        rowsInPattern,
        completeRepeats,
        partialRows,
        stitchChangePerRepeat,
        partialStitchChange,
        totalStitchChange,
        startingStitches: currentStitches,
        endingStitches
      });

      return {
        success: true,
        totalRows: totalRows,
        startingStitches: currentStitches,
        endingStitches: endingStitches,
        isCustomPatternRows: true,
        stitchChangePerRepeat: stitchChangePerRepeat,
        totalStitchChange: totalStitchChange
      };
    }


    // Handle patterns with modern shaping system
    if (wizardData.hasShaping && wizardData.shapingConfig) {
      try {
        const { shapingMode, shapingType, positions, frequency, times, type, config } = wizardData.shapingConfig;

        // Legacy detection (safety check)
        IntelliKnitLogger.debug('Calculation debug - type:', type, 'config exists:', !!config);

        if (shapingMode && !type) {
          IntelliKnitLogger.warn('🚨 UNEXPECTED LEGACY SHAPING DETECTED in calculation', {
            shapingMode, shapingType, positions, frequency, times,
            suggestion: 'This should not happen in modern system'
          });
        }

        // Modern shaping system (type-based)
        if (type === 'even_distribution' && config?.calculation) {
          return {
            success: true,
            totalRows: 1,
            startingStitches: config.calculation.startingStitches,
            endingStitches: config.calculation.endingStitches,
            hasShaping: true,
            shapingMode: 'distribution',
            netStitchChange: config.calculation.changeCount * (config.action === 'increase' ? 1 : -1)
          };
        }
        else if (type === 'phases' && config?.calculation) {
          return {
            success: true,
            totalRows: config.calculation.totalRows,
            startingStitches: config.calculation.startingStitches,
            endingStitches: config.calculation.endingStitches,
            hasShaping: true,
            shapingMode: 'phases',
            netStitchChange: config.calculation.netStitchChange,
            phaseDetails: config.calculation.phases // Store phase breakdown for knitting mode
          };

        }
        else if (type === 'marker_phases' && config?.calculation) {
          return {
            success: true,
            totalRows: config.calculation.totalRows,
            startingStitches: config.calculation.startingStitches,
            endingStitches: config.calculation.endingStitches,
            hasShaping: true,
            shapingMode: 'marker_phases',
            finalArray: config.calculation.finalArray
          };
        }

        else if (type === 'bind_off_shaping' && config?.calculation) {
          return {
            success: true,
            totalRows: config.calculation.totalRows,
            startingStitches: config.calculation.startingStitches,
            endingStitches: config.calculation.endingStitches,
            hasShaping: true,
            shapingMode: 'bind_off_shaping',
            netStitchChange: config.calculation.netStitchChange
          };
        }

        else if (type === 'intrinsic_pattern' && config?.calculation) {
          return {
            success: true,
            totalRows: config.calculation.totalRows || 1,
            startingStitches: config.calculation.startingStitches,
            endingStitches: config.calculation.endingStitches,
            hasShaping: true,
            shapingMode: 'intrinsic',
            netStitchChange: config.calculation.netStitchChange
          };
        }
        else {
          // No valid modern shaping data found
        }
      } catch (error) {
        IntelliKnitLogger.error('Modern shaping calculation error', error);
      }
    }

    // Handle color pattern repeats
    if (wizardData.duration.type === 'color_repeats' && wizardData.colorwork?.stripeSequence) {
      const totalRowsInSequence = wizardData.colorwork.stripeSequence.reduce(
        (sum, stripe) => sum + (stripe.rows || 0),
        0
      );
      const numberOfRepeats = parseInt(wizardData.duration.value) || 1;
      const totalRows = totalRowsInSequence * numberOfRepeats;

      return {
        success: true,
        totalRows: totalRows,
        startingStitches: currentStitches,
        endingStitches: currentStitches,
        isColorRepeat: true
      };
    }

    try {
      // Use existing PatternDetector for other patterns
      const instruction = generateInstructionForDetection(wizardData);
      const detection = detector.detectPattern(instruction);

      if (detection.type !== PATTERN_TYPES.MANUAL) {
        const calculation = calculator.calculatePattern(
          detection.type,
          detection.parsedData,
          currentStitches,
          construction
        );

        return {
          success: true,
          detection,
          calculation,
          totalRows: calculation.totalRows,
          startingStitches: currentStitches,
          endingStitches: calculation.endingStitches
        };
      }
    } catch (error) {
      IntelliKnitLogger.error('Calculation error', error);
    }

    // Fallback for patterns we can't calculate yet
    return {
      success: false,
      totalRows: wizardData.duration.type === 'rows' ? parseInt(wizardData.duration.value) || 1 : 1,
      startingStitches: currentStitches,
      endingStitches: currentStitches
    };
  }, [detector, calculator, advancedCalculator]);

  return { calculateEffect };
};

function generateInstructionForDetection(wizardData) {
  const pattern = wizardData.stitchPattern.pattern === 'Other' ?
    wizardData.stitchPattern.customText :
    wizardData.stitchPattern.pattern;

  if (wizardData.duration.type === 'rows') {
    return `${pattern} for ${wizardData.duration.value} rows`;
  } else if (wizardData.duration.type === 'length') {
    return `${pattern} for ${wizardData.duration.value} ${wizardData.duration.units}`;
  } else if (wizardData.duration.type === 'until_length') {
    return `${pattern} until piece measures ${wizardData.duration.value} ${wizardData.duration.units}`;
  } else if (wizardData.duration.type === 'repeats') {
    return `${pattern} for ${wizardData.duration.value} repeats`;
  } else if (wizardData.duration.type === 'target_repeats') {
    return `${pattern} until ${wizardData.duration.targetStitches} stitches`;
  } else {
    return pattern;
  }
}