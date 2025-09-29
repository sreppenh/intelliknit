import React, { useState, useEffect } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import { PrepStepModal, usePrepNoteManager, PrepStepButton, getPrepNoteConfig } from '../../../shared/components/PrepStepSystem';
import IncrementInput from '../../../shared/components/IncrementInput';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import UnsavedChangesModal from '../../../shared/components/modals/UnsavedChangesModal';
import SegmentedControl from '../../../shared/components/SegmentedControl';
import useYarnManager from '../../../shared/hooks/useYarnManager';
import PatternSelector from '../../steps/components/wizard-steps/PatternSelector';
import PatternConfiguration from '../../steps/components/wizard-steps/PatternConfiguration';

const SmartComponentCreation = ({ onBack, onComponentCreated }) => {
  const { dispatch } = useProjectsContext();
  const { currentProject } = useProjectsContext(); // ← ADD this line
  const { yarns } = useYarnManager();

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
    prepNote: '',
    colorMode: null,           // NEW
    singleColorYarnId: null,
    startStepColorYarnId: []
  });


  // ⭐ ADD THESE NEW STATE VARIABLES
  const [useDefaultPattern, setUseDefaultPattern] = useState(false);
  const [defaultPatternData, setDefaultPatternData] = useState({
    stitchPattern: {
      category: null,
      pattern: null,
      customText: '',
      rowsInPattern: '',
      customDetails: '',
      method: ''
    }
  });

  const [useDefaultColor, setUseDefaultColor] = useState(false);
  const [defaultColorData, setDefaultColorData] = useState({
    colorwork: {
      type: null,
      colorLetter: null,
      sequence: [],
      colorLetters: []
    }
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
      colorMode: componentData.colorMode || 'multiple',           // NEW
      singleColorYarnId: componentData.singleColorYarnId || null,  // NEW
      startStepColorYarnIds: componentData.startStepColorYarnIds || [],
      defaultPattern: useDefaultPattern ? defaultPatternData.stitchPattern : null,
      defaultColorwork: useDefaultColor ? defaultColorData.colorwork : null

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

  // Auto-handle single-color projects
  useEffect(() => {
    if (currentProject?.colorCount === 1 && yarns.length > 0 && !componentData.colorMode) {
      setComponentData(prev => ({
        ...prev,
        colorMode: 'single',
        singleColorYarnId: yarns[0].id
      }));
    }
  }, [currentProject, yarns, componentData.colorMode]);

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

            {/* Color Configuration - Only show if project has multiple colors */}
            {currentProject?.colorCount > 1 && (
              <div>
                <label className="form-label">Colors in This Component</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setComponentData(prev => ({
                      ...prev,
                      colorMode: 'single',
                      singleColorYarnId: yarns.length > 0 ? yarns[0].id : null
                    }))}
                    className={`card-selectable-compact ${componentData.colorMode === 'single' ? 'card-selectable-compact-selected' : ''
                      }`}
                  >
                    <div className="text-xl mb-1">🎨</div>
                    <div className="text-xs font-medium">Single Color</div>
                  </button>
                  <button
                    onClick={() => setComponentData(prev => ({
                      ...prev,
                      colorMode: 'multiple',
                      singleColorYarnId: null
                    }))}
                    className={`card-selectable-compact ${componentData.colorMode === 'multiple' ? 'card-selectable-compact-selected' : ''
                      }`}
                  >
                    <div className="text-xl mb-1">🌈</div>
                    <div className="text-xs font-medium">Multiple Colors</div>
                  </button>
                </div>

                {/* Yarn Selection - Only for single color mode */}
                {componentData.colorMode === 'single' && (
                  <div className="mt-3">
                    <label className="form-label text-sm">Select Yarn</label>
                    <div className="space-y-2">
                      {Array.from({ length: currentProject?.colorCount || 4 }, (_, i) => {
                        const letter = String.fromCharCode(65 + i); // A, B, C, D
                        const existingYarn = yarns.find(y => y.letter === letter);

                        const yarn = existingYarn || {
                          id: `color-${letter}`,
                          letter: letter,
                          color: `Color ${letter}`,
                          colorHex: '#cccccc'  // Gray for unassigned colors
                        };

                        return (
                          <button
                            key={yarn.id}
                            onClick={() => setComponentData(prev => ({
                              ...prev,
                              singleColorYarnId: yarn.id
                            }))}
                            className={`w-full p-2 rounded-lg border-2 flex items-center gap-2 transition-all ${componentData.singleColorYarnId === yarn.id
                              ? 'border-sage-500 bg-sage-50'
                              : 'border-wool-200 hover:border-wool-300'
                              }`}
                          >
                            <div
                              className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                              style={{ backgroundColor: yarn.colorHex }}
                            />
                            <div className="text-left text-xs">
                              <div className="font-medium">{yarn.color} (Color {yarn.letter})</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                    className={`card-selectable-compact ${componentData.startType === option.value ? 'card-selectable-compact-selected' : ''}`}
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
                  className="flex-2 btn-primary"
                  style={{ flexGrow: 2 }}
                >
                  Continue
                </button>
              </div>
            </div>

          </div>
        ) : screen === 2 ? (

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
                        className={`selection-button ${componentData.startMethod === method.id ? 'selection-button-selected' : ''}`}
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

                    {/* Color Selection - Multi-select cards */}
                    {currentProject?.colorCount > 1 && componentData.colorMode === 'multiple' && (
                      <div>
                        <label className="form-label">Select Colors</label>
                        <p className="text-xs text-wool-600 mb-2">Click multiple colors for multi-strand</p>
                        <div className="grid grid-cols-3 gap-2">
                          {Array.from({ length: currentProject.colorCount }, (_, i) => {
                            const letter = String.fromCharCode(65 + i);
                            const yarn = yarns.find(y => y.letter === letter);
                            const colorHex = yarn?.colorHex || '#f3f4f6';
                            const colorName = yarn?.color || `Color ${letter}`;
                            const yarnId = yarn?.id || `color-${letter}`;
                            const isSelected = componentData.startStepColorYarnIds?.includes(yarnId);

                            return (
                              <button
                                key={letter}
                                type="button"
                                onClick={() => {
                                  setComponentData(prev => {
                                    const currentIds = prev.startStepColorYarnIds || [];
                                    let newIds;

                                    if (isSelected) {
                                      newIds = currentIds.filter(id => id !== yarnId);
                                      if (newIds.length === 0) newIds = [yarnId];
                                    } else {
                                      newIds = [...currentIds, yarnId];
                                    }

                                    let setupNote = '';
                                    if (newIds.length === 1) {
                                      const selectedLetter = newIds[0].toString().startsWith('color-')
                                        ? newIds[0].replace('color-', '')
                                        : yarns.find(y => y.id === newIds[0])?.letter || letter;
                                      const selectedYarn = yarns.find(y => y.id === newIds[0]);
                                      const displayName = selectedYarn?.color || `Color ${selectedLetter}`;
                                      setupNote = `Use Color ${selectedLetter} (${displayName})`;
                                    } else {
                                      const letters = newIds.map(id => {
                                        if (id.toString().startsWith('color-')) {
                                          return id.replace('color-', '');
                                        }
                                        return yarns.find(y => y.id === id)?.letter || '';
                                      }).filter(Boolean).sort().join(' and ');
                                      setupNote = `Using Colors ${letters} together`;
                                    }

                                    return {
                                      ...prev,
                                      startStepColorYarnIds: newIds,
                                    };
                                  });
                                }}
                                className={`p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-sage-500 bg-sage-50' : 'border-wool-200 hover:border-wool-300'
                                  }`}
                              >
                                <div
                                  className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mb-1"
                                  style={{ backgroundColor: colorHex }}
                                />
                                <div className="text-xs font-medium text-center">{letter}</div>
                                <div className="text-xs text-center truncate">{colorName}</div>
                                {isSelected && (
                                  <div className="text-sage-600 text-center mt-1">✓</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Setup Notes - Auto-populated from color selection */}
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

                    {/* Stitch Count */}
                    <div>
                      <label className="form-label">Starting Stitch Count</label>
                      <IncrementInput
                        value={componentData.startStitches}
                        onChange={(value) => setComponentData(prev => ({ ...prev, startStitches: value }))}
                        label="starting stitches"
                        unit="stitches"
                        size="sm"
                        min={1}
                        placeholder="80"
                      />
                    </div>
                  </>
                )}
              </>
            ) : (
              // Pick Up, Continue, Other: Direct configuration - UNCHANGED
              <>
                {/* Header */}
                <div>
                  <h2 className="content-header-primary">
                    {componentData.startType === 'pick_up' ? 'Pick Up & Knit' :
                      componentData.startType === 'continue' ? 'Continue From Stitches' :
                        'Custom Setup'}
                  </h2>
                  <p className="content-subheader">
                    {'Describe your custom setup'}
                  </p>
                </div>

                {/* Auto-set method */}
                {(() => {
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

                {/* Instructions Field - HOW to pick up (only for pick_up) */}
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
                      💡 <strong>Hint:</strong> Describe the pickup ratio or technique
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
                    size="sm"
                    min={1}
                    placeholder="80"
                  />
                </div>
              </>
            )}

            {/* Navigation */}
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
                    onClick={() => setScreen(3)}  // ⭐ CHANGE: was handleCreateComponent()
                    disabled={!canCreateComponent()}
                    className="flex-2 btn-primary"
                    style={{ flexGrow: 2 }}
                  >
                    <span className="text-lg">🧶</span>
                    Continue →  {/* ⭐ CHANGE: was "Create Component" */}
                  </button>
                </div>
              </div>
            )}
          </div>

        ) : screen === 3 ? (
          // Screen 3: Pattern Defaults
          <div className="p-6 bg-yarn-50 space-y-6">
            <h1 className="page-title">Pattern Defaults</h1>
            <p className="text-wool-600 text-center">
              Set a default pattern to use throughout this component
            </p>

            {/* Option 1: No Default */}
            <button
              onClick={() => {
                setUseDefaultPattern(false);
                // Skip to screen 4 if multi-color, otherwise create component
                if (currentProject?.colorCount > 1) {
                  setScreen(4);
                } else {
                  handleCreateComponent();
                }
              }}
              className={`w-full card-selectable ${!useDefaultPattern ? 'card-selectable-selected' : ''}`}
            >
              <div className="flex items-start gap-3 p-2">
                <div className="text-2xl">⚪</div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-wool-700">No Default</div>
                  <div className="text-sm text-wool-600">Configure pattern for each step</div>
                </div>
              </div>
            </button>

            {/* Option 2: Set Default */}
            <button
              onClick={() => setUseDefaultPattern(true)}
              className={`w-full card-selectable ${useDefaultPattern ? 'card-selectable-selected' : ''}`}
            >
              <div className="flex items-start gap-3 p-2">
                <div className="text-2xl">●</div>
                <div className="text-left flex-1">
                  <div className="font-semibold text-wool-700">Set Default Pattern</div>
                  <div className="text-sm text-wool-600">Most steps will use the same pattern</div>
                </div>
              </div>
            </button>

            {/* Show Pattern Selector if option 2 selected */}
            {useDefaultPattern && (
              <div className="bg-white rounded-2xl border-2 border-sage-200 p-4 space-y-4">
                <PatternSelector
                  wizardData={defaultPatternData}
                  updateWizardData={(key, value) => {
                    setDefaultPatternData(prev => ({
                      ...prev,
                      [key]: value
                    }));
                  }}
                  construction={componentData.construction}
                  mode="component-default"
                />

                {/* Show pattern config if pattern selected */}
                {defaultPatternData.stitchPattern.pattern && (
                  <PatternConfiguration
                    wizardData={defaultPatternData}
                    updateWizardData={(key, value) => {
                      setDefaultPatternData(prev => ({
                        ...prev,
                        [key]: value
                      }));
                    }}
                    construction={componentData.construction}
                    currentStitches={componentData.startStitches}
                    project={currentProject}
                    mode="component-default"
                  />
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setScreen(2)}
                className="flex-1 btn-tertiary"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  // Go to color defaults if multi-color, otherwise create component
                  if (currentProject?.colorCount > 1) {
                    setScreen(4);
                  } else {
                    handleCreateComponent();
                  }
                }}
                className="flex-2 btn-primary"
                style={{ flexGrow: 2 }}
              >
                {currentProject?.colorCount > 1 ? 'Continue →' : 'Create Component'}
              </button>
            </div>
          </div>

        ) : screen === 4 ? (
          // Screen 4: Color Defaults (only for multi-color projects)
          <div className="p-6 bg-yarn-50 space-y-6">
            <h1 className="page-title">Color Defaults</h1>
            <p className="text-wool-600 text-center">
              Set default colors for this component
            </p>

            {/* Coming in next step - for now just skip button */}
            <div className="text-center py-8">
              <p className="text-wool-500 mb-4">Color defaults configuration coming soon</p>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setScreen(3)}
                className="flex-1 btn-tertiary"
              >
                ← Back
              </button>
              <button
                onClick={handleCreateComponent}
                className="flex-2 btn-primary"
                style={{ flexGrow: 2 }}
              >
                Create Component
              </button>
            </div>
          </div>

        ) : null}


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