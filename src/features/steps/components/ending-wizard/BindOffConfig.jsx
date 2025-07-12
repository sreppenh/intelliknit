import React from 'react';

const BindOffConfig = ({ endingData, setEndingData }) => {
  const methods = [
    { 
      id: 'standard', 
      name: 'Standard', 
      icon: '✂️',
      description: 'Basic bind off, most common'
    },
    { 
      id: 'stretchy', 
      name: 'Stretchy', 
      icon: '🌊',
      description: 'Extra stretch for ribbing'
    },
    { 
      id: 'picot', 
      name: 'Picot', 
      icon: '🌸',
      description: 'Decorative scalloped edge'
    },
    { 
      id: 'three_needle', 
      name: 'Three Needle', 
      icon: '🔗',
      description: 'Joins two pieces together'
    },
    { 
      id: 'provisional', 
      name: 'Put on Holder', 
      icon: '📎',
      description: 'Keep stitches live for later'
    },
    { 
      id: 'other', 
      name: 'Other Method', 
      icon: '📝',
      description: 'Specify your own'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">Bind Off Method</h2>
        <p className="text-wool-500 mb-4">How do you want to finish these stitches?</p>
      </div>

      {/* Stitch Count Input */}
      <div>
        <label className="block text-sm font-semibold text-wool-700 mb-3">
          Number of Stitches to Bind Off
        </label>
        <input
          type="number"
          value={endingData.stitchCount || ''}
          onChange={(e) => setEndingData(prev => ({ ...prev, stitchCount: e.target.value }))}
          placeholder="Leave blank for all stitches"
          min="1"
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
        />
        <p className="text-xs text-wool-500 mt-2">
          Leave blank to bind off all remaining stitches
        </p>
      </div>

      {/* Method Selection - Oval Radio Buttons */}
      <div>
        <label className="block text-sm font-semibold text-wool-700 mb-3">
          Bind Off Method
        </label>
        <div className="space-y-3">
          {methods.map((method) => (
            <label 
              key={method.id}
              className={`flex items-center cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 ${
                endingData.method === method.id
                  ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                  : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
              }`}
            >
              <input
                type="radio"
                name="bindoff_method"
                value={method.id}
                checked={endingData.method === method.id}
                onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                className="w-4 h-4 text-sage-600 mr-4"
              />
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl">{method.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm opacity-75">{method.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Method Input */}
      {endingData.method === 'other' && (
        <div>
          <label className="block text-sm font-semibold text-wool-700 mb-3 text-left">
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
          <div>• <strong>Put on Holder:</strong> When you'll graft or pick up later</div>
        </div>
      </div>
    </div>
  );
};

export default BindOffConfig;