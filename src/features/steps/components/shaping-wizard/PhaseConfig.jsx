import React, { useState } from 'react';

const PhaseConfig = ({ 
  shapingData, 
  setShapingData, 
  currentStitches, 
  construction,
  onComplete,
  onBack 
}) => {
  const [phases, setPhases] = useState([]);
  const [description, setDescription] = useState('');

  const handleComplete = () => {
    onComplete({
      phases,
      description,
      totalPhases: phases.length
    });
  };

  return (
    <div className="p-6 stack-lg">
      <div className="text-center">
        <div className="text-2xl mb-2">🚧</div>
        <h2 className="text-xl font-semibold text-wool-700 mb-2">
          Sequential Phases
        </h2>
        <p className="text-wool-500 mb-4">
          This feature is in development! Coming in the next update.
        </p>
      </div>

      <div className="info-block">
        <h4 className="text-sm font-semibold text-lavender-700 mb-2">🔮 Coming Soon</h4>
        <div className="text-sm text-lavender-600 space-y-1">
          <div>• Add multiple phases (bind off, decrease, setup)</div>
          <div>• Configure each phase separately</div>
          <div>• Complex shoulder and armhole shaping</div>
        </div>
      </div>

      {/* Temporary description input */}
      <div>
        <label className="block text-sm font-semibold text-wool-700 mb-2">
          For now, describe your shaping manually
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-field min-h-24"
          placeholder="e.g., Bind off 3 sts at beg of next 2 rows, then dec 1 st each end every other row 4 times"
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="btn-tertiary flex-1"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={!description.trim()}
          className="btn-primary flex-1"
        >
          Complete
        </button>
      </div>
    </div>
  );
};

export default PhaseConfig;