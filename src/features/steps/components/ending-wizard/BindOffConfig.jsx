// File used for FINISHING COMPONENTS

import React from 'react';

const BindOffConfig = ({ endingData, setEndingData, currentStitches, isFinishingComponent = false }) => {
  const methods = [
    {
      id: 'standard',
      name: 'Standard Bind-Off',
      icon: '✂️',
      description: 'Basic bind off, most common'
    },
    {
      id: 'stretchy',
      name: 'Stretchy Bind-Off',
      icon: '🌊',
      description: 'Extra stretch for ribbing'
    },
    {
      id: 'picot',
      name: 'Picot Bind-Off',
      icon: '🌸',
      description: 'Decorative scalloped edge'
    },
    {
      id: 'other',
      name: 'Other Method',
      icon: '📝',
      description: 'Specify your own'
    }
  ];

  return (
    <div className="stack-lg">
      <div>
        <h2 className="content-header-primary">Bind Off Method</h2>
        <p className="content-subheader">
          {isFinishingComponent
            ? `How do you want to finish these ${currentStitches} stitches?`
            : 'Choose your bind off method'
          }
        </p>
      </div>

      {/* Smart Stitch Count Display/Input */}
      <div className="success-block">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-sage-700">Stitches to Bind Off</h3>
            <p className="text-xs text-sage-600 mt-1">
              {isFinishingComponent
                ? 'Finishing the entire component'
                : 'You can adjust this number if needed'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-sage-700">{endingData.stitchCount || currentStitches}</div>
            <div className="text-xs text-sage-600">stitches</div>
          </div>
        </div>

        {/* Only show input if NOT finishing component (for partial bind-offs) */}
        {!isFinishingComponent && (
          <input
            type="number"
            value={endingData.stitchCount || ''}
            onChange={(e) => setEndingData(prev => ({ ...prev, stitchCount: e.target.value }))}
            placeholder={currentStitches.toString()}
            min="1"
            max={currentStitches}
            className="w-full border-2 border-sage-300 rounded-lg px-3 py-2 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
          />
        )}
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
              onClick={() => setEndingData(prev => ({ ...prev, method: method.id }))}
              className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${endingData.method === method.id
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
      {endingData.method === 'other' && (
        <div>
          <label className="form-label">
            Describe Your Bind Off Method
          </label>
          <input
            type="text"
            value={endingData.customMethod || ''}
            onChange={(e) => setEndingData(prev => ({ ...prev, customMethod: e.target.value }))}
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
          {isFinishingComponent && (
            <div>• <strong>Finishing:</strong> This will complete your {endingData.stitchCount || currentStitches}-stitch component</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BindOffConfig;