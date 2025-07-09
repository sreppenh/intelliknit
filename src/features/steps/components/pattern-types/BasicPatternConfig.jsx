import React from 'react';

const BasicPatternConfig = ({ wizardData, updateWizardData }) => {
  const needsRowInput = ['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'].includes(wizardData.stitchPattern.pattern);
  const isCustomPattern = wizardData.stitchPattern.pattern === 'Custom pattern';
  const isOtherPattern = wizardData.stitchPattern.pattern === 'Other';
  
  // NEW: Check if this is a Basic/Rib/Textured pattern that can have optional repeats
  const canHaveOptionalRepeats = () => {
    if (!wizardData.stitchPattern.category) return false;
    return ['basic', 'rib', 'textured'].includes(wizardData.stitchPattern.category);
  };

  return (
    <div className="space-y-4">
      {/* Lace/Cable/Colorwork - Required row input */}
      {needsRowInput && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rows in Pattern *
          </label>
          <input
            type="number"
            value={wizardData.stitchPattern.rowsInPattern}
            onChange={(e) => updateWizardData('stitchPattern', { rowsInPattern: e.target.value })}
            placeholder="6"
            min="1"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Required for this pattern type
          </p>
        </div>
      )}

      {/* NEW: Basic/Rib/Textured - Optional repeat input */}
      {canHaveOptionalRepeats() && !needsRowInput && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pattern Repeat (optional)
          </label>
          <input
            type="number"
            value={wizardData.stitchPattern.rowsInPattern}
            onChange={(e) => updateWizardData('stitchPattern', { rowsInPattern: e.target.value })}
            placeholder="e.g., 6 for stockinette with bobble every 6th row"
            min="1"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank for simple patterns, or enter the number of rows in your pattern repeat
          </p>
        </div>
      )}

      {/* Custom pattern input */}
      {isCustomPattern && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pattern Description
          </label>
          <input
            type="text"
            value={wizardData.stitchPattern.customText}
            onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
            placeholder="e.g., '5 rows stockinette, 1 bobble row'"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}

      {/* Other pattern input */}
      {isOtherPattern && (
        <input
          type="text"
          value={wizardData.stitchPattern.customText}
          onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
          placeholder="Describe your stitch pattern..."
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
        />
      )}
    </div>
  );
};

export default BasicPatternConfig;