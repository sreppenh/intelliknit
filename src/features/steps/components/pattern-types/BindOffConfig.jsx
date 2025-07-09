import React from 'react';

const BindOffConfig = ({ wizardData, updateWizardData, methods }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Bind Off Method (optional)
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
  );
};

export default BindOffConfig;