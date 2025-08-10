import React, { useState } from 'react';
import PageHeader from '../../../shared/components/PageHeader';
import UnsavedChangesModal from '../../../shared/components/UnsavedChangesModal';
import ComponentCompletionModal from '../../../shared/components/ComponentCompletionModal';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import SetupNotesSection from '../../../shared/components/SetUpNotesSection';

const ComponentEndingWizard = ({
  component,
  projectName,
  onBack,
  onComplete,
  onNavigateToProject,
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

    if (type === 'put_on_holder') {
      setStep(2);
      return;
    }

    if (type === 'bind_off_all') {
      setEndingData(prev => ({
        ...prev,
        stitchCount: currentStitches
      }));
    }

    setStep(2);
  };

  const handleComplete = (finalStep = null) => {
    const endingStep = finalStep || createEndingStepData();

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

  const createEndingStepData = () => {
    const { type, method, targetComponent, customText, customMethod, prepNote } = endingData;

    switch (type) {
      case 'put_on_holder':
        return {
          type,
          stitchCount: currentStitches,
          description: `Put ${currentStitches} stitches on hold`,
          customText,
          prepNote
        };

      case 'bind_off_all':
        const methodName = getMethodName(method);
        return {
          type,
          method,
          stitchCount: currentStitches,
          description: `Bind off all stitches${methodName ? ` using ${methodName}` : ''}`,
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

  // ✅ KEEPING EXISTING LOGIC - Will be replaced in Step 3
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
        return true;

      case 'bind_off_all':
        if (method === 'other') {
          return customMethod && customMethod.trim() !== '';
        }
        return true;

      case 'attach_to_piece':
        const hasValidTarget = targetComponent && targetComponent !== '';
        const hasValidMethod = method !== 'other' || (customMethod && customMethod.trim() !== '');
        const hasCustomText = targetComponent !== 'Other...' || (customText && customText.trim() !== '');
        return hasValidTarget && hasValidMethod && hasCustomText;

      case 'other':
        return customText && customText.trim() !== '';

      default:
        return false;
    }
  };

  // ===== INLINED COMPONENT 1: EndingTypeSelector =====
  const renderEndingTypeSelector = () => (
    <div className="stack-lg">
      <div>
        <h2 className="content-header-primary">How does this component end?</h2>
        <p className="content-subheader">Choose the finishing method for your {currentStitches} stitches</p>
      </div>

      <div className="stack-sm">
        {/* Bind Off All - Most common finishing */}
        <button
          onClick={() => handleEndingTypeSelect('bind_off_all')}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">✂️</div>
            <div>
              <div className="font-semibold text-base mb-1">Bind Off All Stitches</div>
              <div className="text-sm opacity-75">Complete this component ({currentStitches} stitches)</div>
            </div>
          </div>
        </button>

        {/* Put on Holder - For later use */}
        <button
          onClick={() => handleEndingTypeSelect('put_on_holder')}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">📎</div>
            <div>
              <div className="font-semibold text-base mb-1">Put on Holder</div>
              <div className="text-sm opacity-75">Keep stitches live for later use</div>
            </div>
          </div>
        </button>

        {/* Attach to Piece - Join components */}
        <button
          onClick={() => handleEndingTypeSelect('attach_to_piece')}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">🔗</div>
            <div>
              <div className="font-semibold text-base mb-1">Attach to Another Component</div>
              <div className="text-sm opacity-75">Connect to another component</div>
            </div>
          </div>
        </button>

        {/* Other Ending - For complex scenarios */}
        <button
          onClick={() => handleEndingTypeSelect('other')}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">📝</div>
            <div>
              <div className="font-semibold text-base mb-1">Other Ending</div>
              <div className="text-sm opacity-75">Custom finishing method</div>
            </div>
          </div>
        </button>
      </div>

      {/* Helpful context for complex scenarios */}
      <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Need Something Complex?</h4>
        <div className="text-sm text-yarn-600">
          Use "Other Ending" for scenarios like "Bind off center 24 stitches, put remaining 20 on holders" or other custom combinations.
        </div>
      </div>
    </div>
  );

  // ===== INLINED COMPONENT 2: PutOnHolderConfig =====
  const renderPutOnHolderConfig = () => (
    <div className="stack-lg">
      <div>
        <h2 className="content-header-primary">Put on Holder</h2>
        <p className="content-subheader">
          Keep these stitches live for later use
        </p>
      </div>

      {/* Stitch Count Display */}
      <div className="success-block">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-sage-700">Stitches to Hold</h3>
            <p className="text-xs text-sage-600 mt-1">
              All stitches will be placed on holder for later use
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-sage-700">{currentStitches}</div>
            <div className="text-xs text-sage-600">stitches</div>
          </div>
        </div>
      </div>

      {/* Optional Comments */}
      <div>
        <label className="form-label">
          Holder Notes <span className="text-wool-400 text-sm font-normal">(Optional)</span>
        </label>
        <input
          type="text"
          value={endingData.customText || ''}
          onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
          placeholder="e.g., Use metal holder, transfer to waste yarn, leave on needle"
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
        />
      </div>

      {/* Helpful Info */}
      <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Holder Tips</h4>
        <div className="text-sm text-yarn-600 space-y-1">
          <div>• <strong>Stitch holders:</strong> Best for small numbers of stitches</div>
          <div>• <strong>Waste yarn:</strong> Good for large numbers or tight spaces</div>
          <div>• <strong>Spare needles:</strong> Keep stitches ready to knit immediately</div>
          <div>• <strong>Live stitches:</strong> These {currentStitches} stitches will be ready for seaming, grafting, or continuing</div>
        </div>
      </div>
    </div>
  );

  // ===== INLINED COMPONENT 3: BindOffConfig =====
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
        description: 'Joins two pieces together'
      },
      {
        id: 'other',
        name: 'Other Method',
        icon: '📝',
        description: 'Specify your own'
      }
    ];

    return (
      <div className="stack-lg">
        <div>
          <h2 className="content-header-primary">Bind Off Method</h2>
          <p className="content-subheader">How do you want to finish these {currentStitches} stitches?</p>
        </div>

        {/* Stitch Count Display */}
        <div className="warning-block">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-amber-700">Finishing Component</h3>
              <p className="text-xs text-amber-600 mt-1">
                This will complete your component
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-700">{currentStitches}</div>
              <div className="text-xs text-amber-600">stitches</div>
            </div>
          </div>
        </div>

        {/* Method Selection - Grid Layout */}
        <div>
          <label className="form-label">
            Bind Off Method (optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {methods.map((method) => (
              <button
                key={method.id}
                onClick={() => setEndingData(prev => ({ ...prev, method: method.id }))}
                className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${endingData.method === method.id
                  ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                  : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                  }`}
              >
                <div className="text-2xl mb-2">{method.icon}</div>
                <div className="font-semibold text-sm mb-1">{method.name}</div>
                <div className="text-xs opacity-75">{method.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Method Input */}
        {endingData.method === 'other' && (
          <div>
            <label className="form-label">
              Describe Your Bind Off Method
            </label>
            <input
              type="text"
              value={endingData.customMethod || ''}
              onChange={(e) => setEndingData(prev => ({ ...prev, customMethod: e.target.value }))}
              placeholder="e.g., Jeny's surprisingly stretchy bind off"
              className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
            />
          </div>
        )}

        {/* Helpful Info */}
        <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Bind Off Tips</h4>
          <div className="text-sm text-yarn-600 space-y-1">
            <div>• <strong>Standard:</strong> Works for most situations</div>
            <div>• <strong>Stretchy:</strong> Essential for necklines and cuffs</div>
            <div>• <strong>Three Needle:</strong> Great for shoulder seams</div>
            <div>• <strong>Finishing:</strong> This will complete your {currentStitches}-stitch component</div>
          </div>
        </div>
      </div>
    );
  };

  // ===== INLINED COMPONENT 4: AttachmentConfig =====
  const renderAttachmentConfig = () => {
    // Get existing components for the dropdown (mock data for now)
    const availableComponents = [
      'Left Sleeve',
      'Right Sleeve',
      'Back Panel',
      'Front Panel',
      'Collar',
      'Other...'
    ];

    const methods = [
      {
        id: 'mattress_stitch',
        name: 'Mattress Stitch',
        icon: '🧵',
        description: 'Invisible side seam'
      },
      {
        id: 'backstitch',
        name: 'Backstitch',
        icon: '⬅️',
        description: 'Strong, visible seam'
      },
      {
        id: 'kitchener_stitch',
        name: 'Kitchener Stitch',
        icon: '🪡',
        description: 'Invisible graft'
      },
      {
        id: 'three_needle',
        name: 'Three Needle',
        icon: '🔗',
        description: 'Joins two pieces together'
      },
      {
        id: 'other',
        name: 'Other Method',
        icon: '📝',
        description: 'Specify your own'
      }
    ];

    return (
      <div className="stack-lg">
        <div>
          <h2 className="content-header-primary">Attachment Details</h2>
          <p className="content-subheader">Choose method and target component</p>
        </div>

        {/* Attachment Method - Oval Radio List */}
        <div>
          <h3 className="text-sm font-semibold text-wool-700 mb-3 text-left">Attachment Method</h3>
          <div className="stack-sm">
            {methods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 ${endingData.method === method.id
                  ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                  : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                  }`}
              >
                <input
                  type="radio"
                  name="attach_method"
                  value={method.id}
                  checked={endingData.method === method.id}
                  onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                  className="w-4 h-4 text-sage-600 mr-4"
                />
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">{method.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm opacity-75">{method.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {endingData.method === 'other' && (
            <div className="mt-4">
              <input
                type="text"
                value={endingData.customMethod || ''}
                onChange={(e) => setEndingData(prev => ({ ...prev, customMethod: e.target.value }))}
                placeholder="Describe your attachment method"
                className="w-full border-2 border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
              />
            </div>
          )}
        </div>

        {/* Component Dropdown */}
        <div>
          <label className="form-label">
            Attach to Component
          </label>
          <select
            value={endingData.targetComponent || ''}
            onChange={(e) => setEndingData(prev => ({ ...prev, targetComponent: e.target.value }))}
            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
          >
            <option value="">Choose component...</option>
            {availableComponents.map(comp => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>

          {endingData.targetComponent === 'Other...' && (
            <div className="mt-3">
              <input
                type="text"
                value={endingData.customText || ''}
                onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
                placeholder="Describe the component to attach to"
                className="w-full border-2 border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===== INLINED COMPONENT 5: OtherEndingConfig =====
  const renderOtherEndingConfig = () => (
    <div className="stack-lg">
      <div>
        <h2 className="content-header-primary">Describe Your Ending</h2>
        <p className="content-subheader">What happens to complete this component?</p>
      </div>

      <div>
        <label className="form-label">
          Ending Description
        </label>
        <textarea
          value={endingData.customText || ''}
          onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
          placeholder="Describe how this component ends..."
          rows={4}
          className="input-field-lg resize-none"
        />
      </div>

      {/* Helpful examples */}
      <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Examples</h4>
        <div className="text-sm text-yarn-600 space-y-1">
          <div>• Transfer stitches to circular needle for next section</div>
          <div>• Place markers for button band pickup</div>
          <div>• Divide stitches equally onto two needles</div>
          <div>• Special cast off sequence for lace pattern</div>
        </div>
      </div>
    </div>
  );

  // ===== MAIN RENDER =====

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
      </>
    );
  }

  // STEP 2 - Configuration
  return (
    <>
      <div className="min-h-screen bg-yarn-50">
        <div className="app-container bg-white min-h-screen shadow-lg">
          <PageHeader
            title="Configure Ending"
            subtitle="Set up the details"
            onBack={() => setStep(1)}
            showCancelButton={true}
            onCancel={handleExitToComponentSteps}
          />

          <div className="p-6 bg-yarn-50 stack-lg">

            {/* Render appropriate config based on ending type */}
            {endingData.type === 'put_on_holder' && renderPutOnHolderConfig()}
            {endingData.type === 'bind_off_all' && renderBindOffConfig()}
            {endingData.type === 'attach_to_piece' && renderAttachmentConfig()}
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
    </>
  );
};

export default ComponentEndingWizard;