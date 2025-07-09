import React from 'react';

const ShapingConfig = ({ wizardData, updateWizardData }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Configure Shaping</h2>
        <p className="text-sm text-gray-600 mb-4">Set up your shaping details</p>
      </div>

      <div className="space-y-4">
        {/* Shaping Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shaping Type
          </label>
          <div className="grid grid-cols-4 gap-3">
            {[
              { key: 'regular', label: 'Standard', desc: 'Standard inc/dec' },
              { key: 'raglan', label: 'Raglan', desc: '4-point shaping' },
              { key: 'bindoff', label: 'Bind-Off', desc: 'Remove stitches' },
              { key: 'distribution', label: 'Even', desc: 'Distribute throughout' }
            ].map(mode => (
              <button
                key={mode.key}
                onClick={() => updateWizardData('shapingConfig', { shapingMode: mode.key })}
                className={`p-3 text-center border rounded-lg transition-colors ${
                  wizardData.shapingConfig.shapingMode === mode.key
                    ? 'border-purple-500 bg-purple-50 text-purple-900'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="font-medium">{mode.label}</div>
                <div className="text-xs text-gray-600">{mode.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Regular Shaping Controls */}
        {wizardData.shapingConfig.shapingMode === 'regular' && (
          <div className="space-y-4">
            {/* Increase/Decrease */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['increase', 'decrease'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateWizardData('shapingConfig', { shapingType: type })}
                    className={`p-3 text-center border rounded-lg transition-colors ${
                      wizardData.shapingConfig.shapingType === type
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium capitalize">{type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Positions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'beginning', label: 'Beginning' },
                  { key: 'end', label: 'End' },
                  { key: 'both_ends', label: 'Both Ends' },
                  { key: 'center', label: 'Center' }
                ].map(pos => (
                  <button
                    key={pos.key}
                    onClick={() => updateWizardData('shapingConfig', { positions: [pos.key] })}
                    className={`p-2 text-sm border rounded transition-colors ${
                      wizardData.shapingConfig.positions.includes(pos.key)
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency and Times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Every Nth Row
                </label>
                <select
                  value={wizardData.shapingConfig.frequency}
                  onChange={(e) => updateWizardData('shapingConfig', { frequency: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                >
                  <option value={2}>Every other row</option>
                  <option value={4}>Every 4th row</option>
                  <option value={6}>Every 6th row</option>
                  <option value={8}>Every 8th row</option>
                  <option value={10}>Every 10th row</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Times
                </label>
                <input
                  type="number"
                  value={wizardData.shapingConfig.times}
                  onChange={(e) => updateWizardData('shapingConfig', { times: parseInt(e.target.value) || 1 })}
                  placeholder="6"
                  min="1"
                  max="50"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Raglan Shaping Controls */}
        {wizardData.shapingConfig.shapingMode === 'raglan' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Raglan Shaping</h4>
              <p className="text-xs text-blue-600">
                4-point shaping for raglan sleeves. Decreases occur at all 4 raglan lines simultaneously.
              </p>
            </div>

            {/* Increase/Decrease */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Action
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['increase', 'decrease'].map(type => (
                  <button
                    key={type}
                    onClick={() => updateWizardData('shapingConfig', { shapingType: type })}
                    className={`p-3 text-center border rounded-lg transition-colors ${
                      wizardData.shapingConfig.shapingType === type
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium capitalize">{type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Raglan Frequency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Every Nth Row
                </label>
                <select
                  value={wizardData.shapingConfig.frequency}
                  onChange={(e) => updateWizardData('shapingConfig', { frequency: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                >
                  <option value={2}>Every other row</option>
                  <option value={4}>Every 4th row</option>
                  <option value={6}>Every 6th row</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Times
                </label>
                <input
                  type="number"
                  value={wizardData.shapingConfig.times}
                  onChange={(e) => updateWizardData('shapingConfig', { times: parseInt(e.target.value) || 1 })}
                  placeholder="12"
                  min="1"
                  max="50"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bind-Off Shaping Controls */}
        {wizardData.shapingConfig.shapingMode === 'bindoff' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Stepped Bind-Off</h4>
              <p className="text-xs text-red-600">
                Bind off different numbers of stitches over multiple rows (e.g., armhole shaping).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bind-Off Sequence
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Enter the number of stitches to bind off in each row, separated by commas
              </p>
              <input
                type="text"
                value={wizardData.shapingConfig.bindOffSequence?.join(', ') || ''}
                onChange={(e) => {
                  const sequence = e.target.value
                    .split(',')
                    .map(s => parseInt(s.trim()))
                    .filter(n => !isNaN(n) && n > 0);
                  updateWizardData('shapingConfig', { bindOffSequence: sequence });
                }}
                placeholder="3, 2, 2, 1, 1"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                Example: "3, 2, 2, 1, 1" means bind off 3 sts, then 2 sts, then 2 sts, then 1 st, then 1 st
              </div>
            </div>

            {/* Preview */}
            {wizardData.shapingConfig.bindOffSequence && wizardData.shapingConfig.bindOffSequence.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Sequence Preview:</h5>
                <div className="text-xs text-gray-600">
                  Total stitches to bind off: {wizardData.shapingConfig.bindOffSequence.reduce((sum, n) => sum + n, 0)} over {wizardData.shapingConfig.bindOffSequence.length} rows
                </div>
              </div>
            )}
          </div>
        )}

        {/* Even Distribution Controls */}
        {wizardData.shapingConfig.shapingMode === 'distribution' && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">Even Distribution</h4>
              <p className="text-xs text-green-600">
                Distribute increases or decreases evenly across a single row.
              </p>
            </div>

            {/* Distribution Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distribution Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'change', label: 'Change By', desc: 'Add/remove X stitches' },
                  { key: 'target', label: 'Target Count', desc: 'End with X stitches' }
                ].map(type => (
                  <button
                    key={type.key}
                    onClick={() => updateWizardData('shapingConfig', { distributionType: type.key })}
                    className={`p-3 text-center border rounded-lg transition-colors ${
                      wizardData.shapingConfig.distributionType === type.key
                        ? 'border-purple-500 bg-purple-50 text-purple-900'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-600">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Change/Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {wizardData.shapingConfig.distributionType === 'target' ? 'Target Stitch Count' : 'Stitch Change'}
              </label>
              <input
                type="number"
                value={wizardData.shapingConfig.targetChange}
                onChange={(e) => updateWizardData('shapingConfig', { targetChange: parseInt(e.target.value) || 0 })}
                placeholder={wizardData.shapingConfig.distributionType === 'target' ? '120' : '20'}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                {wizardData.shapingConfig.distributionType === 'target' 
                  ? 'Total stitches you want to end up with'
                  : 'Number of stitches to add (positive) or remove (negative)'
                }
              </div>
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <input
            type="text"
            value={wizardData.shapingConfig.comments || ''}
            onChange={(e) => updateWizardData('shapingConfig', { comments: e.target.value })}
            placeholder="e.g., 'for sleeve taper', 'armhole shaping'"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>
    </div>
  );
};

export default ShapingConfig;