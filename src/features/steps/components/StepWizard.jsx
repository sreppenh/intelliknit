import React, { useState } from 'react';
import useStepWizard from '../hooks/useStepWizard';
import { useStepActions } from '../hooks/useStepActions';
import WizardLayout from './wizard-layout/WizardLayout';
import WizardHeader from './wizard-layout/WizardHeader';
import WizardNavigation from './wizard-layout/WizardNavigation';
import PatternSelector from './wizard-steps/PatternSelector';
import PatternDetails from './wizard-steps/PatternDetails';
import ShapingConfig from './wizard-steps/ShapingConfig';
import DurationConfig from './wizard-steps/DurationConfig';
import StepPreview from './wizard-steps/StepPreview';
import ComponentEndingWizard from './ComponentEndingWizard';

const StepWizard = ({ componentIndex, editingStepIndex = null, onBack }) => {
  const wizard = useStepWizard(componentIndex, editingStepIndex);
  const { handleAddStep, handleAddStepAndContinue } = useStepActions(wizard, onBack);
  const [showEndingWizard, setShowEndingWizard] = useState(false);

  // Component validation
  if (!wizard.component) {
    return (
      <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-wool-600 mb-2">Component not found</h3>
          <button 
            onClick={onBack}
            className="bg-sage-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-sage-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleFinishComponent = () => {
    // Don't call handleAddStep() here - just show the ending wizard
    // The ending wizard will handle adding both the current step and the ending step
    setShowEndingWizard(true);
  };

  const handleEndingComplete = (endingStep) => {
    // First add the current step
    handleAddStep();
    // The ending step will be handled by the ending wizard's dispatch
    // Then go back to ManageSteps
    onBack();
  };

  const handleBackFromEnding = () => {
    setShowEndingWizard(false);
    // Go back to ManageSteps
    onBack();
  };

  // If showing ending wizard
  if (showEndingWizard) {
    return (
      <ComponentEndingWizard
        component={wizard.component}
        onBack={handleBackFromEnding}
        onComplete={handleEndingComplete}
      />
    );
  }

  const renderCurrentStep = () => {
    switch (wizard.wizardStep) {
      case 1:
        return (
          <PatternSelector
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
            navigation={wizard.navigation}
          />
        );
      case 2:
        return (
          <PatternDetails
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
            canHaveShaping={wizard.canHaveShaping}
            navigation={wizard.navigation}
          />
        );
      case 3:
        // Fixed: Proper conditional rendering based on hasShaping choice
        return wizard.wizardData.hasShaping ? (
          <ShapingConfig
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
          />
        ) : (
          <DurationConfig
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
          />
        );
      case 4:
        return (
          <StepPreview
            wizard={wizard}
            onAddStep={handleAddStep}
            onAddStepAndContinue={handleAddStepAndContinue}
            onFinishComponent={handleFinishComponent}
            onBack={onBack}
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
        {wizard.wizardStep < 4 && (
          <WizardNavigation wizard={wizard} onBack={onBack} />
        )}
      </div>
    </WizardLayout>
  );
};

export default StepWizard;