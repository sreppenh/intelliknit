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

            {/* Default Texture Pattern */}
            <div>
              <label className="form-label">Default Texture Pattern</label>
              <p className="text-xs text-wool-600 mb-2 text-left">
                Set a pattern (like Stockinette or Lace) to use throughout this component
              </p>
              <div className="segmented-control">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setUseDefaultPattern(false)}
                    className={`segmented-option ${!useDefaultPattern ? 'segmented-option-active' : ''}`}
                  >
                    Don't Set
                  </button>
                  <button
                    onClick={() => setUseDefaultPattern(true)}
                    className={`segmented-option ${useDefaultPattern ? 'segmented-option-active' : ''}`}
                  >
                    Set Default
                  </button>
                </div>
              </div>
            </div>

            {/* Default Color Pattern - Only if multi-color project */}
            {currentProject?.colorCount > 1 && (
              <div>
                <label className="form-label">Default Color Pattern</label>
                <p className="text-xs text-wool-600 mb-2 text-left">
                  Set colors or colorwork (like Stripes or Fair Isle) to use throughout this component
                </p>
                <div className="segmented-control">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setUseDefaultColor(false)}
                      className={`segmented-option ${!useDefaultColor ? 'segmented-option-active' : ''}`}
                    >
                      Don't Set
                    </button>
                    <button
                      onClick={() => setUseDefaultColor(true)}
                      className={`segmented-option ${useDefaultColor ? 'segmented-option-active' : ''}`}
                    >
                      Set Default
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================
        COMMENTED OUT - WILL MOVE TO COLOR CONFIG SCREEN
        ============================================ */}
            {/* 
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
            className={`card-selectable-compact ${componentData.colorMode === 'single' ? 'card-selectable-compact-selected' : ''}`}
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
            className={`card-selectable-compact ${componentData.colorMode === 'multiple' ? 'card-selectable-compact-selected' : ''}`}
          >
            <div className="text-xl mb-1">🌈</div>
            <div className="text-xs font-medium">Multiple Colors</div>
          </button>
        </div>

        {componentData.colorMode === 'single' && (
          <div className="mt-3">
            <label className="form-label text-sm">Select Yarn</label>
            <div className="space-y-2">
              {Array.from({ length: currentProject?.colorCount || 4 }, (_, i) => {
                const letter = String.fromCharCode(65 + i);
                const existingYarn = yarns.find(y => y.letter === letter);
                const yarn = existingYarn || {
                  id: `color-${letter}`,
                  letter: letter,
                  color: `Color ${letter}`,
                  colorHex: '#cccccc'
                };
                return (
                  <button
                    key={yarn.id}
                    onClick={() => setComponentData(prev => ({
                      ...prev,
                      singleColorYarnId: yarn.id
                    }))}
                    className={`w-full p-2 rounded-lg border-2 flex items-center gap-2 transition-all ${
                      componentData.singleColorYarnId === yarn.id
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
    */}

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
                  onClick={() => {
                    // Determine next screen based on opt-in selections
                    if (currentProject?.colorCount > 1 && useDefaultColor) {
                      setScreen(2); // Go to Color Config
                    } else if (useDefaultPattern) {
                      setScreen(4); // Skip to Pattern Config
                    } else {
                      setScreen(5); // Skip to Starting Method
                    }
                  }}
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
          <div className="p-6 bg-yarn-50 space-y-4">
            <h1 className="page-title">Color Defaults</h1>
            <p className="text-wool-600 text-center mb-6">
              Choose how colors are used throughout this component
            </p>

            <div className="space-y-4">
              {/* Single Color Option */}
              <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${defaultColorData.colorwork.type === 'single'
                ? 'border-sage-500 bg-white text-sage-700 shadow-sm'
                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300'
                }`}>
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="color_type"
                    value="single"
                    checked={defaultColorData.colorwork.type === 'single'}
                    onChange={() => setDefaultColorData(prev => ({
                      ...prev,
                      colorwork: { type: 'single', colorLetter: null }
                    }))}
                    className="w-4 h-4 text-sage-600 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🎨</div>
                      <div className="text-left">
                        <div className="font-semibold text-base">Single Color</div>
                        <div className="text-sm opacity-75">Use one color throughout this component</div>
                      </div>
                    </div>

                    {/* Single Color Selection - INSIDE the label */}
                    {defaultColorData.colorwork.type === 'single' && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {Array.from({ length: currentProject?.colorCount || 4 }, (_, i) => {
                          const letter = String.fromCharCode(65 + i);
                          const existingYarn = yarns.find(y => y.letter === letter);
                          const yarn = existingYarn || {
                            id: `color-${letter}`,
                            letter: letter,
                            color: `Color ${letter}`,
                            colorHex: '#cccccc'
                          };

                          return (
                            <button
                              key={yarn.id}
                              type="button"
                              onClick={() => setDefaultColorData(prev => ({
                                ...prev,
                                colorwork: { ...prev.colorwork, colorLetter: letter }
                              }))}
                              className={`card-selectable-compact ${defaultColorData.colorwork.colorLetter === letter
                                ? 'card-selectable-compact-selected'
                                : ''
                                }`}
                            >
                              <div
                                className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mb-1"
                                style={{ backgroundColor: yarn.colorHex }}
                              />
                              <div className="text-xs font-medium">{letter}</div>
                              <div className="text-xs truncate">{yarn.color}</div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </label>

              {/* Multi-Strand Option */}
              <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${defaultColorData.colorwork.type === 'multi_strand'
                ? 'border-sage-500 bg-white text-sage-700 shadow-sm'
                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300'
                }`}>
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="color_type"
                    value="multi_strand"
                    checked={defaultColorData.colorwork.type === 'multi_strand'}
                    onChange={() => setDefaultColorData(prev => ({
                      ...prev,
                      colorwork: { type: 'multi_strand', colorLetters: [] }
                    }))}
                    className="w-4 h-4 text-sage-600 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🧵</div>
                      <div className="text-left">
                        <div className="font-semibold text-base">Multiple Strands</div>
                        <div className="text-sm opacity-75">Hold 2+ colors together (marled/tweed effect)</div>
                      </div>
                    </div>

                    {/* Multi-Strand Selection - INSIDE the label */}
                    {defaultColorData.colorwork.type === 'multi_strand' && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {Array.from({ length: currentProject?.colorCount || 4 }, (_, i) => {
                          const letter = String.fromCharCode(65 + i);
                          const existingYarn = yarns.find(y => y.letter === letter);
                          const yarn = existingYarn || {
                            id: `color-${letter}`,
                            letter: letter,
                            color: `Color ${letter}`,
                            colorHex: '#cccccc'
                          };
                          const isSelected = defaultColorData.colorwork.colorLetters?.includes(letter);

                          return (
                            <button
                              key={letter}
                              type="button"
                              onClick={() => {
                                setDefaultColorData(prev => {
                                  const current = prev.colorwork.colorLetters || [];
                                  let updated;
                                  if (isSelected) {
                                    updated = current.filter(l => l !== letter);
                                    if (updated.length < 2 && current.length === 2) return prev;
                                  } else {
                                    updated = [...current, letter].sort();
                                  }
                                  return {
                                    ...prev,
                                    colorwork: { ...prev.colorwork, colorLetters: updated }
                                  };
                                });
                              }}
                              className={`card-selectable-compact ${isSelected
                                ? 'card-selectable-compact-selected'
                                : ''
                                }`}
                            >
                              <div
                                className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mb-1"
                                style={{ backgroundColor: yarn.colorHex }}
                              />
                              <div className="text-xs font-medium">{letter}</div>
                              <div className="text-xs truncate">{yarn.color}</div>
                              {isSelected && <div className="text-sage-600 mt-1">✓</div>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </label>

              {/* Advanced Colorwork Option */}
              <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${defaultColorData.colorwork.type === 'advanced'
                  ? 'border-sage-500 bg-white text-sage-700 shadow-sm'
                  : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300'
                }`}>
                <div className="flex items-start gap-4">
                  <input
                    type="radio"
                    name="color_type"
                    value="advanced"
                    checked={defaultColorData.colorwork.type === 'advanced'}
                    onChange={() => setDefaultColorData(prev => ({
                      ...prev,
                      colorwork: { type: 'advanced', advancedType: null }
                    }))}
                    className="w-4 h-4 text-sage-600 mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🌈</div>
                      <div className="text-left">
                        <div className="font-semibold text-base">Advanced Colorwork</div>
                        <div className="text-sm opacity-75">Stripes, Fair Isle, or Intarsia patterns</div>
                      </div>
                    </div>

                    {/* Advanced Type Selection - INSIDE the label */}
                    {defaultColorData.colorwork.type === 'advanced' && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDefaultColorData(prev => ({
                            ...prev,
                            colorwork: { ...prev.colorwork, advancedType: 'stripes' }
                          }))}
                          className={`card-selectable-compact ${defaultColorData.colorwork.advancedType === 'stripes'
                              ? 'card-selectable-compact-selected'
                              : ''
                            }`}
                        >
                          <div className="text-xl mb-1">📊</div>
                          <div className="text-xs font-medium">Stripes</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDefaultColorData(prev => ({
                            ...prev,
                            colorwork: { ...prev.colorwork, advancedType: 'fair_isle' }
                          }))}
                          className={`card-selectable-compact ${defaultColorData.colorwork.advancedType === 'fair_isle'
                              ? 'card-selectable-compact-selected'
                              : ''
                            }`}
                        >
                          <div className="text-xl mb-1">🎨</div>
                          <div className="text-xs font-medium">Fair Isle</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDefaultColorData(prev => ({
                            ...prev,
                            colorwork: { ...prev.colorwork, advancedType: 'intarsia' }
                          }))}
                          className={`card-selectable-compact ${defaultColorData.colorwork.advancedType === 'intarsia'
                              ? 'card-selectable-compact-selected'
                              : ''
                            }`}
                        >
                          <div className="text-xl mb-1">🖼️</div>
                          <div className="text-xs font-medium">Intarsia</div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setScreen(1)}
                className="flex-1 btn-tertiary"
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (defaultColorData.colorwork.advancedType) {
                    setScreen(3);
                  } else if (useDefaultPattern) {
                    setScreen(4);
                  } else {
                    setScreen(5);
                  }
                }}
                disabled={
                  !defaultColorData.colorwork.type ||
                  (defaultColorData.colorwork.type === 'single' && !defaultColorData.colorwork.colorLetter) ||
                  (defaultColorData.colorwork.type === 'multi_strand' && (!defaultColorData.colorwork.colorLetters || defaultColorData.colorwork.colorLetters.length < 2)) ||
                  (defaultColorData.colorwork.type === 'advanced' && !defaultColorData.colorwork.advancedType)
                }
                className="flex-2 btn-primary"
                style={{ flexGrow: 2 }}
              >
                Continue →
              </button>
            </div>
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