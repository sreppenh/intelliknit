// features/steps/components/wizard-steps/PatternDetails.jsx
import React from 'react';
import BasicPatternConfig from '../pattern-types/BasicPatternConfig';
import ShapingToggle from '../pattern-types/ShapingToggle';

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
  },
  other: { 
    name: 'Other', 
    icon: '📋',
    patterns: ['Custom pattern']
  }
  // REMOVED: castOn and bindOff patterns
};

export const PatternDetails = ({ wizardData, updateWizardData, canHaveShaping }) => {
   console.log('PatternDetails wizardData:', wizardData); // ADD THIS
  if (!wizardData.stitchPattern.category) {
    return null;
  }

  const category = STITCH_PATTERNS[wizardData.stitchPattern.category];

  const handleBackToCategories = () => {
    updateWizardData('stitchPattern', { category: null, pattern: null });
  };

  const handlePatternSelect = (pattern) => {
    updateWizardData('stitchPattern', { pattern });
  };

  // FIXED: Proper shaping toggle handler for root-level property
  const handleShapingToggle = (hasShaping) => {
      console.log('About to update hasShaping to:', hasShaping); // ADD THIS
    updateWizardData('hasShaping', hasShaping);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Pattern Details</h2>
        <p className="text-sm text-gray-600 mb-4">Configure the specific pattern details</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackToCategories}
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            ← Back to categories
          </button>
          <span className="text-sm text-gray-600">{category.name}</span>
        </div>
        
        {/* Pattern Selection */}
        {category.patterns.length > 1 && (
          <div className="space-y-2">
            {category.patterns.map(pattern => (
              <button
                key={pattern}
                onClick={() => handlePatternSelect(pattern)}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  wizardData.stitchPattern.pattern === pattern
                    ? 'border-purple-500 bg-purple-50 text-purple-900'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                {pattern}
              </button>
            ))}
          </div>
        )}

        {/* Pattern-specific Configuration */}
        {wizardData.stitchPattern.pattern && (
          <>
            {/* All patterns use BasicPatternConfig now - no special Cast On/Bind Off handling */}
            <BasicPatternConfig 
              wizardData={wizardData} 
              updateWizardData={updateWizardData}
            />

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details (optional)
              </label>
              <input
                type="text"
                value={wizardData.stitchPattern.customDetails || ''}
                onChange={(e) => updateWizardData('stitchPattern', { customDetails: e.target.value })}
                placeholder="e.g., 'with seed stitch border', 'using chart A'"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
            </div>

{/* Shaping vs Duration Choice */}
<div className="border-t border-gray-200 pt-4">
  <h3 className="text-sm font-medium text-gray-700 mb-3">How do you want to work this pattern?</h3>
  
  <div className="space-y-3">
    <button
      onClick={() => updateWizardData('hasShaping', false)}
      className={`w-full p-4 text-left border rounded-lg transition-colors ${
        wizardData.hasShaping === false
          ? 'border-green-500 bg-green-50 text-green-900'
          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">⏱️</div>
        <div>
          <div className="font-medium">Set Duration</div>
          <div className="text-sm text-gray-600">Work pattern for specific length (No shaping)</div>
        </div>
      </div>
    </button>

    <button
      onClick={() => updateWizardData('hasShaping', true)}
      className={`w-full p-4 text-left border rounded-lg transition-colors ${
        wizardData.hasShaping === true
          ? 'border-green-500 bg-green-50 text-green-900'
          : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">📏</div>
        <div>
          <div className="font-medium">Add Shaping</div>
          <div className="text-sm text-gray-600">Configure increases, decreases, etc. (Length calculated automatically)</div>
        </div>
      </div>
    </button>
  </div>
</div>
          </>
        )}
      </div>
    </div>
  );
};

export default PatternDetails;