import { useState } from 'react';
import { useStepActions } from '../../hooks/useStepActions';

export const useWizardState = (wizard, onBack) => {
  const [showEndingWizard, setShowEndingWizard] = useState(false);
  const { handleAddStep, handleAddStepAndContinue } = useStepActions(wizard, onBack);

  const handleFinishComponent = () => {
    setShowEndingWizard(true);
  };

  const handleEndingComplete = (endingStep) => {
    handleAddStep();
    onBack();
  };

  const handleBackFromEnding = () => {
    setShowEndingWizard(false);
    onBack();
  };

  return {
    showEndingWizard,
    handleFinishComponent,
    handleEndingComplete,
    handleBackFromEnding,
    handleAddStep,
    handleAddStepAndContinue
  };
};