import React from 'react';

const ShapingTypeSelector = ({ onTypeSelect, currentStitches }) => {
  const shapingTypes = [
    {
      id: 'even_distribution',
      name: 'Even Distribution',
      icon: '⚖️',
      description: 'Distribute increases/decreases evenly across row',
      examples: 'Yoke shaping, hat crowns'
    },
    {
      id: 'phases',
      name: 'Sequential Phases',
      icon: '📈',
      description: 'Multiple phases with different shaping rates',
      examples: 'Shoulder shaping, armhole curves'
    },
    {
      id: 'single_row_repeat',
      name: 'Single Row Repeat',
      icon: '🔄',
      description: 'Repeated pattern with shaping built in',
      examples: 'Hat decreases, simple tapers',
      comingSoon: true
    },
    {
      id: 'marker_based',
      name: 'Marker-Based',
      icon: '📍',
      description: 'Shaping at specific marker positions',
      examples: 'Raglan shaping, center spine increases',
      comingSoon: true
    }
  ];

  return (
    <div className="stack-lg">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">Choose Shaping Method</h2>
        <p className="text-wool-500 mb-4">How do you want to shape your {currentStitches} stitches?</p>
      </div>

      {/* Shaping Type Cards */}
      <div className="stack-sm">
        {shapingTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => !type.comingSoon && onTypeSelect(type.id)}
            disabled={type.comingSoon}
            className={`w-full p-4 border-2 rounded-xl transition-all duration-200 text-left ${
              type.comingSoon
                ? 'border-wool-200 bg-wool-100 text-wool-400 cursor-not-allowed'
                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02] cursor-pointer'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">{type.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">{type.name}</h3>
                  {type.comingSoon && (
                    <span className="text-xs bg-wool-200 text-wool-600 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm opacity-75 mb-2">{type.description}</p>
                <div className="text-xs opacity-60">
                  <span className="font-medium">Examples:</span> {type.examples}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Helpful Context */}
      <div className="info-block">
        <h4 className="text-sm font-semibold text-lavender-700 mb-2">💡 Not Sure Which to Choose?</h4>
        <div className="text-sm text-lavender-600 space-y-1">
          <div>• <strong>Even Distribution:</strong> Best for simple, uniform changes</div>
          <div>• <strong>Sequential Phases:</strong> Best for complex, multi-step shaping</div>
        </div>
      </div>
    </div>
  );
};

export default ShapingTypeSelector;