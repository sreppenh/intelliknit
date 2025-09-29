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
import StripesConfig from '../../steps/components/pattern-configs/StripesConfig';
import PatternWizard from './PatternWizard';

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
                    if (currentProject?.colorCount > 1 && useDefaultColor) {
                      setScreen(2);
                    } else if (useDefaultPattern) {
                      setScreen(4);
                    } else {
                      setScreen(5);
                    }
                  }}
                  disabled={!componentData.name.trim() || !componentData.construction}
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
          // Screen 3: Color Detail Configuration
          <div className="p-6 bg-yarn-50 space-y-6">
            {defaultColorData.colorwork.advancedType === 'stripes' ? (
              // Stripes Configuration
              <>
                <h1 className="page-title">Stripe Pattern</h1>
                <p className="text-wool-600 text-center">
                  Define your stripe sequence
                </p>

                <StripesConfig
                  wizardData={defaultPatternData}
                  updateWizardData={(key, value) => {
                    setDefaultPatternData(prev => ({
                      ...prev,
                      [key]: value
                    }));
                  }}
                  construction={componentData.construction}
                  project={currentProject}
                  mode="component-default"
                />
              </>
            ) : defaultColorData.colorwork.advancedType === 'fair_isle' ? (
              // Fair Isle Placeholder
              <>
                <h1 className="page-title">Fair Isle Pattern</h1>
                <p className="text-wool-600 text-center mb-6">
                  Configure your Fair Isle colorwork
                </p>

                <div className="bg-lavender-50 border-2 border-lavender-200 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🎨</div>
                  <p className="text-lavender-700 font-medium mb-2">Fair Isle Configuration</p>
                  <p className="text-sm text-lavender-600">
                    Select the colors used in your Fair Isle pattern and add any notes about the design.
                  </p>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="form-label">Colors Used</label>
                  <div className="grid grid-cols-2 gap-2">
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
                              const updated = isSelected
                                ? current.filter(l => l !== letter)
                                : [...current, letter].sort();
                              return {
                                ...prev,
                                colorwork: { ...prev.colorwork, colorLetters: updated }
                              };
                            });
                          }}
                          className={`card-selectable-compact ${isSelected ? 'card-selectable-compact-selected' : ''
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
                </div>

                {/* Pattern Description */}
                <div>
                  <label className="form-label">Pattern Description</label>
                  <textarea
                    value={defaultColorData.colorwork.description || ''}
                    onChange={(e) => setDefaultColorData(prev => ({
                      ...prev,
                      colorwork: { ...prev.colorwork, description: e.target.value }
                    }))}
                    placeholder="Describe your Fair Isle pattern (e.g., traditional snowflake motif, chart reference)"
                    rows={3}
                    className="input-field-lg resize-none"
                  />
                </div>
              </>
            ) : defaultColorData.colorwork.advancedType === 'intarsia' ? (
              // Intarsia Placeholder
              <>
                <h1 className="page-title">Intarsia Pattern</h1>
                <p className="text-wool-600 text-center mb-6">
                  Configure your Intarsia colorwork
                </p>

                <div className="bg-lavender-50 border-2 border-lavender-200 rounded-xl p-6 text-center">
                  <div className="text-4xl mb-3">🖼️</div>
                  <p className="text-lavender-700 font-medium mb-2">Intarsia Configuration</p>
                  <p className="text-sm text-lavender-600">
                    Select the colors used in your Intarsia blocks and describe the color placement.
                  </p>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="form-label">Colors Used</label>
                  <div className="grid grid-cols-2 gap-2">
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
                              const updated = isSelected
                                ? current.filter(l => l !== letter)
                                : [...current, letter].sort();
                              return {
                                ...prev,
                                colorwork: { ...prev.colorwork, colorLetters: updated }
                              };
                            });
                          }}
                          className={`card-selectable-compact ${isSelected ? 'card-selectable-compact-selected' : ''
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
                </div>

                {/* Pattern Description */}
                <div>
                  <label className="form-label">Pattern Description</label>
                  <textarea
                    value={defaultColorData.colorwork.description || ''}
                    onChange={(e) => setDefaultColorData(prev => ({
                      ...prev,
                      colorwork: { ...prev.colorwork, description: e.target.value }
                    }))}
                    placeholder="Describe your Intarsia pattern (e.g., color block placement, chart reference)"
                    rows={3}
                    className="input-field-lg resize-none"
                  />
                </div>
              </>
            ) : null}

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
                  if (useDefaultPattern) {
                    setScreen(4); // Go to pattern config
                  } else {
                    setScreen(5); // Skip to starting method
                  }
                }}
                className="flex-2 btn-primary"
                style={{ flexGrow: 2 }}
              >
                Continue →
              </button>
            </div>
          </div>

        ) : screen === 4 ? (
          // Screen 4: Pattern Wizard (no launcher, direct render)
          <PatternWizard
            componentData={componentData}
            defaultPatternData={defaultPatternData}
            setDefaultPatternData={setDefaultPatternData}
            currentProject={currentProject}
            onComplete={() => {
              setScreen(5); // Go to Starting Method after saving pattern
            }}
            onBack={() => {
              // Go back to appropriate screen
              if (defaultColorData.colorwork.advancedType) {
                setScreen(3);
              } else if (useDefaultColor && currentProject?.colorCount > 1) {
                setScreen(2);
              } else {
                setScreen(1);
              }
            }}
          />

        ) : screen === 5 ? (
          // Screen 5: Method Selection & Configuration (Conditional Layout)
          <div className="p-6 bg-yarn-50 stack-lg">

            {/* How Does It Start - Always visible first */}
            <div>
              <h2 className="content-header-primary">How Does It Start</h2>
              <p className="content-subheader">Choose how this component begins</p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { value: 'cast_on', label: 'Cast On', icon: '🏗️', desc: 'Start from scratch' },
                  { value: 'pick_up', label: 'Pick Up & Knit', icon: '🧶', desc: 'From existing edge' },
                  { value: 'continue', label: 'Continue from Stitches', icon: '📎', desc: 'Resume saved stitches' },
                  { value: 'other', label: 'Other', icon: '📝', desc: 'Complex setup' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setComponentData(prev => ({ ...prev, startType: option.value }))}
                    className={`card-selectable ${componentData.startType === option.value ? 'card-selectable-selected' : ''}`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-sm font-semibold">{option.label}</div>
                    <div className="text-xs text-wool-600 mt-1">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Configuration - Only show after startType is selected */}
            {componentData.startType && (
              <>
                {componentData.startType === 'cast_on' ? (

                  // Cast On: Show method selection
                  <>

                    {/* Method Selection Grid */}
                    <div>
                      <label className="form-label">Select Method</label>
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
                  // Pick Up, Continue, Other: Direct configuration
                  <>

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
                        onClick={() => {
                          if (useDefaultPattern) {
                            setScreen(4); // Go back to Pattern wizard
                          } else if (defaultColorData.colorwork.advancedType) {
                            setScreen(3); // Go back to Color detail
                          } else if (useDefaultColor && currentProject?.colorCount > 1) {
                            setScreen(2); // Go back to Color config
                          } else {
                            setScreen(1); // Go back to Identity
                          }
                        }}
                        className="flex-1 btn-tertiary"
                      >
                        ← Back
                      </button>

                      <button
                        onClick={handleCreateComponent}
                        disabled={!canCreateComponent()}
                        className="flex-2 btn-primary"
                        style={{ flexGrow: 2 }}
                      >
                        <span className="text-lg">🧶</span>
                        Create Component
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
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