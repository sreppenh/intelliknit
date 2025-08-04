// src/features/steps/components/wizard-steps/PatternSelector.jsx
import React, { useState, useEffect } from 'react';
import { PrepStepOverlay, usePrepNoteManager, PrepStepButton, getPrepNoteConfig } from '../../../../shared/components/PrepStepSystem';
import SetupNotesSection from '../../../../shared/components/SetUpNotesSection';
import { PATTERN_CATEGORIES } from '../../../../shared/utils/PatternCategories'; // ✅ IMPORT

export const PatternSelector = ({
  wizardData,
  updateWizardData,
  navigation,
  onCreatePrepStep,
  existingPrepNote = '',
  onSavePrepNote
}) => {
  const [selectedQuickCategory, setSelectedQuickCategory] = useState(null);
  const [showSetupNotes, setShowSetupNotes] = useState(false);

  // Use the enhanced prep note manager with persistence
  const {
    isOverlayOpen,
    currentNote,
    hasNote,
    notePreview,
    handleOpenOverlay,
    handleCloseOverlay,
    handleSaveNote
  } = usePrepNoteManager(existingPrepNote, onSavePrepNote);

  // Get the config for step wizard
  const prepConfig = getPrepNoteConfig('stepWizard');

  const handleQuickCategorySelect = (categoryKey) => {
    if (selectedQuickCategory === categoryKey) {
      setSelectedQuickCategory(null);
    } else {
      setSelectedQuickCategory(categoryKey);
    }
  };

  const handleAdvancedCategorySelect = (categoryKey) => {
    setSelectedQuickCategory(null);
    const category = PATTERN_CATEGORIES[categoryKey];

    // SIMPLIFIED: Just set the category, no automatic navigation
    if (category.patterns.length === 1) {
      // Single pattern - set both category and pattern
      updateWizardData('stitchPattern', {
        category: categoryKey,
        pattern: category.patterns[0].name,
        customText: '',
        rowsInPattern: '',
        method: ''
      });
      // REMOVED: navigation.nextStep() - let user click Continue
    } else {
      // Multiple patterns - set category only
      updateWizardData('stitchPattern', {
        category: categoryKey,
        pattern: null,
        customText: '',
        rowsInPattern: '',
        method: ''
      });
      // No navigation - React will re-render to show pattern selection
    }
  };


  const handlePatternSelect = (categoryKey, pattern) => {
    updateWizardData('stitchPattern', {
      category: categoryKey,
      pattern: pattern.name,
      customText: '',
      rowsInPattern: '',
      method: ''
    });

    // REMOVED: setTimeout(() => { navigation.goToStep(3); }, 10);
    // User will click Continue button to proceed
  };

  const handleAdvancedPatternSelect = (pattern) => {
    updateWizardData('stitchPattern', { pattern: pattern.name });

    // REMOVED: setTimeout(() => { navigation.nextStep(); }, 10);
    // User will click Continue button to proceed
  };

  const selectedCategory = wizardData?.stitchPattern?.category;
  const selectedPattern = wizardData?.stitchPattern?.pattern;

  // ✅ FIX #2: Auto-open drawer when editing
  useEffect(() => {
    // Auto-open drawer when editing and we have a quick category selected
    const selectedCategory = wizardData?.stitchPattern?.category;
    if (selectedCategory && PATTERN_CATEGORIES[selectedCategory]?.type === 'quick') {
      setSelectedQuickCategory(selectedCategory);
    }
  }, [wizardData?.stitchPattern?.category]);

  // Show pattern selection screen for advanced categories
  if (selectedCategory && !selectedPattern && PATTERN_CATEGORIES[selectedCategory]?.type === 'advanced') {
    const category = PATTERN_CATEGORIES[selectedCategory];

    return (
      <>
        <div className="space-y-4 relative">
          {/* Prep Note Button - Enhanced with state */}
          <PrepStepButton
            onClick={handleOpenOverlay}
            hasNote={hasNote}
            notePreview={notePreview}
            position="top-right"
            size="normal"
            variant="ghost"
          />

          <div>
            <h2 className="content-header-secondary mb-1">Configure {category.name}</h2>
            <p className="text-sm text-wool-500">Define your pattern details</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {category.patterns.map(pattern => (
              <button
                key={pattern.name}
                onClick={() => handleAdvancedPatternSelect(pattern)}
                className="card-selectable"
              >
                <div className="text-2xl mb-2">{pattern.icon}</div>
                <div className="text-sm font-semibold mb-1">{pattern.name}</div>
                <div className="text-xs opacity-75">{pattern.desc}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => updateWizardData('stitchPattern', { category: null, pattern: null })}
            className="w-full text-wool-500 text-sm py-2 hover:text-wool-700 transition-colors"
          >
            ← Choose different category
          </button>
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

  // Main category selection screen
  return (
    <>
      <div className="space-y-4 relative">
        {/* Compact Header */}
        <div className="text-center">
          <div className="content-header-with-buttons">
            <h2 className="content-title">Create Step</h2>
            <div className="button-group">
              <button
                onClick={handleOpenOverlay}
                className="btn-secondary btn-sm"
              >
                {hasNote ? 'Edit Preparation Note' : '+ Add Preparation Note'}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-left text-sm font-semibold text-wool-700">Choose Pattern</h3>
        </div>

        {/* Basic Patterns Section with Drawer */}
        <div className="bg-white rounded-2xl border-2 border-wool-200 shadow-sm p-4">
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

          {selectedQuickCategory && (
            <div className="border-t border-wool-200 pt-4">
              <div className="grid grid-cols-2 gap-3">
                {PATTERN_CATEGORIES[selectedQuickCategory].patterns.map(pattern => (
                  <button
                    key={pattern.name}
                    onClick={() => handlePatternSelect(selectedQuickCategory, pattern)}
                    className={`card-pattern-option ${selectedPattern === pattern.name
                      ? 'border-sage-500 bg-sage-100 text-sage-700'
                      : ''
                      }`}  // ✅ FIX #2: Add selected state styling
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

        {/* Advanced Patterns */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PATTERN_CATEGORIES)
            .filter(([_, category]) => category.type === 'advanced')
            .map(([key, category]) => (
              <button
                key={key}
                onClick={() => handleAdvancedCategorySelect(key)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${selectedCategory === key
                  ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
                  : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm'
                  }`}
              >
                <div className="text-xl mb-1">{category.icon}</div>
                <div className="text-xs font-medium">{category.name}</div>
                <div className="text-xs opacity-60 mt-0.5">Configure</div>
              </button>
            ))}
        </div>

        {/* Compact help text */}
        <div className="help-block">
          <div className="text-xs text-sage-600 text-center">
            💡 <strong>Quick:</strong> Tap to see patterns • <strong>Advanced:</strong> Configure details • <strong>Custom:</strong> Any pattern + repeats
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
};

export default PatternSelector;