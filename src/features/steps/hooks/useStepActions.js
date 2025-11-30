// features/steps/hooks/useStepActions.js
// import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import { useActiveContext } from '../../../shared/hooks/useActiveContext';
import { useStepCalculation } from './useStepCalculation';
import { useStepGeneration } from './useStepGeneration';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

// ✅ EXTRACTED: Helper function to create step objects consistently
// ✅ FIXED: Helper function to create step objects consistently
// ✅ FIXED: Helper function to create step objects consistently
const createStepObject = (instruction, effect, wizard, options = {}) => {
  const {
    forceManualType = false,
    includeNavigation = true,
    useCurrentStitches = false
  } = options;

  console.log('🔍 COLORWORK BEING SAVED:', wizard.wizardData?.colorwork);

  const stepObject = {
    description: instruction,
    type: forceManualType ? 'manual' : (effect.success ? 'calculated' : 'manual'),
    patternType: effect.detection?.type,
    parsedData: effect.detection?.parsedData,
    construction: wizard.construction,
    calculatedRows: effect.calculation?.rows || effect.rows || [],
    startingStitches: effect.isCastOn ? 0 : (useCurrentStitches ? wizard.currentStitches : wizard.currentStitches),
    endingStitches: effect.endingStitches,
    totalRows: effect.totalRows,
    expectedStitches: effect.endingStitches,

    // 🎯 FIX: Ensure colorwork is properly transferred


    colorwork: wizard.wizardData?.colorwork || null,

    sideTracking: wizard.wizardData?.sideTracking || null,

    wizardConfig: wizard.wizardData,
    advancedWizardConfig: {
      hasShaping: wizard.wizardData.hasShaping,
      shapingConfig: wizard.wizardData.shapingConfig
    },
    ...(includeNavigation && wizard.navigationStack && { navigationStack: wizard.navigationStack }),
    ...(includeNavigation && wizard.navigationCache && { navigationCache: wizard.navigationCache })
  };

  console.log('🔍 SIDE TRACKING BEING SAVED:', wizard.wizardData?.sideTracking);


  return stepObject;
};

export const useStepActions = (wizard, onBack, mode = 'project') => {
  const { dispatch } = useActiveContext(mode);

  const { calculateEffect } = useStepCalculation();
  const { generateInstruction } = useStepGeneration(wizard.construction);

  const handleAddStepWithCustomData = (customWizard) => {
    const instruction = generateInstruction(customWizard.wizardData);
    const effect = calculateEffect(customWizard.wizardData, customWizard.currentStitches, customWizard.construction);

    // ✅ USE HELPER: Create step object for debugging
    const stepObject = createStepObject(instruction, effect, customWizard);

    if (customWizard.isEditing) {
      // Update existing step
      dispatch({
        type: 'UPDATE_STEP',
        payload: {
          componentIndex: customWizard.componentIndex,
          stepIndex: customWizard.editingStepIndex,
          step: createStepObject(instruction, effect, customWizard, { includeNavigation: false })
        }
      });
    } else {
      // Add new step
      dispatch({
        type: 'ADD_STEP',
        payload: {
          componentIndex: customWizard.componentIndex,
          step: createStepObject(instruction, effect, customWizard, {
            forceManualType: true,
            includeNavigation: false
          })
        }
      });
    }

    // 🎯 FIX: Update stitch count BEFORE reset
    customWizard.setCurrentStitches(effect.endingStitches);

    // Reset wizard for next step but stay in wizard
    customWizard.resetWizardData();
    onBack();
  };

  const handleAddStep = () => {

    const instruction = generateInstruction(wizard.wizardData);
    const effect = calculateEffect(wizard.wizardData, wizard.currentStitches, wizard.construction)

    if (wizard.isEditing) {
      // Update existing step
      const updateActionType = mode === 'notepad' ? 'UPDATE_STEP_IN_NOTE' : 'UPDATE_STEP';

      dispatch({
        type: updateActionType,
        payload: {
          componentIndex: wizard.componentIndex,
          stepIndex: wizard.editingStepIndex,
          step: createStepObject(instruction, effect, wizard)
        }
      });
    } else {
      // Add new step
      if (effect.success) {
        const actionType = mode === 'notepad' ? 'ADD_STEP_TO_NOTE' : 'ADD_CALCULATED_STEP';

        dispatch({
          type: actionType,
          payload: {
            componentIndex: wizard.componentIndex,
            step: createStepObject(instruction, effect, wizard, { forceManualType: false })
          }
        });
      } else {
        const actionType = mode === 'notepad' ? 'ADD_STEP_TO_NOTE' : 'ADD_STEP';

        dispatch({
          type: actionType,
          payload: {
            componentIndex: wizard.componentIndex,
            step: createStepObject(instruction, effect, wizard, { useCurrentStitches: true })

          }
        });
      }
    }

    // Navigate back to component detail
    onBack();
  };

  const handleAddStepAndContinue = () => {
    IntelliKnitLogger.debug('Step Actions', 'handleAddStepAndContinue called');
    console.log('🔧 handleAddStepAndContinue called for mode:', mode);

    const instruction = generateInstruction(wizard.wizardData);
    const effect = calculateEffect(wizard.wizardData, wizard.currentStitches, wizard.construction);

    if (effect.success) {
      dispatch({
        type: 'ADD_CALCULATED_STEP',
        payload: {
          componentIndex: wizard.componentIndex,
          step: createStepObject(instruction, effect, wizard, { includeNavigation: false })
        }
      });
    } else {
      dispatch({
        type: 'ADD_STEP',
        payload: {
          componentIndex: wizard.componentIndex,
          step: createStepObject(instruction, effect, wizard, {
            useCurrentStitches: true,
            includeNavigation: false
          })
        }
      });
    }

    // 🎯 FIX: Update stitch count BEFORE reset
    wizard.setCurrentStitches(effect.endingStitches);

    // Reset wizard for next step but stay in wizard
    wizard.navigation.goToStep(1);
    wizard.resetWizardData();
  };

  return {
    handleAddStep,
    handleAddStepAndContinue,
    handleAddStepWithCustomData
  };
};