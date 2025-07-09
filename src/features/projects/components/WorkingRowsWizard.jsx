// features/steps/hooks/useStepWizard.js
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

  const [wizardData, setWizardData] = useState(() => {
    if (isEditing && editingStep?.wizardConfig) {
      return {
        ...editingStep.wizardConfig,
        hasShaping: editingStep.advancedWizardConfig?.hasShaping || false,
        shapingConfig: {
          shapingType: 'increase',
          positions: ['end'],
          frequency: 4,
          times: 6,
          technique: 'auto',
          shapingMode: 'regular',
          bindOffSequence: [3, 2, 2, 1, 1],
          comments: '',
          ...(editingStep.advancedWizardConfig?.shapingConfig || {})
        }
      };
    }
    return {
      stitchPattern: { 
        category: null, 
        pattern: null, 
        customText: '', 
        method: '',
        rowsInPattern: '', 
        stitchCount: '', 
        customDetails: '' 
      },
      duration: { type: '', value: '', units: currentProject?.defaultUnits || 'inches' },
      hasShaping: false,
      shapingConfig: {
        shapingType: 'increase',
        positions: ['end'],
        frequency: 4,
        times: 6,
        targetChange: 20,
        technique: 'auto',
        shapingMode: 'regular',
        bindOffSequence: [3, 2, 2, 1, 1],
        comments: ''
      }
    };
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

  // Get current stitch count from last step
  useEffect(() => {
    if (!component) return;
    
    if (component.steps.length === 0) {
      setCurrentStitches(0);
      return;
    }
    
    const lastStep = component.steps[component.steps.length - 1];
    if (lastStep.calculatedRows && lastStep.calculatedRows.length > 0) {
      const lastRow = lastStep.calculatedRows[lastStep.calculatedRows.length - 1];
      setCurrentStitches(lastRow.stitchCount);
    } else if (lastStep.endingStitches && lastStep.endingStitches > 0) {
      setCurrentStitches(lastStep.endingStitches);
    } else if (lastStep.expectedStitches > 0) {
      setCurrentStitches(lastStep.expectedStitches);
    } else {
      const stitchMatch = lastStep.description.match(/→\s*(\d+)\s*stitches/);
      if (stitchMatch) {
        setCurrentStitches(parseInt(stitchMatch[1]));
      } else {
        setCurrentStitches(0);
      }
    }
  }, [component?.steps, componentIndex]);

  const updateWizardData = (section, data) => {
    setWizardData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  // Check if current pattern can have shaping
  const canHaveShaping = () => {
    const { pattern } = wizardData.stitchPattern;
    return pattern && pattern !== 'Cast On' && pattern !== 'Bind Off';
  };

  const canProceed = (step) => {
    switch (step) {
      case 1:
        return wizardData.stitchPattern.category;
      case 2:
        if (wizardData.stitchPattern.pattern === 'Cast On') {
          return wizardData.stitchPattern.stitchCount;
        }
        if (['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'].includes(wizardData.stitchPattern.pattern)) {
          return wizardData.stitchPattern.pattern && wizardData.stitchPattern.rowsInPattern;
        }
        if (wizardData.stitchPattern.pattern === 'Custom pattern') {
          return wizardData.stitchPattern.customText;
        }
        return wizardData.stitchPattern.pattern && 
               (wizardData.stitchPattern.pattern !== 'Other' || wizardData.stitchPattern.customText);
      case 3:
        if (!wizardData.hasShaping) return true;
        const { shapingMode, shapingType, positions, bindOffSequence } = wizardData.shapingConfig;
        if (shapingMode === 'bindoff') {
          return bindOffSequence && bindOffSequence.length > 0;
        } else if (shapingMode === 'raglan') {
          return shapingType;
        } else {
          return shapingType && positions && positions.length > 0;
        }
      case 4:
        if (wizardData.stitchPattern.pattern === 'Cast On') return true;
        if (wizardData.stitchPattern.pattern === 'Bind Off') {
          return wizardData.duration.type;
        }
        return wizardData.duration.type && wizardData.duration.value;
      default:
        return false;
    }
  };

  const getNextStep = (currentStep) => {
    if (currentStep === 1) return 2;
    if (currentStep === 2) {
      if (!canHaveShaping() || !wizardData.hasShaping) {
        return 4; // Skip to duration
      }
      return 3; // Go to shaping config
    }
    if (currentStep === 3) return 4;
    if (currentStep === 4) return 5;
    return currentStep + 1;
  };

  const getPreviousStep = (currentStep) => {
    if (currentStep === 5) return 4;
    if (currentStep === 4) {
      if (!canHaveShaping() || !wizardData.hasShaping) {
        return 2; // Go back to pattern details
      }
      return 3; // Go back to shaping config
    }
    if (currentStep === 3) return 2;
    if (currentStep === 2) return 1;
    return currentStep - 1;
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
    isEditing,
    editingStep,
    
    // Actions
    updateWizardData,
    setConstruction,
    canHaveShaping,
    
    // Navigation
    navigation
  };
};