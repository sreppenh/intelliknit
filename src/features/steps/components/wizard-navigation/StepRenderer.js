import React from 'react';
import PatternSelector from '../wizard-steps/PatternSelector';
import PatternConfiguration from '../wizard-steps/PatternConfiguration';
import DurationChoice from '../wizard-steps/DurationChoice';
import StepPreview from '../wizard-steps/StepPreview';
import DurationShapingChoice from '../wizard-steps/DurationShapingChoice';
import { shouldSkipConfiguration } from './WizardNavigator';

export const renderStep = (
  wizardStep, 
  wizard, 
  customNavigation, 
  handlers
) => {
  const { handleAddStep, handleAddStepAndContinue, handleFinishComponent, onBack } = handlers;

  switch (wizardStep) {
    case 1:
      return (
        <PatternSelector
          wizardData={wizard.wizardData}
          updateWizardData={wizard.updateWizardData}
          navigation={customNavigation}
        />
      );
      
    case 2:
      // Check if we should skip configuration for basic patterns
      if (shouldSkipConfiguration(wizard.wizardData)) {
        // Auto-advance to step 3 for basic patterns
        setTimeout(() => wizard.navigation.goToStep(3), 0);
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🧶</div>
              <h2 className="text-xl font-semibold text-wool-700 mb-2">
                Setting up {wizard.wizardData.stitchPattern.pattern}...
              </h2>
            </div>
          </div>
        );
      }
      
      return (
        <PatternConfiguration
          wizardData={wizard.wizardData}
          updateWizardData={wizard.updateWizardData}
        />
      );
      
    case 3:
      // Duration/Shaping choice - no nav buttons needed
      return (
        <DurationShapingChoice
          wizardData={wizard.wizardData}
          updateWizardData={wizard.updateWizardData}
          onAdvanceStep={() => wizard.navigation.goToStep(4)}
        />
      );
      
    case 4:
      // If we chose duration, show DurationChoice
      if (wizard.wizardData.hasShaping === false) {
        return (
          <DurationChoice
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
          />
        );
      }
      // For shaping (future), would show shaping config
      return (
        <StepPreview
          wizard={wizard}
          onAddStep={handleAddStep}
          onAddStepAndContinue={handleAddStepAndContinue}
          onFinishComponent={handleFinishComponent}
          onBack={onBack}
        />
      );
      
    case 5:
      // Preview step (after duration config)
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