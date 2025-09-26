import React, { useState } from 'react';
import WizardLayout from './wizard-layout/WizardLayout';
import WizardHeader from './wizard-layout/WizardHeader';
import ShapingTypeSelector from './shaping-wizard/ShapingTypeSelector';
import EvenDistributionConfig from './shaping-wizard/EvenDistributionConfig';
import PhaseConfig from './shaping-wizard/PhaseConfig';
import PhaseConfigSummary from './shaping-wizard/PhaseConfigSummary';
import MarkerPhasesConfig from './shaping-wizard/MarkerPhasesConfig'; // NEW
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import UnsavedChangesModal from '../../../shared/components/modals/UnsavedChangesModal';
import WizardContextBar from './wizard-layout/WizardContextBar';
import PageHeader from '../../../shared/components/PageHeader';
import BindOffShapingConfig from './shaping-wizard/BindOffShapingConfig';

const ShapingWizard = ({
  wizardData,
  updateWizardData,
  currentStitches,
  construction,
  onBack,
  setConstruction,
  setCurrentStitches,
  component,
  componentIndex,
  onExitToComponentSteps,
  onGoToLanding,
  editingStepIndex = null,
  mode = 'project',
  project
}) => {

  // 🔧 FIX: Initialize step based on whether we have existing data
  const getInitialStep = () => {
    // If we have existing shaping config with a type, go directly to config step
    if (wizardData.shapingConfig?.type) {
      return 2;
    }
    // Otherwise start at type selection
    return 1;
  };

  // 🔧 FIX: Initialize shapingData from existing wizardData.shapingConfig
  const getInitialShapingData = () => {
    const existingConfig = wizardData.shapingConfig;

    if (existingConfig?.type) {
      return {
        type: existingConfig.type,
        config: existingConfig.config || {},
        description: existingConfig.description || ''
      };
    }

    // Default empty state for new shaping
    return {
      type: null,
      config: {},
      description: ''
    };
  };

  const [step, setStep] = useState(getInitialStep());
  const [shapingData, setShapingData] = useState(getInitialShapingData());

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

  const handleCancel = () => {
    if (hasUnsavedData()) {
      setShowExitModal(true);
    } else {
      onExitToComponentSteps();
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
            componentIndex={componentIndex}
            editingStepIndex={editingStepIndex}
            onExitToComponentSteps={onExitToComponentSteps}
            onComplete={handleConfigComplete}
            onBack={() => setStep(1)}
            wizardData={wizardData}
            onGoToLanding={onGoToLanding}
            wizard={shapingWizard}
            onCancel={handleCancel}
            mode={mode}
          />
        );

      case 'marker_phases':
        return (
          <MarkerPhasesConfig
            shapingData={shapingData}
            setShapingData={setShapingData}
            currentStitches={currentStitches}
            construction={construction}
            component={component}
            componentIndex={componentIndex}
            editingStepIndex={editingStepIndex}
            onExitToComponentSteps={onExitToComponentSteps}
            onComplete={handleConfigComplete}
            onBack={() => setStep(1)}
            wizardData={wizardData}
            onGoToLanding={onGoToLanding}
            wizard={shapingWizard}
            onCancel={handleCancel}
            mode={mode}
            project={project}
          />
        );

      case 'phases':
        return (
          <PhaseConfig
            shapingData={shapingData}
            setShapingData={setShapingData}
            currentStitches={currentStitches}
            construction={construction}
            componentIndex={componentIndex}
            onExitToComponentSteps={onExitToComponentSteps}
            onComplete={handleConfigComplete}
            onBack={() => setStep(1)}
            wizardData={wizardData}
            onGoToLanding={onGoToLanding}
            wizard={shapingWizard}
            onCancel={handleCancel}
            mode={mode}
          />
        );

      case 'bind_off_shaping':
        return (
          <BindOffShapingConfig
            shapingData={shapingData}
            setShapingData={setShapingData}
            currentStitches={currentStitches}
            construction={construction}
            component={component}
            componentIndex={componentIndex}
            editingStepIndex={editingStepIndex}
            onExitToComponentSteps={onExitToComponentSteps}
            onComplete={handleConfigComplete}
            onBack={() => setStep(1)}
            wizardData={wizardData}
            onGoToLanding={onGoToLanding}
            wizard={shapingWizard}
            onCancel={handleCancel}
            mode={mode}
            project={project}
          />
        );

      case 'single_row_repeat':
        // Future implementation
        return (
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="content-header-secondary mb-2">Coming Soon!</h3>
            <p className="content-subheader">Single row repeat shaping is in development.</p>
            <button
              onClick={() => setStep(1)}
              className="btn-tertiary btn-sm"
            >
              Back to Types
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <WizardLayout>
      <div className=" bg-yarn-50 min-h-screen">
        <div className="stack-lg">
          {step === 1 ? (
            <ShapingTypeSelector
              onTypeSelect={handleShapingTypeSelect}
              currentStitches={currentStitches}
              construction={construction}
              onBack={onBack}
              onGoToLanding={onGoToLanding}
              wizard={shapingWizard}
              onCancel={handleCancel}
            />
          ) : (
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