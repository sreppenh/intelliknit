// features/steps/components/pattern-types/CastOnConfig.jsx
import React from 'react';

export const CastOnConfig = ({ wizardData, updateWizardData, methods }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Stitches
        </label>
        <input
          type="number"
          value={wizardData.stitchPattern.stitchCount}
          onChange={(e) => updateWizardData('stitchPattern', { stitchCount: e.target.value })}
          placeholder="78"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cast On Method (optional)
        </label>
        <select
          value={wizardData.stitchPattern.method}
          onChange={(e) => updateWizardData('stitchPattern', { method: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select method (optional)</option>
          {methods.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CastOnConfig;