import { useMemo } from 'react';
import { includesInRowCountPatterns, requiresCustomText } from '../../shared/utils/stepDisplayUtils';

export const useStepValidation = () => {
  const validateStepData = useMemo(() => (wizardData, step) => {
    const errors = [];

    switch (step) {
      case 1:
        if (!wizardData.stitchPattern.category) {
          errors.push('Please select a stitch pattern category');
        }
        break;

      case 2:
        if (!wizardData.stitchPattern.pattern) {
          errors.push('Please select a specific pattern');
        }

        if (wizardData.stitchPattern.pattern === 'Cast On' && !wizardData.stitchPattern.stitchCount) {
          errors.push('Please enter the number of stitches to cast on');
        }

        // 🔄 REPLACED: Hardcoded array with centralized function
        // OLD: ['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'].includes(wizardData.stitchPattern.pattern)
        if (includesInRowCountPatterns(wizardData.stitchPattern.pattern)
          && !wizardData.stitchPattern.rowsInPattern) {
          errors.push('Please enter the number of rows in the pattern');
        }

        // 🔄 REPLACED: Individual pattern check with centralized function
        // OLD: wizardData.stitchPattern.pattern === 'Custom pattern'
        if (requiresCustomText(wizardData.stitchPattern.pattern) && !wizardData.stitchPattern.customText) {
          errors.push('Please describe your custom pattern');
        }
        break;

      case 3:
        if (wizardData.hasShaping) {
          if (!wizardData.shapingConfig.shapingType) {
            errors.push('Please select increase or decrease');
          }

          if (wizardData.shapingConfig.shapingMode === 'bindoff'
            && (!wizardData.shapingConfig.bindOffSequence || wizardData.shapingConfig.bindOffSequence.length === 0)) {
            errors.push('Please enter a bind-off sequence');
          }

          if (wizardData.shapingConfig.shapingMode === 'distribution'
            && !wizardData.shapingConfig.targetStitches) {
            errors.push('Please enter target stitch count');
          }
        }
        break;

      case 4:
        if (wizardData.stitchPattern.pattern !== 'Cast On') {
          if (!wizardData.duration.type) {
            errors.push('Please select a duration type');
          }

          if (wizardData.duration.type && !wizardData.duration.value
            && wizardData.stitchPattern.pattern !== 'Bind Off') {
            errors.push('Please enter a duration value');
          }
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return { validateStepData };
};