import React from 'react';

const OtherEndingConfig = ({ endingData, setEndingData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">Describe Your Ending</h2>
        <p className="text-wool-500 mb-4">What happens to complete this component?</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-wool-700 mb-3 text-left">
          Ending Description
        </label>
        <textarea
          value={endingData.customText || ''}
          onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
          placeholder="Describe how this component ends..."
          rows={4}
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white resize-none"
        />
      </div>

      {/* Helpful examples */}
      <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Examples</h4>
        <div className="text-sm text-yarn-600 space-y-1">
          <div>• Transfer stitches to circular needle for next section</div>
          <div>• Place markers for button band pickup</div>
          <div>• Divide stitches equally onto two needles</div>
          <div>• Special cast off sequence for lace pattern</div>
        </div>
      </div>
    </div>
  );
};

export default OtherEndingConfig;