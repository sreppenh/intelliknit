import React, { useState } from 'react';
import useStepWizard from '../hooks/useStepWizard';
import { useStepActions } from '../hooks/useStepActions';
import WizardLayout from './wizard-layout/WizardLayout';
import PatternSelector from './wizard-steps/PatternSelector';
import PatternConfiguration from './wizard-steps/PatternConfiguration';
import ComponentEndingWizard from './ComponentEndingWizard';
import DurationShapingChoice from './wizard-steps/DurationShapingChoice';
import { useWizardState } from './wizard-navigation/WizardState';
import ShapingWizard from './ShapingWizard';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import UnsavedChangesModal from '../../../shared/components/modals/UnsavedChangesModal';
import DurationWizard from './DurationWizard';
// import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import { useActiveContext } from '../../../shared/hooks/useActiveContext';
import WizardContextBar from './wizard-layout/WizardContextBar';
import PageHeader from '../../../shared/components/PageHeader';
import { calculateFinalStitchCount } from '../../../shared/utils/stitchCalculatorUtils';
import { isAdvancedRowByRowPattern, getKeyboardPatternKey } from '../../../shared/utils/stepDisplayUtils';
import { StandardModal } from '../../../shared/components/modals/StandardModal';
import StepPreview from './wizard-steps/StepPreview';


const StepWizard = ({ componentIndex, onGoToLanding, editingStepIndex = null, editMode = null, onBack, mode = 'project' }) => {
  const wizard = useStepWizard(componentIndex, editingStepIndex, editMode, mode);
  const { handleAddStep, handleAddStepAndContinue, handleAddStepWithCustomData } = useStepActions(wizard, onBack, mode);
  const { currentProject } = useActiveContext(mode);
  const [showShapingWizard, setShowShapingWizard] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showStepConfirmModal, setShowStepConfirmModal] = useState(false);
  const [pendingShapingInfo, setPendingShapingInfo] = useState(null);

  const wizardState = useWizardState(wizard, onBack, mode);

  console.log('wizard.construction:', wizard.construction);
  console.log('wizard.component.construction:', wizard.component.construction);

  // Add this function inside StepWizard component:
  const handleConfirmIntrinsicStep = () => {
    if (pendingShapingInfo) {

      // Create updated wizard data object synchronously
      const updatedWizardData = {
        ...wizard.wizardData,
        hasShaping: true,
        shapingConfig: createIntrinsicShapingConfig(pendingShapingInfo)
      };

      // Create a temporary wizard object with updated data
      const updatedWizard = {
        ...wizard,
        wizardData: updatedWizardData
      };

      // Call handleAddStep with the updated wizard data
      handleAddStepWithCustomData(updatedWizard);

      // Clean up
      setShowStepConfirmModal(false);
      setPendingShapingInfo(null);
    }
  };

  const handleCancelIntrinsicStep = () => {
    setShowStepConfirmModal(false);
    setPendingShapingInfo(null);
  };

  // Component validation
  if (!wizard.component) {
    return (
      <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-wool-600 mb-2">Component not found</h3>
          <button
            onClick={onBack}
            className="btn-primary btn-sm"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // 🎯 NEW: Simple navigation object - no more calculations!
  const navigation = {
    canProceed: wizard.navigation.canProceed,
    nextStep: wizard.navigation.nextStep,
    previousStep: () => {
      const result = wizard.navigation.previousStep();

      // Handle exit from wizard if navigation stack is empty
      if (result?.shouldExit) {
        IntelliKnitLogger.debug('Step Wizard', 'Navigation stack empty - exiting wizard');
        onBack();
      }
    },
    goToStep: wizard.navigation.goToStep
  };

  // Helper to get existing prep note when editing  
  const getExistingPrepNote = () => {
    const stepIndex = editingStepIndex;

    if (stepIndex !== null && wizard.component?.steps?.[stepIndex]) {
      const editingStep = wizard.component.steps[stepIndex];
      return editingStep.prepNote ||
        editingStep.wizardConfig?.prepNote ||
        editingStep.advancedWizardConfig?.prepNote ||
        '';
    }
    return wizard.wizardData.prepNote || '';
  };

  /**
   * Detect if a pattern has intrinsic shaping from row-by-row instructions
   * Put this function inside StepWizard.jsx since it needs both utilities
   */
  const detectIntrinsicShaping = (wizardData, currentStitches, customActionsData = {}) => {
    const { pattern, entryMode, rowInstructions } = wizardData.stitchPattern || {};

    // Only check advanced row-by-row patterns
    if (!isAdvancedRowByRowPattern(pattern) || entryMode !== 'row_by_row') {
      return null;
    }

    // Must have row instructions to analyze
    if (!rowInstructions || rowInstructions.length === 0) {
      return null;
    }

    // Calculate final stitch count using existing utilities
    const finalStitches = calculateFinalStitchCount(rowInstructions, currentStitches, customActionsData);

    // Check if stitches changed
    if (finalStitches !== currentStitches) {
      const netChange = finalStitches - currentStitches;
      return {
        hasIntrinsicShaping: true,
        startingStitches: currentStitches,
        endingStitches: finalStitches,
        netChange,
        action: netChange > 0 ? 'increase' : 'decrease',
        amount: Math.abs(netChange)
      };
    }

    return { hasIntrinsicShaping: false };
  };

  /**
   * Create shaping config for intrinsic pattern shaping
   * Put this function inside StepWizard.jsx as well
   */
  const createIntrinsicShapingConfig = (shapingInfo) => {
    // Get the actual row count from rowInstructions
    const rowCount = wizard.wizardData.stitchPattern?.rowInstructions?.length || 1;

    return {
      type: 'intrinsic_pattern',
      config: {
        action: shapingInfo.action,
        amount: shapingInfo.amount,
        patternBased: true,
        calculation: {
          instruction: "Shaping integrated into pattern rows",
          startingStitches: shapingInfo.startingStitches,
          endingStitches: shapingInfo.endingStitches,
          totalRows: rowCount,
          netStitchChange: shapingInfo.netChange
        }
      }
    };
  };

  // If showing ending wizard
  // Replace the commented-out section with this:
  if (wizardState.showEndingWizard) {
    return (
      <ComponentEndingWizard
        component={wizard.component}
        onBack={wizardState.handleBackFromEnding}
        onComplete={wizardState.handleEndingComplete}
      />
    );
  }

  // If showing shaping wizard
  if (showShapingWizard) {

    return (
      <ShapingWizard
        wizardData={wizard.wizardData}
        mode={mode}
        updateWizardData={wizard.updateWizardData}
        currentStitches={wizard.currentStitches}
        construction={wizard.construction}
        setConstruction={wizard.setConstruction}
        setCurrentStitches={wizard.setCurrentStitches}
        component={wizard.component}
        componentIndex={wizard.componentIndex}
        editingStepIndex={wizard.editingStepIndex}
        onExitToComponentSteps={mode === 'notepad' ? () => { handleAddStep(); } : onBack}
        onBack={() => {
          setShowShapingWizard(false);

          console.log("=== VALIDATION DEBUG ===");
          console.log("wizard.wizardData.shapingConfig:", wizard.wizardData.shapingConfig);
          console.log("shapingConfig?.type:", wizard.wizardData.shapingConfig?.type);
          console.log("shapingConfig?.config:", wizard.wizardData.shapingConfig?.config);
          console.log("shapingConfig?.config?.calculation:", wizard.wizardData.shapingConfig?.config?.calculation);


          // Check if shaping was actually completed
          const hasCompletedShaping = wizard.wizardData.shapingConfig?.type &&
            wizard.wizardData.shapingConfig?.config?.calculation;

          console.log("hasCompletedShaping result:", hasCompletedShaping);
          console.log("========================");


          IntelliKnitLogger.debug('ShapingWizard onBack', {
            hasCompletedShaping,
            shapingConfigType: wizard.wizardData.shapingConfig?.type,
            hasCalculation: !!wizard.wizardData.shapingConfig?.config?.calculation
          });

          if (hasCompletedShaping) {
            // Shaping completed - advance to next step
            wizard.navigation.nextStep();
          } else {
            // Shaping not completed - clear selection and stay
            wizard.updateWizardData('hasShaping', false);
            wizard.updateWizardData('choiceMade', false);
          }
        }}
        onGoToLanding={onGoToLanding} // Just added
      />
    );
  }

  // Check for unsaved data
  const hasUnsavedData = () => {
    const { wizardStep, wizardData } = wizard;

    switch (wizardStep) {
      case 1: // Pattern Selection
        return wizardData.stitchPattern?.pattern || wizardData.stitchPattern?.category;
      case 2: // Pattern Configuration
        return true; // Always has pattern data from step 1
      case 3: // Duration/Shaping Choice
        return wizardData.hasShaping !== undefined || wizardData.choiceMade;
      case 4: // Duration Config
        return true; // Always show warning - user is in step creation flow
      case 5: // Preview
        return true; // Always show warning - user has complete step data 
      default:
        return false;
    }
  };

  const handleXButtonClick = () => {
    if (hasUnsavedData()) {
      setShowExitModal(true);
    } else {
      onBack();
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    wizard.resetWizardData(); // Clean data before exit
    onBack();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  // 🎯 NEW: Clean step rendering with smart navigation
  const renderCurrentStep = () => {
    switch (wizard.wizardStep) {
      case 1:
        return (
          <div className="stack-lg">
            <PatternSelector
              wizardData={wizard.wizardData}
              updateWizardData={wizard.updateWizardData}
              navigation={navigation}
              existingPrepNote={getExistingPrepNote()}
              onSavePrepNote={(note) => wizard.updateWizardData('prepNote', note)}
            />

            {/* 🎯 SIMPLIFIED: Navigation buttons for Step 1 */}
            <div className="pt-6 border-t border-wool-100">
              <div className="flex gap-3">
                <button
                  onClick={navigation.previousStep}
                  className="flex-1 btn-tertiary"
                >
                  ← Cancel
                </button>

                <button
                  onClick={navigation.nextStep}
                  disabled={!navigation.canProceed()}
                  className="flex-2 btn-primary"
                  style={{ flexGrow: 2 }}
                >
                  Continue →
                </button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="stack-lg">
            <PatternConfiguration
              wizardData={wizard.wizardData}
              updateWizardData={wizard.updateWizardData}
              navigation={navigation}
              construction={wizard.construction}
              existingPrepNote={getExistingPrepNote()}
              onSavePrepNote={(note) => wizard.updateWizardData('prepNote', note)}
              currentStitches={wizard.currentStitches}
              project={currentProject}
              mode={mode}
            />

            {/* 🎯 SIMPLIFIED: Navigation for Step 2 */}
            <div className="pt-6 border-t border-wool-100">
              <div className="flex gap-3">
                <button
                  onClick={navigation.previousStep}
                  className="flex-1 btn-tertiary"
                >
                  ← Back
                </button>

                <button
                  onClick={() => {

                    // 🔄 REPLACED: Get custom actions using centralized pattern key function
                    const customActionsData = {};
                    const patternType = wizard.wizardData.stitchPattern.pattern;
                    const patternKey = getKeyboardPatternKey(patternType);
                    const customActions = currentProject?.customKeyboardActions?.[patternKey] || [];

                    customActions.forEach(action => {
                      if (typeof action === 'object' && action.name) {
                        customActionsData[action.name] = action;
                      }
                    });

                    // Check for intrinsic shaping
                    const shapingInfo = detectIntrinsicShaping(
                      wizard.wizardData,
                      wizard.currentStitches,
                      customActionsData
                    );

                    if (shapingInfo?.hasIntrinsicShaping) {

                      // Store shaping info and show confirmation modal
                      setPendingShapingInfo(shapingInfo);
                      setShowStepConfirmModal(true);
                    } else {

                      // Normal flow to shaping selection
                      wizard.navigation.nextStep();
                    }
                  }}

                  disabled={!navigation.canProceed()}
                  className="flex-2 btn-primary"
                  style={{ flexGrow: 2 }}
                >
                  {wizard.wizardData.stitchPattern.pattern === 'Cast On' ? 'Add Step' : 'Continue →'}
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        // Duration/Shaping choice - auto-advances, no nav buttons needed
        return (
          <DurationShapingChoice
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
            construction={wizard.construction}
            onAdvanceStep={() => wizard.navigation.goToStep(4)}
            onShowShapingWizard={() => setShowShapingWizard(true)}
            existingPrepNote={wizard.wizardData.prepNote || ''}
            onSavePrepNote={(note) => wizard.updateWizardData('prepNote', note)}
          />
        );

      case 4:
        // Duration Choice - needs nav buttons
        return (
          <DurationWizard
            wizardData={wizard.wizardData}
            updateWizardData={wizard.updateWizardData}
            currentStitches={wizard.currentStitches}
            construction={wizard.construction}
            componentIndex={wizard.componentIndex}
            editingStepIndex={wizard.editingStepIndex}
            project={currentProject}
            onBack={navigation.previousStep} // 🎯 SIMPLIFIED: Direct navigation call
            onExitToComponentSteps={mode === 'notepad' ? () => { handleAddStep(); } : onBack}
            mode={mode}
          />
        );

      case 5:
      // Preview step (has custom buttons, no nav needed)
      case 5:
        return (
          <StepPreview
            wizardData={wizard.wizardData}
            currentStitches={wizard.currentStitches}
            construction={wizard.construction}
            component={wizard.component}
            onAddStep={handleAddStep}
            onAddStepAndContinue={handleAddStepAndContinue}
            onBack={navigation.previousStep}
            mode={mode}
          />
        );

      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <WizardLayout>
      <PageHeader
        useBranding={true}
        onHome={onGoToLanding}  // ← I had this right originally, just confirming
        onBack={navigation.previousStep}
        showCancelButton={true}
        onCancel={handleXButtonClick}
        compact={true}
        sticky={true}
      />
      <WizardContextBar wizard={wizard} />
      <div className="p-6 bg-yarn-50 min-h-screen">
        {renderCurrentStep()}
      </div>

      <UnsavedChangesModal
        isOpen={showExitModal}
        onConfirmExit={handleConfirmExit}
        onCancel={handleCancelExit}
      />

      {/* Step Confirmation Modal for Intrinsic Shaping */}
      <StandardModal
        isOpen={showStepConfirmModal}
        onClose={handleCancelIntrinsicStep}
        onConfirm={handleConfirmIntrinsicStep}
        category="simple"
        colorScheme="sage"
        title="Ready to Add Step"
        subtitle="Shaped pattern detected"
        icon="🧶"
        primaryButtonText="Add Step"
        secondaryButtonText="Cancel"
      >
        {pendingShapingInfo && (
          <div className="space-y-4">
            <div className="bg-sage-50 border border-sage-200 rounded-lg p-4">
              <h4 className="font-medium text-sage-800 mb-2">Pattern Summary</h4>
              <div className="space-y-2 text-sm text-sage-700">
                <div className="flex justify-between">
                  <span>Pattern Type:</span>
                  <span className="font-medium">{wizard.wizardData.stitchPattern.pattern}</span>
                </div>
                <div className="flex justify-between">
                  <span>Entry Mode:</span>
                  <span className="font-medium">Row-by-Row</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Rows:</span>
                  <span className="font-medium">{wizard.wizardData.stitchPattern.rowInstructions?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-lavender-50 border border-lavender-200 rounded-lg p-4">
              <h4 className="font-medium text-lavender-800 mb-2">Shaping Detected</h4>
              <div className="space-y-2 text-sm text-lavender-700">
                <div className="flex justify-between">
                  <span>Starting Stitches:</span>
                  <span className="font-medium">{pendingShapingInfo.startingStitches}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ending Stitches:</span>
                  <span className="font-medium">{pendingShapingInfo.endingStitches}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Change:</span>
                  <span className={`font-medium ${pendingShapingInfo.netChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pendingShapingInfo.netChange > 0 ? '+' : ''}{pendingShapingInfo.netChange} stitches
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shaping Type:</span>
                  <span className="font-medium capitalize">{pendingShapingInfo.action}</span>
                </div>
              </div>
            </div>

            <p className="text-sm text-wool-600">
              Your pattern includes built-in shaping. This step will be added with the shaping automatically configured.
            </p>
          </div>
        )}
      </StandardModal>





    </WizardLayout>
  );
};

export default StepWizard;