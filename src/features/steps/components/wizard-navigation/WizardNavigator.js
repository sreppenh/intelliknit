import { shouldSkipConfiguration as shouldSkipPatternConfiguration } from '../../../../shared/utils/PatternCategories';
import { validatePatternConfiguration } from '../../../../shared/utils/stepDisplayUtils';

export const shouldSkipConfiguration = (wizardData) => {
  return shouldSkipPatternConfiguration(wizardData);
};

// Helper function to determine if navigation buttons should be shown
export const shouldShowNavigation = (wizardStep) => {
  // Don't show nav buttons for choice screens or auto-advancing screens
  const choiceSteps = [3]; // Duration/Shaping choice
  const autoAdvanceSteps = []; // Pattern selector auto-advances

  return !choiceSteps.includes(wizardStep) &&
    !autoAdvanceSteps.includes(wizardStep) &&
    wizardStep < 5;
};

// Main navigation logic
export const createWizardNavigator = (wizardData, currentStep) => {
  const getNextStep = () => {
    const { pattern } = wizardData.stitchPattern;

    switch (currentStep) {
      case 1: // PatternSelector  
        // Skip step 2 for basic patterns - go directly to step 3
        if (shouldSkipConfiguration(wizardData)) {
          return 3; // Skip directly to Duration/Shaping choice
        }
        return 2; // Go to configuration for complex patterns

      case 2: // PatternConfiguration
        // Cast On and Bind Off skip to preview
        if (pattern === 'Cast On' && wizardData.stitchPattern.stitchCount) {
          return 5;
        }
        if (pattern === 'Bind Off') {
          return 5;
        }
        // Everything else goes to Duration/Shaping choice
        return 3;

      case 3: // Duration/Shaping Choice
        if (wizardData.hasShaping === false) {
          return 4; // Go to duration config
        }
        return 5; // Go to preview (or future shaping step)

      case 4: // Duration Config
        return 5; // Go to preview

      default:
        return currentStep + 1;
    }
  };

  const getPreviousStep = () => {
    const { pattern } = wizardData.stitchPattern;

    switch (currentStep) {
      case 5: // Preview
        if (wizardData.hasShaping === false) {
          return 4; // Back to duration config
        }
        return 3; // Back to choice

      case 4: // Duration Config
        return 3; // Back to choice

      case 3: // Duration/Shaping Choice
        if (shouldSkipConfiguration(wizardData)) {
          return 1; // Back to pattern selector (skip config)
        }
        return 2; // Back to configuration

      case 2: // Configuration
        return 1;

      default:
        return Math.max(1, currentStep - 1);
    }
  };

  const canProceed = () => {
    const { category, pattern, stitchCount, customText, rowsInPattern } = wizardData.stitchPattern;
    const { type, value } = wizardData.duration || {};

    switch (currentStep) {
      case 1: // PatternSelector
        return category && pattern;

      case 2: // PatternConfiguration
        if (shouldSkipConfiguration(wizardData)) {
          return true;
        }

        // Use centralized validation from stepDisplayUtils
        return validatePatternConfiguration(wizardData.stitchPattern);

      case 3: // Duration/Shaping choice
        // Choice steps handle their own advancement
        return true;

      case 4: // Duration Config
        if (pattern === 'Bind Off') {
          return true;
        }
        return type && value;

      case 5: // Preview
        return true;

      default:
        return false;
    }
  };

  return {
    getNextStep,
    getPreviousStep,
    canProceed
  };
};