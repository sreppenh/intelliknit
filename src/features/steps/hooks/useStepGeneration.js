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
const getDurationText = (wizardData, construction) => {
  const { duration } = wizardData;

  switch (duration.type) {
    case 'rows':
      return ` for ${duration.value} ${construction === 'round' ? 'rounds' : 'rows'}`;
    case 'until_length':
      return ` until piece measures ${duration.value} ${duration.units}`;
    case 'repeats':
      return ` for ${duration.value} repeats`;
    case 'measurement': // Handle legacy type
      return ` until piece measures ${duration.value} ${duration.units}`;
    default:
      return '';
  }
};

export const useStepGeneration = (construction = 'flat') => {
  const generateInstruction = useMemo(() => (wizardData) => {
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
      instruction += getDurationText(wizardData, construction);

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
      instruction += getDurationText(wizardData, construction);

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