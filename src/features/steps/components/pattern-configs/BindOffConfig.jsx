import React from 'react';
import { getBindOffMethodsArray } from '../../../shared/utils/constants';

const BindOffConfig = ({ wizardData, updateWizardData, construction, mode = 'create' }) => {
  const handleMethodSelect = (method) => {
    updateWizardData('stitchPattern', { method });
  };

  // Get base methods from constants
  const baseMethods = getBindOffMethodsArray();

  // Add UI-specific descriptions
  const methodDescriptions = {
    'standard': 'Basic bind off, most common',
    'stretchy': 'Extra stretch for ribbing',
    'sewn': 'Soft, stretchy finish',
    'picot': 'Decorative scalloped edge',
    'three_needle': 'Joins two pieces together',
    'other': 'Specify your own'
  };

  // Merge constants with descriptions
  const methods = baseMethods.map(method => ({
    ...method,
    description: methodDescriptions[method.id] || ''
  }));

  return (
    <div className="stack-lg">
      <div>
        <h3 className="content-header-secondary mb-3">Bind Off Method</h3>
        <p className="content-subheader">How do you want to finish these stitches?</p>
      </div>

      {/* Stitch Count Input */}
      <div>
        <label className="form-label">
          Number of Stitches to Bind Off
        </label>
        <input
          type="number"
          value={wizardData.stitchPattern.stitchCount || ''}
          onChange={(e) => updateWizardData('stitchPattern', { stitchCount: e.target.value })}
          placeholder="Leave blank for all stitches"
          min="1"
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
        />
        <p className="text-xs text-wool-500 mt-2">
          Leave blank to bind off all remaining stitches
        </p>
      </div>

      {/* Method Selection - Grid Layout */}
      <div>
        <label className="form-label">
          Bind Off Method (optional)
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
            Describe Your Bind Off Method
          </label>
          <input
            type="text"
            value={wizardData.stitchPattern.customText || ''}
            onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
            placeholder="e.g., Jeny's surprisingly stretchy bind off"
            className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
          />
        </div>
      )}

      {/* Helpful Info */}
      <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Bind Off Tips</h4>
        <div className="text-sm text-yarn-600 space-y-1">
          <div>• <strong>Standard:</strong> Works for most situations</div>
          <div>• <strong>Stretchy:</strong> Essential for necklines and cuffs</div>
          <div>• <strong>Three Needle:</strong> Great for shoulder seams</div>
          <div>• <strong>Put on Holder:</strong> When you'll graft or pick up later</div>
        </div>
      </div>
    </div>
  );
};

export default BindOffConfig;