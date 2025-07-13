import React from 'react';
import BasicPatternConfig from '../pattern-types/BasicPatternConfig';
import CastOnConfig from '../pattern-types/CastOnConfig';
import BindOffConfig from '../pattern-types/BindOffConfig';

const STITCH_PATTERNS = {
  basic: { 
    name: 'Basic Stitches', 
    icon: '📐',
    patterns: [
      { name: 'Stockinette', icon: '⬜', desc: 'Classic smooth fabric', complexity: 'simple' },
      { name: 'Garter', icon: '〰️', desc: 'Bumpy, stretchy texture', complexity: 'simple' },
      { name: 'Reverse Stockinette', icon: '⬛', desc: 'Purl side showing', complexity: 'simple' },
      { name: 'Seed Stitch', icon: '🌱', desc: 'Bumpy alternating texture', complexity: 'simple' },
      { name: 'Moss Stitch', icon: '🍃', desc: 'British seed stitch', complexity: 'simple' }
    ]
  },
  rib: { 
    name: 'Ribbing', 
    icon: '〰️',
    patterns: [
      { name: '1x1 Rib', icon: '|||', desc: 'K1, P1 alternating', complexity: 'simple' },
      { name: '2x2 Rib', icon: '||||', desc: 'K2, P2 alternating', complexity: 'simple' },
      { name: '2x1 Rib', icon: '||', desc: 'K2, P1 alternating', complexity: 'simple' },
      { name: '3x3 Rib', icon: '||||||', desc: 'K3, P3 alternating', complexity: 'simple' },
      { name: 'Twisted Rib', icon: '🌀', desc: 'Twisted knit stitches', complexity: 'simple' },
      { name: 'Fisherman\'s Rib', icon: '🎣', desc: 'Chunky brioche-like texture', complexity: 'simple' }
    ]
  },
  lace: { 
    name: 'Lace Patterns', 
    icon: '🕸️',
    patterns: [
      { name: 'Lace Pattern', icon: '🕸️', desc: 'Openwork with YOs and decreases', complexity: 'complex' }
    ]
  },
  cable: { 
    name: 'Cable Patterns', 
    icon: '🔗',
    patterns: [
      { name: 'Cable Pattern', icon: '🔗', desc: 'Twisted rope-like cables', complexity: 'complex' }
    ]
  },
  colorwork: { 
    name: 'Colorwork', 
    icon: '🌈',
    patterns: [
      { name: 'Fair Isle', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', desc: 'Stranded colorwork', complexity: 'complex' },
      { name: 'Intarsia', icon: '🎨', desc: 'Large color blocks', complexity: 'complex' },
      { name: 'Stripes', icon: '🌈', desc: 'Horizontal color bands', complexity: 'complex' }
    ]
  },
  custom: {
    name: 'Custom Patterns',
    icon: '📝',
    patterns: [
      { name: 'Custom Pattern', icon: '📝', desc: 'Define your own pattern', complexity: 'custom' }
    ]
  },
  special: {
    name: 'Special',
    icon: '⭐',
    patterns: [
      { name: 'Cast On', icon: '🏗️', desc: 'Start from scratch', complexity: 'special' },
      { name: 'Bind Off', icon: '✂️', desc: 'Finish stitches', complexity: 'special' }
    ]
  }
};

// NEW: Dynamic step flow logic
const getPatternStepFlow = (category, pattern) => {
  if (!pattern) return ['pattern-selection'];
  
  // Special patterns have their own flows
  if (pattern === 'Cast On') {
    return ['pattern-selection', 'cast-on-config'];
  }
  
  if (pattern === 'Bind Off') {
    return ['pattern-selection', 'bind-off-config'];
  }
  
  // Get pattern complexity
  const patternData = STITCH_PATTERNS[category]?.patterns?.find(p => p.name === pattern);
  const complexity = patternData?.complexity || 'simple';
  
  switch (complexity) {
    case 'simple':
      return ['pattern-selection', 'duration-choice'];
      
    case 'medium':
      return ['pattern-selection', 'pattern-config', 'duration-choice'];
      
    case 'complex':
      return ['pattern-selection', 'pattern-config', 'duration-choice'];
      
    case 'custom':
      return ['pattern-selection', 'custom-definition', 'pattern-config', 'duration-choice'];
      
    default:
      return ['pattern-selection', 'duration-choice'];
  }
};

const getStepName = (stepKey) => {
  const stepNames = {
    'pattern-selection': 'Choose Pattern',
    'cast-on-config': 'Cast On Setup',
    'bind-off-config': 'Bind Off Setup', 
    'custom-definition': 'Define Pattern',
    'pattern-config': 'Pattern Details',
    'duration-choice': 'How Long'
  };
  return stepNames[stepKey] || 'Configuration';
};

export const PatternDetails = ({ wizardData, updateWizardData, canHaveShaping, navigation }) => {
  if (!wizardData.stitchPattern.category) {
    return null;
  }

  const category = STITCH_PATTERNS[wizardData.stitchPattern.category];
  const currentPattern = wizardData.stitchPattern.pattern;
  
  // NEW: Calculate dynamic step flow
  const stepFlow = getPatternStepFlow(wizardData.stitchPattern.category, currentPattern);
  const currentStepIndex = stepFlow.findIndex(step => {
    if (!currentPattern) return step === 'pattern-selection';
    if (currentPattern === 'Cast On' && step === 'cast-on-config') return true;
    if (currentPattern === 'Bind Off' && step === 'bind-off-config') return true;
    if (step === 'custom-definition' && currentPattern === 'Other') return true;
    if (step === 'pattern-config') return wizardData.stitchPattern.pattern && !wizardData.stitchPattern.customText && currentPattern !== 'Cast On' && currentPattern !== 'Bind Off';
    if (step === 'duration-choice') return wizardData.stitchPattern.pattern && (wizardData.stitchPattern.customText || ['Stockinette', 'Garter', 'Reverse Stockinette', '1x1 Rib', '2x2 Rib', 'Seed Stitch'].includes(currentPattern));
    return false;
  });
  
  const actualCurrentStep = Math.max(0, currentStepIndex);
  const currentStepKey = stepFlow[actualCurrentStep] || 'pattern-selection';
  const totalSteps = stepFlow.length;

  const handleBackToCategories = () => {
    updateWizardData('stitchPattern', { category: null, pattern: null });
  };

  const handlePatternSelect = (pattern) => {
    updateWizardData('stitchPattern', { 
      pattern: pattern.name,
      customText: '',
      rowsInPattern: '',
      method: ''
    });
  };

  const canGoBack = () => {
    return currentStepKey !== 'pattern-selection';
  };

  const handleStepBack = () => {
    if (currentStepKey === 'duration-choice') {
      // Go back based on flow
      if (stepFlow.includes('pattern-config')) {
        updateWizardData('stitchPattern', { rowsInPattern: '', customText: '' });
      } else if (stepFlow.includes('custom-definition')) {
        updateWizardData('stitchPattern', { customText: '' });
      } else {
        updateWizardData('stitchPattern', { pattern: null });
      }
    } else if (currentStepKey === 'pattern-config' || currentStepKey === 'cast-on-config' || currentStepKey === 'bind-off-config') {
      updateWizardData('stitchPattern', { pattern: null });
    } else if (currentStepKey === 'custom-definition') {
      updateWizardData('stitchPattern', { pattern: null });
    }
  };

  const renderCurrentStep = () => {
    switch (currentStepKey) {
      case 'pattern-selection':
        return (
          <div className="stack-lg">
            <div>
              <h2 className="text-xl font-semibold text-wool-700 mb-3">Choose Pattern</h2>
              <p className="text-wool-500 mb-4">Select your specific {category.name.toLowerCase()} pattern</p>
            </div>

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
          </div>
        );

      case 'cast-on-config':
        return (
          <div className="stack-lg">
            <div>
              <h2 className="text-xl font-semibold text-wool-700 mb-3">Cast On Setup</h2>
              <p className="text-wool-500 mb-4">Configure your cast on method and stitch count</p>
            </div>
            <CastOnConfig 
              wizardData={wizardData} 
              updateWizardData={updateWizardData}
            />
          </div>
        );

      case 'bind-off-config':
        return (
          <div className="stack-lg">
            <div>
              <h2 className="text-xl font-semibold text-wool-700 mb-3">Bind Off Setup</h2>
              <p className="text-wool-500 mb-4">Choose how to finish these stitches</p>
            </div>
            <BindOffConfig 
              wizardData={wizardData} 
              updateWizardData={updateWizardData}
            />
          </div>
        );

      case 'custom-definition':
        return (
          <div className="stack-lg">
            <div>
              <h2 className="text-xl font-semibold text-wool-700 mb-3">Define Your Pattern</h2>
              <p className="text-wool-500 mb-4">Describe your custom pattern with any repeats or special instructions</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                Pattern Description
              </label>
              <textarea
                value={wizardData.stitchPattern.customText || ''}
                onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
                placeholder="e.g., 4 rows stockinette, 2 rows garter, repeat"
                rows={3}
                className="input-field-lg resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                Rows in Pattern Repeat (optional)
              </label>
              <input
                type="number"
                value={wizardData.stitchPattern.rowsInPattern || ''}
                onChange={(e) => updateWizardData('stitchPattern', { rowsInPattern: e.target.value })}
                placeholder="e.g., 6 for a 6-row repeat"
                min="1"
                className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
              />
              <p className="text-xs text-wool-500 mt-2">
                Enter the number of rows in one complete pattern repeat
              </p>
            </div>

            <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Custom Pattern Tips</h4>
              <div className="text-sm text-yarn-600 space-y-1">
                <div>• Describe row sequences clearly (e.g., "3 stockinette, 1 purl")</div>
                <div>• Include repeat information for pattern tracking</div>
                <div>• Note any special techniques or stitch combinations</div>
              </div>
            </div>
          </div>
        );

      case 'pattern-config':
        return (
          <div className="stack-lg">
            <div>
              <h2 className="text-xl font-semibold text-wool-700 mb-3">Pattern Details</h2>
              <p className="text-wool-500 mb-4">Configure your {currentPattern}</p>
            </div>
            
            <BasicPatternConfig 
              wizardData={wizardData} 
              updateWizardData={updateWizardData}
            />
          </div>
        );

      case 'duration-choice':
        return (
          <div className="stack-lg">
            <div>
              <h2 className="text-xl font-semibold text-wool-700 mb-3">How Long?</h2>
              <p className="text-wool-500 mb-4">Choose how you want to work this pattern</p>
            </div>

            {/* Show repeat option only if pattern has repeats */}
            {wizardData.stitchPattern.rowsInPattern && parseInt(wizardData.stitchPattern.rowsInPattern) > 0 && (
              <div className="success-block mb-4">
                <h4 className="text-sm font-semibold text-sage-700 mb-2">🔄 Pattern Repeat Detected</h4>
                <p className="text-sm text-sage-600">
                  This pattern has a {wizardData.stitchPattern.rowsInPattern}-row repeat. 
                  You can work specific number of repeats or set duration.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateWizardData('hasShaping', false)}
                className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                  wizardData.hasShaping === false
                    ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                    : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                }`}
              >
                <div className="text-2xl mb-2">⏱️</div>
                <div className="font-semibold text-sm mb-1">Set Duration</div>
                <div className="text-xs opacity-75">Work for specific length</div>
              </button>

              <button
                onClick={() => updateWizardData('hasShaping', true)}
                className={`p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                  wizardData.hasShaping === true
                    ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                    : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                }`}
              >
                <div className="text-2xl mb-2">📏</div>
                <div className="font-semibold text-sm mb-1">Add Shaping</div>
                <div className="text-xs opacity-75">Include increases/decreases</div>
              </button>
            </div>

            <div className="bg-wool-100 border border-wool-200 rounded-lg p-3">
              <p className="text-xs text-wool-600 text-center">
                💡 <strong>Note:</strong> Shaping features are coming soon! For now, choose "Set Duration"
              </p>
            </div>
          </div>
        );

      default:
        return <div>Step not implemented yet</div>;
    }
  };

  return (
    <div className="stack-lg">
      {renderCurrentStep()}
    </div>
  );
};

export default PatternDetails;