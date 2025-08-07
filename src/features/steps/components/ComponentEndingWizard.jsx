import React, { useState } from 'react';
import EndingTypeSelector from './ending-wizard/EndingTypeSelector';
import BindOffConfig from './ending-wizard/BindOffConfig';
import AttachmentConfig from './ending-wizard/AttachmentConfig';
import OtherEndingConfig from './ending-wizard/OtherEndingConfig';
import PutOnHolderConfig from './ending-wizard/PutOnHolderConfig'; // ✅ NEW IMPORT
import PageHeader from '../../../shared/components/PageHeader';
import UnsavedChangesModal from '../../../shared/components/UnsavedChangesModal';
import ComponentCompletionModal from '../../../shared/components/ComponentCompletionModal';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import SetupNotesSection from '../../../shared/components/SetUpNotesSection';

const ComponentEndingWizard = ({
  component,
  projectName, // Added
  onBack,
  onComplete,
}) => {
  const [step, setStep] = useState(1);
  const [endingData, setEndingData] = useState({
    type: null,
    method: 'standard',
    targetComponent: '',
    customText: '',
    customMethod: '',
    prepNote: ''
  });

  const [showExitModal, setShowExitModal] = useState(false);

  // Component completion modal state
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedEndingStep, setCompletedEndingStep] = useState(null);

  // Get current stitch count from last step
  const getCurrentStitchCount = () => {
    if (!component?.steps || component.steps.length === 0) return 0;
    const lastStep = component.steps[component.steps.length - 1];
    return lastStep.endingStitches || lastStep.expectedStitches || 0;
  };

  const currentStitches = getCurrentStitchCount();

  const handleEndingTypeSelect = (type) => {
    setEndingData(prev => ({ ...prev, type }));

    // ✅ CHANGED: Put on Holder now goes to config screen instead of immediate completion
    if (type === 'put_on_holder') {
      setStep(2); // Go to configuration screen
      return;
    }

    // Bind Off All gets smart defaults and skips to method selection
    if (type === 'bind_off_all') {
      setEndingData(prev => ({
        ...prev,
        stitchCount: currentStitches
      }));
    }

    // All other types need configuration
    setStep(2);
  };

  // Modified to show modal instead of immediate navigation
  const handleComplete = (finalData = null) => {
    const endingStep = finalData || generateEndingStep();

    // Show completion modal with navigation options
    setCompletedEndingStep(endingStep);
    setShowCompletionModal(true);
  };

  // ✅ NEW: Handle modal navigation choices
  const handleViewComponent = () => {
    setShowCompletionModal(false);
    // Complete the step first, then navigate
    onComplete(completedEndingStep);
    // Navigation to ManageSteps (Pattern Steps) will happen via existing flow
  };

  const handleViewProject = () => {
    setShowCompletionModal(false);
    // Complete the step first, then navigate to ProjectDetail Overview
    onComplete(completedEndingStep);
  };

  const handleCloseModal = () => {
    // Close modal and stay on current screen
    setShowCompletionModal(false);
  };

  const generateEndingStep = () => {
    const { type, method, targetComponent, customText, customMethod, stitchCount, prepNote } = endingData;

    switch (type) {
      case 'put_on_holder':
        return {
          type,
          description: `Put all ${currentStitches} stitches on holder${customText ? ` (${customText})` : ''}`,
          stitchCount: currentStitches,
          customText,
          prepNote
        };

      case 'bind_off_all':
        const methodName = method === 'other' ? customMethod : getMethodName(method);
        const actualCount = stitchCount || currentStitches;
        return {
          type,
          method: method || 'standard',
          stitchCount: actualCount,
          description: `Bind off all ${actualCount} stitches${methodName ? ` using ${methodName}` : ''}`,
          prepNote
        };

      case 'attach_to_piece':
        const attachMethod = method === 'other' ? customMethod : getMethodName(method);
        const target = targetComponent === 'Other...' ? customText : targetComponent;
        return {
          type,
          method,
          targetComponent: target,
          stitchCount: currentStitches,
          description: `Attach to ${target}${attachMethod ? ` using ${attachMethod}` : ''}`,
          prepNote
        };

      case 'other':
        return {
          type,
          description: customText,
          customText,
          stitchCount: currentStitches,
          prepNote
        };

      default:
        return {
          type,
          description: 'Unknown ending',
          stitchCount: currentStitches,
          prepNote
        };
    }
  };

  const getMethodName = (methodId) => {
    const methodNames = {
      'standard': 'standard bind off',
      'stretchy': 'stretchy bind off',
      'picot': 'picot bind off',
      'three_needle': 'three needle bind off',
      'mattress_stitch': 'mattress stitch',
      'backstitch': 'backstitch',
      'kitchener_stitch': 'kitchener stitch',
      'three_needle_bindoff': 'three needle bind off'
    };
    return methodNames[methodId] || methodId;
  };

  const hasUnsavedData = () => {
    if (step === 1) {
      return endingData.type !== null;
    }
    if (step === 2) {
      return true;
    }
    return false;
  };

  const handleExitToComponentSteps = () => {
    if (hasUnsavedData()) {
      setShowExitModal(true);
    } else {
      onBack();
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    onBack();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
  };

  const canComplete = () => {
    const { type, method, targetComponent, customText, customMethod } = endingData;

    switch (type) {
      case 'put_on_holder':
        return true; // ✅ NEW: Put on Holder always ready to complete
      case 'bind_off_all':
        return true;
      case 'attach_to_piece':
        return method && targetComponent && (targetComponent !== 'Other...' || customText);
      case 'other':
        return customText && customText.trim() !== '';
      default:
        return false;
    }
  };

  // STEP 1
  if (step === 1) {
    return (
      <>
        <div className="min-h-screen bg-yarn-50">
          <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
            <PageHeader
              title="Configure Ending"
              subtitle="Set up the details"
              onBack={onBack}
              showCancelButton={true}
              onCancel={handleExitToComponentSteps}
            />

            <div className="p-6 bg-yarn-50 stack-lg">
              <EndingTypeSelector
                onTypeSelect={handleEndingTypeSelect}
                component={component}
                currentStitches={currentStitches}
              />
            </div>
          </div>
        </div>

        {/* Step Completion Modal */}
        <ComponentCompletionModal
          isOpen={showCompletionModal}
          componentName={component?.name || 'this component'}
          projectName={projectName} // ✅ ADD THIS
          endingType={completedEndingStep?.type}
          currentStitches={currentStitches}
          onViewComponent={handleViewComponent}
          onViewProject={handleViewProject} // ✅ ADD THIS
          onClose={handleCloseModal}
        />

        <UnsavedChangesModal
          isOpen={showExitModal}
          onConfirmExit={handleConfirmExit}
          onCancel={handleCancelExit}
        />
      </>
    );
  }

  // STEP 2
  return (
    <>
      <div className="min-h-screen bg-yarn-50">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
          <PageHeader
            title="Configure Ending"
            subtitle="Set up the details"
            onBack={() => setStep(1)}
            showCancelButton={true}
            onCancel={handleExitToComponentSteps}
          />

          <div className="p-6 bg-yarn-50 stack-lg">

            {/* ✅ NEW: Put on Holder Config */}
            {endingData.type === 'put_on_holder' && (
              <PutOnHolderConfig
                endingData={endingData}
                setEndingData={setEndingData}
                currentStitches={currentStitches}
              />
            )}

            {endingData.type === 'bind_off_all' && (
              <BindOffConfig
                endingData={endingData}
                setEndingData={setEndingData}
                currentStitches={currentStitches}
                isFinishingComponent={true}
              />
            )}

            {endingData.type === 'attach_to_piece' && (
              <AttachmentConfig
                endingData={endingData}
                setEndingData={setEndingData}
                currentStitches={currentStitches}
              />
            )}

            {endingData.type === 'other' && (
              <OtherEndingConfig
                endingData={endingData}
                setEndingData={setEndingData}
                currentStitches={currentStitches}
              />
            )}

            <div className="pt-6 border-t border-wool-200">
              <button
                onClick={() => handleComplete()}
                disabled={!canComplete()}
                className="w-full bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span className="text-xl">🏁</span>
                Finish Component
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step Completion Modal for Step 2 completions */}
      <ComponentCompletionModal
        isOpen={showCompletionModal}
        componentName={component?.name || 'this component'}
        projectName={projectName} // ✅ ADD THIS
        endingType={completedEndingStep?.type}
        currentStitches={currentStitches}
        onViewComponent={handleViewComponent}
        onViewProject={handleViewProject} // ✅ ADD THIS
        onClose={handleCloseModal}
      />

      <UnsavedChangesModal
        isOpen={showExitModal}
        onConfirmExit={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </>
  );
};

export default ComponentEndingWizard;