// src/features/steps/components/wizard-steps/PatternSelector.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { PrepStepModal, usePrepNoteManager, getPrepNoteConfig } from '../../../../shared/components/PrepStepSystem';
import { PATTERN_CATEGORIES } from '../../../../shared/utils/PatternCategories';

export const PatternSelector = ({
  wizardData,
  updateWizardData,
  navigation,
  onCreatePrepStep,
  mode = 'create',
  existingPrepNote = '',
  onSavePrepNote
}) => {
  // State for toggle between Basic and Custom
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize based on existing data if available
    const selectedCategory = wizardData?.stitchPattern?.category;
    if (selectedCategory && PATTERN_CATEGORIES[selectedCategory]) {
      const categoryType = PATTERN_CATEGORIES[selectedCategory].type;
      return categoryType === 'quick' ? 'basic' : 'custom';
    }
    return 'basic'; // Default fallback
  });

  const [selectedQuickCategory, setSelectedQuickCategory] = useState(null);

  // Mode detection
  const isComponentDefault = mode === 'component-default';
  const headerText = isComponentDefault ? 'Set Default Pattern' : 'Select Pattern';
  const showPrepNote = !isComponentDefault;

  // Prep note management
  const {
    isModalOpen,
    currentNote,
    hasNote,
    handleOpenModal,
    handleCloseModal,
    handleSaveNote
  } = usePrepNoteManager(existingPrepNote, onSavePrepNote);

  const prepConfig = getPrepNoteConfig('stepWizard');

  // Helper function for category lookup
  const findCategoryFromPattern = useCallback((patternName) => {
    if (!patternName) return null;
    for (const [categoryKey, category] of Object.entries(PATTERN_CATEGORIES)) {
      const foundPattern = category.patterns.find(pattern => pattern.name === patternName);
      if (foundPattern) {
        return { categoryKey, type: category.type };
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const selectedCategory = wizardData?.stitchPattern?.category;
    const selectedPattern = wizardData?.stitchPattern?.pattern;

    if (selectedCategory && PATTERN_CATEGORIES[selectedCategory]) {
      const categoryType = PATTERN_CATEGORIES[selectedCategory].type;
      setActiveTab(categoryType === 'quick' ? 'basic' : 'custom');

      if (categoryType === 'quick') {
        setSelectedQuickCategory(selectedCategory);
      }
    } else if (selectedPattern) {
      // Reverse lookup if we only have pattern
      const found = findCategoryFromPattern(selectedPattern);
      if (found) {
        setActiveTab(found.type === 'quick' ? 'basic' : 'custom');
        if (found.type === 'quick') {
          setSelectedQuickCategory(found.categoryKey);
        }
        // Update wizardData with found category
        updateWizardData('stitchPattern', {
          ...wizardData.stitchPattern,
          category: found.categoryKey
        });
      }
    } else {
      // Auto-select defaults on first load
      if (!selectedCategory && !selectedPattern) {
        if (activeTab === 'basic') {
          setSelectedQuickCategory('basic');
          updateWizardData('stitchPattern', {
            category: 'basic',
            pattern: null,
            customText: '',
            rowsInPattern: '',
            method: '',
            entryMode: null
          });
        }
      }
    }
  }, [
    wizardData?.stitchPattern?.category,
    wizardData?.stitchPattern?.pattern,
    updateWizardData,
    findCategoryFromPattern,
    activeTab
  ]);

  // Tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedQuickCategory(null);

    // Clear all selections when switching tabs
    updateWizardData('stitchPattern', {
      category: null,
      pattern: null,
      customText: '',
      rowsInPattern: '',
      method: '',
      entryMode: null
    });
  };

  // Quick pattern handlers
  const handleQuickCategorySelect = (categoryKey) => {
    if (selectedQuickCategory === categoryKey) {
      setSelectedQuickCategory(null);
    } else {
      setSelectedQuickCategory(categoryKey);
    }
  };

  const handleQuickPatternSelect = (categoryKey, pattern) => {
    updateWizardData('stitchPattern', {
      category: categoryKey,
      pattern: pattern.name,
      customText: '',
      rowsInPattern: '',
      method: '',
      entryMode: null
    });
  };

  // Custom pattern entry mode selection
  const handleCustomEntryModeSelect = (entryMode) => {
    updateWizardData('stitchPattern', {
      category: 'custom',
      pattern: 'Custom',
      customText: '',
      rowsInPattern: '',
      method: '',
      entryMode: entryMode // 'row_by_row' or 'description'
    });
  };

  // Get current selections
  const selectedCategory = wizardData?.stitchPattern?.category;
  const selectedPattern = wizardData?.stitchPattern?.pattern;

  // Main pattern selector
  return (
    <>
      <div className="space-y-4 relative">
        {/* Header */}
        <div>
          <h2 className="content-header-primary">{headerText}</h2>
        </div>

        {/* Pattern Type Toggle */}
        <div className="mb-4">
          <div className="segmented-control">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleTabChange('basic')}
                className={`segmented-option ${activeTab === 'basic' ? 'segmented-option-active' : ''}`}
              >
                Basic Patterns
              </button>
              <button
                onClick={() => handleTabChange('custom')}
                className={`segmented-option ${activeTab === 'custom' ? 'segmented-option-active' : ''}`}
              >
                Custom
              </button>
            </div>
          </div>
        </div>

        {/* Basic Patterns View */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border-2 border-wool-200 shadow-sm p-4">
              {/* Category Selection */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Object.entries(PATTERN_CATEGORIES)
                  .filter(([_, category]) => category.type === 'quick')
                  .map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => handleQuickCategorySelect(key)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${selectedQuickCategory === key
                        ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                        : 'border-wool-200 bg-sage-50 text-wool-700 hover:border-sage-300 hover:bg-sage-100 hover:shadow-sm'
                        }`}
                    >
                      <div className="text-xl mb-1">{category.icon}</div>
                      <div className="text-xs font-medium">{category.name}</div>
                    </button>
                  ))}
              </div>

              {/* Pattern Selection */}
              {selectedQuickCategory && (
                <div className="border-t border-wool-200 pt-4">
                  <h4 className="text-sm font-semibold text-wool-700 mb-3 text-left">
                    {PATTERN_CATEGORIES[selectedQuickCategory].name} Patterns
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {PATTERN_CATEGORIES[selectedQuickCategory].patterns.map(pattern => (
                      <button
                        key={pattern.name}
                        onClick={() => handleQuickPatternSelect(selectedQuickCategory, pattern)}
                        className={`card-selectable ${selectedPattern === pattern.name
                          ? 'card-selectable-selected'
                          : ''
                          }`}
                      >
                        <div className="text-lg mb-1">{pattern.icon}</div>
                        <div className="text-xs font-medium mb-0.5">{pattern.name}</div>
                        <div className="text-xs opacity-70">{pattern.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="help-block">
              <div className="text-xs text-sage-600 text-center">
                💡 <strong>Basic patterns</strong> work right out of the box with simple setup
              </div>
            </div>
          </div>
        )}

        {/* Custom Pattern View - Two Entry Mode Cards */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {/* Row-by-Row Entry Card */}
              <button
                onClick={() => handleCustomEntryModeSelect('row_by_row')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${wizardData?.stitchPattern?.entryMode === 'row_by_row'
                    ? 'border-sage-500 bg-sage-50 shadow-sm'
                    : 'border-wool-200 bg-white hover:border-sage-300 hover:bg-sage-50'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">📋</div>
                  <div className="flex-1">
                    <div className="font-semibold text-wool-800 mb-1">Row-by-Row Entry</div>
                    <div className="text-sm text-wool-600 mb-2">
                      Enter each row individually with our smart keyboard
                    </div>
                    <div className="text-xs text-wool-500">
                      Best for: Complex patterns with varying rows
                    </div>
                  </div>
                  {wizardData?.stitchPattern?.entryMode === 'row_by_row' && (
                    <div className="text-sage-600 text-xl flex-shrink-0">✓</div>
                  )}
                </div>
              </button>

              {/* Description Entry Card */}
              <button
                onClick={() => handleCustomEntryModeSelect('description')}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${wizardData?.stitchPattern?.entryMode === 'description'
                    ? 'border-sage-500 bg-sage-50 shadow-sm'
                    : 'border-wool-200 bg-white hover:border-sage-300 hover:bg-sage-50'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0">📝</div>
                  <div className="flex-1">
                    <div className="font-semibold text-wool-800 mb-1">Description Entry</div>
                    <div className="text-sm text-wool-600 mb-2">
                      Describe your pattern and specify the repeat length
                    </div>
                    <div className="text-xs text-wool-500">
                      Best for: Simple repeating patterns
                    </div>
                  </div>
                  {wizardData?.stitchPattern?.entryMode === 'description' && (
                    <div className="text-sage-600 text-xl flex-shrink-0">✓</div>
                  )}
                </div>
              </button>
            </div>

            <div className="tip-block">
              <div className="text-xs text-yarn-700 text-center">
                ✨ <strong>Custom patterns</strong> let you define any stitch pattern you can imagine
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prep Note Modal */}
      <PrepStepModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveNote}
        existingNote={currentNote}
        {...prepConfig}
      />
    </>
  );
};

export default PatternSelector;