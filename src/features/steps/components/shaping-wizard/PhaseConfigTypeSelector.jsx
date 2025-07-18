// src/features/steps/components/shaping-wizard/PhaseConfigTypeSelector.jsx
import React from 'react';

const PhaseConfigTypeSelector = ({ 
  phaseTypes,
  onTypeSelect,
  onBackToSummary
}) => {
  return (
    <div className="p-6 stack-lg">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3 text-left">Choose Phase Type</h2>
        <p className="text-wool-500 mb-4 text-left">What kind of shaping do you want to add?</p>
      </div>

      {/* Phase Type Grid */}
      <div className="grid-2-equal">
        {phaseTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeSelect(type.id)}
            className="card-selectable text-left"
          >
            <div className="text-2xl mb-2">{type.icon}</div>
            <div className="font-semibold text-wool-700 text-sm">{type.name}</div>
            <div className="text-xs text-wool-500">{type.description}</div>
          </button>
        ))}
      </div>

      {/* Back Button */}
      <div className="pt-4">
        <button
          onClick={onBackToSummary}
          className="btn-tertiary w-full"
        >
          ← Back to Summary
        </button>
      </div>
    </div>
  );
};

export default PhaseConfigTypeSelector;