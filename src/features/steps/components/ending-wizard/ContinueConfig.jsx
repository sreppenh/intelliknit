import React from 'react';

const ContinueConfig = ({ endingData, setEndingData }) => {
  return (
    <div className="stack-lg">
      <div>
        <h2 className="content-header-primary">Continue To What?</h2>
        <p className="content-subheader">Describe what section comes next</p>
      </div>

      <div>
        <label className="form-label">
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
      <div className="success-block">
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