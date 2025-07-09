// features/steps/components/StepWizard.jsx
import React from 'react';
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

const StepWizard = ({ componentIndex, editingStepIndex = null, onBack }) => {
  const wizard = useStepWizard(componentIndex, editingStepIndex);
  const { handleAddStep, handleAddStepAndContinue } = useStepActions(wizard, onBack);

  // Component validation
  if (!wizard.component) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Component not found</h3>
          <button 
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
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
            onBack={onBack}
          />
        );
      
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <WizardLayout>
      <WizardHeader 
        wizard={wizard}
        onBack={onBack}
      />
      
      <div className="p-6">
        {renderCurrentStep()}
        
        {wizard.wizardStep < 4 && (
          <WizardNavigation 
            wizard={wizard}
            onBack={onBack}
          />
        )}
      </div>
    </WizardLayout>
  );
};

export default StepWizard;