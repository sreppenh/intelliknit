import { useMemo } from 'react';
import PatternDetector, { PATTERN_TYPES } from '../../../shared/utils/PatternDetector';
import PatternCalculator from '../../../shared/utils/PatternCalculator';
import { AdvancedPatternCalculator, ADVANCED_PATTERN_TYPES } from '../../../shared/utils/AdvancedPatternCalculator';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

export const useStepCalculation = () => {
  const detector = useMemo(() => new PatternDetector(), []);
  const calculator = useMemo(() => new PatternCalculator(), []);
  const advancedCalculator = useMemo(() => new AdvancedPatternCalculator(), []);

  const calculateEffect = useMemo(() => (wizardData, currentStitches, construction) => {
    // Handle Cast On specially - it sets the stitch count from 0
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
        // Add this AFTER the existing phases case:
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

    // Handle patterns with repeats (Lace, Cable, Colorwork)
    if (wizardData.duration.type === 'repeats' && wizardData.stitchPattern.rowsInPattern) {
      const rowsPerRepeat = parseInt(wizardData.stitchPattern.rowsInPattern) || 1;
      const numberOfRepeats = parseInt(wizardData.duration.value) || 1;
      const totalRows = rowsPerRepeat * numberOfRepeats;

      return {
        success: true,
        totalRows: totalRows,
        startingStitches: currentStitches,
        endingStitches: currentStitches,
        isPatternRepeat: true
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
  } else {
    return pattern;
  }
}