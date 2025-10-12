import { useMemo } from 'react';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import { getConstructionTerms } from '../../../shared/utils/ConstructionTerminology';
import { getStepMethodDisplay, includesInRowCountPatterns, requiresCustomText } from '../../../shared/utils/stepDisplayUtils';

// Helper to create mock step for utility usage
const createMockStep = (wizardData, construction) => ({
  wizardConfig: {
    stitchPattern: wizardData.stitchPattern,
    duration: wizardData.duration
  },
  construction: construction
});

// Helper for consistent duration text
const getDurationText = (wizardData, construction, currentStitches = 0) => {
  const { duration, colorwork } = wizardData;

  switch (duration.type) {
    case 'rows':
      return ` for ${duration.value} ${construction === 'round' ? 'rounds' : 'rows'}`;
    case 'until_length':
      return ` until piece measures ${duration.value} ${duration.units}`;
    case 'repeats':
      return ` for ${duration.value} repeats`;
    case 'target_repeats':
      if (duration.targetStitches && wizardData.stitchPattern.stitchChangePerRepeat !== undefined) {
        const stitchChangePerRepeat = parseInt(wizardData.stitchPattern.stitchChangePerRepeat) || 0;
        const targetStitches = parseInt(duration.targetStitches);

        if (stitchChangePerRepeat === 0) {
          return ` until ${targetStitches} stitches`; // Fallback
        }

        const stitchDifference = targetStitches - currentStitches;
        const repeatsNeeded = Math.ceil(Math.abs(stitchDifference) / Math.abs(stitchChangePerRepeat));

        return ` ${repeatsNeeded} ${repeatsNeeded === 1 ? 'time' : 'times'}`;
      }
      return '';
    case 'color_repeats':
      // Calculate total rows from stripe sequence
      if (colorwork?.stripeSequence) {
        const totalRowsInSequence = colorwork.stripeSequence.reduce(
          (sum, stripe) => sum + (stripe.rows || 0),
          0
        );
        const totalRows = totalRowsInSequence * parseInt(duration.value);
        return ` for ${totalRows} ${construction === 'round' ? 'rounds' : 'rows'}`;
      }
      return ` for ${duration.value} color repeats`;
    case 'measurement': // Handle legacy type
      return ` until piece measures ${duration.value} ${duration.units}`;
    default:
      return '';
  }
};

export const useStepGeneration = (construction = 'flat') => {
  const generateInstruction = useMemo(() => (wizardData, currentStitches = 0) => {
    const pattern = wizardData.stitchPattern.pattern === 'Other' ?
      wizardData.stitchPattern.customText :
      wizardData.stitchPattern.pattern;

    // Handle Cast On
    if (pattern === 'Cast On') {
      const mockStep = createMockStep(wizardData, construction);
      const methodDisplay = getStepMethodDisplay(mockStep);
      const methodText = methodDisplay ? ` using ${methodDisplay.toLowerCase()}` : '';
      const detailsText = wizardData.stitchPattern.customDetails ?
        ` (${wizardData.stitchPattern.customDetails})` : '';
      return `Cast on ${wizardData.stitchPattern.stitchCount} stitches${methodText}${detailsText}`;
    }

    // Handle Bind Off
    if (pattern === 'Bind Off') {
      const mockStep = createMockStep(wizardData, construction);
      const methodDisplay = getStepMethodDisplay(mockStep);
      const methodText = methodDisplay ? ` using ${methodDisplay.toLowerCase()}` : '';
      const detailsText = wizardData.stitchPattern.customDetails ?
        ` (${wizardData.stitchPattern.customDetails})` : '';
      return wizardData.duration.value ?
        `Bind off ${wizardData.duration.value} stitches${methodText}${detailsText}` :
        `Bind off all stitches${methodText}${detailsText}`;
    }

    // 🔄 REPLACED: Handle patterns with custom row counts using centralized function
    // OLD: ['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'].includes(pattern)
    if (includesInRowCountPatterns(pattern)) {
      const rowsText = wizardData.stitchPattern.rowsInPattern ?
        `${wizardData.stitchPattern.rowsInPattern}-row ` : '';
      const detailsText = wizardData.stitchPattern.customDetails ?
        ` (${wizardData.stitchPattern.customDetails})` : '';

      let instruction = `${rowsText}${pattern.toLowerCase()}${detailsText}`;
      instruction += getDurationText(wizardData, construction, currentStitches);

      return instruction;
    }

    // 🔄 REPLACED: Handle custom patterns using centralized function
    // OLD: pattern === 'Custom pattern'
    // NOTE: Custom pattern has different generation logic (doesn't use includesInRowCountPatterns)
    if (requiresCustomText(pattern) && !includesInRowCountPatterns(pattern)) {
      const rowsText = wizardData.stitchPattern.rowsInPattern ?
        `${wizardData.stitchPattern.rowsInPattern}-row ` : '';
      const baseText = wizardData.stitchPattern.customText || 'custom pattern';
      const detailsText = wizardData.stitchPattern.customDetails ?
        ` (${wizardData.stitchPattern.customDetails})` : '';

      let instruction = `${rowsText}${baseText}${detailsText}`;
      instruction += getDurationText(wizardData, construction, currentStitches);

      return instruction;
    }

    // Regular pattern with duration
    let instruction = pattern;
    const detailsText = wizardData.stitchPattern.customDetails ?
      ` (${wizardData.stitchPattern.customDetails})` : '';

    instruction += detailsText;
    instruction += getDurationText(wizardData, construction);

    // Add shaping description if applicable
    if (wizardData.hasShaping && wizardData.shapingConfig) {
      const { shapingMode, shapingType, positions, frequency, times, comments, type, config } = wizardData.shapingConfig;

      // Legacy detection (safety check)
      if (shapingMode && !type) {
        IntelliKnitLogger.warn('🚨 UNEXPECTED LEGACY SHAPING DETECTED', {
          shapingMode, shapingType, positions, frequency, times,
          suggestion: 'This should not happen in modern system'
        });
      }

      // Modern shaping system (type-based)
      if (type === 'even_distribution' && config?.calculation?.instruction) {
        instruction += ` with ${config.calculation.instruction}`;
      }
      else if (type === 'phases' && config?.calculation?.instruction) {
        instruction += ` with ${config.calculation.instruction}`;
      }
      else if (type === 'marker_phases' && config?.calculation?.instruction) {
        instruction += ` with ${config.calculation.instruction}`;
      }
      else if (type === 'bind_off_shaping' && config?.calculation?.instruction) {
        instruction += ` with ${config.calculation.instruction}`;
      }
      // Add this AFTER the existing phases case:
      else if (type === 'intrinsic_pattern' && config?.calculation?.instruction) {
        instruction += ` with ${config.calculation.instruction}`;
      }
      else {
        // No shaping data found - pattern-only step
      }

      if (comments) {
        instruction += ` (${comments})`;
      }
    }

    return instruction;
  }, [construction]); // 🎯 FIX: Add construction to dependency array

  return { generateInstruction };
};