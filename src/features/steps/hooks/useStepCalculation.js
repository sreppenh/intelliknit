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

    // Handle patterns with advanced shaping using AdvancedPatternCalculator
    if (wizardData.hasShaping && wizardData.shapingConfig) {
      try {
        const { shapingMode, shapingType, positions, frequency, times, bindOffSequence, distributionType, targetChange, type, config } = wizardData.shapingConfig;

        // SAFETY: Warn about legacy data usage
        if (shapingMode && !type) {
          IntelliKnitLogger.warn('🚨 LEGACY SHAPING DETECTED in calculation', {
            shapingMode, shapingType, positions, frequency, times
          });
        }

        // Check for new shaping structure first (from ShapingWizard)
        if (type === 'even_distribution' && config && config.calculation) {
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

        // Handle sequential phases shaping
        else if (type === 'phases' && config && config.calculation) {
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

        // Stepped Bind-Off
        else if (shapingMode === 'bindoff') {
          const bindOffResult = advancedCalculator.calculateSteppedBindOff(bindOffSequence, currentStitches, construction);
          if (bindOffResult.success) {
            return {
              success: true,
              totalRows: bindOffResult.totalRows,
              startingStitches: bindOffResult.startingStitches,
              endingStitches: bindOffResult.endingStitches,
              rows: bindOffResult.rows,
              hasShaping: true,
              shapingMode: 'bindoff'
            };
          }
        }

        // Even Distribution (legacy fallback)
        else if (shapingMode === 'distribution') {
          const distributionResult = advancedCalculator.calculateEvenDistribution(
            currentStitches,
            targetChange,
            distributionType
          );
          if (distributionResult.success) {
            return {
              success: true,
              totalRows: distributionResult.totalRows,
              startingStitches: distributionResult.startingStitches,
              endingStitches: distributionResult.endingStitches,
              rows: distributionResult.rows,
              hasShaping: true,
              shapingMode: 'distribution'
            };
          }
        }

        // Regular and Raglan Shaping - use Multi-Point Shaping
        else if (shapingMode === 'regular' || shapingMode === 'raglan') {
          const shapingConfig = {
            frequency: { every: frequency, times: times },
            points: [],
            shapingType
          };

          // Configure points based on shaping mode
          if (shapingMode === 'raglan') {
            // Raglan: 4-point shaping (decrease 4 stitches per shaping row)
            shapingConfig.points = [
              { position: 'beginning', technique: null, stitchChange: shapingType === 'increase' ? 1 : -1, borderStitches: 1 },
              { position: 'center', technique: null, stitchChange: shapingType === 'increase' ? 2 : -2, borderStitches: 0 },
              { position: 'end', technique: null, stitchChange: shapingType === 'increase' ? 1 : -1, borderStitches: 1 }
            ];
          } else {
            // Regular shaping
            if (positions.includes('both_ends')) {
              shapingConfig.points = [
                { position: 'beginning', technique: null, stitchChange: shapingType === 'increase' ? 1 : -1, borderStitches: 1 },
                { position: 'end', technique: null, stitchChange: shapingType === 'increase' ? 1 : -1, borderStitches: 1 }
              ];
            } else {
              shapingConfig.points = positions.map(pos => ({
                position: pos,
                technique: null,
                stitchChange: shapingType === 'increase' ? 1 : -1,
                borderStitches: pos === 'center' ? 0 : 1
              }));
            }
          }

          const multiPointResult = advancedCalculator.calculateMultiPointShaping(shapingConfig, currentStitches, construction);
          if (multiPointResult.success) {
            return {
              success: true,
              totalRows: multiPointResult.totalRows,
              startingStitches: multiPointResult.startingStitches,
              endingStitches: multiPointResult.endingStitches,
              rows: multiPointResult.rows,
              hasShaping: true,
              shapingMode: shapingMode,
              netStitchChange: multiPointResult.netStitchChange
            };
          }
        }
      } catch (error) {
        IntelliKnitLogger.error('Advanced shaping calculation error', error);
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
  } else if (wizardData.duration.type === 'length') {  // 🎯 ADD: Length from current position
    return `${pattern} for ${wizardData.duration.value} ${wizardData.duration.units}`;
  } else if (wizardData.duration.type === 'until_length') {  // 🎯 ADD: Length until target
    return `${pattern} until piece measures ${wizardData.duration.value} ${wizardData.duration.units}`;
  } else if (wizardData.duration.type === 'repeats') {  // 🎯 ADD: Pattern repeats
    return `${pattern} for ${wizardData.duration.value} repeats`;
  } else {
    return pattern;
  }
}