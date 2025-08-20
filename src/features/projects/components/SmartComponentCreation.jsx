import React, { useState, useEffect } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import { PrepStepModal, usePrepNoteManager, PrepStepButton, getPrepNoteConfig } from '../../../shared/components/PrepStepSystem';
import IncrementInput from '../../../shared/components/IncrementInput';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import UnsavedChangesModal from '../../../shared/components/modals/UnsavedChangesModal';
import SegmentedControl from '../../../shared/components/SegmentedControl';


const SmartComponentCreation = ({ onBack, onComponentCreated }) => {
  const { dispatch } = useProjectsContext();
  const { currentProject } = useProjectsContext(); // ← ADD this line

  const [screen, setScreen] = useState(1);
  // Keep your existing useState exactly as it is:
  const [componentData, setComponentData] = useState({
    name: '',
    setupNotes: '',
    construction: null,       // ← Keep as null
    startType: null,
    startMethod: null,
    startStitches: '',
    startDescription: '',
    startInstructions: '',
    prepNote: ''
  });


  // State for which start type is expanded (like selectedQuickCategory)
  const [selectedStartType, setSelectedStartType] = useState(null);


  const [showExitModal, setShowExitModal] = useState(false);

  // Check if user has entered any component data (across both screens)
  const hasUnsavedData = () => {
    // Only consider it "dirty" if user has actually entered meaningful data
    return componentData.name.trim().length > 0 ||
      (componentData.setupNotes && componentData.setupNotes.trim().length > 0) ||
      (componentData.construction !== null && componentData.construction !== (currentProject?.construction || 'flat')) || // Only if different from project default
      componentData.startType !== null ||
      componentData.startMethod !== null ||
      (componentData.startStitches && componentData.startStitches.trim().length > 0) ||
      (componentData.startDescription && componentData.startDescription.trim().length > 0) ||
      (componentData.startInstructions && componentData.startInstructions.trim().length > 0);
  };

  const handleXButtonClick = () => {
    if (hasUnsavedData()) {
      setShowExitModal(true);
    } else {
      // Exit directly to Project Detail
      onBack();
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    onBack();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    // Stay on current screen
  };

  // Prep note management
  const {
    isModalOpen,
    currentNote,
    hasNote,
    notePreview,
    handleOpenModal,
    handleCloseModal,
    handleSaveNote
  } = usePrepNoteManager(componentData.prepNote, (note) => {
    setComponentData(prev => ({ ...prev, prepNote: note }));
  });

  const prepConfig = getPrepNoteConfig('componentCreation');

  // Method definitions - organized by start type
  const methodsByStartType = {
    cast_on: [
      { id: 'long_tail', name: 'Long Tail', icon: '🪢' },
      { id: 'cable', name: 'Cable', icon: '🔗' },
      { id: 'provisional', name: 'Provisional', icon: '📎' },
      { id: 'tubular', name: 'Tubular', icon: '🌊' },
      { id: 'backward_loop', name: 'Backward Loop', icon: '↪️' },
      { id: 'other', name: 'Other', icon: '📝' }
    ],
    pick_up: [
      { id: 'pick_up_knit', name: 'Pick Up & Knit', icon: '🧶' }
    ],
    continue: [
      { id: 'from_stitches', name: 'From Live Stitches', icon: '📎' }
    ],
    other: [
      { id: 'custom', name: 'Custom Setup', icon: '📝' }
    ]
  };

  const startTypes = [
    { id: 'cast_on', name: 'Cast On', icon: '🏗️', desc: 'Start from scratch' },
    { id: 'pick_up', name: 'Pick Up & Knit', icon: '🧶', desc: 'From existing edge' },
    { id: 'continue', name: 'From Holder', icon: '📎', desc: 'Resume saved stitches' },
    { id: 'other', name: 'Other', icon: '📝', desc: 'Complex setup' }
  ];

  const handleStartTypeSelect = (startTypeId) => {
    setSelectedStartType(selectedStartType === startTypeId ? null : startTypeId);
    // Reset component data when changing start type
    setComponentData(prev => ({
      ...prev,
      startType: null,
      startMethod: null,
      startStitches: '',
      startDescription: '',
      startInstructions: ''
    }));
  };

  const handleMethodSelect = (startTypeId, methodId) => {
    setComponentData(prev => ({
      ...prev,
      startType: startTypeId,
      startMethod: methodId
    }));

    // Auto-advance to screen 2 after a brief delay (like PatternSelector)
    setTimeout(() => {
      setScreen(2);
    }, 50);
  };

  const needsDescription = () => {
    return componentData.startType === 'pick_up' ||
      componentData.startType === 'continue' ||
      componentData.startMethod === 'other';
  };

  const needsInstructions = () => {
    return componentData.startType === 'pick_up';
  };

  const canProceedToDetails = () => {
    return componentData.name.trim() &&
      componentData.startType &&
      componentData.startMethod;
  };

  const canCreateComponent = () => {
    if (!componentData.startStitches || parseInt(componentData.startStitches) <= 0) {
      return false;
    }

    if (needsDescription() && !componentData.startDescription?.trim()) {
      return false;
    }

    if (needsInstructions() && !componentData.startInstructions?.trim()) {
      return false;
    }

    return true;
  };

  const handleCreateComponent = () => {
    const newComponent = {
      name: componentData.name.trim(),
      startType: componentData.startType,
      startDescription: componentData.startDescription || getDefaultDescription(),
      startInstructions: componentData.startInstructions || '',
      startingStitches: parseInt(componentData.startStitches),
      startMethod: componentData.startMethod,
      endType: null,
      endDescription: '',
      endingStitches: null,
      endMethod: '',
      steps: [],
      currentStep: 0,
      prepNote: componentData.prepNote,
      construction: componentData.construction,           // ADD THIS
      setupNotes: componentData.setupNotes,             // ADD THIS
    };

    dispatch({
      type: 'ADD_ENHANCED_COMPONENT',
      payload: newComponent
    });

    onComponentCreated(newComponent);
  };

  const getDefaultDescription = () => {
    const typeMap = {
      cast_on: 'Cast on from scratch',
      pick_up: 'Pick up from existing piece',
      continue: 'Continue from previous section',
      other: 'Custom setup'
    };
    return typeMap[componentData.startType] || '';
  };

  // In SmartComponentCreation.jsx, add this useEffect near the top after your state declarations:

  // Keep the existing useEffect exactly as it is:
  useEffect(() => {
    // Initialize with project defaults when component mounts
    if (currentProject && !componentData.construction) {
      setComponentData(prev => ({
        ...prev,
        construction: currentProject.construction || 'flat'
      }));
    }
  }, [currentProject]);

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="app-container bg-yarn-50 min-h-screen shadow-lg">

        {/* Header */}
        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={screen === 1 ? onBack : () => setScreen(1)}
              className="text-white text-lg hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0"
            >
              ←
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold">Add Component</h1>
              <p className="text-sage-100 text-sm">{screen === 1 ? 'Component Identity & Setup' : 'Method & Configuration'}</p>
            </div>
            <button
              onClick={handleXButtonClick}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              title="Exit Component Creation"
            >
              ✕
            </button>
          </div>
        </div>

        {screen === 1 ? (
          // Screen 1: Component Identity & Setup
          <div className="p-6 bg-yarn-50 space-y-6 relative">

            {/* Page Title */}
            <h1 className="page-title">Create Component</h1>

            {/* Component Name */}
            <div>
              <label className="form-label">Component Name</label>
              <input
                type="text"
                value={componentData.name}
                onChange={(e) => setComponentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Left Sleeve, Back Panel, Collar"
                className="input-field-lg"
              />
            </div>

            {/* Setup Notes */}
            <div>
              <label className="form-label">
                Setup Notes <span className="text-wool-400 text-sm font-normal">(Optional)</span>
              </label>
              <textarea
                value={componentData.setupNotes || ''}
                onChange={(e) => setComponentData(prev => ({ ...prev, setupNotes: e.target.value }))}
                placeholder="e.g., Switch to US 6 circular needles, place stitch markers, check measurements"
                rows={3}
                className="input-field-lg resize-none"
              />
            </div>


            {/* Construction Selection */}
            <SegmentedControl.Construction
              value={componentData.construction}
              onChange={(value) => setComponentData(prev => ({ ...prev, construction: value }))}
            />

            {/* How Does It Start */}
            <div>
              <label className="form-label">How Does It Start</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'cast_on', label: 'Cast On', icon: '🏗️' },
                  { value: 'pick_up', label: 'Pick Up & Knit', icon: '🧶' },
                  { value: 'continue', label: 'Continue from Stitches', icon: '📎' },
                  { value: 'other', label: 'Other', icon: '📝' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setComponentData(prev => ({ ...prev, startType: option.value }))}
                    className={`p-3 text-sm border-2 rounded-lg transition-colors text-center ${componentData.startType === option.value
                      ? 'border-sage-500 bg-sage-100 text-sage-700'
                      : 'border-wool-200 hover:border-sage-300'
                      }`}
                  >
                    <div className="text-xl mb-1">{option.icon}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-4">
              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="flex-1 btn-tertiary"
                >
                  ← Back
                </button>

                <button
                  onClick={() => setScreen(2)}
                  disabled={!componentData.name.trim() || !componentData.construction || !componentData.startType}
                  className="flex-2 bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                  style={{ flexGrow: 2 }}
                >
                  Continue
                </button>
              </div>
            </div>

          </div>
        ) : (
          // Screen 2: Method Selection & Configuration (Conditional Layout)
          <div className="p-6 bg-yarn-50 stack-lg">

            {componentData.startType === 'cast_on' ? (
              // Cast On: Show method selection
              <>
                {/* Header */}
                <div>
                  <h2 className="content-header-primary">Select Cast On</h2>
                  <p className="content-subheader">Provide method and starting number of stitches</p>
                </div>

                {/* Method Selection Grid */}
                <div>
                  <label className="form-label">Method</label>
                  <div className="grid grid-cols-3 gap-3">
                    {methodsByStartType[componentData.startType]?.map(method => (
                      <button
                        key={method.id}
                        onClick={() => setComponentData(prev => ({ ...prev, startMethod: method.id }))}
                        className={`selection-button ${componentData.startMethod === method.id ? 'selection-button-selected' : ''
                          }`}
                      >
                        <div className="text-xl mb-1">{method.icon}</div>
                        <div className="text-xs font-medium">{method.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Configuration Fields - Only show when method selected */}
                {componentData.startMethod && (
                  <>
                    {/* Description for "other" method */}
                    {componentData.startMethod === 'other' && (
                      <div>
                        <label className="form-label">Describe Your Cast On Method</label>
                        <input
                          type="text"
                          value={componentData.startDescription}
                          onChange={(e) => setComponentData(prev => ({ ...prev, startDescription: e.target.value }))}
                          placeholder="e.g., Italian cast on, Judy's magic cast on"
                          className="input-field-lg"
                        />
                      </div>
                    )}

                    {/* Stitch Count */}
                    <div>
                      <label className="form-label">Starting Stitch Count</label>
                      <IncrementInput
                        value={componentData.startStitches}
                        onChange={(value) => setComponentData(prev => ({ ...prev, startStitches: value }))}
                        label="starting stitches"
                        unit="stitches"
                        min={1}
                        placeholder="80"
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              // Pick Up, Continue, Other: Direct configuration
              <>
                {/* Header */}
                <div>
                  <h2 className="content-header-primary">
                    {componentData.startType === 'pick_up' ? 'Pick Up & Knit' :
                      componentData.startType === 'continue' ? 'Continue From Stitches' :
                        'Custom Setup'}
                  </h2>
                  <p className="content-subheader">
                    {//componentData.startType === 'pick_up' ? 'Configure your pick up details' :
                      //componentData.startType === 'continue' ? 'Configure where to continue from' :
                      'Describe your custom setup'}
                  </p>
                </div>

                {/* Auto-set method and show configuration */}
                {(() => {
                  // Auto-set the method if not already set
                  if (!componentData.startMethod) {
                    const autoMethod = componentData.startType === 'pick_up' ? 'pick_up_knit' :
                      componentData.startType === 'continue' ? 'from_stitches' :
                        'custom';
                    setComponentData(prev => ({ ...prev, startMethod: autoMethod }));
                  }
                  return null;
                })()}

                {/* Description Field */}
                <div>
                  <label className="form-label">
                    {componentData.startType === 'pick_up' ? 'Pick Up From Where' :
                      componentData.startType === 'continue' ? 'Continue From Where' :
                        'Describe Your Setup'}
                  </label>
                  <input
                    type="text"
                    value={componentData.startDescription}
                    onChange={(e) => setComponentData(prev => ({ ...prev, startDescription: e.target.value }))}
                    placeholder={
                      componentData.startType === 'pick_up' ? 'e.g., neckline, front edge, armhole' :
                        componentData.startType === 'continue' ? 'e.g., from underarm, from previous section' :
                          'Describe your custom setup method'
                    }
                    className="input-field-lg"
                  />
                </div>

                {/* ✅ NEW: Instructions Field - HOW to pick up (only for pick_up) */}
                {componentData.startType === 'pick_up' && (
                  <div>
                    <label className="form-label">Pick Up Instructions</label>
                    <input
                      type="text"
                      value={componentData.startInstructions}
                      onChange={(e) => setComponentData(prev => ({ ...prev, startInstructions: e.target.value }))}
                      placeholder="e.g., pick up 2 of every 3 stitches, pick up 1 stitch per row"
                      className="input-field-lg"
                    />
                    <div className="text-xs text-wool-500 mt-1">
                      💡 <strong>Hint:</strong> Describe the pickup ratio or technique (e.g., "pick up 3 stitches for every 4 rows")
                    </div>
                  </div>
                )}

                {/* Stitch Count */}
                <div>
                  <label className="form-label">Starting Stitch Count</label>
                  <IncrementInput
                    value={componentData.startStitches}
                    onChange={(value) => setComponentData(prev => ({ ...prev, startStitches: value }))}
                    label="starting stitches"
                    unit="stitches"
                    min={1}
                    placeholder="80"
                  />
                </div>
              </>
            )}

            {/* Navigation - Show when ready */}
            {(componentData.startType === 'cast_on' ? componentData.startMethod : true) && (
              <div className="pt-4">
                <div className="flex gap-3">
                  <button
                    onClick={() => setScreen(1)}
                    className="flex-1 btn-tertiary"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={handleCreateComponent}
                    disabled={!canCreateComponent()}
                    className="flex-2 bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                    style={{ flexGrow: 2 }}
                  >
                    <span className="text-lg">🧶</span>
                    Create Component
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prep Note Modal */}
        <PrepStepModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveNote}
          existingNote={currentNote}
          {...prepConfig}
        />

        {/* Unsaved Changes Modal */}
        <UnsavedChangesModal
          isOpen={showExitModal}
          onConfirmExit={handleConfirmExit}
          onCancel={handleCancelExit}
        />


      </div>
    </div>
  );
};

export default SmartComponentCreation;