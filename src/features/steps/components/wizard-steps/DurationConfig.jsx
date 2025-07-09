import React from 'react';

const DurationConfig = ({ wizardData, updateWizardData }) => {
  if (wizardData.stitchPattern.pattern === 'Cast On') {
    return null; // Cast On doesn't need duration
  }

  // NEW: Check if pattern has repeats defined
  const hasPatternRepeats = () => {
    // For patterns that MUST have repeats defined
    const mustHaveRepeats = ['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'];
    if (mustHaveRepeats.includes(wizardData.stitchPattern.pattern)) {
      return wizardData.stitchPattern.rowsInPattern && parseInt(wizardData.stitchPattern.rowsInPattern) > 0;
    }
    
    // For Basic/Rib/Textured patterns, check if user defined repeats
    if (wizardData.stitchPattern.pattern && wizardData.stitchPattern.rowsInPattern) {
      return parseInt(wizardData.stitchPattern.rowsInPattern) > 0;
    }
    
    return false;
  };

  const patternHasRepeats = hasPatternRepeats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">How Long?</h2>
        <p className="text-sm text-gray-600 mb-4">Specify the duration for this pattern section</p>
      </div>

      {/* Bind Off - Just stitch count */}
      {wizardData.stitchPattern.pattern === 'Bind Off' ? (
        <div>
          <input
            type="number"
            value={wizardData.duration.value}
            onChange={(e) => updateWizardData('duration', { value: e.target.value, type: 'stitches' })}
            placeholder="leave blank for all stitches"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to bind off all remaining stitches
          </p>
        </div>
      ) : (
        /* Regular patterns - duration selection */
        <div className="space-y-4">
          {/* Duration Type Selection */}
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => updateWizardData('duration', { type: 'rows' })}
              className={`p-4 rounded-lg border transition-colors text-left ${
                wizardData.duration.type === 'rows'
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="font-medium">📊 Specific Number of Rows</div>
              <div className="text-sm text-gray-600">e.g., "for 40 rows"</div>
            </button>
            
            <button
              onClick={() => updateWizardData('duration', { type: 'measurement' })}
              className={`p-4 rounded-lg border transition-colors text-left ${
                wizardData.duration.type === 'measurement'
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="font-medium">📏 Until Measurement</div>
              <div className="text-sm text-gray-600">e.g., "for 5 inches" (gauge learning)</div>
            </button>
            
            {/* NEW: Pattern Repeats option - only show if pattern has repeats defined */}
            {patternHasRepeats && (
              <button
                onClick={() => updateWizardData('duration', { type: 'repeats' })}
                className={`p-4 rounded-lg border transition-colors text-left ${
                  wizardData.duration.type === 'repeats'
                    ? 'border-purple-500 bg-purple-50 text-purple-900'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="font-medium">🔄 Number of Repeats</div>
                <div className="text-sm text-gray-600">
                  Repeat the {wizardData.stitchPattern.rowsInPattern}-row pattern X times
                </div>
              </button>
            )}
          </div>

          {/* Value Input */}
          {wizardData.duration.type && (
            <div className="pt-4 border-t border-gray-200">
              {wizardData.duration.type === 'measurement' ? (
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.25"
                    value={wizardData.duration.value}
                    onChange={(e) => updateWizardData('duration', { value: e.target.value })}
                    placeholder="5"
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                  />
                  <select
                    value={wizardData.duration.units}
                    onChange={(e) => updateWizardData('duration', { units: e.target.value })}
                    className="border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="inches">inches</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
              ) : wizardData.duration.type === 'repeats' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Repeats
                  </label>
                  <input
                    type="number"
                    value={wizardData.duration.value}
                    onChange={(e) => updateWizardData('duration', { value: e.target.value })}
                    placeholder="5"
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will work the {wizardData.stitchPattern.rowsInPattern}-row pattern {wizardData.duration.value || 'X'} times 
                    ({(parseInt(wizardData.stitchPattern.rowsInPattern) || 0) * (parseInt(wizardData.duration.value) || 0)} total rows)
                  </p>
                </div>
              ) : (
                <input
                  type="number"
                  value={wizardData.duration.value}
                  onChange={(e) => updateWizardData('duration', { value: e.target.value })}
                  placeholder={wizardData.duration.type === 'rows' ? '40' : '5'}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                />
              )}
            </div>
          )}

          {/* REMOVED: Pattern Summary box - was redundant with Number of Repeats info */}
        </div>
      )}
    </div>
  );
};

export default DurationConfig;