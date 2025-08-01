import { useState, useEffect } from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import { CONSTRUCTION_TYPES } from '../../../shared/utils/constants';

export const useStepWizard = (componentIndex, editingStepIndex = null) => {
  const { currentProject } = useProjectsContext();
  const [wizardStep, setWizardStep] = useState(1);
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
    duration: { type: '', value: '', units: defaultUnits },
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
    setWizardStep(1);
  };

  // Check if current pattern can have shaping
  const canHaveShaping = () => {
    const { pattern } = wizardData.stitchPattern;
    return pattern && pattern !== 'Cast On' && pattern !== 'Bind Off';
  };

  // Navigation functions
  const getNextStep = (currentStep) => {
    if (currentStep === 1) return 2;
    if (currentStep === 2) return 3; // Always go to step 3 (either Shaping or Duration)
    if (currentStep === 3) return 4; // From config go to preview
    return currentStep + 1;
  };

  const getPreviousStep = (currentStep) => {
    if (currentStep === 4) return 3; // From preview back to config
    if (currentStep === 3) return 2; // From config back to pattern details
    if (currentStep === 2) return 1; // From pattern details back to selector
    return currentStep - 1;
  };

  // Validation function
  const canProceed = (step) => {
    switch (step) {
      case 1:
        return wizardData.stitchPattern.category;

      case 2:
        // Must have pattern selected
        if (!wizardData.stitchPattern.pattern) return false;

        // Cast On needs stitch count
        if (wizardData.stitchPattern.pattern === 'Cast On') {
          return wizardData.stitchPattern.stitchCount && parseInt(wizardData.stitchPattern.stitchCount) > 0;
        }

        // Patterns that require rowsInPattern
        if (['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'].includes(wizardData.stitchPattern.pattern)) {
          return wizardData.stitchPattern.rowsInPattern &&
            parseInt(wizardData.stitchPattern.rowsInPattern) > 0 &&
            wizardData.hasShaping !== undefined;
        }

        // Custom pattern needs description
        if (wizardData.stitchPattern.pattern === 'Custom pattern') {
          return wizardData.stitchPattern.customText && wizardData.hasShaping !== undefined;
        }

        // Other patterns need to choose shaping
        return wizardData.stitchPattern.pattern &&
          (wizardData.stitchPattern.pattern !== 'Other' || wizardData.stitchPattern.customText) &&
          wizardData.hasShaping !== undefined;

      case 3:
        if (wizardData.hasShaping) {
          // Validate shaping config
          const { shapingMode, shapingType, positions, bindOffSequence, targetChange } = wizardData.shapingConfig;

          if (shapingMode === 'bindoff') {
            return bindOffSequence && bindOffSequence.length > 0;
          } else if (shapingMode === 'distribution') {
            return targetChange !== undefined && targetChange !== null;
          } else if (shapingMode === 'raglan') {
            return shapingType;
          } else {
            return shapingType && positions && positions.length > 0;
          }
        } else {
          // Validate duration config
          if (wizardData.stitchPattern.pattern === 'Bind Off') {
            return true; // Bind off can have empty value (means all stitches)
          }
          return wizardData.duration.type && wizardData.duration.value;
        }

      case 4:
        return true; // Preview step is always valid if we got here

      default:
        return false;
    }
  };

  const navigation = {
    canProceed: () => canProceed(wizardStep),
    nextStep: () => setWizardStep(getNextStep(wizardStep)),
    previousStep: () => setWizardStep(getPreviousStep(wizardStep)),
    goToStep: (step) => setWizardStep(step)
  };

  return {
    // State
    wizardStep,
    wizardData,
    construction,
    currentStitches,
    component,
    componentIndex,
    isEditing,
    editingStep,

    // Actions
    updateWizardData,
    setConstruction,
    canHaveShaping,
    resetWizardData,
    setCurrentStitches,

    // Navigation
    navigation
  };
};

export default useStepWizard;