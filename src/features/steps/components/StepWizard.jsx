import React, { useState } from 'react';
import useStepWizard from '../hooks/useStepWizard';
import { useStepActions } from '../hooks/useStepActions';
import WizardLayout from './wizard-layout/WizardLayout';
import WizardHeader from './wizard-layout/WizardHeader';
// ❌ REMOVED: import WizardNavigation from './wizard-layout/WizardNavigation';
import PatternSelector from './wizard-steps/PatternSelector';
import PatternConfiguration from './wizard-steps/PatternConfiguration';
import DurationChoice from './wizard-steps/DurationChoice';
// import StepPreview from './wizard-steps/StepPreview';
import ComponentEndingWizard from './ComponentEndingWizard';
import DurationShapingChoice from './wizard-steps/DurationShapingChoice';
import { createWizardNavigator, shouldSkipConfiguration, shouldShowNavigation } from './wizard-navigation/WizardNavigator';
import { renderStep } from './wizard-navigation/StepRenderer';
import { useWizardState } from './wizard-navigation/WizardState';
import ShapingWizard from './ShapingWizard';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import UnsavedChangesModal from '../../../shared/components/UnsavedChangesModal';
import DurationWizard from './DurationWizard';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';




const StepWizard = ({ componentIndex, editingStepIndex = null, onBack }) => {
  const wizard = useStepWizard(componentIndex, editingStepIndex);
  const { handleAddStep, handleAddStepAndContinue } = useStepActions(wizard, onBack);
  const { currentProject } = useProjectsContext();
  const wizardState = useWizardState(wizard, onBack);
  const [showShapingWizard, setShowShapingWizard] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);


  // Component validation
  if (!wizard.component) {
    return (
      <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-wool-600 mb-2">Component not found</h3>
          <button
            onClick={onBack}
            className="btn-primary btn-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  const navigator = createWizardNavigator(wizard.wizardData, wizard.wizardStep);

  const customNavigation = {
    canProceed: navigator.canProceed,
    nextStep: () => wizard.navigation.goToStep(navigator.getNextStep()),
    previousStep: () => wizard.navigation.goToStep(navigator.getPreviousStep()),
    goToStep: wizard.navigation.goToStep
  };

  // Helper to get existing prep note when editing  
  const getExistingPrepNote = () => {
    // Use the prop directly and make sure we're referencing the right variable
    const stepIndex = editingStepIndex;

    if (stepIndex !== null && wizard.component?.steps?.[stepIndex]) {
      const editingStep = wizard.component.steps[stepIndex];
      return editingStep.prepNote ||
        editingStep.wizardConfig?.prepNote ||
        editingStep.advancedWizardConfig?.prepNote ||
        '';
    }
    return wizard.wizardData.prepNote || '';
  };

  // If showing ending wizard
  if (wizardState.showEndingWizard) {
    return (
      <ComponentEndingWizard
        component={wizard.component}
        onBack={wizardState.handleBackFromEnding}
        onComplete={wizardState.handleEndingComplete}
      />
    );
  }

  // If showing shaping wizard
  if (showShapingWizard) {
    return (
      <ShapingWizard
        wizardData={wizard.wizardData}
        updateWizardData={wizard.updateWizardData}
        currentStitches={wizard.currentStitches}
        construction={wizard.construction}
        setConstruction={wizard.setConstruction}
        setCurrentStitches={wizard.setCurrentStitches}
        component={wizard.component}
        componentIndex={wizard.componentIndex} // ← ADD THIS LINE
        editingStepIndex={wizard.editingStepIndex}
        onExitToComponentSteps={onBack} // ← ADD THIS LINE
        onBack={() => {
          setShowShapingWizard(false);
          // Check if shaping was actually COMPLETED (has config with calculation)
          // vs just SELECTED (hasShaping=true but no actual config)
          const hasCompletedShaping = wizard.wizardData.shapingConfig?.type &&
            wizard.wizardData.shapingConfig?.config?.calculation;

          IntelliKnitLogger.debug('ShapingWizard onBack Logic', {
            hasCompletedShaping: hasCompletedShaping,
            hasShapingFlag: wizard.wizardData.hasShaping,
            shapingConfigType: wizard.wizardData.shapingConfig?.type,
            hasCalculation: !!wizard.wizardData.shapingConfig?.config?.calculation,
            currentStep: wizard.wizardStep
          });




          if (hasCompletedShaping) {
            // Shaping was completed - advance to next step
            const navigator = createWizardNavigator(wizard.wizardData, wizard.wizardStep);
            const nextStep = navigator.getNextStep();
            wizard.navigation.goToStep(nextStep);
          } else {
            // Shaping was not completed - clear the selection and stay on current step
            wizard.updateWizardData('hasShaping', false);
            wizard.updateWizardData('choiceMade', false); // ← Optional cleanup
          }
          // If hasShaping is still undefined/false, just return to where we came from
        }}
      />
    );
  }


  // AFTER existing helper functions, ADD:
  const hasUnsavedData = () => {
    const { wizardStep, wizardData } = wizard;

    switch (wizardStep) {
      case 1: // Pattern Selection
        return wizardData.stitchPattern?.pattern || wizardData.stitchPattern?.category;

      case 2: // Pattern Configuration
        return true; // Always has pattern data from step 1

      case 3: // Duration/Shaping Choice
        return wizardData.hasShaping !== undefined || wizardData.choiceMade;

      case 4: // Set Duration - How Long
        return true; // Always show warning - user is in step creation flow

      case 5: // Preview
        return true; // Always show warning - user has complete step data 

      default:
        return false;
    }
  };

  const handleXButtonClick = () => {
    if (hasUnsavedData()) {
      setShowExitModal(true);
    } else {
      onBack();
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    wizard.resetWizardData(); // ✅ Clean data before exit
    onBack();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const renderCurrentStep = () => {
    const handlers = {
      handleAddStep: wizardState.handleAddStep,
      handleAddStepAndContinue: wizardState.handleAddStepAndContinue,
      handleFinishComponent: wizardState.handleFinishComponent,
      onBack
    };

    // Enhanced step rendering with prep note support
    switch (wizard.wizardStep) {
      case 1:
        return (
          <div className="stack-lg">
            <PatternSelector
              wizardData={wizard.wizardData}
              updateWizardData={wizard.updateWizardData}
              navigation={customNavigation}
              existingPrepNote={getExistingPrepNote()}
              onSavePrepNote={(note) => wizard.updateWizardData('prepNote', note)}
            />

            {/* Navigation buttons for Step 1 */}
            <div className="pt-6 border-t border-wool-100">
              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="flex-1 btn-tertiary"
                >
                  ← Cancel
                </button>

                <button
                  onClick={() => {
                    const navigator = createWizardNavigator(wizard.wizardData, wizard.wizardStep);
                    const nextStep = navigator.getNextStep();
                    wizard.navigation.goToStep(nextStep);
                  }}
                  disabled={!navigator.canProceed()}
                  className="flex-2 btn-primary"
                  style={{ flexGrow: 2 }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="stack-lg">
            <PatternConfiguration
              wizardData={wizard.wizardData}
              updateWizardData={wizard.updateWizardData}
              navigation={customNavigation}
              construction={wizard.construction}
              existingPrepNote={getExistingPrepNote()}
              onSavePrepNote={(note) => wizard.updateWizardData('prepNote', note)}
            />

            {/* Inline Navigation for Step 2 */}
            <div className="pt-6 border-t border-wool-100">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const navigator = createWizardNavigator(wizard.wizardData, wizard.wizardStep);
                    const previousStep = navigator.getPreviousStep();
                    wizard.navigation.goToStep(previousStep);
                  }}
                  className="flex-1 btn-tertiary"
                >
                  ← Back
                </button>

                <button
                  onClick={() => {
                    const navigator = createWizardNavigator(wizard.wizardData, wizard.wizardStep);
                    const nextStep = navigator.getNextStep();
                    wizard.navigation.goToStep(nextStep);
                  }}
                  disabled={!navigator.canProceed()}
                  className="flex-2 btn-primary"
                  style={{ flexGrow: 2 }}
                >
                  {wizard.wizardData.stitchPattern.pattern === 'Cast On' ? 'Add Step' : 'Continue →'}
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        // Duration/Shaping choice - no nav buttons needed (auto-advances)
        return (
          <DurationShapingChoice
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
            construction={wizard.construction}
            onAdvanceStep={() => wizard.navigation.goToStep(4)}
            onShowShapingWizard={() => setShowShapingWizard(true)}
            existingPrepNote={wizard.wizardData.prepNote || ''}
            onSavePrepNote={(note) => wizard.updateWizardData('prepNote', note)}
          />
        );

      case 4:
        // Duration Choice - needs nav buttons
        return (
          <DurationWizard
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
            currentStitches={wizard.currentStitches}
            construction={wizard.construction}
            componentIndex={wizard.componentIndex}
            editingStepIndex={wizard.editingStepIndex}
            project={currentProject}
            onBack={() => {
              // Go back to previous step in StepWizard
              const navigator = createWizardNavigator(wizard.wizardData, wizard.wizardStep);
              const previousStep = navigator.getPreviousStep();
              wizard.navigation.goToStep(previousStep);
            }}
            onExitToComponentSteps={onBack}
          />
        );

      /*   case 5:
          // Preview step (has custom buttons, no nav needed)
          return (
            <StepPreview
              wizard={wizard}
              onAddStep={handleAddStep}
              onAddStepAndContinue={handleAddStepAndContinue}
              onFinishComponent={wizardState.handleFinishComponent}
              onBack={onBack}
              prepNote={wizard.wizardData.prepNote || ''}
            />
          ); */

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <WizardLayout>
      <WizardHeader wizard={wizard} onBack={onBack} onCancel={handleXButtonClick} />
      <div className="p-6 bg-yarn-50 min-h-screen">
        {renderCurrentStep()}

        {/* ❌ REMOVED: WizardNavigation component - no more conflicts! */}
      </div>

      <UnsavedChangesModal
        isOpen={showExitModal}
        onConfirmExit={handleConfirmExit}
        onCancel={handleCancelExit}
      />


    </WizardLayout>
  );
};

export default StepWizard;