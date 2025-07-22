import React, { useState } from 'react';
import { PrepStepOverlay, usePrepNoteManager, PrepStepButton, getPrepNoteConfig } from '../../../../shared/components/PrepStepSystem';

const PATTERN_CATEGORIES = {
  // Quick Selection Categories
  basic: {
    name: 'Basic Stitches',
    icon: '📐',
    type: 'quick',
    patterns: [
      { name: 'Stockinette', icon: '⬜', desc: 'Classic smooth fabric' },
      { name: 'Garter', icon: '〰️', desc: 'Bumpy, stretchy texture' },
      { name: 'Reverse Stockinette', icon: '⬛', desc: 'Purl side showing' }
    ]
  },
  rib: {
    name: 'Ribbing',
    icon: '〰️',
    type: 'quick',
    patterns: [
      { name: '1x1 Rib', icon: '|||', desc: 'K1, P1 alternating' },
      { name: '2x2 Rib', icon: '||||', desc: 'K2, P2 alternating' },
      { name: '3x3 Rib', icon: '||||||', desc: 'K3, P3 alternating' },
      { name: '2x1 Rib', icon: '||', desc: 'K2, P1 alternating' },
      { name: '1x1 Twisted Rib', icon: '🌀', desc: 'Twisted knit stitches' },
      { name: '2x2 Twisted Rib', icon: '🌀🌀', desc: 'Twisted knit stitches' }
    ]
  },
  textured: {
    name: 'Textured',
    icon: '🔹',
    type: 'quick',
    patterns: [
      { name: 'Seed Stitch', icon: '🌱', desc: 'Bumpy alternating texture' },
      { name: 'Moss Stitch', icon: '🍃', desc: 'British seed stitch' },
      { name: 'Double Seed', icon: '🌿', desc: '2x2 seed variation' },
      { name: 'Basketweave', icon: '🧺', desc: 'Alternating knit/purl blocks' },
      { name: 'Linen Stitch', icon: '🪢', desc: 'Slip stitch texture' },
      { name: 'Rice Stitch', icon: '🌾', desc: 'Seed stitch variation' },
      { name: 'Trinity Stitch', icon: '🔮', desc: 'Bobble-like clusters' },
      { name: 'Broken Rib', icon: '💔', desc: 'Interrupted ribbing pattern' }
    ]
  },

  // Advanced Categories
  lace: {
    name: 'Lace',
    icon: '🕸️',
    type: 'advanced',
    patterns: [
      { name: 'Lace Pattern', icon: '🕸️', desc: 'Define your lace pattern' }
    ]
  },
  cable: {
    name: 'Cables',
    icon: '🔗',
    type: 'advanced',
    patterns: [
      { name: 'Cable Pattern', icon: '🔗', desc: 'Define your cable pattern' }
    ]
  },
  colorwork: {
    name: 'Colorwork',
    icon: '🌈',
    type: 'advanced',
    patterns: [
      { name: 'Fair Isle', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', desc: 'Define your colorwork pattern' },
      { name: 'Intarsia', icon: '🎨', desc: 'Large color blocks' },
      { name: 'Stripes', icon: '🌈', desc: 'Define your stripe sequence' }
    ]
  },

  // Custom Category
  custom: {
    name: 'Custom Pattern',
    icon: '✨',
    type: 'advanced',
    patterns: [
      { name: 'Custom pattern', icon: '📝', desc: 'Define your own pattern' }
    ]
  }
};

export const PatternSelector = ({
  wizardData,
  updateWizardData,
  navigation,
  onCreatePrepStep,
  existingPrepNote = '', // NEW: prop for existing note
  onSavePrepNote // NEW: callback to save note to wizard state
}) => {
  const [selectedQuickCategory, setSelectedQuickCategory] = useState(null);

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
    const category = PATTERN_CATEGORIES[categoryKey];

    if (category.patterns.length === 1) {
      updateWizardData('stitchPattern', {
        category: categoryKey,
        pattern: category.patterns[0].name,
        customText: '',
        rowsInPattern: '',
        method: ''
      });
      navigation.nextStep();
    } else {
      updateWizardData('stitchPattern', {
        category: categoryKey,
        pattern: null,
        customText: '',
        rowsInPattern: '',
        method: ''
      });
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

    setTimeout(() => {
      navigation.goToStep(3);
    }, 10);
  };

  const handleAdvancedPatternSelect = (pattern) => {
    updateWizardData('stitchPattern', { pattern: pattern.name });
    setTimeout(() => {
      navigation.nextStep();
    }, 10);
  };

  const selectedCategory = wizardData?.stitchPattern?.category;
  const selectedPattern = wizardData?.stitchPattern?.pattern;

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

        {/* Prep Note Button - Enhanced with state indicator */}
        {/*}    <PrepStepButton
          onClick={handleOpenOverlay}
          hasNote={hasNote}
          notePreview={notePreview}
          position="top-right"
          size="normal"
          variant="ghost"
        /> */}

        {/* Compact Header */}
        <div className="text-center">
          <h2 className="content-header-primary">Choose Pattern</h2>
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
                    className="card-pattern-option"
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