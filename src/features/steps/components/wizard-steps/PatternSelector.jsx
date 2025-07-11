import React from 'react';

const STITCH_PATTERNS = {
  basic: { 
    name: 'Basic Stitches', 
    icon: '📐',
    patterns: ['Stockinette', 'Garter', 'Reverse Stockinette']
  },
  rib: { 
    name: 'Ribbing', 
    icon: '〰️',
    patterns: ['1x1 Rib', '2x2 Rib', '3x3 Rib', '2x1 Rib', 'Twisted Rib', 'Other']
  },
  textured: {
    name: 'Textured',
    icon: '🔹',
    patterns: ['Seed Stitch', 'Moss Stitch', 'Double Seed', 'Other']
  },
  lace: { 
    name: 'Lace', 
    icon: '🕸️',
    patterns: ['Lace Pattern']
  },
  cable: { 
    name: 'Cables', 
    icon: '🔗',
    patterns: ['Cable Pattern']
  },
  colorwork: { 
    name: 'Colorwork', 
    icon: '🌈',
    patterns: ['Fair Isle', 'Intarsia', 'Stripes']
  }
};

export const PatternSelector = ({ wizardData, updateWizardData, navigation }) => {
  const handleCategorySelect = (key) => {
    // Clear fields that are specific to other pattern types
    updateWizardData('stitchPattern', { 
      category: key,
      pattern: null,
      customText: '',
      rowsInPattern: '',
      method: ''
    });
    
    const category = STITCH_PATTERNS[key];
    
    // If only one pattern option, select it and auto-advance
    if (category.patterns.length === 1) {
      updateWizardData('stitchPattern', { pattern: category.patterns[0] });
      setTimeout(() => navigation.nextStep(), 150);
    }
  };

  const handlePatternSelect = (patternName) => {
    updateWizardData('stitchPattern', { pattern: patternName });
    // Auto-advance to next step
    setTimeout(() => navigation.nextStep(), 150);
  };

  const selectedCategory = wizardData?.stitchPattern?.category;
  const selectedPattern = wizardData?.stitchPattern?.pattern;

  // Show pattern selection if category is selected but not pattern
  if (selectedCategory && !selectedPattern) {
    const category = STITCH_PATTERNS[selectedCategory];
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-wool-700 mb-3">Choose {category.name}</h2>
          <p className="text-wool-500 mb-4">Select your specific {category.name.toLowerCase()} pattern</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {category.patterns.map(pattern => (
            <button
              key={pattern}
              onClick={() => handlePatternSelect(pattern)}
              className="p-4 border-2 rounded-xl transition-all duration-200 text-center border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm"
            >
              <div className="text-sm font-semibold mb-1">{pattern}</div>
            </button>
          ))}
        </div>

        {/* Back to categories option */}
        <button
          onClick={() => updateWizardData('stitchPattern', { category: null, pattern: null })}
          className="w-full text-wool-500 text-sm py-2 hover:text-wool-700 transition-colors"
        >
          ← Choose different category
        </button>
      </div>
    );
  }

  // Show category selection (initial step)
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">Choose Stitch Pattern</h2>
        <p className="text-wool-500 mb-4">Select the main stitch pattern for this section</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(STITCH_PATTERNS).map(([key, category]) => (
          <button
            key={key}
            onClick={() => handleCategorySelect(key)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              selectedCategory === key
                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
            }`}
          >
            <div className="text-2xl mb-2">{category.icon}</div>
            <div className="text-sm font-medium">{category.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PatternSelector;