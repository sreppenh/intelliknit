// features/steps/components/wizard-steps/PatternSelector.jsx
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
  // REMOVED: other category entirely
};

export const PatternSelector = ({ wizardData, updateWizardData, navigation }) => {
  const handleCategorySelect = (key) => {
    // Only clear fields that are specific to other pattern types
    updateWizardData('stitchPattern', { 
      category: key,
      customText: '',       // Clear custom text (used by Other/Custom)
      rowsInPattern: '',    // Clear rows in pattern (used by Lace/Cable/etc)
      method: ''            // Clear method (used by Cast On/Bind Off)
    });
    
    const category = STITCH_PATTERNS[key];
    
    if (category.patterns.length === 1) {
      updateWizardData('stitchPattern', { pattern: category.patterns[0] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Choose Stitch Pattern</h2>
        <p className="text-sm text-gray-600 mb-4">Select the main stitch pattern for this section</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(STITCH_PATTERNS).map(([key, category]) => (
          <button
            key={key}
            onClick={() => handleCategorySelect(key)}
            className={`p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center ${
              wizardData?.stitchPattern?.category === key
                ? 'border-purple-500 bg-purple-50 text-purple-900'
                : ''
            }`}
          >
            <div className="text-2xl mb-2">{category.icon}</div>
            <div className="text-sm font-medium text-gray-700">{category.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PatternSelector;