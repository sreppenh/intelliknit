// src/features/steps/components/shaping-wizard/EvenDistributionConfig.jsx
import React from 'react';
import useStepSaveHelper, { StepSaveErrorModal } from '../../../../shared/utils/StepSaveHelper';
import { useActiveContext } from '../../../../shared/hooks/useActiveContext'; // ✅ FIXED: Use context bridge
import ShapingHeader from './ShapingHeader';
import EvenDistributionForm from './EvenDistributionForm';

/**
 * EvenDistributionConfig - Creation flow wrapper around EvenDistributionForm
 * 
 * FIXED: Now uses useActiveContext to work with both projects and notes
 */
const EvenDistributionConfig = ({
  shapingData,
  setShapingData,
  currentStitches,
  construction,
  componentIndex,
  onExitToComponentSteps,
  onComplete,
  onBack,
  editingStepIndex = null,
  wizardData,
  onGoToLanding,
  onCancel,
  wizard,
  mode = 'project' // ✅ ADDED: Accept mode prop with default
}) => {

  // ✅ FIXED: Use context bridge instead of hardcoded projects context
  const { dispatch } = useActiveContext(mode);
  const { error, clearError } = useStepSaveHelper();

  // Get initial configuration from shapingData
  const getInitialConfig = () => {
    if (shapingData.config && Object.keys(shapingData.config).length > 0) {
      return {
        action: shapingData.config.action || 'increase',
        amount: shapingData.config.amount || 1,
        description: shapingData.config.description || ''
      };
    }

    return {
      action: 'increase',
      amount: 1,
      description: ''
    };
  };

  // Handle save from form component
  const handleFormSave = async (configData) => {
    console.log('🔧 EvenDistributionConfig handleFormSave called');
    console.log('🔧 Saving config:', configData);

    // ✅ FIXED: Actually save the shaping data before navigating
    setShapingData({
      type: 'even_distribution',
      config: {
        action: configData.action,
        amount: configData.amount,
        description: configData.description,
        construction: configData.construction,
        calculation: configData.calculation
      }
    });

    // Navigate back to component steps
    onExitToComponentSteps();
  };


  return (
    <div>
      <ShapingHeader
        onBack={onBack}
        onGoToLanding={onGoToLanding}
        wizard={wizard}
        onCancel={onCancel}
      />

      <div className="p-6">
        {/* Use the extracted EvenDistributionForm */}
        <EvenDistributionForm
          currentStitches={currentStitches}
          construction={construction}
          initialConfig={getInitialConfig()}
          mode="create"
          onSave={handleFormSave}
          onCancel={onBack}
          showSaveActions={true}
        />

        {/* Form handles its own save actions when showSaveActions is true */}

        <StepSaveErrorModal
          isOpen={!!error}
          error={error}
          onClose={clearError}
          onRetry={() => {
            // Retry logic here if needed
          }}
        />
      </div>
    </div>
  );
};

export default EvenDistributionConfig;