import React, { useState } from 'react';

const PATTERN_CATEGORIES = {
  // Simple Categories - Now with inline expansion!
  basic: { 
    name: 'Basic Stitches', 
    icon: '📐',
    type: 'simple',
    actionText: 'Choose',
    patterns: [
      { name: 'Stockinette', icon: '⬜', desc: 'Classic smooth fabric' },
      { name: 'Garter', icon: '〰️', desc: 'Bumpy, stretchy texture' },
      { name: 'Reverse Stockinette', icon: '⬛', desc: 'Purl side showing' }
    ]
  },
  rib: { 
    name: 'Ribbing', 
    icon: '〰️',
    type: 'simple',
    actionText: 'Choose',
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
    type: 'simple',
    actionText: 'Choose',
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
  
  // Complex Categories - Configuration required
  lace: { 
    name: 'Lace', 
    icon: '🕸️',
    type: 'complex',
    actionText: 'Configure',
    patterns: [
      { name: 'Lace Pattern', icon: '🕸️', desc: 'Define your lace pattern' }
    ]
  },
  cable: { 
    name: 'Cables', 
    icon: '🔗',
    type: 'complex',
    actionText: 'Configure',
    patterns: [
      { name: 'Cable Pattern', icon: '🔗', desc: 'Define your cable pattern' }
    ]
  },
  colorwork: { 
    name: 'Colorwork', 
    icon: '🌈',
    type: 'complex',
    actionText: 'Configure',
    patterns: [
      { name: 'Fair Isle', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', desc: 'Define your colorwork pattern' },
      { name: 'Intarsia', icon: '🎨', desc: 'Large color blocks' },
      { name: 'Stripes', icon: '🌈', desc: 'Define your stripe sequence' }
    ]
  },

  // Ultimate Flexibility
  custom: {
    name: 'Custom Pattern',
    icon: '✨',
    type: 'custom',
    actionText: 'Create',
    patterns: [
      { name: 'Custom Pattern', icon: '📝', desc: 'Ultimate flexibility for any pattern' }
    ]
  }
};

export const PatternSelector = ({ wizardData, updateWizardData, navigation }) => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const handleCategorySelect = (categoryKey) => {
    const category = PATTERN_CATEGORIES[categoryKey];
    
    // For simple categories, expand inline
    if (category.type === 'simple') {
      setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey);
      return;
    }
    
    // For complex/custom categories, set and navigate
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
    // Update pattern data
    updateWizardData('stitchPattern', { 
      category: categoryKey,
      pattern: pattern.name,
      customText: '',
      rowsInPattern: '',
      method: ''
    });
    
    // Check if this is a basic pattern that should skip configuration
    const basicPatterns = [
      'Stockinette', 'Garter', 'Reverse Stockinette',
      '1x1 Rib', '2x2 Rib', '3x3 Rib', '2x1 Rib', '1x1 Twisted Rib', '2x2 Twisted Rib',
      'Seed Stitch', 'Moss Stitch', 'Double Seed', 'Basketweave', 
      'Linen Stitch', 'Rice Stitch', 'Trinity Stitch', 'Broken Rib'
    ];
    
    if (basicPatterns.includes(pattern.name)) {
      // For basic patterns, skip to step 3 (Duration/Shaping choice)
      setTimeout(() => {
        navigation.goToStep(3);
      }, 10);
    } else {
      // For complex patterns, go to configuration step
      setTimeout(() => {
        navigation.nextStep();
      }, 10);
    }
  };

  const handleComplexCategoryPatternSelect = (pattern) => {
    // For patterns from the complex categories selection screen
    updateWizardData('stitchPattern', { pattern: pattern.name });
    setTimeout(() => {
      navigation.nextStep();
    }, 10);
  };

  const selectedCategory = wizardData?.stitchPattern?.category;
  const selectedPattern = wizardData?.stitchPattern?.pattern;

  // Show pattern selection screen for complex categories
  if (selectedCategory && !selectedPattern && PATTERN_CATEGORIES[selectedCategory]?.type !== 'simple') {
    const category = PATTERN_CATEGORIES[selectedCategory];
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-wool-700 mb-3">{category.actionText} {category.name}</h2>
          <p className="text-wool-500 mb-4">
            {category.type === 'complex' && 'Define your pattern details'}
            {category.type === 'custom' && 'Create your custom pattern'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {category.patterns.map(pattern => (
            <button
              key={pattern.name}
              onClick={() => handleComplexCategoryPatternSelect(pattern)}
              className="p-4 border-2 rounded-xl transition-all duration-200 text-center border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm"
            >
              <div className="text-2xl mb-2">{pattern.icon}</div>
              <div className="text-sm font-semibold mb-1">{pattern.name}</div>
              <div className="text-xs opacity-75">{pattern.desc}</div>
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

  // Main category selection screen with progressive disclosure
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">Choose Stitch Pattern</h2>
        <p className="text-wool-500 mb-4">Select the type of pattern for this section</p>
      </div>

      {/* Quick Selection - With Progressive Disclosure */}
      <div>
        <h3 className="text-sm font-semibold text-wool-600 mb-3 text-left">Quick Selection</h3>
        <div className="space-y-3">
          {Object.entries(PATTERN_CATEGORIES)
            .filter(([_, category]) => category.type === 'simple')
            .map(([key, category]) => (
              <div key={key} className="space-y-3">
                {/* Category Header Button */}
                <button
                  onClick={() => handleCategorySelect(key)}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    expandedCategory === key
                      ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                      : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{category.icon}</div>
                      <div>
                        <div className="font-semibold text-base">{category.name}</div>
                        <div className="text-xs opacity-75">
                          {category.patterns.length} pattern{category.patterns.length > 1 ? 's' : ''} available
                        </div>
                      </div>
                    </div>
                    <div className={`text-xl transition-transform duration-200 ${
                      expandedCategory === key ? 'rotate-180' : ''
                    }`}>
                      ↓
                    </div>
                  </div>
                </button>

                {/* Expanded Pattern Grid */}
                {expandedCategory === key && (
                  <div className="grid grid-cols-2 gap-3 pl-4 animate-in slide-in-from-top-2 duration-200">
                    {category.patterns.map(pattern => (
                      <button
                        key={pattern.name}
                        onClick={() => handlePatternSelect(key, pattern)}
                        className="p-3 border-2 rounded-xl transition-all duration-200 text-center border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm"
                      >
                        <div className="text-xl mb-1">{pattern.icon}</div>
                        <div className="text-xs font-semibold mb-1">{pattern.name}</div>
                        <div className="text-xs opacity-75">{pattern.desc}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Advanced Patterns - Middle section */}
      <div>
        <h3 className="text-sm font-semibold text-wool-600 mb-3 text-left">Advanced Patterns</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(PATTERN_CATEGORIES)
            .filter(([_, category]) => category.type === 'complex')
            .map(([key, category]) => (
              <button
                key={key}
                onClick={() => handleCategorySelect(key)}
                className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                  selectedCategory === key
                    ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
                    : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm'
                }`}
              >
                <div className="text-xl mb-1">{category.icon}</div>
                <div className="text-xs font-medium">{category.name}</div>
                <div className="text-xs opacity-60 mt-1">{category.actionText}</div>
              </button>
            ))}
        </div>
      </div>

      {/* Custom Category - Bottom section, special styling */}
      <div>
        <h3 className="text-sm font-semibold text-wool-600 mb-3 text-left">Ultimate Flexibility</h3>
        <button
          onClick={() => handleCategorySelect('custom')}
          className={`w-full p-4 rounded-xl border-2 transition-all duration-200 text-center ${
            selectedCategory === 'custom'
              ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
              : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="text-2xl">{PATTERN_CATEGORIES.custom.icon}</div>
            <div className="text-left">
              <div className="font-semibold text-sm">{PATTERN_CATEGORIES.custom.name}</div>
              <div className="text-xs opacity-75">{PATTERN_CATEGORIES.custom.patterns[0].desc}</div>
            </div>
          </div>
        </button>
      </div>

      {/* Helpful context */}
      <div className="bg-sage-100 border-2 border-sage-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 Pattern Guide</h4>
        <div className="text-sm text-sage-600 space-y-1">
          <div>• <strong>Quick Selection:</strong> Tap to expand and choose common patterns</div>
          <div>• <strong>Advanced:</strong> Complex patterns you'll configure in detail</div>
          <div>• <strong>Custom:</strong> Describe any pattern with repeats (perfect for bobble rows!)</div>
        </div>
      </div>
    </div>
  );
};

export default PatternSelector;