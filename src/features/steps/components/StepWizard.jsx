import React, { useState } from 'react';
import useStepWizard from '../hooks/useStepWizard';
import { useStepActions } from '../hooks/useStepActions';
import WizardLayout from './wizard-layout/WizardLayout';
import WizardHeader from './wizard-layout/WizardHeader';
// ❌ REMOVED: import WizardNavigation from './wizard-layout/WizardNavigation';
import PatternSelector from './wizard-steps/PatternSelector';
import PatternConfiguration from './wizard-steps/PatternConfiguration';
import DurationChoice from './wizard-steps/DurationChoice';
import StepPreview from './wizard-steps/StepPreview';
import ComponentEndingWizard from './ComponentEndingWizard';
import DurationShapingChoice from './wizard-steps/DurationShapingChoice';
import { createWizardNavigator, shouldSkipConfiguration, shouldShowNavigation } from './wizard-navigation/WizardNavigator';
import { renderStep } from './wizard-navigation/StepRenderer';
import { useWizardState } from './wizard-navigation/WizardState';
import ShapingWizard from './ShapingWizard';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

const StepWizard = ({ componentIndex, editingStepIndex = null, onBack }) => {
  const wizard = useStepWizard(componentIndex, editingStepIndex);
  const { handleAddStep, handleAddStepAndContinue } = useStepActions(wizard, onBack);
  const wizardState = useWizardState(wizard, onBack);
  const [showShapingWizard, setShowShapingWizard] = useState(false);

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
        onBack={() => {
          setShowShapingWizard(false);
          // If shaping was completed (hasShaping=true), advance to next step
          // Otherwise, just return to previous step
          if (wizard.wizardData.hasShaping === true) {
            // Shaping completed - advance to next step in flow
            const navigator = createWizardNavigator(wizard.wizardData, wizard.wizardStep);
            const nextStep = navigator.getNextStep();
            wizard.navigation.goToStep(nextStep);
          }
          // If hasShaping is still undefined/false, just return to where we came from
        }}
      />
    );
  }

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
          <PatternSelector
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
            navigation={customNavigation}
            existingPrepNote={wizard.wizardData.prepNote || ''}
            onSavePrepNote={(note) => wizard.updateWizardData('prepNote', note)}
          />
        );

      case 2:
        return (
          <div className="stack-lg">
            <PatternConfiguration
              wizardData={wizard.wizardData}
              updateWizardData={wizard.updateWizardData}
              navigation={customNavigation}
              existingPrepNote={wizard.wizardData.prepNote || ''}
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
          <div className="stack-lg">
            <DurationChoice
              wizardData={wizard.wizardData}
              updateWizardData={wizard.updateWizardData}
              construction={wizard.construction}
              existingPrepNote={wizard.wizardData.prepNote || ''}
              onSavePrepNote={(note) => wizard.updateWizardData('prepNote', note)}
            />

            {/* Inline Navigation for Step 4 */}
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
                  Add Step
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
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
        );

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <WizardLayout>
      <WizardHeader wizard={wizard} onBack={onBack} onCancel={onBack} />
      <div className="p-6 bg-yarn-50 min-h-screen">
        {renderCurrentStep()}

        {/* ❌ REMOVED: WizardNavigation component - no more conflicts! */}
      </div>
    </WizardLayout>
  );
};

export default StepWizard;