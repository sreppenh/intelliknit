import React, { useState } from 'react';
import { PrepStepOverlay, usePrepNoteManager, PrepStepButton, getPrepNoteConfig } from '../../../shared/components/PrepStepSystem';
import EndingTypeSelector from './ending-wizard/EndingTypeSelector';
import BindOffConfig from './ending-wizard/BindOffConfig';
import AttachmentConfig from './ending-wizard/AttachmentConfig';
import OtherEndingConfig from './ending-wizard/OtherEndingConfig';
import PageHeader from '../../../shared/components/PageHeader';
import UnsavedChangesModal from '../../../shared/components/UnsavedChangesModal';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

const ComponentEndingWizard = ({ component, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [endingData, setEndingData] = useState({
    type: null,
    method: 'standard', // Default to standard bind off
    targetComponent: '',
    customText: '',
    customMethod: '',
    prepNote: '' // NEW: Add prep note to ending data
  });

  const [showExitModal, setShowExitModal] = useState(false);

  // Prep note management
  const {
    isOverlayOpen,
    currentNote,
    hasNote,
    notePreview,
    handleOpenOverlay,
    handleCloseOverlay,
    handleSaveNote
  } = usePrepNoteManager(endingData.prepNote, (note) => {
    setEndingData(prev => ({ ...prev, prepNote: note }));
  });

  // Get config for component ending
  const prepConfig = getPrepNoteConfig('componentEnding');

  // Get current stitch count from last step
  const getCurrentStitchCount = () => {
    if (!component?.steps || component.steps.length === 0) return 0;
    const lastStep = component.steps[component.steps.length - 1];
    return lastStep.endingStitches || lastStep.expectedStitches || 0;
  };

  const currentStitches = getCurrentStitchCount();

  const handleEndingTypeSelect = (type) => {
    setEndingData(prev => ({ ...prev, type }));

    // Put on Holder is instant - no configuration needed
    if (type === 'put_on_holder') {
      handleComplete({
        type,
        description: `Put all ${currentStitches} stitches on holder for later use`,
        stitchCount: currentStitches,
        prepNote: endingData.prepNote // NEW: Include prep note
      });
      return;
    }

    // Bind Off All gets smart defaults and skips to method selection
    if (type === 'bind_off_all') {
      setEndingData(prev => ({
        ...prev,
        stitchCount: currentStitches // Auto-populate with current count
      }));
    }

    // All other types need configuration
    setStep(2);
  };

  const handleComplete = (finalData = null) => {
    const endingStep = finalData || generateEndingStep();
    onComplete(endingStep);
  };

  const generateEndingStep = () => {
    const { type, method, targetComponent, customText, customMethod, stitchCount, prepNote } = endingData;

    switch (type) {
      case 'bind_off_all':
        const methodName = method === 'other' ? customMethod : getMethodName(method);
        const actualCount = stitchCount || currentStitches; // Fallback to current if somehow missing
        return {
          type,
          method: method || 'standard',
          stitchCount: actualCount,
          description: `Bind off all ${actualCount} stitches${methodName ? ` using ${methodName}` : ''}`,
          prepNote // NEW: Include prep note
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
          prepNote // NEW: Include prep note
        };

      case 'other':
        return {
          type,
          description: customText,
          customText,
          stitchCount: currentStitches,
          prepNote // NEW: Include prep note
        };

      default:
        return {
          type,
          description: 'Unknown ending',
          stitchCount: currentStitches,
          prepNote // NEW: Include prep note
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

  // Check for unsaved data - PM Claude specified: "validation for first screen only"
  const hasUnsavedData = () => {
    // Step 1: Check if user has selected an ending type
    if (step === 1) {
      return endingData.type !== null;
    }

    // Step 2: Always show warning (subsequent screens always have data)
    if (step === 2) {
      return true;
    }

    return false;
  };

  // Handle exit with warning validation
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
      case 'bind_off_all':
        return true; // Method is optional, stitch count is auto-populated
      case 'attach_to_piece':
        return method && targetComponent && (targetComponent !== 'Other...' || customText);
      case 'other':
        return customText && customText.trim() !== '';
      default:
        return false;
    }
  };

  // Step 1: What happens to stitches?
  if (step === 1) {
    return (
      <>
        <div className="min-h-screen bg-yarn-50">
          <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">

            {/* Header */}
            <PageHeader
              title="Configure Ending"
              subtitle="Set up the details"
              onBack={() => setStep(1)}
              showCancelButton={true}
              onCancel={handleExitToComponentSteps}
            />

            <div className="p-6 bg-yarn-50 stack-lg relative">

              {/* Prep Note Button */}
              <PrepStepButton
                onClick={handleOpenOverlay}
                hasNote={hasNote}
                notePreview={notePreview}
                position="top-right"
                size="normal"
                variant="ghost"
              />

              <EndingTypeSelector
                onTypeSelect={handleEndingTypeSelect}
                component={component}
                currentStitches={currentStitches}
              />
            </div>
          </div>
        </div>

        {/* Prep Note Overlay */}
        <PrepStepOverlay
          isOpen={isOverlayOpen}
          onClose={handleCloseOverlay}
          onSave={handleSaveNote}
          existingNote={currentNote}
          {...prepConfig}
        />
      </>
    );
  }

  // Step 2: Configuration based on ending type
  return (
    <>
      <div className="min-h-screen bg-yarn-50">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">

          {/* Header */}
          <PageHeader
            title="Configure Ending"
            subtitle="Set up the details"
            onBack={() => setStep(1)}
            showCancelButton={true}
            onCancel={handleExitToComponentSteps}
          />

          <div className="p-6 bg-yarn-50 stack-lg relative">

            {/* Prep Note Button */}
            <PrepStepButton
              onClick={handleOpenOverlay}
              hasNote={hasNote}
              notePreview={notePreview}
              position="top-right"
              size="normal"
              variant="ghost"
            />

            {/* Render appropriate configuration component */}
            {endingData.type === 'bind_off_all' && (
              <BindOffConfig
                endingData={endingData}
                setEndingData={setEndingData}
                currentStitches={currentStitches}
                isFinishingComponent={true} // New prop to indicate this is "bind off all"
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

            {/* Finish Button */}
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

      {/* Prep Note Overlay */}
      <PrepStepOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        onSave={handleSaveNote}
        existingNote={currentNote}
        {...prepConfig}
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