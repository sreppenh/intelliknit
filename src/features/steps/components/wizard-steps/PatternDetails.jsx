// features/steps/components/wizard-steps/PatternDetails.jsx
import React from 'react';
import BasicPatternConfig from '../pattern-types/BasicPatternConfig';

const STITCH_PATTERNS = {
  basic: { 
    name: 'Basic Stitches', 
    icon: '📐',
    patterns: [
      { name: 'Stockinette', icon: '⬜', desc: 'Classic smooth fabric' },
      { name: 'Garter', icon: '〰️', desc: 'Bumpy, stretchy texture' },
      { name: 'Reverse Stockinette', icon: '⬛', desc: 'Purl side showing' }
    ]
  },
  rib: { 
    name: 'Ribbing', 
    icon: '〰️',
    patterns: [
      { name: '1x1 Rib', icon: '|||', desc: 'K1, P1 alternating' },
      { name: '2x2 Rib', icon: '||||', desc: 'K2, P2 alternating' },
      { name: '3x3 Rib', icon: '||||||', desc: 'K3, P3 alternating' },
      { name: '2x1 Rib', icon: '|||', desc: 'K2, P1 alternating' },
      { name: 'Twisted Rib', icon: '🌀', desc: 'Twisted knit stitches' },
      { name: 'Other', icon: '📝', desc: 'Custom ribbing pattern' }
    ]
  },
  textured: {
    name: 'Textured',
    icon: '🔹',
    patterns: [
      { name: 'Seed Stitch', icon: '🌱', desc: 'Bumpy alternating texture' },
      { name: 'Moss Stitch', icon: '🍃', desc: 'British seed stitch' },
      { name: 'Double Seed', icon: '🌾', desc: '2x2 seed pattern' },
      { name: 'Other', icon: '📝', desc: 'Custom textured pattern' }
    ]
  },
  lace: { 
    name: 'Lace', 
    icon: '🕸️',
    patterns: [
      { name: 'Lace Pattern', icon: '🕸️', desc: 'Openwork with YOs and decreases' }
    ]
  },
  cable: { 
    name: 'Cables', 
    icon: '🔗',
    patterns: [
      { name: 'Cable Pattern', icon: '🔗', desc: 'Twisted rope-like cables' }
    ]
  },
  colorwork: { 
    name: 'Colorwork', 
    icon: '🌈',
    patterns: [
      { name: 'Fair Isle', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', desc: 'Stranded colorwork' },
      { name: 'Intarsia', icon: '🎨', desc: 'Large color blocks' },
      { name: 'Stripes', icon: '🌈', desc: 'Horizontal color bands' }
    ]
  }
};

export const PatternDetails = ({ wizardData, updateWizardData, canHaveShaping }) => {
  if (!wizardData.stitchPattern.category) {
    return null;
  }

  const category = STITCH_PATTERNS[wizardData.stitchPattern.category];

  const handleBackToCategories = () => {
    updateWizardData('stitchPattern', { category: null, pattern: null });
  };

  const handlePatternSelect = (pattern) => {
    updateWizardData('stitchPattern', { pattern: pattern.name });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">Pattern Details</h2>
        <p className="text-wool-500 mb-4">Choose your specific {category.name.toLowerCase()} pattern</p>
      </div>

      <div className="space-y-4">
        {/* REDESIGNED: Visual card grid like Choose Stitch Pattern */}
        {category.patterns.length > 1 ? (
          <div className="grid grid-cols-2 gap-3">
            {category.patterns.map(pattern => (
              <button
                key={pattern.name}
                onClick={() => handlePatternSelect(pattern)}
                className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                  wizardData.stitchPattern.pattern === pattern.name
                    ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                    : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                }`}
              >
                <div className="text-2xl mb-2">{pattern.icon}</div>
                <div className="text-sm font-semibold mb-1">{pattern.name}</div>
                <div className="text-xs opacity-75">{pattern.desc}</div>
              </button>
            ))}
          </div>
        ) : (
          /* Single pattern - show as selected card */
          <div className="grid grid-cols-1">
            <div className="p-4 border-2 border-sage-500 bg-sage-100 text-sage-700 rounded-xl text-center shadow-sm">
              <div className="text-2xl mb-2">{category.patterns[0].icon}</div>
              <div className="text-sm font-semibold mb-1">{category.patterns[0].name}</div>
              <div className="text-xs opacity-75">{category.patterns[0].desc}</div>
            </div>
          </div>
        )}

        {/* Pattern-specific Configuration */}
        {wizardData.stitchPattern.pattern && (
          <>
            <BasicPatternConfig 
              wizardData={wizardData} 
              updateWizardData={updateWizardData}
            />

            {/* Additional Details Input */}
            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                Additional Details (optional)
              </label>
              <input
                type="text"
                value={wizardData.stitchPattern.customDetails || ''}
                onChange={(e) => updateWizardData('stitchPattern', { customDetails: e.target.value })}
                placeholder="e.g., 'with seed stitch border', 'using chart A'"
                className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400"
              />
            </div>

            {/* REDESIGNED: Shaping vs Duration choice with improved visual design */}
            <div className="border-t border-wool-200 pt-6">
              <h3 className="text-lg font-semibold text-wool-700 mb-3">How do you want to work this pattern?</h3>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => updateWizardData('hasShaping', false)}
                  className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                    wizardData.hasShaping === false
                      ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                      : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⏱️</div>
                    <div className="flex-1">
                      <div className="font-semibold">Set Duration</div>
                      <div className="text-sm opacity-75">Work pattern for specific length (No shaping)</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => updateWizardData('hasShaping', true)}
                  className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                    wizardData.hasShaping === true
                      ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                      : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📏</div>
                    <div className="flex-1">
                      <div className="font-semibold">Add Shaping</div>
                      <div className="text-sm opacity-75">Configure increases, decreases, etc. (Length calculated automatically)</div>
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