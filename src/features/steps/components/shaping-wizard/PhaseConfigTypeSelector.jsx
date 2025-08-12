// src/features/steps/components/shaping-wizard/PhaseConfigTypeSelector.jsx
import React from 'react';
import ShapingHeader from './ShapingHeader';

const PhaseConfigTypeSelector = ({
  phaseTypes,
  onTypeSelect,
  onBackToSummary,
  onCancel,
  phases = [], // Add prop to determine back navigation
  phaseNumber,
  onGoToLanding,  // NEW
  wizard          // NEW


}) => {
  return (
    <div>
      <ShapingHeader
        onBack={onBackToSummary}
        onGoToLanding={onGoToLanding}
        wizard={wizard}
        onCancel={onCancel}
      />

      <div className="p-6 stack-lg">
        {/* Header */}
        <div>
          <h2 className="content-header-primary">Phase {phaseNumber}: Choose Phase Type</h2>
          <p className="content-subheader">What kind of shaping do you want to add?</p>
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
        <button
          onClick={onBackToSummary}
          className="btn-tertiary w-full"
        >
          {phases.length === 0 ? '← Back' : '← Back to Summary'}
        </button>
      </div>
    </div>
  );
};

export default PhaseConfigTypeSelector;