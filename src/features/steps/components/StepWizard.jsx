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
import DurationShapingChoice from './wizard-steps/DurationShapingChoice';
import { createWizardNavigator, shouldSkipConfiguration, shouldShowNavigation } from './wizard-navigation/WizardNavigator';
import { renderStep } from './wizard-navigation/StepRenderer';
import { useWizardState } from './wizard-navigation/WizardState';

const StepWizard = ({ componentIndex, editingStepIndex = null, onBack }) => {
  const wizard = useStepWizard(componentIndex, editingStepIndex);
  const { handleAddStep, handleAddStepAndContinue } = useStepActions(wizard, onBack);
  const wizardState = useWizardState(wizard, onBack);

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
          <PatternConfiguration
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
            navigation={customNavigation}
            existingPrepNote={wizard.wizardData.prepNote || ''}
            onSavePrepNote={(note) => wizard.updateWizardData('prepNote', note)}
          />
        );
        
      case 3:
        // Duration/Shaping choice - no nav buttons needed (auto-advances)
        return (
          <DurationShapingChoice
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
            onAdvanceStep={() => wizard.navigation.goToStep(4)}
            existingPrepNote={wizard.wizardData.prepNote || ''}
            onSavePrepNote={(note) => wizard.updateWizardData('prepNote', note)}
          />
        );
        
      case 4:
        // Duration Choice - our new single page that NEEDS nav buttons
        return (
          <DurationChoice
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
            existingPrepNote={wizard.wizardData.prepNote || ''}
            onSavePrepNote={(note) => wizard.updateWizardData('prepNote', note)}
          />
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
        
        {(wizard.wizardStep === 2 || wizard.wizardStep === 4) && (
          <WizardNavigation wizard={{ ...wizard, navigation: customNavigation }} onBack={onBack} />
        )}
      </div>
    </WizardLayout>
  );
};

export default StepWizard;