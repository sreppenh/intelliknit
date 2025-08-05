// src/features/steps/hooks/useStepWizard.js (ENHANCED VERSION)
import { useState, useEffect } from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import { CONSTRUCTION_TYPES } from '../../../shared/utils/constants';
import useSmartStepNavigation from '../../../shared/hooks/useSmartStepNavigation';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

export const useStepWizard = (componentIndex, editingStepIndex = null) => {
  const { currentProject } = useProjectsContext();
  const [construction, setConstruction] = useState(CONSTRUCTION_TYPES.FLAT);
  const [currentStitches, setCurrentStitches] = useState(0);

  const component = currentProject?.components?.[componentIndex] || null;
  const isEditing = editingStepIndex !== null;
  const editingStep = isEditing ? component?.steps?.[editingStepIndex] : null;

  // Helper function to get initial wizard data
  const getInitialWizardData = (defaultUnits = 'inches') => ({
    stitchPattern: {
      category: null,
      pattern: null,
      customText: '',
      method: '',
      rowsInPattern: '',
      stitchCount: '',
      customDetails: ''
    },
    duration: { type: '', value: '', units: defaultUnits, measurement: '', targetLength: '' },
    hasShaping: false,
    shapingConfig: {},
    prepNote: '' // NEW: Add prep note to wizard data
  });

  const [wizardData, setWizardData] = useState(() => {
    if (isEditing && editingStep?.wizardConfig) {
      return {
        ...editingStep.wizardConfig,
        hasShaping: editingStep.advancedWizardConfig?.hasShaping || false,
        shapingConfig: {
          ...(editingStep.advancedWizardConfig?.shapingConfig || {})
        },
        prepNote: editingStep.prepNote || '' // NEW: Include existing prep note when editing
      };
    }
    return getInitialWizardData(currentProject?.defaultUnits);
  });

  // 🎯 NEW: Smart Navigation Integration
  const smartNav = useSmartStepNavigation(1, wizardData, (section, data) => {
    updateWizardData(section, data);
  });

  // Inherit construction from previous step
  useEffect(() => {
    if (component && component.steps.length > 0) {
      const lastStep = component.steps[component.steps.length - 1];
      if (lastStep.construction) {
        setConstruction(lastStep.construction);
      }
    }
  }, [component?.steps]);

  // Get current stitch count from the step chain
  useEffect(() => {
    if (!component) return;

    if (component.steps.length === 0) {
      // No steps yet - start with 0
      setCurrentStitches(0);
      return;
    }

    // Get the ending stitch count from the last step
    const lastStep = component.steps[component.steps.length - 1];
    const stitchCount = lastStep.endingStitches || lastStep.expectedStitches || 0;
    setCurrentStitches(stitchCount);

  }, [component?.steps, componentIndex]);

  const updateWizardData = (sectionOrKey, dataOrValue) => {
    IntelliKnitLogger.debug('Step Wizard', `Updating wizard data: ${sectionOrKey}`, dataOrValue);

    setWizardData(prev => {
      // Handle root-level properties (like hasShaping, prepNote)
      if (typeof dataOrValue === 'boolean' || typeof dataOrValue === 'string' || typeof dataOrValue === 'number') {
        return {
          ...prev,
          [sectionOrKey]: dataOrValue
        };
      }

      // Handle nested sections (like stitchPattern, duration, shapingConfig)
      return {
        ...prev,
        [sectionOrKey]: { ...prev[sectionOrKey], ...dataOrValue }
      };
    });
  };

  // Reset wizard data function
  const resetWizardData = () => {
    setWizardData(getInitialWizardData(currentProject?.defaultUnits));
    smartNav.clearCache(); // Clear navigation cache too
    IntelliKnitLogger.debug('Step Wizard', 'Reset wizard data and navigation cache');
  };

  // Check if current pattern can have shaping
  const canHaveShaping = () => {
    const { pattern } = wizardData.stitchPattern;
    return pattern && pattern !== 'Cast On' && pattern !== 'Bind Off';
  };

  // 🎯 NEW: Smart Step Flow Logic
  // These functions determine the actual flow based on wizard data
  const getNextStep = (currentStep) => {
    const { pattern } = wizardData.stitchPattern;

    switch (currentStep) {
      case 1: // PatternSelector
        // Check if we should skip configuration
        if (shouldSkipConfiguration(wizardData)) {
          return 3; // Skip directly to Duration/Shaping choice
        }
        return 2; // Go to configuration

      case 2: // PatternConfiguration  
        // Cast On and Bind Off patterns skip to preview
        if (pattern === 'Cast On' && wizardData.stitchPattern.stitchCount) {
          return 5; // Skip to preview
        }
        if (pattern === 'Bind Off') {
          return 5; // Skip to preview
        }
        return 3; // Go to Duration/Shaping choice

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

  // Helper function to check if configuration should be skipped
  const shouldSkipConfiguration = (data) => {
    const { pattern } = data.stitchPattern || {};
    const basicPatterns = [
      'Stockinette', 'Garter', 'Reverse Stockinette',
      '1x1 Rib', '2x2 Rib', '3x3 Rib', '2x1 Rib', '1x1 Twisted Rib', '2x2 Twisted Rib',
      'Seed Stitch', 'Moss Stitch', 'Double Seed', 'Basketweave'
    ];
    return basicPatterns.includes(pattern);
  };

  // 🎯 NEW: Enhanced Validation Logic
  const canProceed = (step) => {
    switch (step) {
      case 1: // PatternSelector
        return wizardData.stitchPattern.category && wizardData.stitchPattern.pattern;

      case 2: // PatternConfiguration
        if (shouldSkipConfiguration(wizardData)) {
          return true; // Skip validation for basic patterns
        }

        const { pattern, stitchCount, customText, rowsInPattern } = wizardData.stitchPattern;

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

        if (pattern === 'Custom pattern' || pattern === 'Other') {
          return customText && customText.trim() !== '';
        }

        return true;

      case 3: // Duration/Shaping choice
        return true; // Choice steps handle their own advancement

      case 4: // Duration Config
        if (wizardData.stitchPattern.pattern === 'Bind Off') {
          return true;
        }
        const { type, value } = wizardData.duration || {};
        return type && value;

      case 5: // Preview
        return true;

      default:
        return false;
    }
  };

  // 🎯 NEW: Enhanced Navigation Object
  const navigation = {
    canProceed: () => canProceed(smartNav.currentStep),

    nextStep: () => {
      const nextStep = getNextStep(smartNav.currentStep);
      IntelliKnitLogger.debug('Step Wizard', `Next step: ${smartNav.currentStep} → ${nextStep}`);
      smartNav.goToStep(nextStep);
    },

    previousStep: () => {
      const result = smartNav.goBack();
      IntelliKnitLogger.debug('Step Wizard', `Previous step result:`, result);

      if (result.action === 'exit') {
        // Will be handled by parent component
        return { shouldExit: true };
      }
      return result;
    },

    goToStep: (step) => {
      IntelliKnitLogger.debug('Step Wizard', `Direct navigation to step: ${step}`);
      smartNav.goToStep(step);
    },

    // 🎯 NEW: Enhanced navigation methods
    goToStepWithCycle: (step, cycleType) => {
      smartNav.goToStep(step, { isCycleEntry: true, cycleType });
    },

    handleBackWithUnsavedChanges: () => {
      // Integration point for unsaved changes modal
      if (smartNav.hasUnsavedChanges()) {
        return { shouldPrompt: true, changes: 'wizard-data' };
      }
      return smartNav.goBack();
    }
  };

  // 🎯 NEW: Debug information
  const getDebugInfo = () => {
    return {
      ...smartNav.getNavigationContext(),
      wizardData: JSON.stringify(wizardData, null, 2),
      canProceed: canProceed(smartNav.currentStep)
    };
  };

  return {
    // State (updated to use smart navigation)
    wizardStep: smartNav.currentStep,
    wizardData,
    construction,
    currentStitches,
    component,
    componentIndex,
    isEditing,
    editingStepIndex,
    editingStep,

    // Actions
    updateWizardData,
    setConstruction,
    canHaveShaping,
    resetWizardData,
    setCurrentStitches,

    // Navigation (enhanced)
    navigation,

    // 🎯 NEW: Smart navigation utilities
    smartNavigation: {
      canGoBack: smartNav.canGoBack,
      clearCache: smartNav.clearCache,
      getDebugInfo,
      hasUnsavedChanges: smartNav.hasUnsavedChanges
    }
  };
};

export default useStepWizard;