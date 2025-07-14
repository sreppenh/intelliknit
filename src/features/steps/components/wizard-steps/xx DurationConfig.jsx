import React from 'react';

const DurationConfig = ({ wizardData, updateWizardData }) => {
  const patternHasRepeats = wizardData.stitchPattern.rowsInPattern && 
                           parseInt(wizardData.stitchPattern.rowsInPattern) > 0;

  const handleDurationTypeSelect = (type) => {
    updateWizardData('duration', { type, value: '' });
  };

  return (
    <div className="stack-lg">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">How Long?</h2>
        <p className="text-wool-500 mb-4">Choose how you want to specify the duration</p>
      </div>

      {/* Bind Off - Special case */}
      {wizardData.stitchPattern.pattern === 'Bind Off' ? (
        <div className="stack-lg">
          <div className="success-block">
            <div className="text-center">
              <div className="text-2xl mb-2">✂️</div>
              <h3 className="text-lg font-semibold text-sage-700 mb-2">Bind Off Stitches</h3>
              <p className="text-sm text-sage-600">Specify how many stitches to bind off</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-wool-700 mb-3">
              Number of Stitches to Bind Off
            </label>
            <input
              type="number"
              value={wizardData.duration.value}
              onChange={(e) => updateWizardData('duration', { value: e.target.value, type: 'stitches' })}
              placeholder="Leave blank for all stitches"
              className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
            />
            <p className="text-xs text-wool-500 mt-2">
              Leave blank to bind off all remaining stitches
            </p>
          </div>
        </div>
      ) : (
        /* Normal Duration Selection */
        <div className="stack-lg">
          {/* Duration Type Selection - Visual Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Rows Option */}
            <button
              onClick={() => handleDurationTypeSelect('rows')}
              className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                wizardData.duration.type === 'rows'
                  ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                  : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
              }`}
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-sm">Rows</div>
              <div className="text-xs opacity-75">Count rows</div>
            </button>

            {/* Measurement Option */}
            <button
              onClick={() => handleDurationTypeSelect('measurement')}
              className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                wizardData.duration.type === 'measurement'
                  ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                  : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
              }`}
            >
              <div className="text-2xl mb-2">📏</div>
              <div className="font-semibold text-sm">Length</div>
              <div className="text-xs opacity-75">Measure inches/cm</div>
            </button>

            {/* Pattern Repeats - only show if pattern has repeats */}
            {patternHasRepeats && (
              <>
                <button
                  onClick={() => handleDurationTypeSelect('repeats')}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                    wizardData.duration.type === 'repeats'
                      ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
                      : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-2">🔄</div>
                  <div className="font-semibold text-sm">Repeats</div>
                  <div className="text-xs opacity-75">{wizardData.stitchPattern.rowsInPattern}-row pattern</div>
                </button>

                {/* Until Length - special combination option */}
                <button
                  onClick={() => handleDurationTypeSelect('until_length')}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                    wizardData.duration.type === 'until_length'
                      ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
                      : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-2">📐</div>
                  <div className="font-semibold text-sm">Until Length</div>
                  <div className="text-xs opacity-75">Repeat until measurement</div>
                </button>
              </>
            )}
          </div>

          {/* Value Input Based on Selection */}
          {wizardData.duration.type && (
            <div className="space-y-4">
              <div className="bg-sage-50 border border-sage-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-sage-700 mb-3">
                  {wizardData.duration.type === 'rows' && '📊 Number of Rows'}
                  {wizardData.duration.type === 'measurement' && '📏 Target Length'}
                  {wizardData.duration.type === 'repeats' && '🔄 Number of Repeats'}
                  {wizardData.duration.type === 'until_length' && '📐 Work Until Length'}
                </h4>
                
                {wizardData.duration.type === 'measurement' || wizardData.duration.type === 'until_length' ? (
                  <div className="flex gap-3">
                    <input
                      type="number"
                      step="0.25"
                      value={wizardData.duration.value}
                      onChange={(e) => updateWizardData('duration', { value: e.target.value })}
                      placeholder="5"
                      className="flex-1 border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                    />
                    <select
                      value={wizardData.duration.units}
                      onChange={(e) => updateWizardData('duration', { units: e.target.value })}
                      className="border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                    >
                      <option value="inches">inches</option>
                      <option value="cm">cm</option>
                    </select>
                  </div>
                ) : wizardData.duration.type === 'repeats' ? (
                  <div>
                    <input
                      type="number"
                      value={wizardData.duration.value}
                      onChange={(e) => updateWizardData('duration', { value: e.target.value })}
                      placeholder="5"
                      min="1"
                      className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                    />
                    <p className="text-xs text-yarn-600 mt-2 bg-yarn-50 rounded-lg p-2">
                      <strong>Preview:</strong> This will work the {wizardData.stitchPattern.rowsInPattern}-row pattern {wizardData.duration.value || 'X'} times 
                      ({(parseInt(wizardData.stitchPattern.rowsInPattern) || 0) * (parseInt(wizardData.duration.value) || 0)} total rows)
                    </p>
                  </div>
                ) : (
                  <input
                    type="number"
                    value={wizardData.duration.value}
                    onChange={(e) => updateWizardData('duration', { value: e.target.value })}
                    placeholder={wizardData.duration.type === 'rows' ? '40' : '5'}
                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                  />
                )}
              </div>

              {/* Helpful context */}
              {wizardData.duration.type === 'rows' && (
                <div className="warning-block">
                  <p className="text-xs text-wool-600">
                    💡 <strong>Tip:</strong> This is the total number of rows to work for this section.
                  </p>
                </div>
              )}

              {wizardData.duration.type === 'measurement' && (
                <div className="warning-block">
                  <p className="text-xs text-wool-600">
                    💡 <strong>Tip:</strong> IntelliKnit will calculate the approximate rows needed based on your gauge.
                  </p>
                </div>
              )}

              {wizardData.duration.type === 'until_length' && (
                <div className="bg-yarn-100 border border-yarn-200 rounded-lg p-3">
                  <p className="text-xs text-yarn-600">
                    💡 <strong>Smart Choice:</strong> Work full pattern repeats until you reach the target length. No partial patterns!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DurationConfig;