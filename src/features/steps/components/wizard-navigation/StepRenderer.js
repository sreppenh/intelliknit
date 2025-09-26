import React from 'react';
import PatternSelector from '../wizard-steps/PatternSelector';
import PatternConfiguration from '../wizard-steps/PatternConfiguration';
import DurationChoice from '../wizard-steps/DurationChoice';
import DurationShapingChoice from '../wizard-steps/DurationShapingChoice';

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
      return (
        <PatternConfiguration
          wizardData={wizard.wizardData}
          updateWizardData={wizard.updateWizardData}
          navigation={customNavigation}
          construction={wizard.construction}  // Make sure this is passed
          currentStitches={wizard.currentStitches}  // ADD THIS LINE
        />
      );

    case 3:
      // Duration/Shaping choice - no nav buttons needed (auto-advances)
      return (
        <DurationShapingChoice
          wizardData={wizard.wizardData}
          updateWizardData={wizard.updateWizardData}
          onAdvanceStep={() => wizard.navigation.goToStep(4)}
        />
      );

    case 4:
      // Duration Choice - our new single page that NEEDS nav buttons
      return (
        <DurationChoice
          wizardData={wizard.wizardData}
          updateWizardData={wizard.updateWizardData}
        />
      );

    default:
      return <div>Step not found</div>;
  }
};