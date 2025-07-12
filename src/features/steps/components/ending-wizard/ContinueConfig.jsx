import React from 'react';

const ContinueConfig = ({ endingData, setEndingData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">Continue To What?</h2>
        <p className="text-wool-500 mb-4">Describe what section comes next</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-wool-700 mb-3 text-left">
          Next Section Description
        </label>
        <input
          type="text"
          value={endingData.customText || ''}
          onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
          placeholder="e.g., sleeve decreases, neckline shaping, collar"
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
        />
      </div>

      {/* Helpful examples */}
      <div className="bg-sage-100 border-2 border-sage-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 Examples</h4>
        <div className="text-sm text-sage-600 space-y-1">
          <div>• Sleeve decreases for armhole shaping</div>
          <div>• Neckline shaping and collar pickup</div>
          <div>• Cable panel transition to ribbing</div>
          <div>• Short row heel turn</div>
        </div>
      </div>
    </div>
  );
};

export default ContinueConfig;