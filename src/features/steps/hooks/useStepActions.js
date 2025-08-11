// features/steps/hooks/useStepActions.js
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import { useStepCalculation } from './useStepCalculation';
import { useStepGeneration } from './useStepGeneration';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';


export const useStepActions = (wizard, onBack) => {
  const { dispatch } = useProjectsContext();
  const { calculateEffect } = useStepCalculation();
  const { generateInstruction } = useStepGeneration(wizard.construction);

  const handleAddStep = () => {
    const instruction = generateInstruction(wizard.wizardData);
    const effect = calculateEffect(wizard.wizardData, wizard.currentStitches, wizard.construction);
    IntelliKnitLogger.debug('Step Actions', 'handleAddStep called');

    console.log('🔧 WIZARD navigationStack:', wizard.navigationStack);
    console.log('🔧 WIZARD navigationCache:', wizard.navigationCache);

    if (wizard.isEditing) {
      // Update existing step
      dispatch({
        type: 'UPDATE_STEP',
        payload: {
          componentIndex: wizard.componentIndex,
          stepIndex: wizard.editingStepIndex,
          step: {
            description: instruction,
            type: effect.success ? 'calculated' : 'manual',
            patternType: effect.detection?.type,
            parsedData: effect.detection?.parsedData,
            construction: wizard.construction,
            calculatedRows: effect.calculation?.rows || effect.rows || [],
            startingStitches: effect.isCastOn ? 0 : wizard.currentStitches,
            endingStitches: effect.endingStitches,
            totalRows: effect.totalRows,
            expectedStitches: effect.endingStitches,
            wizardConfig: wizard.wizardData,
            advancedWizardConfig: {
              hasShaping: wizard.wizardData.hasShaping,
              shapingConfig: wizard.wizardData.shapingConfig
            }, navigationStack: wizard.navigationStack,     // ✅ ADD THIS
            navigationCache: wizard.navigationCache      // ✅ ADD THIS

          }
        }
      });
    } else {
      // Add new step
      if (effect.success) {
        dispatch({
          type: 'ADD_CALCULATED_STEP',
          payload: {
            componentIndex: wizard.componentIndex,
            step: {
              description: instruction,
              type: 'calculated',
              patternType: effect.detection?.type,
              parsedData: effect.detection?.parsedData,
              construction: wizard.construction,
              calculatedRows: effect.calculation?.rows || effect.rows || [],
              startingStitches: effect.isCastOn ? 0 : wizard.currentStitches,
              endingStitches: effect.endingStitches,
              totalRows: effect.totalRows,
              wizardConfig: wizard.wizardData,
              advancedWizardConfig: {
                hasShaping: wizard.wizardData.hasShaping,
                shapingConfig: wizard.wizardData.shapingConfig
              },
              navigationStack: wizard.navigationStack,     // ✅ ADD THIS
              navigationCache: wizard.navigationCache      // ✅ ADD THIS
            }
          }
        });
      } else {
        dispatch({
          type: 'ADD_STEP',
          payload: {
            componentIndex: wizard.componentIndex,
            step: {
              description: instruction,
              expectedStitches: effect.endingStitches,
              type: 'manual',
              construction: wizard.construction,
              startingStitches: wizard.currentStitches,
              endingStitches: effect.endingStitches,
              totalRows: effect.totalRows,
              wizardConfig: wizard.wizardData,
              advancedWizardConfig: {
                hasShaping: wizard.wizardData.hasShaping,
                shapingConfig: wizard.wizardData.shapingConfig
              },
              navigationStack: wizard.navigationStack,     // ✅ ADD THIS
              navigationCache: wizard.navigationCache      // ✅ ADD THIS
            }
          }
        });
      }
    }

    // Navigate back to component detail
    onBack();
  };

  const handleAddStepAndContinue = () => {
    IntelliKnitLogger.debug('Step Actions', 'handleAddStepAndContinue called');
    const instruction = generateInstruction(wizard.wizardData);
    const effect = calculateEffect(wizard.wizardData, wizard.currentStitches, wizard.construction);

    if (effect.success) {
      dispatch({
        type: 'ADD_CALCULATED_STEP',
        payload: {
          componentIndex: wizard.componentIndex,
          step: {
            description: instruction,
            type: 'calculated',
            patternType: effect.detection?.type,
            parsedData: effect.detection?.parsedData,
            construction: wizard.construction,
            calculatedRows: effect.calculation?.rows || effect.rows || [],
            startingStitches: effect.isCastOn ? 0 : wizard.currentStitches,
            endingStitches: effect.endingStitches,
            totalRows: effect.totalRows,
            wizardConfig: wizard.wizardData,
            advancedWizardConfig: {
              hasShaping: wizard.wizardData.hasShaping,
              shapingConfig: wizard.wizardData.shapingConfig
            }
          }
        }
      });
    } else {
      dispatch({
        type: 'ADD_STEP',
        payload: {
          componentIndex: wizard.componentIndex,
          step: {
            description: instruction,
            expectedStitches: effect.endingStitches,
            type: 'manual',
            construction: wizard.construction,
            startingStitches: wizard.currentStitches,
            endingStitches: effect.endingStitches,
            totalRows: effect.totalRows,
            wizardConfig: wizard.wizardData,
            advancedWizardConfig: {
              hasShaping: wizard.wizardData.hasShaping,
              shapingConfig: wizard.wizardData.shapingConfig
            }
          }
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
    handleAddStepAndContinue
  };
};