// src/shared/hooks/useWizardNavigation.js
import { useMemo } from 'react';

export const useWizardNavigation = (wizardType, currentStep, wizardData, navigation, onBack) => {
  const navInfo = useMemo(() => {
    switch (wizardType) {
      case 'step-wizard':
        return getStepWizardNavigation(currentStep, wizardData);
      case 'component-creation':
        return getComponentCreationNavigation(currentStep, wizardData);
      case 'component-ending':
        return getComponentEndingNavigation(currentStep, wizardData);
      default:
        return { stepName: 'Unknown', currentStep, totalSteps: currentStep, canGoBack: false };
    }
  }, [wizardType, currentStep, wizardData]);

  const handleBack = () => {
    if (!navInfo.canGoBack) {
      onBack();
      return;
    }

    if (wizardType === 'step-wizard' && navigation?.goToStep) {
      // Use smart navigation for step wizard
      const previousStep = getPreviousStepForStepWizard(currentStep, wizardData);
      if (previousStep && previousStep !== currentStep) {
        navigation.goToStep(previousStep);
      } else {
        onBack();
      }
    } else if (wizardType === 'component-creation' && navigation?.setStep) {
      // Simple back for component creation
      const previousStep = currentStep - 1;
      if (previousStep >= 1) {
        navigation.setStep(previousStep);
      } else {
        onBack();
      }
    } else {
      onBack();
    }
  };

  return {
    ...navInfo,
    handleBack
  };
};

// Step Wizard Navigation Logic
const getStepWizardNavigation = (currentStep, wizardData) => {
  const { pattern } = wizardData.stitchPattern || {};
  
  // Calculate actual flow
  const flow = [1]; // Always start with pattern selection
  
  if (pattern && !shouldSkipConfiguration(wizardData)) {
    flow.push(2); // Configuration
  }
  
  if (pattern !== 'Cast On' && pattern !== 'Bind Off') {
    flow.push(3); // Shaping/Duration choice
  }
  
if (wizardData.hasShaping === false) {
  flow.push(4); // Duration config
  flow.push(5); // Preview
} else if (wizardData.hasShaping === true) {
  flow.push(4); // Shaping config (or shaping completed)
  flow.push(5); // Preview
} else {
  flow.push(5); // Preview (hasShaping not set yet)
}
  
  const currentIndex = flow.indexOf(currentStep);
  const stepName = getStepWizardStepName(currentStep, wizardData);
  
  return {
    stepName,
    currentStep: currentIndex + 1,
    totalSteps: flow.length,
    canGoBack: currentStep > 1
  };
};

const shouldSkipConfiguration = (wizardData) => {
  const { pattern } = wizardData.stitchPattern || {};
  const basicPatterns = [
    'Stockinette', 'Garter', 'Reverse Stockinette',
    '1x1 Rib', '2x2 Rib', '3x3 Rib', '2x1 Rib', '1x1 Twisted Rib', '2x2 Twisted Rib',
    'Seed Stitch', 'Moss Stitch', 'Double Seed', 'Basketweave'
  ];
  return basicPatterns.includes(pattern);
};

const getStepWizardStepName = (step, wizardData) => {
  const { pattern } = wizardData.stitchPattern || {};
  
  // Special case for shaping wizard
  if (wizardData.isShapingWizard) {
    return 'Shaping Setup';
  }
  
  switch (step) {
    case 1: return 'Stitch Pattern';
    case 2: return 'Pattern Details';
    case 3: 
      if (pattern === 'Cast On') return 'Cast On Setup';
      if (pattern === 'Bind Off') return 'Bind Off Setup';
      return 'Duration & Shaping';
    case 4: 
      if (wizardData.hasShaping === false) return 'Duration Setup';
      return 'Shaping Setup';
    case 5: return 'Preview';
    default: return 'Configuration';
  }
};

const getPreviousStepForStepWizard = (currentStep, wizardData) => {
  const { pattern } = wizardData.stitchPattern || {};
  
  switch (currentStep) {
    case 5: // Preview
      if (wizardData.hasShaping === false) return 4; // Back to duration
      return 3; // Back to choice
    case 4: // Duration config
      return 3; // Back to choice
    case 3: // Choice
      if (shouldSkipConfiguration(wizardData)) return 1; // Skip config
      return 2; // Back to config
    case 2: // Configuration
      return 1;
    default:
      return Math.max(1, currentStep - 1);
  }
};

// Component Creation Navigation Logic
const getComponentCreationNavigation = (currentStep, componentData) => {
  const stepNames = {
    1: 'Component Name',
    2: 'How it starts',
    3: 'Method Selection',
    4: 'Setup Details'
  };
  
  // Calculate total steps dynamically
  let totalSteps = 2; // Always have name + start type
  if (componentData.startType) totalSteps = 3;
  if (componentData.startMethod) totalSteps = 4;
  
  return {
    stepName: stepNames[currentStep] || 'Configuration',
    currentStep,
    totalSteps: Math.max(totalSteps, currentStep),
    canGoBack: currentStep > 1
  };
};

// Component Ending Navigation Logic  
const getComponentEndingNavigation = (currentStep, endingData) => {
  const stepNames = {
    1: 'Ending Type',
    2: 'Configuration'
  };
  
  return {
    stepName: stepNames[currentStep] || 'Configuration',
    currentStep,
    totalSteps: 2,
    canGoBack: currentStep > 1
  };
};

export default useWizardNavigation;