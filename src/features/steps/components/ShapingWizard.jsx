import React, { useState } from 'react';
import WizardLayout from './wizard-layout/WizardLayout';
import WizardHeader from './wizard-layout/WizardHeader';
import ShapingTypeSelector from './shaping-wizard/ShapingTypeSelector';
import EvenDistributionConfig from './shaping-wizard/EvenDistributionConfig';
import PhaseConfig from './shaping-wizard/PhaseConfig';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import UnsavedChangesModal from '../../../shared/components/UnsavedChangesModal';

const ShapingWizard = ({ wizardData, updateWizardData, currentStitches, construction, onBack,
  setConstruction, setCurrentStitches, component, componentIndex, onExitToComponentSteps }) => {
  IntelliKnitLogger.debug('ShapingWizard props', { construction, currentStitches });
  const [step, setStep] = useState(1);
  const [shapingData, setShapingData] = useState({
    type: null,
    config: {},
    description: ''
  });

  const [showExitModal, setShowExitModal] = useState(false);

  const handleShapingTypeSelect = (type) => {
    setShapingData(prev => ({ ...prev, type }));

    // Some types might auto-complete (future feature)
    // For now, all types go to step 2
    setStep(2);
  };


  const handleConfigComplete = (config) => {
    IntelliKnitLogger.success('Saving config', config);
    // Update wizard data with shaping configuration
    updateWizardData('shapingConfig', {
      type: shapingData.type,
      config: config,
      description: shapingData.description
    });
    updateWizardData('hasShaping', true);

    if (config.calculation && config.calculation.endingStitches) {
      setCurrentStitches(config.calculation.endingStitches);
    }

    // Simple return to parent - let parent handle step management
    onBack();
  };

  // Check for unsaved data to show warning modal
  const hasUnsavedData = () => {
    // Step 1: Has selected a shaping type
    if (step === 1) {
      return true; // No unsaved data on type selection screen
    }

    // Step 2: Has shaping type selected and potentially config in progress
    if (step === 2) {
      return shapingData.type !== null; // Has selected a type, potentially configuring
    }

    return false;
  };

  const handleShapingWizardExit = () => {
    if (hasUnsavedData()) {
      setShowExitModal(true);
    } else {
      onExitToComponentSteps();
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    onExitToComponentSteps();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  // Create a wizard-like object for the header - include ALL required functions
  const shapingWizard = {
    wizardStep: step,
    wizardData: { ...wizardData, isShapingWizard: true },
    construction,
    currentStitches,
    component,
    setConstruction,
    updateWizardData, // Pass through the real function
    navigation: {
      goToStep: (step) => setStep(step)
    }
  };




  const renderConfigStep = () => {
    switch (shapingData.type) {
      case 'even_distribution':
        return (
          <EvenDistributionConfig
            shapingData={shapingData}
            setShapingData={setShapingData}
            currentStitches={currentStitches}
            construction={construction}
            componentIndex={componentIndex} // ← ADD THIS LINE
            onExitToComponentSteps={onExitToComponentSteps} // ← ADD THIS LINE
            onComplete={handleConfigComplete}
            onBack={() => setStep(1)}
          />
        );

      case 'phases':
        return (
          <PhaseConfig
            shapingData={shapingData}
            setShapingData={setShapingData}
            currentStitches={currentStitches}
            construction={construction}
            componentIndex={componentIndex} // ← ADD THIS LINE
            onExitToComponentSteps={onExitToComponentSteps} // ← ADD THIS LINE
            onComplete={handleConfigComplete}
            onBack={() => setStep(1)}

          />
        );

      case 'single_row_repeat':
        // Future implementation
        return (
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold text-wool-700 mb-2">Coming Soon!</h3>
            <p className="text-wool-500 mb-4">Single row repeat shaping is in development.</p>
            <button
              onClick={() => setStep(1)}
              className="btn-tertiary btn-sm"
            >
              Back to Types
            </button>
          </div>
        );

      case 'marker_based':
        // Future implementation  
        return (
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold text-wool-700 mb-2">Coming Soon!</h3>
            <p className="text-wool-500 mb-4">Marker-based shaping is in development.</p>
            <button
              onClick={() => setStep(1)}
              className="btn-tertiary btn-sm"
            >
              ← Back
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <WizardLayout>
      <WizardHeader
        wizard={shapingWizard}
        onBack={step === 1 ? onBack : () => setStep(1)}
        onCancel={handleShapingWizardExit}
      />
      <div className="p-6 bg-yarn-50 min-h-screen">
        <div className="stack-lg">
          {step === 1 ? (
            <ShapingTypeSelector
              onTypeSelect={handleShapingTypeSelect}
              currentStitches={currentStitches}
              construction={construction}
            />
          ) : (
            IntelliKnitLogger.debug('Rendering config step', { step }),
            renderConfigStep()
          )}
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={showExitModal}
        onConfirmExit={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </WizardLayout>
  );
};

export default ShapingWizard;