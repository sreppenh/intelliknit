import React from 'react';

const CastOnConfig = ({ wizardData, updateWizardData, construction, mode = 'create' }) => {
  const handleMethodSelect = (method) => {
    updateWizardData('stitchPattern', { method });
  };

  const methods = [
    {
      id: 'long_tail',
      name: 'Long Tail',
      icon: '🪢',
      description: 'Most common, stretchy edge'
    },
    {
      id: 'cable',
      name: 'Cable Cast On',
      icon: '🔗',
      description: 'Firm, decorative edge'
    },
    {
      id: 'provisional',
      name: 'Provisional',
      icon: '📎',
      description: 'Removable, for later picking up'
    },
    {
      id: 'german_twisted',
      name: 'German Twisted',
      icon: '🌀',
      description: 'Very stretchy, great for ribbing'
    },
    {
      id: 'backward_loop',
      name: 'Backward Loop',
      icon: '↪️',
      description: 'Quick and simple'
    },
    {
      id: 'other',
      name: 'Other Method',
      icon: '📝',
      description: 'Specify your own'
    }
  ];

  return (
    <div className="stack-lg">
      <div>
        <h3 className="content-header-secondary mb-3">Cast On Method</h3>
        <p className="content-subheader">Choose your preferred cast on technique</p>
      </div>

      {/* Stitch Count Input */}
      <div>
        <label className="form-label">
          Number of Stitches to Cast On
        </label>
        <input
          type="number"
          value={wizardData.stitchPattern.stitchCount || ''}
          onChange={(e) => updateWizardData('stitchPattern', { stitchCount: e.target.value })}
          placeholder="e.g., 80"
          min="1"
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
        />
      </div>

      {/* Method Selection - Grid Layout */}
      <div>
        <label className="form-label">
          Cast On Method (optional)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {methods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.id)}
              className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${wizardData.stitchPattern.method === method.id
                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                }`}
            >
              <div className="text-2xl mb-2">{method.icon}</div>
              <div className="font-semibold text-sm mb-1">{method.name}</div>
              <div className="text-xs opacity-75">{method.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Method Input */}
      {wizardData.stitchPattern.method === 'other' && (
        <div>
          <label className="form-label">
            Describe Your Cast On Method
          </label>
          <input
            type="text"
            value={wizardData.stitchPattern.customText || ''}
            onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
            placeholder="e.g., Italian cast on, Judy's magic cast on"
            className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
          />
        </div>
      )}

      {/* Helpful Info */}
      <div className="success-block">
        <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 Cast On Tips</h4>
        <div className="text-sm text-sage-600 space-y-1">
          <div>• <strong>Long Tail:</strong> Most versatile, good for most projects</div>
          <div>• <strong>Cable:</strong> Best for edges that need structure</div>
          <div>• <strong>German Twisted:</strong> Perfect for ribbed edges</div>
          <div>• <strong>Provisional:</strong> When you'll pick up stitches later</div>
        </div>
      </div>
    </div>
  );
};

export default CastOnConfig;