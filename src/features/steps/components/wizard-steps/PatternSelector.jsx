import React, { useState } from 'react';

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
    type: 'custom',
    patterns: [
      { name: 'Custom Pattern', icon: '📝', desc: 'Ultimate flexibility for any pattern' }
    ]
  }
};

export const PatternSelector = ({ wizardData, updateWizardData, navigation }) => {
  const [selectedQuickCategory, setSelectedQuickCategory] = useState(null);

  const handleQuickCategorySelect = (categoryKey) => {
    // Toggle selection - if already selected, hide patterns
    if (selectedQuickCategory === categoryKey) {
      setSelectedQuickCategory(null);
    } else {
      setSelectedQuickCategory(categoryKey);
    }
  };

  const handleAdvancedCategorySelect = (categoryKey) => {
    const category = PATTERN_CATEGORIES[categoryKey];
    
    // Set category and navigate to configuration
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

  const handleCustomSelect = () => {
    updateWizardData('stitchPattern', { 
      category: 'custom',
      pattern: 'Custom Pattern',
      customText: '',
      rowsInPattern: '',
      method: ''
    });
    navigation.nextStep();
  };

  const handlePatternSelect = (categoryKey, pattern) => {
    // Update pattern data
    updateWizardData('stitchPattern', { 
      category: categoryKey,
      pattern: pattern.name,
      customText: '',
      rowsInPattern: '',
      method: ''
    });
    
    // All quick selection patterns skip to duration/shaping
    setTimeout(() => {
      navigation.goToStep(3);
    }, 10);
  };

  const handleAdvancedPatternSelect = (pattern) => {
    // For patterns from the advanced categories selection screen
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
      <div className="space-y-4">
        {/* Compact Header */}
        <div>
          <h2 className="text-lg font-semibold text-wool-700 mb-1">Configure {category.name}</h2>
          <p className="text-sm text-wool-500">Define your pattern details</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {category.patterns.map(pattern => (
            <button
              key={pattern.name}
              onClick={() => handleAdvancedPatternSelect(pattern)}
              className="p-4 border-2 rounded-xl transition-all duration-200 text-center border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm"
            >
              <div className="text-2xl mb-2">{pattern.icon}</div>
              <div className="text-sm font-semibold mb-1">{pattern.name}</div>
              <div className="text-xs opacity-75">{pattern.desc}</div>
            </button>
          ))}
        </div>

        {/* Back to categories */}
        <button
          onClick={() => updateWizardData('stitchPattern', { category: null, pattern: null })}
          className="w-full text-wool-500 text-sm py-2 hover:text-wool-700 transition-colors"
        >
          ← Choose different category
        </button>
      </div>
    );
  }

  // Main category selection screen - compact and above the fold
  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div>
        <h2 className="text-lg font-semibold text-wool-700">Choose Pattern</h2>
      </div>

      {/* Basic Patterns - 3 boxes in a row */}
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(PATTERN_CATEGORIES)
          .filter(([_, category]) => category.type === 'quick')
          .map(([key, category]) => (
            <button
              key={key}
              onClick={() => handleQuickCategorySelect(key)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                selectedQuickCategory === key
                  ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                  : 'border-wool-200 bg-sage-50 text-wool-700 hover:border-sage-300 hover:bg-sage-100 hover:shadow-sm'
              }`}
            >
              <div className="text-xl mb-1">{category.icon}</div>
              <div className="text-xs font-medium">{category.name}</div>
            </button>
          ))}
      </div>

      {/* Pattern Grid - Appears as "nested drawer" when basic category selected */}
      {selectedQuickCategory && (
        <div className="pl-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {/* Remove redundant label, just show close button */}
          <div className="flex justify-end">
            <button
              onClick={() => setSelectedQuickCategory(null)}
              className="text-wool-400 hover:text-wool-600 text-sm p-1 hover:bg-wool-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Nested pattern cards with "drawer" feeling */}
          <div className="bg-white rounded-lg border border-wool-200 shadow-sm p-3">
            <div className="grid grid-cols-2 gap-2">
              {PATTERN_CATEGORIES[selectedQuickCategory].patterns.map(pattern => (
                <button
                  key={pattern.name}
                  onClick={() => handlePatternSelect(selectedQuickCategory, pattern)}
                  className="p-2.5 border border-wool-200 rounded-lg transition-all duration-200 text-center bg-wool-50 text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm"
                >
                  <div className="text-lg mb-1">{pattern.icon}</div>
                  <div className="text-xs font-medium mb-0.5">{pattern.name}</div>
                  <div className="text-xs opacity-70">{pattern.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Patterns - 2x2 grid with Custom, better contrast */}
      <div className="grid grid-cols-2 gap-2">
        {/* Advanced Categories */}
        {Object.entries(PATTERN_CATEGORIES)
          .filter(([_, category]) => category.type === 'advanced')
          .map(([key, category]) => (
            <button
              key={key}
              onClick={() => handleAdvancedCategorySelect(key)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                selectedCategory === key
                  ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
                  : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm'
              }`}
            >
              <div className="text-xl mb-1">{category.icon}</div>
              <div className="text-xs font-medium">{category.name}</div>
              <div className="text-xs opacity-60 mt-0.5">Configure</div>
            </button>
          ))}
        
        {/* Custom Pattern */}
        <button
          onClick={handleCustomSelect}
          className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
            selectedCategory === 'custom'
              ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
              : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm'
          }`}
        >
          <div className="text-xl mb-1">{PATTERN_CATEGORIES.custom.icon}</div>
          <div className="text-xs font-medium">{PATTERN_CATEGORIES.custom.name}</div>
          <div className="text-xs opacity-60 mt-0.5">Create</div>
        </button>
      </div>

      {/* Compact help text */}
      <div className="bg-sage-100 border border-sage-200 rounded-lg p-3">
        <div className="text-xs text-sage-600 text-center">
          💡 <strong>Quick:</strong> Tap to see patterns • <strong>Advanced:</strong> Configure details • <strong>Custom:</strong> Any pattern + repeats
        </div>
      </div>
    </div>
  );
};

export default PatternSelector;