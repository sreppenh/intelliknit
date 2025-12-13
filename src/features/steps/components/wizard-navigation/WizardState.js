import { useState } from 'react';
import { useStepActions } from '../../hooks/useStepActions';

export const useWizardState = (wizard, onBack, mode = 'project') => {
  const [showEndingWizard, setShowEndingWizard] = useState(false);
  const { handleAddStep, handleAddStepWithCustomData } = useStepActions(wizard, onBack, mode);

  const handleFinishComponent = () => {
    setShowEndingWizard(true);
  };

  // ✅ FIXED: Actually use the endingStep parameter
  const handleEndingComplete = (endingStep) => {
    // Create a custom wizard with the ending step data
    const endingWizard = {
      ...wizard,
      wizardData: {
        ...wizard.wizardData,
        stitchPattern: endingStep.wizardConfig.stitchPattern,
        prepNote: endingStep.prepNote || endingStep.wizardConfig?.prepNote || '',
        afterNote: endingStep.afterNote || endingStep.wizardConfig?.afterNote || '',
        // Pass through the full ending step for proper creation
        _fullEndingStep: endingStep
      }
    };

    // Add the step with the ending data
    handleAddStepWithCustomData(endingWizard);

    // Close the wizard and go back
    setShowEndingWizard(false);
    onBack();
  };

  const handleBackFromEnding = () => {
    setShowEndingWizard(false);
    // Don't call onBack() - just close the ending wizard and return to Step Options
  };

  return {
    showEndingWizard,
    handleFinishComponent,
    handleEndingComplete,
    handleBackFromEnding,
    handleAddStep,
    handleAddStepAndContinue: handleAddStep // Keep this for compatibility
  };
};