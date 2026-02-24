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
  // No more tab state — single scrollable view
  const [selectedQuickCategory, setSelectedQuickCategory] = useState(null);

  // Mode detection
  const isComponentDefault = mode === 'component-default';
  const headerText = isComponentDefault ? 'Set Default Pattern' : 'Select Pattern';

  // Prep note management
  const {
    isModalOpen,
    currentNote,
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
      if (categoryType === 'quick') {
        setSelectedQuickCategory(selectedCategory);
      }
    } else if (selectedPattern) {
      // Reverse lookup if we only have pattern
      const found = findCategoryFromPattern(selectedPattern);
      if (found) {
        if (found.type === 'quick') {
          setSelectedQuickCategory(found.categoryKey);
        }
        updateWizardData('stitchPattern', {
          ...wizardData.stitchPattern,
          category: found.categoryKey
        });
      }
    } else {
      // Auto-expand Standard category on first load
      if (!selectedCategory && !selectedPattern) {
        setSelectedQuickCategory('basic');
        updateWizardData('stitchPattern', {
          category: 'basic',
          pattern: isComponentDefault ? 'None' : null,
          customText: '',
          rowsInPattern: '',
          method: '',
          entryMode: null
        });
      }
    }
  }, [
    wizardData?.stitchPattern?.category,
    wizardData?.stitchPattern?.pattern,
    updateWizardData,
    findCategoryFromPattern,
  ]);

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
      entryMode: entryMode
    });
  };

  // Get current selections
  const selectedPattern = wizardData?.stitchPattern?.pattern;
  const selectedEntryMode = wizardData?.stitchPattern?.entryMode;

  const isPatternBuilderSelected = selectedEntryMode === 'row_by_row';
  const isDescriptionSelected = selectedEntryMode === 'description';

  // Derive quick categories in order: basic first, then rib, then textured
  const quickCategories = Object.entries(PATTERN_CATEGORIES).filter(
    ([_, category]) => category.type === 'quick'
  );

  // Standard is the first quick category — always auto-expanded
  const [standardKey, standardCategory] = quickCategories[0] ?? [];
  // Ribbing & Textured are the rest — shown with drill-down
  const browseCategories = quickCategories.slice(1);

  return (
    <>
      <div className="space-y-5 relative">

        {/* Header */}
        <div>
          <h2 className="content-header-primary">{headerText}</h2>
        </div>

        {/* ── SECTION 1: Pattern Builder (promoted, top) ── */}
        <div>
          <button
            onClick={() => handleCustomEntryModeSelect('row_by_row')}
            className={`w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${isPatternBuilderSelected
                ? 'border-sage-500 bg-sage-50 shadow-sm'
                : 'border-yarn-300 bg-yarn-50 hover:border-yarn-400 hover:bg-yarn-100 hover:shadow-sm'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-3xl flex-shrink-0">🔨</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="font-semibold text-wool-800">Pattern Builder</div>
                  <span className="badge bg-yarn-200 text-yarn-800 text-xs px-2 py-0.5 rounded-full font-medium">
                    Most Powerful
                  </span>
                </div>
                <div className="text-sm text-wool-600">
                  Build any stitch pattern row by row — cables, lace, anything
                </div>
              </div>
              {isPatternBuilderSelected && (
                <div className="text-sage-600 text-xl flex-shrink-0">✓</div>
              )}
            </div>
          </button>
        </div>

        {/* ── SECTION 2: Standard Patterns (auto-expanded) ── */}
        <div className="bg-white rounded-2xl border-2 border-wool-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-wool-700 mb-3">
            {standardCategory?.name ?? 'Standard'} Patterns
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {standardCategory?.patterns
              .filter(pattern => isComponentDefault || pattern.name !== 'None')
              .map(pattern => (
                <button
                  key={pattern.name}
                  onClick={() => handleQuickPatternSelect(standardKey, pattern)}
                  className={`card-selectable ${selectedPattern === pattern.name ? 'card-selectable-selected' : ''
                    }`}
                >
                  <div className="text-lg mb-1">{pattern.icon}</div>
                  <div className="text-xs font-medium mb-0.5">{pattern.name}</div>
                  <div className="text-xs opacity-70">{pattern.desc}</div>
                </button>
              ))}
          </div>
        </div>

        {/* ── SECTION 3: Ribbing & Textured (category drill-down, starts collapsed) ── */}
        <div className="bg-white rounded-2xl border-2 border-wool-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-wool-700 mb-3">More Patterns</h3>

          {/* Category pills */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {browseCategories.map(([key, category]) => (
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

          {/* Pattern grid — only shown when a browse category is selected and it's not Standard */}
          {selectedQuickCategory && selectedQuickCategory !== standardKey && (
            <div className="border-t border-wool-200 pt-4">
              <h4 className="text-sm font-semibold text-wool-700 mb-3">
                {PATTERN_CATEGORIES[selectedQuickCategory].name} Patterns
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {PATTERN_CATEGORIES[selectedQuickCategory].patterns.map(pattern => (
                  <button
                    key={pattern.name}
                    onClick={() => handleQuickPatternSelect(selectedQuickCategory, pattern)}
                    className={`card-selectable ${selectedPattern === pattern.name ? 'card-selectable-selected' : ''
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

        {/* ── SECTION 4: Description Entry (demoted, secondary) ── */}
        <div>
          <button
            onClick={() => handleCustomEntryModeSelect('description')}
            className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${isDescriptionSelected
                ? 'border-sage-400 bg-sage-50 shadow-sm'
                : 'border-wool-200 bg-white hover:border-wool-300 hover:bg-wool-50'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-xl flex-shrink-0">📝</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-wool-700">Description Entry</div>
                <div className="text-xs text-wool-500">
                  Describe your pattern with a repeat length
                </div>
              </div>
              {isDescriptionSelected && (
                <div className="text-sage-600 text-sm flex-shrink-0">✓</div>
              )}
            </div>
          </button>
        </div>

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