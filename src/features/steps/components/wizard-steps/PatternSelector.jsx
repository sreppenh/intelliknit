import React, { useState, useEffect, useCallback } from 'react'; // ✅ Add useCallback import
import { PrepStepOverlay, usePrepNoteManager, PrepStepButton, getPrepNoteConfig } from '../../../../shared/components/PrepStepSystem';
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
  // const [activeTab, setActiveTab] = useState('quick');

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

  // Prep note management
  const {
    isOverlayOpen,
    currentNote,
    hasNote,
    notePreview,
    handleOpenOverlay,
    handleCloseOverlay,
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
  }, []); // Empty dependency array since PATTERN_CATEGORIES is static

  useEffect(() => {
    const selectedCategory = wizardData?.stitchPattern?.category;
    const selectedPattern = wizardData?.stitchPattern?.pattern;

    if (selectedCategory && PATTERN_CATEGORIES[selectedCategory]) {
      const categoryType = PATTERN_CATEGORIES[selectedCategory].type;
      setActiveTab(categoryType === 'quick' ? 'quick' : 'advanced');

      if (categoryType === 'quick') {
        setSelectedQuickCategory(selectedCategory);
      }
    } else if (selectedPattern) {
      // Reverse lookup if we only have pattern
      const found = findCategoryFromPattern(selectedPattern);
      if (found) {
        setActiveTab(found.type === 'quick' ? 'quick' : 'advanced');
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
      // Auto-select Basic Stitches on FIRST LOAD only
      //     if (!selectedCategory && !selectedPattern && activeTab === 'quick') {
      //     setSelectedQuickCategory('basic');
      //   updateWizardData('stitchPattern', {
      //   category: 'basic',
      // pattern: null,
      //        customText: '',
      //      rowsInPattern: '',
      //     method: ''
      //   });
      //      }
    }
  }, [
    wizardData?.stitchPattern?.category,
    wizardData?.stitchPattern?.pattern,
    updateWizardData,
    findCategoryFromPattern,
    activeTab
    // 🎯 ONLY REMOVED: selectedQuickCategory (this was the loop maker!)
  ]);

  // Rest of your component code stays exactly the same...
  // Tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedQuickCategory(null);

    // Only clear selection if user actually had selections
    if (wizardData?.stitchPattern?.category || wizardData?.stitchPattern?.pattern) {
      updateWizardData('stitchPattern', {
        category: null,
        pattern: null,
        customText: '',
        rowsInPattern: '',
        method: ''
      });
    }
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
      method: ''
    });
  };

  // Advanced pattern handlers
  const handleAdvancedCategorySelect = (categoryKey) => {
    const category = PATTERN_CATEGORIES[categoryKey];

    if (category.patterns.length === 1) {
      // Single pattern - set both category and pattern
      updateWizardData('stitchPattern', {
        category: categoryKey,
        pattern: category.patterns[0].name,
        customText: '',
        rowsInPattern: '',
        method: ''
      });
    } else {
      // Multiple patterns - set category only
      updateWizardData('stitchPattern', {
        category: categoryKey,
        pattern: null,
        customText: '',
        rowsInPattern: '',
        method: ''
      });
    }
  };

  const handleAdvancedPatternSelect = (pattern) => {
    updateWizardData('stitchPattern', {
      ...wizardData.stitchPattern,
      pattern: pattern.name
    });
  };

  // Get current selections
  const selectedCategory = wizardData?.stitchPattern?.category;
  const selectedPattern = wizardData?.stitchPattern?.pattern;

  // Render advanced pattern detail screen
  if (activeTab === 'advanced' && selectedCategory && !selectedPattern && PATTERN_CATEGORIES[selectedCategory]?.type === 'advanced') {
    const category = PATTERN_CATEGORIES[selectedCategory];

    return (
      <>
        <div className="space-y-4 relative">
          <PrepStepButton
            onClick={handleOpenOverlay}
            hasNote={hasNote}
            notePreview={notePreview}
            position="top-right"
            size="normal"
            variant="ghost"
          />

          <div className="text-center">
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

  // Main pattern selector with toggle
  return (
    <>
      <div className="space-y-4 relative">
        {/* Header with Prep Note */}
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

        {/* Pattern Type Toggle - Standardized Segmented Control */}
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

        {/* Quick Patterns View */}
        {activeTab === 'quick' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border-2 border-wool-200 shadow-sm p-4">
              {/* Category Selection - Always Visible */}
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

              {/* Pattern Selection - Always Open When Category Selected */}
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
                        className={`card-pattern-option ${selectedPattern === pattern.name
                          ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm !bg-sage-100'
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

            {/* Quick Help Text */}
            <div className="help-block">
              <div className="text-xs text-sage-600 text-center">
                💡 <strong>Quick patterns</strong> work right out of the box with simple setup
              </div>
            </div>
          </div>
        )}

        {/* Advanced Patterns View */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PATTERN_CATEGORIES)
                .filter(([_, category]) => category.type === 'advanced')
                .map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => handleAdvancedCategorySelect(key)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${selectedCategory === key
                      ? 'border-yarn-500 bg-yarn-100 text-yarn-800 shadow-sm'
                      : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm'
                      }`}
                  >
                    <div className="text-2xl mb-2">{category.icon}</div>
                    <div className="text-sm font-medium mb-1">{category.name}</div>
                    <div className="text-xs opacity-60">Needs configuration</div>
                  </button>
                ))}
            </div>

            {/* Advanced Help Text */}
            <div className="tip-block">
              <div className="text-xs text-yarn-700 text-center">
                ⚙️ <strong>Advanced patterns</strong> require additional setup and configuration
              </div>
            </div>
          </div>
        )}
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