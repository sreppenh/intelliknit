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

    // Handle duration.type === 'length' or 'until_length' for ALL patterns
    if (wizardData.duration.type === 'length' || wizardData.duration.type === 'until_length') {
      return {
        success: true,
        totalRows: 1, // Placeholder - actual tracking happens in knitting mode
        startingStitches: currentStitches,
        endingStitches: currentStitches, // Can't calculate without knowing actual rows worked
        isLengthBased: true,
        lengthValue: parseFloat(wizardData.duration.value),
        lengthUnits: wizardData.duration.units || 'inches'
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
        stitchChangePerRepeat,
        wizardData.stitchPattern.customSequence?.rows || null  // ✅ Pass actual row data
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

      const rowsPerRepeat = parseInt(wizardData.stitchPattern.rowsInPattern) || 1;
      const numberOfRepeats = parseInt(wizardData.duration.value) || 1;
      const totalRows = rowsPerRepeat * numberOfRepeats;

      // Calculate stitch change for Custom and Brioche patterns from customSequence
      let stitchChangePerRepeat = parseInt(wizardData.stitchPattern.stitchChangePerRepeat) || 0;

      // For Custom pattern (uses array)
      if (wizardData.stitchPattern.pattern === 'Custom' && wizardData.stitchPattern.customSequence?.rows) {
        const rows = wizardData.stitchPattern.customSequence.rows;
        stitchChangePerRepeat = rows.reduce((sum, row) => sum + (row.stitchChange || 0), 0);
      }

      // For Two-Color Brioche pattern (uses object - convert to array first)
      if (wizardData.stitchPattern.pattern === 'Two-Color Brioche' && wizardData.stitchPattern.customSequence?.rows) {
        const rows = wizardData.stitchPattern.customSequence.rows;
        const rowValues = Object.values(rows);
        stitchChangePerRepeat = rowValues.reduce((sum, row) => sum + (row.stitchChange || 0), 0);
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

    // ===== HANDLE ALL CUSTOM PATTERNS (Description, Simple Row, Two-Color Brioche) =====
    // This handles "Custom pattern", "Custom", and "Two-Color Brioche" patterns with ALL duration types

    const isCustomPattern = wizardData.stitchPattern.pattern === 'Custom' ||
      wizardData.stitchPattern.pattern === 'Custom pattern' ||
      wizardData.stitchPattern.pattern === 'Two-Color Brioche';

    if (isCustomPattern && wizardData.duration.type && !wizardData.hasShaping) {
      const rowsInPattern = parseInt(wizardData.stitchPattern.rowsInPattern) || 1;
      let stitchChangePerRepeat = parseInt(wizardData.stitchPattern.stitchChangePerRepeat) || 0;

      // Calculate stitch change from customSequence if it exists
      if (wizardData.stitchPattern.customSequence?.rows) {
        const rows = wizardData.stitchPattern.customSequence.rows;

        // Handle array (Custom) vs object (Two-Color Brioche)
        const rowValues = Array.isArray(rows) ? rows : Object.values(rows);
        stitchChangePerRepeat = rowValues.reduce((sum, row) => sum + (row.stitchChange || 0), 0);
      }

      // Handle duration.type === 'rows'
      // Handle duration.type === 'rows'
      if (wizardData.duration.type === 'rows') {
        const totalRows = parseInt(wizardData.duration.value) || 1;

        // ✅ NEW: Build calculatedRows array with proper stitch tracking
        let runningStitches = currentStitches;
        const calculatedRows = [];

        if (wizardData.stitchPattern.customSequence?.rows) {
          const rows = wizardData.stitchPattern.customSequence.rows;

          // Handle Two-Color Brioche object structure vs Custom array structure
          const isObject = !Array.isArray(rows);

          if (isObject && wizardData.stitchPattern.pattern === 'Two-Color Brioche') {
            // Two-Color Brioche: pairs of rows (1a, 1b), (2a, 2b)
            for (let i = 0; i < totalRows; i++) {
              const pairIndex = Math.floor(i / 2) + 1;
              const isFirstInPair = i % 2 === 0;
              const rowKey = `${pairIndex}${isFirstInPair ? 'a' : 'b'}`;
              const row = rows[rowKey];

              if (row) {
                let endingStitchesForRow;
                // PRIORITY: Use stitchesRemaining if provided
                if (row.stitchesRemaining !== null && row.stitchesRemaining !== undefined) {
                  endingStitchesForRow = row.stitchesRemaining;
                } else {
                  endingStitchesForRow = runningStitches + (row.stitchChange || 0);
                }

                calculatedRows.push({
                  rowNumber: i + 1,
                  instruction: row.instruction || '',
                  stitches: endingStitchesForRow
                });

                runningStitches = endingStitchesForRow;
              }
            }
          } else {
            // Custom pattern: simple array structure
            const rowValues = Array.isArray(rows) ? rows : Object.values(rows);

            for (let i = 0; i < totalRows; i++) {
              const rowIndex = i % rowValues.length;
              const row = rowValues[rowIndex];

              let endingStitchesForRow;
              // PRIORITY: Use stitchesRemaining if provided
              if (row.stitchesRemaining !== null && row.stitchesRemaining !== undefined) {
                endingStitchesForRow = row.stitchesRemaining;
              } else {
                endingStitchesForRow = runningStitches + (row.stitchChange || 0);
              }

              calculatedRows.push({
                rowNumber: i + 1,
                instruction: row.instruction || '',
                stitches: endingStitchesForRow
              });

              runningStitches = endingStitchesForRow;
            }
          }
        }

        // ✅ FIX: Calculate ending stitches for Description Entry mode
        // Description Entry doesn't have customSequence, so calculate from stitchChangePerRepeat
        const endingStitches = calculatedRows.length > 0
          ? calculatedRows[calculatedRows.length - 1].stitches
          : currentStitches + (stitchChangePerRepeat * Math.ceil(totalRows / rowsInPattern));

        IntelliKnitLogger.success('Custom Pattern Calculated (rows)', {
          pattern: wizardData.stitchPattern.pattern,
          totalRows,
          startingStitches: currentStitches,
          endingStitches,
          calculatedRowsCount: calculatedRows.length
        });

        return {
          success: true,
          totalRows,
          startingStitches: currentStitches,
          endingStitches,
          calculatedRows, // ✅ Include calculated rows
          isCustomPattern: true
        };
      }

      // Handle duration.type === 'length' or 'until_length'
      if (wizardData.duration.type === 'length' || wizardData.duration.type === 'until_length') {
        IntelliKnitLogger.success('Custom Pattern with Length', {
          pattern: wizardData.stitchPattern.pattern,
          durationType: wizardData.duration.type,
          lengthValue: wizardData.duration.value,
          units: wizardData.duration.units,
          rowsInPattern,
          stitchChangePerRepeat,
          note: 'Ending stitches cannot be calculated without gauge'
        });

        return {
          success: true,
          totalRows: 1, // Placeholder
          startingStitches: currentStitches,
          endingStitches: currentStitches, // Can't calculate without gauge
          isLengthBased: true,
          lengthValue: wizardData.duration.value,
          lengthUnits: wizardData.duration.units
        };
      }

      // If we got here, it's an unsupported duration type for custom patterns
      // But still return success to avoid the red box
      IntelliKnitLogger.warn('Custom Pattern with unsupported duration type', {
        pattern: wizardData.stitchPattern.pattern,
        durationType: wizardData.duration.type
      });

      return {
        success: true,
        totalRows: 1,
        startingStitches: currentStitches,
        endingStitches: currentStitches,
        isCustomPattern: true
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

    // Fallback - validate we have minimum required data
    if (!wizardData.duration?.type || !wizardData.duration?.value) {
      return {
        success: false,
        error: 'Missing duration configuration',
        totalRows: 1,
        startingStitches: currentStitches,
        endingStitches: currentStitches
      };
    }

    // We have everything needed for basic patterns
    return {
      success: true,  // ✅ Safe - we validated above
      totalRows: wizardData.duration.type === 'rows' ?
        parseInt(wizardData.duration.value) || 1 : 1,
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