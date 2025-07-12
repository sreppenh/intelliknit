import React, { useState } from 'react';

// Prep Step Form Component
const PrepStepForm = ({ onBack, onCreatePrepStep }) => {
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (description.trim()) {
      onCreatePrepStep(description.trim());
    }
  };

  const canCreate = description.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-2xl mb-2">📝</div>
        <h2 className="text-lg font-semibold text-wool-700 mb-1">Preparation Step</h2>
        <p className="text-wool-500 text-sm">Add a non-knitting preparation step</p>
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm font-semibold text-wool-700 mb-3">
          What should the knitter do?
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., Switch to US 6 needles, Place markers at stitches 20, 40, and 60, Try on for fit"
          rows={3}
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white resize-none"
        />
      </div>

      {/* Examples */}
      <div className="bg-sage-100 border-2 border-sage-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 Examples</h4>
        <div className="text-sm text-sage-600 space-y-1">
          <div>• Switch to US 6 circular needles</div>
          <div>• Place markers for raglan decreases</div>
          <div>• Try on to check fit before continuing</div>
          <div>• Change to contrasting color yarn</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-wool-100 text-wool-700 py-4 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
        >
          ← Back
        </button>
        
        <button
          onClick={handleCreate}
          disabled={!canCreate}
          className="flex-2 bg-sage-500 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-sage-600 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm"
          style={{flexGrow: 2}}
        >
          Add Prep Step
        </button>
      </div>
    </div>
  );
};

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

export const PatternSelector = ({ wizardData, updateWizardData, navigation, onCreatePrepStep }) => {
  const [selectedQuickCategory, setSelectedQuickCategory] = useState(null);
  const [showPrepForm, setShowPrepForm] = useState(false);

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

  const handlePrepStepCreate = (description) => {
    if (onCreatePrepStep) {
      onCreatePrepStep(description);
    }
    setShowPrepForm(false);
  };

  const selectedCategory = wizardData?.stitchPattern?.category;
  const selectedPattern = wizardData?.stitchPattern?.pattern;

  // Show prep step form if activated
  if (showPrepForm) {
    return (
      <PrepStepForm
        onBack={() => setShowPrepForm(false)}
        onCreatePrepStep={handlePrepStepCreate}
      />
    );
  }

  // Show pattern selection screen for advanced categories
  if (selectedCategory && !selectedPattern && PATTERN_CATEGORIES[selectedCategory]?.type === 'advanced') {
    const category = PATTERN_CATEGORIES[selectedCategory];
    
    return (
      <div className="space-y-4">
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

        <button
          onClick={() => updateWizardData('stitchPattern', { category: null, pattern: null })}
          className="w-full text-wool-500 text-sm py-2 hover:text-wool-700 transition-colors"
        >
          ← Choose different category
        </button>
      </div>
    );
  }

  // Main category selection screen with prep step option
  return (
    <div className="space-y-4 relative">
      
      {/* Prep Step Button - Top Right Corner */}
      <div className="absolute top-0 right-0 z-10">
        <button
          onClick={() => setShowPrepForm(true)}
          className="p-2 text-wool-400 hover:text-sage-600 hover:bg-sage-50 rounded-full transition-all duration-200 group"
          title="Add preparation step"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="group-hover:scale-110 transition-transform">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
        </button>
      </div>

      {/* Compact Header */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-wool-700">Choose Pattern</h2>
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

        {selectedQuickCategory && (
          <div className="border-t border-wool-200 pt-4">
            <div className="grid grid-cols-2 gap-3">
              {PATTERN_CATEGORIES[selectedQuickCategory].patterns.map(pattern => (
                <button
                  key={pattern.name}
                  onClick={() => handlePatternSelect(selectedQuickCategory, pattern)}
                  className="p-3 border border-wool-200 rounded-lg transition-all duration-200 text-center bg-wool-50 text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm"
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