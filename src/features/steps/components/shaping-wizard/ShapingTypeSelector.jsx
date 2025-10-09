import React from 'react';
import ShapingHeader from './ShapingHeader';


const ShapingTypeSelector = ({ onTypeSelect, onCancel, currentStitches, construction, onBack, onGoToLanding, wizard }) => {
  const shapingTypes = [
    {
      id: 'even_distribution',
      name: 'Even Distribution',
      icon: '⚖️',
      description: `Distribute increases/decreases evenly across ${construction === 'round' ? 'round' : 'row'}`,
      examples: 'Yoke shaping, hat crowns'
    },
    {
      id: 'marker_phases',
      name: 'Marker Phases',
      icon: '📍',
      description: 'Pattern-based shaping at marker positions',
      examples: 'Raglan shaping, waist shaping, stepped bind-offs',
      comingSoon: false,
      isNew: true
    },
    {
      id: 'bind_off_shaping',
      name: 'Bind-Off Shaping',
      icon: '✂️',
      description: 'Graduated bind-offs for shoulders and necklines',
      examples: 'Shoulder shaping, stepped necklines, armhole finishing',
      comingSoon: false,
      disabledForRound: true  // Add this flag
    },
    {
      id: 'phases',
      name: 'Sequential Phases',
      icon: '📈',
      description: 'Multiple phases with different shaping rates',
      examples: 'Shoulder shaping, armhole curves',
      comingSoon: false
    },
    {
      id: 'single_row_repeat',
      name: 'Single Row Repeat',
      icon: '🔄',
      description: 'Repeated pattern with shaping built in',
      examples: 'Hat decreases, simple tapers',
      comingSoon: true
    }
  ];

  return (
    <div>
      <ShapingHeader
        onBack={onBack}
        onGoToLanding={onGoToLanding}
        wizard={wizard}
        onCancel={onCancel}
      />

      <div className="p-6 stack-lg">
        <div>
          <h2 className="content-header-primary">Choose Shaping Method</h2>
          <p className="content-subheader">How do you want to shape your {currentStitches} stitches?</p>
        </div>

        {/* Shaping Type Cards */}
        <div className="stack-sm">
          {shapingTypes.map((type) => {
            const isDisabled = type.comingSoon || (type.disabledForRound && construction === 'round');

            return (
              <button
                key={type.id}
                onClick={() => !isDisabled && onTypeSelect(type.id)}
                disabled={isDisabled}
                className={`card-selectable w-full text-left ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">{type.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base">{type.name}</h3>
                      {type.isNew && (
                        <span className="text-xs bg-sage-200 text-sage-700 px-2 py-1 rounded-full">
                          New
                        </span>
                      )}
                      {type.comingSoon && (
                        <span className="text-xs bg-wool-200 text-wool-600 px-2 py-1 rounded-full">
                          Coming Soon
                        </span>
                      )}
                      {type.disabledForRound && construction === 'round' && (
                        <span className="text-xs bg-wool-200 text-wool-600 px-2 py-1 rounded-full">
                          Flat Only
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
            );
          })}
        </div>

        {/* Updated Helpful Context */}
        <div className="info-block">
          <h4 className="text-sm font-semibold text-lavender-700 mb-2">💡 Not Sure Which to Choose?</h4>
          <div className="text-sm text-lavender-600 space-y-1">
            <div>• <strong>Even Distribution:</strong> Mathematical spacing for uniform changes</div>
            <div>• <strong>Marker Phases:</strong> Translate published patterns directly</div>
            <div>• <strong>Sequential Phases:</strong> Multi-step mathematical shaping</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShapingTypeSelector;