// src/features/steps/components/wizard-steps/PatternSelector.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { PrepStepModal, usePrepNoteManager, PrepStepButton, getPrepNoteConfig } from '../../../../shared/components/PrepStepSystem';
import { PATTERN_CATEGORIES } from '../../../../shared/utils/PatternCategories';

export const PatternSelector = ({
  wizardData,
  updateWizardData,
  navigation,
  onCreatePrepStep,
  existingPrepNote = '',
  onSavePrepNote
}) => {
  // State for toggle between Quick and Advanced
  const [activeTab, setActiveTab] = useState(() => {
    // Initialize based on existing data if available
    const selectedCategory = wizardData?.stitchPattern?.category;
    if (selectedCategory && PATTERN_CATEGORIES[selectedCategory]) {
      const categoryType = PATTERN_CATEGORIES[selectedCategory].type;
      return categoryType === 'quick' ? 'quick' : 'advanced';
    }
    return 'quick'; // Default fallback
  });

  const [selectedQuickCategory, setSelectedQuickCategory] = useState(null);

  // ✅ FIX: Track which advanced category is expanded
  const [expandedAdvancedCategory, setExpandedAdvancedCategory] = useState(null);

  // Prep note management
  const {
    isModalOpen,
    currentNote,
    hasNote,
    notePreview,
    handleOpenModal,
    handleCloseModal,
    handleSaveNote
  } = usePrepNoteManager(existingPrepNote, onSavePrepNote);

  const prepConfig = getPrepNoteConfig('stepWizard');

  // ✅ FIX: Wrap helper function in useCallback to stabilize it
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
      setActiveTab(categoryType === 'quick' ? 'quick' : 'advanced');

      if (categoryType === 'quick') {
        setSelectedQuickCategory(selectedCategory);
      } else if (categoryType === 'advanced') {
        setExpandedAdvancedCategory(selectedCategory);
      }
    } else if (selectedPattern) {
      // Reverse lookup if we only have pattern
      const found = findCategoryFromPattern(selectedPattern);
      if (found) {
        setActiveTab(found.type === 'quick' ? 'quick' : 'advanced');
        if (found.type === 'quick') {
          setSelectedQuickCategory(found.categoryKey);
        } else {
          setExpandedAdvancedCategory(found.categoryKey);
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
        if (activeTab === 'quick') {
          setSelectedQuickCategory('basic');
          updateWizardData('stitchPattern', {
            category: 'basic',
            pattern: null,
            customText: '',
            rowsInPattern: '',
            method: ''
          });
        }
        // Don't auto-expand advanced categories
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
    setExpandedAdvancedCategory(null);

    // Clear all selections when switching tabs
    updateWizardData('stitchPattern', {
      category: null,
      pattern: null,
      customText: '',
      rowsInPattern: '',
      method: ''
    });
  };

  // Quick pattern handlers (unchanged)
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
      method: ''
    });
  };

  // ✅ FIX: Advanced pattern handlers with proper clearing
  const handleAdvancedCategorySelect = (categoryKey) => {
    const category = PATTERN_CATEGORIES[categoryKey];

    // ✅ FIX: Always clear existing selection first
    updateWizardData('stitchPattern', {
      category: null,
      pattern: null,
      customText: '',
      rowsInPattern: '',
      method: ''
    });

    if (category.patterns.length === 1) {
      // Single pattern - immediately select pattern and activate Continue
      updateWizardData('stitchPattern', {
        category: categoryKey,
        pattern: category.patterns[0].name,
        customText: '',
        rowsInPattern: '',
        method: ''
      });
      setExpandedAdvancedCategory(categoryKey);
    } else {
      // Multi-pattern - expand/collapse the category
      if (expandedAdvancedCategory === categoryKey) {
        setExpandedAdvancedCategory(null); // Collapse if already expanded
      } else {
        setExpandedAdvancedCategory(categoryKey); // Expand
        // Don't set wizardData yet - wait for pattern selection
      }
    }
  };

  const handleAdvancedPatternSelect = (categoryKey, pattern) => {
    updateWizardData('stitchPattern', {
      category: categoryKey,
      pattern: pattern.name,
      customText: '',
      rowsInPattern: '',
      method: ''
    });
    // Keep this category expanded since user just selected a pattern from it
    setExpandedAdvancedCategory(categoryKey);
  };

  // Get current selections
  const selectedCategory = wizardData?.stitchPattern?.category;
  const selectedPattern = wizardData?.stitchPattern?.pattern;

  // ✅ FIX: Define fixed order for advanced categories with colorwork first
  const getAdvancedCategories = () => {
    const fixedOrder = ['colorwork', 'lace', 'cable', 'custom'];
    return fixedOrder
      .filter(key => PATTERN_CATEGORIES[key]?.type === 'advanced')
      .map(key => [key, PATTERN_CATEGORIES[key]]);
  };

  // Main pattern selector
  return (
    <>
      <div className="space-y-4 relative">
        {/* Header with Prep Note */}
        <div className="text-center">
          <div className="content-header-with-buttons">
            <h2 className="content-title">Create Step</h2>
            <div className="button-group">
              <button
                onClick={handleOpenModal}
                className="btn-secondary btn-sm"
              >
                {hasNote ? 'Edit Preparation Note' : '+ Add Preparation Note'}
              </button>
            </div>
          </div>
        </div>

        {/* Pattern Type Toggle */}
        <div className="mb-4">
          <div className="segmented-control">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleTabChange('quick')}
                className={`segmented-option ${activeTab === 'quick' ? 'segmented-option-active' : ''}`}
              >
                Basic Patterns
              </button>
              <button
                onClick={() => handleTabChange('advanced')}
                className={`segmented-option ${activeTab === 'advanced' ? 'segmented-option-active' : ''}`}
              >
                Advanced Patterns
              </button>
            </div>
          </div>
        </div>

        {/* Quick Patterns View (unchanged) */}
        {activeTab === 'quick' && (
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
                💡 <strong>Quick patterns</strong> work right out of the box with simple setup
              </div>
            </div>
          </div>
        )}

        {/* ✅ FIX: Advanced Patterns View with colorwork first and no scrolling issues */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border-2 border-wool-200 shadow-sm p-4">
              {/* ✅ FIX: 2x2 Grid for Advanced Categories with fixed order */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {getAdvancedCategories().map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => handleAdvancedCategorySelect(key)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                      // Show selected state if this category is currently selected AND has a pattern
                      selectedCategory === key && selectedPattern
                        ? 'card-selectable-selected'
                        : // Show expanded state for multi-pattern categories that are expanded but no pattern selected yet
                        expandedAdvancedCategory === key && !selectedPattern && category.patterns.length > 1
                          ? 'border-sage-300 bg-sage-50 text-sage-700'
                          : // Default state
                          'card-selectable'
                      }`}
                  >
                    <div className="text-xl mb-1">{category.icon}</div>
                    <div className="text-xs font-medium">{category.name}</div>
                  </button>
                ))}
              </div>

              {/* ✅ STANDARDIZED: Pattern Selection matching Basic Patterns style */}
              <div style={{ minHeight: expandedAdvancedCategory && PATTERN_CATEGORIES[expandedAdvancedCategory]?.patterns.length > 1 ? '120px' : '0px' }}>
                {expandedAdvancedCategory && PATTERN_CATEGORIES[expandedAdvancedCategory]?.patterns.length > 1 && (
                  <div className="border-t border-wool-200 pt-4">
                    <h4 className="text-sm font-semibold text-wool-700 mb-3 text-left">
                      {PATTERN_CATEGORIES[expandedAdvancedCategory].name} Patterns
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {PATTERN_CATEGORIES[expandedAdvancedCategory].patterns.map(pattern => (
                        <button
                          key={pattern.name}
                          onClick={() => handleAdvancedPatternSelect(expandedAdvancedCategory, pattern)}
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
            </div>

            <div className="tip-block">
              <div className="text-xs text-yarn-700 text-center">
                ⚙️ <strong>Advanced patterns</strong> require additional setup and configuration
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