import { useMemo } from 'react';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

export const useStepGeneration = () => {
  const generateInstruction = useMemo(() => (wizardData) => {
    const pattern = wizardData.stitchPattern.pattern === 'Other' ? 
      wizardData.stitchPattern.customText : 
      wizardData.stitchPattern.pattern;
    
    // Handle Cast On
    if (pattern === 'Cast On') {
      const methodText = wizardData.stitchPattern.method && wizardData.stitchPattern.method !== 'Other' ? 
        ` using ${wizardData.stitchPattern.method} cast on` : '';
      const detailsText = wizardData.stitchPattern.customDetails ? 
        ` (${wizardData.stitchPattern.customDetails})` : '';
      return `Cast on ${wizardData.stitchPattern.stitchCount} stitches${methodText}${detailsText}`;
    } 
    
    // Handle Bind Off
    if (pattern === 'Bind Off') {
      const methodText = wizardData.stitchPattern.method && wizardData.stitchPattern.method !== 'Other' ? 
        ` using ${wizardData.stitchPattern.method} bind off` : '';
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
      
      if (wizardData.duration.type === 'rows') {
        instruction += ` for ${wizardData.duration.value} rows`;
      } else if (wizardData.duration.type === 'measurement') {
        instruction += ` until piece measures ${wizardData.duration.value} ${wizardData.duration.units}`;
      } else if (wizardData.duration.type === 'repeats') {
        instruction += ` for ${wizardData.duration.value} repeats`;
      }
      
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
      
      if (wizardData.duration.type === 'rows') {
        instruction += ` for ${wizardData.duration.value} rows`;
      } else if (wizardData.duration.type === 'measurement') {
        instruction += ` until piece measures ${wizardData.duration.value} ${wizardData.duration.units}`;
      } else if (wizardData.duration.type === 'repeats') {
        instruction += ` for ${wizardData.duration.value} repeats`;
      }
      
      return instruction;
    }
    
    // Regular pattern with duration
    let instruction = pattern;
    const detailsText = wizardData.stitchPattern.customDetails ? 
      ` (${wizardData.stitchPattern.customDetails})` : '';
    
    instruction += detailsText;
    
    if (wizardData.duration.type === 'rows') {
      instruction += ` for ${wizardData.duration.value} rows`;
    } else if (wizardData.duration.type === 'measurement') {
      instruction += ` until piece measures ${wizardData.duration.value} ${wizardData.duration.units}`;
    } else if (wizardData.duration.type === 'repeats') {
      instruction += ` for ${wizardData.duration.value} repeats`;
    }
    
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
        instruction += ` with raglan ${shapingType}s every ${frequency === 2 ? 'other' : `${frequency}th`} row ${times} times`;
      } else if (shapingMode === 'bindoff') {
        instruction += ` with bind-off shaping`;
      } 
      // REMOVED: The redundant 'distribution' fallback block that was handling the same case as 'even_distribution'
      else {
        const positionText = positions.includes('both_ends') ? 'both ends' : positions.join(' and ');
        instruction += ` with ${shapingType}s at ${positionText} every ${frequency === 2 ? 'other' : `${frequency}th`} row ${times} times`;
      }
      
      if (comments) {
        instruction += ` (${comments})`;
      }
    }
    
    return instruction;
  }, []);

  return { generateInstruction };
};