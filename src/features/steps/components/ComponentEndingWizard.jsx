import React, { useState } from 'react';
import PageHeader from '../../../shared/components/PageHeader';
import UnsavedChangesModal from '../../../shared/components/modals/UnsavedChangesModal';
import ComponentCompletionModal from '../../../shared/components/modals/ComponentCompletionModal';
import { PrepStepModal, usePrepNoteManager, getPrepNoteConfig } from '../../../shared/components/PrepStepSystem';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import { getStepMethodDisplay } from '../../../shared/utils/stepDisplayUtils';
import { createEndingStep } from '../../../shared/utils/stepCreationUtils';
import useYarnManager from '../../../shared/hooks/useYarnManager';

const ComponentEndingWizard = ({
  component,
  projectName,
  onBack,
  onComplete,
  onNavigateToProject, onGoToLanding
}) => {
  const [step, setStep] = useState(1);
  const [endingData, setEndingData] = useState({
    type: null,
    method: 'standard',
    targetComponent: '',
    customText: '',
    customMethod: '',
    stitchCount: '',
    prepNote: '',
    afterNote: ''
  });

  const [showExitModal, setShowExitModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedEndingStep, setCompletedEndingStep] = useState(null);

  // Prep note management
  const {
    isModalOpen: isPrepNoteModalOpen,
    currentNote: currentPrepNote,
    handleOpenModal: handleOpenPrepNoteModal,
    handleCloseModal: handleClosePrepNoteModal,
    handleSaveNote: handleSavePrepNote
  } = usePrepNoteManager(endingData.prepNote, (note) => {
    setEndingData(prev => ({ ...prev, prepNote: note }));
  });

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
    setStep(2);
  };

  const handleComplete = (finalStep = null) => {
    const endingStep = finalStep || createEndingStep(endingData, currentStitches);

    IntelliKnitLogger.success('ComponentEndingWizard', 'Component ending completed', {
      endingType: endingStep.type,
      stitchCount: endingStep.stitchCount
    });

    setCompletedEndingStep(endingStep);
    setShowCompletionModal(true);
  };

  const handleViewComponent = () => {
    setShowCompletionModal(false);
    if (completedEndingStep) {
      onComplete(completedEndingStep);
    }
  };

  const handleViewProject = () => {
    setShowCompletionModal(false);
    if (completedEndingStep) {
      onComplete(completedEndingStep);
    }
    if (onNavigateToProject) {
      onNavigateToProject();
    }
  };

  const handleCloseModal = () => {
    setShowCompletionModal(false);
    if (completedEndingStep) {
      onComplete(completedEndingStep);
    }
  };

  // Use stepDisplayUtils instead of duplicate logic
  const getMethodName = (methodId, patternType) => {
    const mockStep = {
      wizardConfig: {
        stitchPattern: {
          pattern: patternType,
          method: methodId
        }
      }
    };
    return getStepMethodDisplay(mockStep);
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
        return true;

      case 'bind_off_all':
        // Three-needle bind off needs target component
        if (method === 'three_needle') {
          const hasValidTarget = targetComponent && targetComponent !== '';
          const hasCustomText = targetComponent !== 'Other...' || (customText && customText.trim() !== '');
          return hasValidTarget && hasCustomText;
        }
        // Other method needs custom description
        if (method === 'other') {
          return customMethod && customMethod.trim() !== '';
        }
        return true;

      case 'other':
        return customText && customText.trim() !== '';

      default:
        return false;
    }
  };

  // EndingTypeSelector
  const renderEndingTypeSelector = () => (
    <div className="stack-lg">
      <div className="content-header-with-buttons">
        <div>
          <h2 className="content-header-primary">Finish Component</h2>
        </div>
        <div className="button-group">
          <button
            onClick={handleOpenPrepNoteModal}
            className="btn-secondary btn-sm"
          >
            {currentPrepNote.trim().length > 0 ? 'Edit Preparation Note' : '+ Add Preparation Note'}
          </button>
        </div>
      </div>

      <div className="stack-sm">
        {/* Bind Off All */}
        <button
          onClick={() => handleEndingTypeSelect('bind_off_all')}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">✂️</div>
            <div>
              <div className="font-semibold text-base mb-1">Bind Off Stitches</div>
              <div className="text-sm opacity-75">Complete this component</div>
            </div>
          </div>
        </button>

        {/* Put on Holder */}
        <button
          onClick={() => handleEndingTypeSelect('put_on_holder')}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">📎</div>
            <div>
              <div className="font-semibold text-base mb-1">Put Stitches on Hold</div>
              <div className="text-sm opacity-75">Keep stitches live for later use</div>
            </div>
          </div>
        </button>

        {/* Other Ending */}
        <button
          onClick={() => handleEndingTypeSelect('other')}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">⚙️</div>
            <div>
              <div className="font-semibold text-base mb-1">Custom Combination</div>
              <div className="text-sm opacity-75">Complex ending (partial bind off, etc.)</div>
            </div>
          </div>
        </button>
      </div>

      {/* Helpful context */}
      <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Choose Your Path</h4>
        <div className="text-sm text-yarn-600 space-y-1">
          <div>• <strong>Bind Off:</strong> Complete component with bind off (including 3-needle join)</div>
          <div>• <strong>Hold:</strong> Pause with live stitches for later seaming or grafting</div>
          <div>• <strong>Custom:</strong> Complex scenarios like "bind off center 24, hold remaining"</div>
        </div>
      </div>
    </div>
  );

  // PutOnHolderConfig
  const renderPutOnHolderConfig = () => (
    <div className="stack-lg">
      <div>
        <h2 className="content-header-primary">Put Stitches on Hold</h2>
        <p className="content-subheader">Keep stitches live for later use</p>
      </div>

      {/* Stitch Count Display */}
      <div className="success-block">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-sage-700">Stitches to Hold</h3>
            <p className="text-xs text-sage-600 mt-1">Live stitches available for seaming, grafting, or continuing</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-sage-700">{currentStitches}</div>
            <div className="text-xs text-sage-600">stitches</div>
          </div>
        </div>
      </div>

      {/* Optional holder notes */}
      <div>
        <label className="form-label">
          Holder Notes <span className="text-wool-400 text-sm font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          value={endingData.customText || ''}
          onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
          placeholder="e.g., Use metal holder, transfer to waste yarn"
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
        />
      </div>

      {/* After note */}
      <div>
        <label className="form-label">
          Assembly Notes <span className="text-wool-400 text-sm font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          value={endingData.afterNote || ''}
          onChange={(e) => setEndingData(prev => ({ ...prev, afterNote: e.target.value }))}
          placeholder="e.g., Keep stitches for later grafting to front panel"
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
        />
      </div>
    </div>
  );

  // BindOffConfig
  const renderBindOffConfig = () => {
    const methods = [
      {
        id: 'standard',
        name: 'Standard Bind Off',
        icon: '✂️',
        description: 'Basic bind off, most common'
      },
      {
        id: 'stretchy',
        name: 'Stretchy Bind Off',
        icon: '🌊',
        description: 'Extra stretch for ribbing'
      },
      {
        id: 'picot',
        name: 'Picot Bind Off',
        icon: '🌸',
        description: 'Decorative scalloped edge'
      },
      {
        id: 'three_needle',
        name: 'Three Needle Bind Off',
        icon: '🔗',
        description: 'Joins to another component'
      },
      {
        id: 'other',
        name: 'Other Method',
        icon: '📝',
        description: 'Specify your own'
      }
    ];

    const availableComponents = [
      'Left Sleeve',
      'Right Sleeve',
      'Back Panel',
      'Front Panel',
      'Collar',
      'Other...'
    ];

    return (
      <div className="stack-lg">
        <div>
          <h2 className="content-header-primary">Bind Off Method</h2>
          <p className="content-subheader">Choose how to finish these {currentStitches} stitches</p>
        </div>

        {/* Stitch Count Display */}
        <div className="success-block">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-sage-700">Stitches to Bind Off</h3>
              <p className="text-xs text-sage-600 mt-1">This will consume all stitches and complete the component</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-sage-700">{currentStitches}</div>
              <div className="text-xs text-sage-600">stitches</div>
            </div>
          </div>
        </div>

        {/* Method Selection - Radio Style */}
        <div className="space-y-3">
          {methods.map((method) => (
            <label
              key={method.id}
              className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${endingData.method === method.id
                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                }`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="bind_off_method"
                  value={method.id}
                  checked={endingData.method === method.id}
                  onChange={(e) => {
                    const newYarnId = e.target.value;
                    setEndingData(prev => ({ ...prev, colorYarnId: newYarnId }));
                  }}
                  className="w-4 h-4 text-sage-600 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{method.icon}</div>
                    <div className="text-left">
                      <div className="font-semibold text-base">{method.name}</div>
                      <div className="text-sm opacity-75">{method.description}</div>
                    </div>
                  </div>

                  {/* Three Needle - Target Component Selection */}
                  {endingData.method === 'three_needle' && method.id === 'three_needle' && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="text-sm font-medium text-sage-700 block mb-2">Join to Component</label>
                        <select
                          value={endingData.targetComponent || ''}
                          onChange={(e) => setEndingData(prev => ({ ...prev, targetComponent: e.target.value }))}
                          className="w-full border-2 border-sage-300 rounded-lg px-3 py-2 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                        >
                          <option value="">Choose component...</option>
                          {availableComponents.map(comp => (
                            <option key={comp} value={comp}>{comp}</option>
                          ))}
                        </select>
                      </div>

                      {endingData.targetComponent === 'Other...' && (
                        <div>
                          <input
                            type="text"
                            value={endingData.customText || ''}
                            onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
                            placeholder="Describe the component to join to"
                            className="w-full border-2 border-sage-300 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                          />
                        </div>
                      )}

                      <div className="text-xs text-sage-600">
                        💡 Three-needle bind off joins two pieces together while binding off
                      </div>
                    </div>
                  )}

                  {/* Other Method - Custom Input */}
                  {endingData.method === 'other' && method.id === 'other' && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={endingData.customMethod || ''}
                        onChange={(e) => setEndingData(prev => ({ ...prev, customMethod: e.target.value }))}
                        placeholder="e.g., Jeny's surprisingly stretchy bind off"
                        className="w-full border-2 border-sage-300 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* After note */}
        <div>
          <label className="form-label">
            Assembly Notes <span className="text-wool-400 text-sm font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={endingData.afterNote || ''}
            onChange={(e) => setEndingData(prev => ({ ...prev, afterNote: e.target.value }))}
            placeholder="e.g. using Kitchener Stitch, attach to shoulder"
            className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
          />
        </div>
      </div>
    );
  };

  // OtherEndingConfig
  const renderOtherEndingConfig = () => (
    <div className="stack-lg">
      <div>
        <h2 className="content-header-primary">Custom Combination Ending</h2>
        <p className="content-subheader">Describe your complex finishing method</p>
      </div>

      <div>
        <label className="form-label">Description</label>
        <textarea
          value={endingData.customText || ''}
          onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
          placeholder="e.g., Bind off center 24 stitches, put remaining 20 stitches on holders (10 each side)"
          rows={4}
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white resize-none"
        />
      </div>


      {/* After note */}
      <div>
        <label className="form-label">
          Assembly Notes <span className="text-wool-400 text-sm font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          value={endingData.afterNote || ''}
          onChange={(e) => setEndingData(prev => ({ ...prev, afterNote: e.target.value }))}
          placeholder="e.g., Held stitches ready for neckband pickup"
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
        />
      </div>

      {/* Helpful examples */}
      <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Custom Ending Examples</h4>
        <div className="text-sm text-yarn-600 space-y-1">
          <div>• Bind off center 24 stitches, put remaining 20 on holders</div>
          <div>• Transfer stitches to circular needle for neckband</div>
          <div>• Divide stitches for split hem construction</div>
          <div>• Special cast off sequence following pattern instructions</div>
        </div>
      </div>
    </div>
  );

  // MAIN RENDER

  // STEP 1 - Type Selection
  if (step === 1) {
    return (
      <>
        <div className="min-h-screen bg-yarn-50">
          <div className="app-container bg-white min-h-screen shadow-lg">
            <PageHeader
              title="Finish Component"
              subtitle={`${component?.name || 'Component'} • ${currentStitches} stitches`}
              onBack={onBack}
              showCancelButton={true}
              onCancel={handleExitToComponentSteps}
            />

            <div className="p-6 bg-yarn-50 stack-lg">
              {renderEndingTypeSelector()}
            </div>
          </div>
        </div>

        <ComponentCompletionModal
          isOpen={showCompletionModal}
          componentName={component?.name || 'this component'}
          projectName={projectName}
          endingType={completedEndingStep?.type}
          currentStitches={currentStitches}
          onViewComponent={handleViewComponent}
          onViewProject={handleViewProject}
          onClose={handleCloseModal}
        />

        <UnsavedChangesModal
          isOpen={showExitModal}
          onConfirmExit={handleConfirmExit}
          onCancel={handleCancelExit}
        />

        <PrepStepModal
          isOpen={isPrepNoteModalOpen}
          onClose={handleClosePrepNoteModal}
          onSave={handleSavePrepNote}
          existingNote={currentPrepNote}
          {...prepConfig}
        />
      </>
    );
  }

  // STEP 2 - Configuration
  return (
    <>
      <div className="min-h-screen bg-yarn-50">
        <div className="app-container bg-white min-h-screen shadow-lg">
          <PageHeader
            useBranding={true}
            onHome={onGoToLanding}
            compact={true}
            onBack={onBack}
            showCancelButton={true}
            onCancel={handleExitToComponentSteps}
          />

          <div className="p-6 bg-yarn-50 stack-lg">
            {/* Render appropriate config based on ending type */}
            {endingData.type === 'put_on_holder' && renderPutOnHolderConfig()}
            {endingData.type === 'bind_off_all' && renderBindOffConfig()}
            {endingData.type === 'other' && renderOtherEndingConfig()}

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

      <ComponentCompletionModal
        isOpen={showCompletionModal}
        componentName={component?.name || 'this component'}
        projectName={projectName}
        endingType={completedEndingStep?.type}
        currentStitches={currentStitches}
        onViewComponent={handleViewComponent}
        onViewProject={handleViewProject}
        onClose={handleCloseModal}
      />

      <UnsavedChangesModal
        isOpen={showExitModal}
        onConfirmExit={handleConfirmExit}
        onCancel={handleCancelExit}
      />

      <PrepStepModal
        isOpen={isPrepNoteModalOpen}
        onClose={handleClosePrepNoteModal}
        onSave={handleSavePrepNote}
        existingNote={currentPrepNote}
        {...prepConfig}
      />
    </>
  );
};

export default ComponentEndingWizard;