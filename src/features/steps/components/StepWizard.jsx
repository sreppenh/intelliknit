import React, { useState } from 'react';
import useStepWizard from '../hooks/useStepWizard';
import { useStepActions } from '../hooks/useStepActions';
import WizardLayout from './wizard-layout/WizardLayout';
import WizardHeader from './wizard-layout/WizardHeader';
import WizardNavigation from './wizard-layout/WizardNavigation';
import PatternSelector from './wizard-steps/PatternSelector';
import PatternConfiguration from './wizard-steps/PatternConfiguration';
import DurationChoice from './wizard-steps/DurationChoice';
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

  // New substep navigation logic
  const getNextStep = () => {
    const { pattern } = wizard.wizardData.stitchPattern;
    
    switch (wizard.wizardStep) {
      case 1: // PatternSelector
        return 2; // Always go to PatternConfiguration
        
      case 2: // PatternConfiguration
        // Cast On and Bind Off can skip duration if already configured
        if (pattern === 'Cast On' && wizard.wizardData.stitchPattern.stitchCount) {
          return 4; // Skip to preview
        }
        if (pattern === 'Bind Off') {
          return 4; // Skip to preview (bind off handles its own duration)
        }
        return 3; // Go to DurationChoice
        
      case 3: // DurationChoice
        return 4; // Go to preview
        
      default:
        return wizard.wizardStep + 1;
    }
  };

  const getPreviousStep = () => {
    const { pattern } = wizard.wizardData.stitchPattern;
    
    switch (wizard.wizardStep) {
      case 4: // StepPreview
        // If we skipped duration choice, go back to configuration
        if (pattern === 'Cast On' || pattern === 'Bind Off') {
          return 2;
        }
        return 3; // Normal case: back to duration choice
        
      case 3: // DurationChoice
        return 2; // Back to configuration
        
      case 2: // PatternConfiguration
        return 1; // Back to selector
        
      default:
        return Math.max(1, wizard.wizardStep - 1);
    }
  };

  const canProceedFromStep = () => {
    const { category, pattern, stitchCount } = wizard.wizardData.stitchPattern;
    const { type, value } = wizard.wizardData.duration;
    
    switch (wizard.wizardStep) {
      case 1: // PatternSelector
        return category && pattern;
        
      case 2: // PatternConfiguration
        if (pattern === 'Cast On') {
          return stitchCount && parseInt(stitchCount) > 0;
        }
        if (pattern === 'Bind Off') {
          return true; // Bind off can proceed without additional config
        }
        if (['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'].includes(pattern)) {
          return wizard.wizardData.stitchPattern.rowsInPattern && 
                 parseInt(wizard.wizardData.stitchPattern.rowsInPattern) > 0;
        }
        if (pattern === 'Custom pattern') {
          return wizard.wizardData.stitchPattern.customText && 
                 wizard.wizardData.stitchPattern.customText.trim() !== '';
        }
        return true; // Other patterns can proceed
        
      case 3: // DurationChoice
        if (pattern === 'Bind Off') {
          return true; // Bind off handles its own duration
        }
        return type && value;
        
      case 4: // StepPreview
        return true; // Preview is always ready
        
      default:
        return false;
    }
  };

  const handleNext = () => {
    const nextStep = getNextStep();
    wizard.navigation.goToStep(nextStep);
  };

  const handlePrevious = () => {
    const prevStep = getPreviousStep();
    wizard.navigation.goToStep(prevStep);
  };

  const customNavigation = {
    canProceed: canProceedFromStep,
    nextStep: handleNext,
    previousStep: handlePrevious,
    goToStep: wizard.navigation.goToStep
  };

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
            navigation={customNavigation}
          />
        );
        
      case 2:
        return (
          <PatternConfiguration
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
          />
        );
        
      case 3:
        return (
          <DurationChoice
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
        {wizard.wizardStep < 4 && wizard.wizardStep !== 1 && (
  <WizardNavigation wizard={{ ...wizard, navigation: customNavigation }} onBack={onBack} />
)}
      </div>
    </WizardLayout>
  );
};

export default StepWizard;