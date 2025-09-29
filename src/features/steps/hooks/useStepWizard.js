// src/features/steps/hooks/useStepWizard.js (ENHANCED VERSION)
import { useState, useEffect } from 'react';
// import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import { useActiveContext } from '../../../shared/hooks/useActiveContext';
import { CONSTRUCTION_TYPES } from '../../../shared/utils/constants';
import useSmartStepNavigation from '../../../shared/hooks/useSmartStepNavigation';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import { validatePatternConfiguration } from '../../../shared/utils/stepDisplayUtils';
import { shouldSkipConfiguration as shouldSkipPatternConfiguration } from '../../../shared/utils/PatternCategories';


export const useStepWizard = (componentIndex, editingStepIndex = null, editMode = null, mode = 'project') => {
  const { currentProject } = useActiveContext(mode);
  const [construction, setConstruction] = useState(CONSTRUCTION_TYPES.FLAT);
  const [currentStitches, setCurrentStitches] = useState(0);

  const component = currentProject?.components?.[componentIndex] || null;
  const isEditing = editingStepIndex !== null;
  const editingStep = isEditing ? component?.steps?.[editingStepIndex] : null;

  const shouldSkipConfiguration = shouldSkipPatternConfiguration;

  // Add this useEffect after the component declaration
  useEffect(() => {
    if (component?.construction) {
      setConstruction(component.construction);
    }
  }, [component?.construction]);

  // Helper function to determine starting step based on edit mode and saved stack
  const getStartingStep = () => {
    if (!editMode || !isEditing || !editingStep) {
      return 1; // Default: start at pattern selector
    }

    const savedStack = editingStep.navigationStack;
    if (!savedStack || savedStack.length === 0) {
      return 1; // Fallback if no saved stack
    }

    if (editMode === 'pattern') {
      // Find the last pattern-related screen in the saved stack
      // Pattern screens are typically 1 (PatternSelector) and 2 (PatternConfiguration)
      const lastPatternScreen = savedStack.filter(step => step <= 2).slice(-1)[0];
      const patternResult = lastPatternScreen || 1;

      return patternResult;
    }

    if (editMode === 'configuration') {
      // For configuration, go to the last screen in the saved stack
      // This will be the final config screen they were on
      const configResult = savedStack[savedStack.length - 1];

      return configResult;
    }

    console.log('🔧 Starting Step: 1 (fallback)');
    return 1; // Fallback
  };

  const startingStep = getStartingStep();


  // Helper function to get initial wizard data
  const getInitialWizardData = (defaultUnits = 'inches') => ({
    stitchPattern: {
      category: null,
      pattern: null,
      customText: '',
      method: '',
      rowsInPattern: '',
      stitchCount: '',
      customDetails: '',
      entryMode: 'row_by_row', // ✅ ADD THIS LINE - it's probably missing!
      rowInstructions: []       // ✅ ADD THIS LINE - also probably missing!
    },
    duration: { type: '', value: '', units: defaultUnits, measurement: '', targetLength: '' },
    hasShaping: false,
    shapingConfig: {},
    prepNote: '' // NEW: Add prep note to wizard data
  });

  const [wizardData, setWizardData] = useState(() => {
    if (isEditing && editingStep?.wizardConfig) {
      // Editing existing step - use step's config
      return {
        ...editingStep.wizardConfig,
        hasShaping: editingStep.advancedWizardConfig?.hasShaping || false,
        shapingConfig: {
          ...(editingStep.advancedWizardConfig?.shapingConfig || {})
        },
        prepNote: editingStep.prepNote || ''
      };
    }

    // Creating new step - check for component defaults
    const initialData = getInitialWizardData(currentProject?.defaultUnits);

    // Apply component pattern default if exists
    if (component?.defaultPattern) {
      initialData.stitchPattern = {
        ...initialData.stitchPattern,
        ...component.defaultPattern
      };
    }

    // Apply component colorwork default if exists
    if (component?.defaultColorwork) {
      initialData.colorwork = {
        ...component.defaultColorwork
      };
    }

    return initialData;
  });

  // Initialize smart navigation with saved data if editing
  const smartNav = useSmartStepNavigation(
    startingStep,
    wizardData,
    (section, data) => { updateWizardData(section, data); },
    // ✅ NEW: Pass saved navigation data if editing
    isEditing ? {
      savedStack: editingStep?.navigationStack,
      savedCache: editingStep?.navigationCache
    } : null
  );

  // Inherit construction from previous step
  // Get current stitch count from the step chain
  useEffect(() => {

    if (!component) return;

    // Special handling for notepad mode
    if (mode === 'notepad' || mode === 'note') {
      if (component.steps.length === 0) {
        // For notes, use the component's startingStitches (which came from note mapping)
        const noteStartingStitches = component.startingStitches || 0;

        setCurrentStitches(noteStartingStitches);
        return;
      }
    } else {
      // Original project logic
      if (component.steps.length === 0) {
        setCurrentStitches(0);
        return;
      }
    }

    // Common logic for both modes: get stitches from last step
    const lastStep = component.steps[component.steps.length - 1];
    const stitchCount = lastStep.endingStitches || lastStep.expectedStitches || 0;
    setCurrentStitches(stitchCount);

  }, [component?.steps, componentIndex, mode, component?.startingStitches]);

  const updateWizardData = (sectionOrKey, dataOrValue) => {

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



  // 🎯 NEW: Enhanced Validation Logic
  const canProceed = (step) => {
    switch (step) {
      case 1: // PatternSelector
        return wizardData.stitchPattern.category && wizardData.stitchPattern.pattern;

      case 2: // PatternConfiguration
        if (shouldSkipConfiguration(wizardData)) {
          return true; // Skip validation for basic patterns
        }


        const validationResult = validatePatternConfiguration(wizardData.stitchPattern);

        // Use centralized validation from stepDisplayUtils
        return validationResult;

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
      console.log('Next step calculated:', nextStep);
      smartNav.goToStep(nextStep);
    },

    previousStep: () => {
      const result = smartNav.goBack();

      if (result.action === 'exit') {
        // Will be handled by parent component
        return { shouldExit: true };
      }
      return result;
    },

    goToStep: (step) => {
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

    // Smart history for Edit
    navigationStack: smartNav.navigationStack,
    navigationCache: smartNav.dataCache,

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