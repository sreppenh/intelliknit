// Helper function to determine if a pattern should skip configuration
export const shouldSkipConfiguration = (wizardData) => {
  const { pattern } = wizardData.stitchPattern;
  
  // Basic patterns that don't need configuration
  const basicPatterns = [
    'Stockinette', 'Garter', 'Reverse Stockinette',
    '1x1 Rib', '2x2 Rib', '3x3 Rib', '2x1 Rib', '1x1 Twisted Rib', '2x2 Twisted Rib',
    'Seed Stitch', 'Moss Stitch', 'Double Seed', 'Basketweave'
  ];
  
  return basicPatterns.includes(pattern);
};

// Helper function to determine if navigation buttons should be shown
export const shouldShowNavigation = (wizardStep) => {
  // Don't show nav buttons for choice screens or auto-advancing screens
  const choiceSteps = [3]; // Duration/Shaping choice
  const autoAdvanceSteps = [1]; // Pattern selector auto-advances
  
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
    const { type, value } = wizardData.duration;
    
    switch (currentStep) {
      case 1: // PatternSelector
        return category && pattern;
        
      case 2: // PatternConfiguration
        if (shouldSkipConfiguration(wizardData)) {
          return true;
        }
        
        if (pattern === 'Cast On') {
          return stitchCount && parseInt(stitchCount) > 0;
        }
        if (pattern === 'Bind Off') {
          return true;
        }
        
        // Complex patterns that need both description AND row count
        if (['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'].includes(pattern)) {
          return customText && customText.trim() !== '' && 
                 rowsInPattern && parseInt(rowsInPattern) > 0;
        }
        
        if (pattern === 'Custom pattern') {
          return customText && customText.trim() !== '';
        }
        
        if (pattern === 'Other') {
          return customText && customText.trim() !== '';
        }
        
        return true;
        
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