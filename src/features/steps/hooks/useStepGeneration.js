import { useMemo } from 'react';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import { getConstructionTerms } from '../../../shared/utils/ConstructionTerminology';
import { getStepMethodDisplay } from '../../../shared/utils/stepDisplayUtils';

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

    // Handle patterns with custom row counts
    if (['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'].includes(pattern)) {
      const rowsText = wizardData.stitchPattern.rowsInPattern ?
        `${wizardData.stitchPattern.rowsInPattern}-row ` : '';
      const detailsText = wizardData.stitchPattern.customDetails ?
        ` (${wizardData.stitchPattern.customDetails})` : '';

      let instruction = `${rowsText}${pattern.toLowerCase()}${detailsText}`;
      instruction += getDurationText(wizardData, construction);

      return instruction;
    }

    // Handle custom patterns
    if (pattern === 'Custom pattern') {
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

      // Add debugging log
      IntelliKnitLogger.debug('Shaping debug - type:', type, 'config exists:', !!config);

      // Check for new shaping structure first (from ShapingWizard)
      if (type === 'even_distribution' && config && config.calculation && config.calculation.instruction) {
        instruction += ` with ${config.calculation.instruction}`;
      }
      else if (type === 'phases' && config && config.calculation && config.calculation.instruction) {
        instruction += ` with ${config.calculation.instruction}`;
      }
      // Fall back to old shaping structure
      else if (shapingMode === 'raglan') {
        const terms = getConstructionTerms(construction);
        const freqText = frequency === 2 ? terms.everyOtherRow.replace('every ', '') : `${frequency}th ${terms.row}`;
        instruction += ` with raglan ${shapingType}s ${freqText} ${times} times`;

      } else if (shapingMode === 'bindoff') {
        instruction += ` with bind-off shaping`;
      }
      // REMOVED: The redundant 'distribution' fallback block that was handling the same case as 'even_distribution'
      else if (positions && shapingType && frequency && times) {
        const terms = getConstructionTerms(construction);
        const positionText = positions.includes('both_ends') ? terms.atBothEnds : positions.join(' and ');
        const freqText = frequency === 2 ? terms.everyOtherRow.replace('every ', '') : `${frequency}th ${terms.row}`;
        instruction += ` with ${shapingType}s at ${positionText} ${freqText} ${times} times`;
      }
      // If no valid legacy data, just skip the shaping text entirely

      if (comments) {
        instruction += ` (${comments})`;
      }
    }

    return instruction;
  }, []);

  return { generateInstruction };
};