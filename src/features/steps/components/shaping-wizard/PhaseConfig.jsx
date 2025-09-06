// src/features/steps/components/shaping-wizard/PhaseConfig.jsx
import React from 'react';
import { usePhaseManager } from '../../hooks/usePhaseManager';
import PhaseConfigSummary from './PhaseConfigSummary';
import PhaseConfigForm from './PhaseConfigForm';
import PhaseConfigTypeSelector from './PhaseConfigTypeSelector';

/**
 * Sequential Phases Configuration Component
 * 
 * Clean, focused component that orchestrates the phase management flow
 * All complex state and logic moved to usePhaseManager hook
 */
const PhaseConfig = ({
  shapingData,
  setShapingData,
  currentStitches,
  construction,
  componentIndex,
  onExitToComponentSteps,
  onComplete,
  onCancel,
  onBack,
  mode = 'creation', // ✅ ADDED: Accept mode prop with default
  wizardData,
  onGoToLanding,
  wizard
}) => {
  // All state management and logic handled by custom hook
  const phaseManager = usePhaseManager(currentStitches, construction, shapingData);

  const {
    phases,
    currentScreen,
    phaseTypes,
    tempPhaseConfig,
    setTempPhaseConfig,
    editingPhaseId,
    stepDescription,
    setStepDescription,
    calculateSequentialPhases,
    getPhaseDescription,
    getPhasePreview,
    getStitchContext,
    calculatePhaseEndingStitches,
    handleAddPhase,
    handleEditPhase,
    handleDeletePhase,
    handleTypeSelect,
    handleSavePhaseConfig,
    handleConfigureBack
  } = phaseManager;

  // Calculate result for completion
  const result = calculateSequentialPhases();

  // Calculate current phase number
  const getCurrentPhaseNumber = () => {
    if (editingPhaseId) {
      // Editing existing phase - find its position
      const phaseIndex = phases.findIndex(p => p.id === editingPhaseId);
      return phaseIndex + 1;
    } else {
      // Adding new phase - next number in sequence
      return phases.length + 1;
    }
  };

  // Handle back navigation from type selector when no phases exist
  const handleTypeSelectBack = () => {
    if (phases.length === 0) {
      // No phases configured yet - exit Sequential Shaping entirely
      onBack();
    } else {
      // Phases exist - go back to summary
      phaseManager.goToSummary();
    }
  };

  const handleComplete = () => {
    onComplete({
      phases: phases,
      construction: construction,
      calculation: result,
      description: stepDescription
    });
  };

  // Screen 1: Summary (main screen)
  if (currentScreen === 'summary') {
    return (
      <PhaseConfigSummary
        phases={phases}
        phaseTypes={phaseTypes}
        result={result}
        construction={construction}
        currentStitches={currentStitches}
        stepDescription={stepDescription}
        setStepDescription={setStepDescription}
        componentIndex={componentIndex}
        onExitToComponentSteps={onExitToComponentSteps}
        onAddPhase={handleAddPhase}
        onEditPhase={handleEditPhase}
        onDeletePhase={handleDeletePhase}
        onBack={onBack}
        onComplete={handleComplete}
        getPhaseDescription={getPhaseDescription}
        wizardData={wizardData}
        wizard={wizard}
        onGoToLanding={onGoToLanding}
        onCancel={onCancel}
        mode={mode}
        contextMode={mode} // ✅ ADDED: Pass contextMode for useActiveContext
      />
    );
  }

  // Screen 2: Type Selection
  if (currentScreen === 'type-select') {
    return (
      <PhaseConfigTypeSelector
        phaseTypes={phaseTypes}
        onTypeSelect={handleTypeSelect}
        onBackToSummary={handleTypeSelectBack}
        phases={phases}
        phaseNumber={getCurrentPhaseNumber()}
        wizard={wizard}
        onGoToLanding={onGoToLanding}
        wizardData={wizardData}
        onCancel={onCancel}
      />
    );
  }

  // Screen 3: Configure Phase
  if (currentScreen === 'configure') {
    return (
      <PhaseConfigForm
        tempPhaseConfig={tempPhaseConfig}
        setTempPhaseConfig={setTempPhaseConfig}
        phaseTypes={phaseTypes}
        phases={phases}
        currentStitches={currentStitches}
        construction={construction}
        editingPhaseId={editingPhaseId}
        onSave={handleSavePhaseConfig}
        onBack={handleConfigureBack}
        getPhasePreview={getPhasePreview}
        getStitchContext={getStitchContext}
        calculatePhaseEndingStitches={calculatePhaseEndingStitches}
        phaseNumber={getCurrentPhaseNumber()}
        onGoToLanding={onGoToLanding}
        wizard={wizard}
        wizardData={wizardData}
        onCancel={onCancel}
      />
    );
  }

  return null;
};

export default PhaseConfig;