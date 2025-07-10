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
        <h2 className="text-xl font-semibold text-wool-700 mb-3">Choose Stitch Pattern</h2>
        <p className="text-wool-500 mb-4">Select the main stitch pattern for this section</p>
      </div>

      {/* UPDATED: Consistent card styling with sage selection states */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(STITCH_PATTERNS).map(([key, category]) => (
          <button
            key={key}
            onClick={() => handleCategorySelect(key)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
              wizardData?.stitchPattern?.category === key
                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm' // UPDATED: Sage selection state
                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm' // UPDATED: Sage hover state
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