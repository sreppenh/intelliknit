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
  const [showPhaseSelector, setShowPhaseSelector] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);

  const phaseTypes = [
    {
      id: 'decrease',
      name: 'Decrease Phase',
      icon: '📉',
      description: 'Remove stitches over multiple rows'
    },
    {
      id: 'increase',
      name: 'Increase Phase', 
      icon: '📈',
      description: 'Add stitches over multiple rows'
    },
    {
      id: 'setup',
      name: 'Setup Rows',
      icon: '📐',
      description: 'Work plain rows between shaping'
    }
  ];

  const addPhase = (type) => {
    const newPhase = {
      id: Date.now(),
      type,
      config: getDefaultConfigForType(type)
    };
    setPhases([...phases, newPhase]);
    setShowPhaseSelector(false);
    setEditingPhase(newPhase.id);
  };

  const deletePhase = (phaseId) => {
    setPhases(phases.filter(p => p.id !== phaseId));
    if (editingPhase === phaseId) {
      setEditingPhase(null);
    }
  };

  const updatePhase = (phaseId, config) => {
    setPhases(phases.map(p => 
      p.id === phaseId ? { ...p, config } : p
    ));
  };

  const getDefaultConfigForType = (type) => {
    switch (type) {
      case 'decrease':
        return {
          amount: 1,
          frequency: 2, // every other row
          times: 5,
          position: 'both_ends',
          technique: 'auto'
        };
      case 'increase':
        return {
          amount: 1,
          frequency: 2, // every other row  
          times: 5,
          position: 'both_ends',
          technique: 'auto'
        };
      case 'setup':
        return {
          rows: 4
        };
      default:
        return {};
    }
  };

  const calculateSequentialPhases = () => {
    if (phases.length === 0) {
      return {
        error: 'Please add at least one phase',
        instruction: '',
        startingStitches: currentStitches,
        endingStitches: currentStitches,
        totalRows: 0,
        netStitchChange: 0
      };
    }

    let currentStitchCount = currentStitches;
    let totalRows = 0;
    let instructions = [];
    let netStitchChange = 0;

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const { type, config } = phase;

      if (type === 'setup') {
        totalRows += config.rows;
        instructions.push(`work ${config.rows} plain rows`);
      } else if (type === 'decrease' || type === 'increase') {
        const isDecrease = type === 'decrease';
        const stitchChange = config.amount * (isDecrease ? -1 : 1);
        const totalChange = stitchChange * config.times;
        
        if (config.position === 'both_ends') {
          // 2 stitches changed per shaping row
          const actualChange = totalChange * 2;
          netStitchChange += actualChange;
          currentStitchCount += actualChange;
        } else {
          // 1 stitch changed per shaping row
          netStitchChange += totalChange;
          currentStitchCount += totalChange;
        }

        totalRows += config.times * config.frequency;

        // Generate instruction text
        const action = isDecrease ? 'decrease' : 'increase';
        const technique = config.technique === 'auto' ? 
          (isDecrease ? 'K2tog' : 'M1') : config.technique;
        const positionText = config.position === 'both_ends' ? 
          'at each end' : `at ${config.position}`;
        const frequencyText = config.frequency === 1 ? 
          'every row' : config.frequency === 2 ? 
          'every other row' : `every ${config.frequency} rows`;

        instructions.push(
          `${action} ${config.amount} st ${positionText} ${frequencyText} ${config.times} times`
        );
      }
    }

    // Check for impossible scenarios
    if (currentStitchCount <= 0) {
      return {
        error: `Impossible: Would result in ${currentStitchCount} stitches`,
        instruction: '',
        startingStitches: currentStitches,
        endingStitches: currentStitchCount,
        totalRows,
        netStitchChange
      };
    }

    return {
      instruction: instructions.join(', then '),
      startingStitches: currentStitches,
      endingStitches: currentStitchCount,
      totalRows,
      netStitchChange,
      phases: phases.map(p => p.config)
    };
  };

  const result = calculateSequentialPhases();

  const handleComplete = () => {
    if (result.error || phases.length === 0) return;
    
    onComplete({
      phases: phases.map(p => p.config),
      construction,
      calculation: result
    });
  };

  const getPhaseDescription = (phase) => {
    const { type, config } = phase;
    
    switch (type) {
      case 'decrease':
        const decFreqText = config.frequency === 1 ? 'every row' : 
                           config.frequency === 2 ? 'every other row' :
                           `every ${config.frequency} rows`;
        return `Dec ${config.amount} st at ${config.position} ${decFreqText} ${config.times} times`;
      case 'increase':
        const incFreqText = config.frequency === 1 ? 'every row' : 
                           config.frequency === 2 ? 'every other row' :
                           `every ${config.frequency} rows`;
        return `Inc ${config.amount} st at ${config.position} ${incFreqText} ${config.times} times`;
      case 'setup':
        return `Work ${config.rows} plain rows`;
      default:
        return 'Unknown phase';
    }
  };

  const renderPhaseConfig = (phase) => {
    const { type, config } = phase;
    
    if (type === 'setup') {
      return (
        <div>
          <label className="block text-sm font-semibold text-wool-700 mb-2">
            Number of Rows
          </label>
          <input
            type="number"
            min="1"
            value={config.rows}
            onChange={(e) => updatePhase(phase.id, { ...config, rows: parseInt(e.target.value) || 1 })}
            className="w-24 border-2 border-wool-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Amount */}
        <div>
          <label className="block text-sm font-semibold text-wool-700 mb-2">
            Amount per Row
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={config.amount}
              onChange={(e) => updatePhase(phase.id, { ...config, amount: parseInt(e.target.value) || 1 })}
              className="w-20 border-2 border-wool-200 rounded-lg px-3 py-2 text-sm"
            />
            <span className="text-sm text-wool-600">stitches</span>
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-semibold text-wool-700 mb-2">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'both_ends', label: 'Both Ends' },
              { value: 'beginning', label: 'Beginning' },
              { value: 'end', label: 'End' },
              { value: 'center', label: 'Center' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => updatePhase(phase.id, { ...config, position: option.value })}
                className={`p-2 text-sm border-2 rounded-lg transition-colors ${
                  config.position === option.value
                    ? 'border-sage-500 bg-sage-100 text-sage-700'
                    : 'border-wool-200 hover:border-sage-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-semibold text-wool-700 mb-2">
            Frequency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 1, label: 'Every Row' },
              { value: 2, label: 'Every Other' },
              { value: 4, label: 'Every 4th' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => updatePhase(phase.id, { ...config, frequency: option.value })}
                className={`p-2 text-sm border-2 rounded-lg transition-colors ${
                  config.frequency === option.value
                    ? 'border-sage-500 bg-sage-100 text-sage-700'
                    : 'border-wool-200 hover:border-sage-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Times */}
        <div>
          <label className="block text-sm font-semibold text-wool-700 mb-2">
            Times
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={config.times}
              onChange={(e) => updatePhase(phase.id, { ...config, times: parseInt(e.target.value) || 1 })}
              className="w-20 border-2 border-wool-200 rounded-lg px-3 py-2 text-sm"
            />
            <span className="text-sm text-wool-600">times</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 stack-lg">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">📈 Sequential Phases</h2>
        <p className="text-wool-500 mb-4">Configure multiple shaping phases in sequence</p>
      </div>

      {/* Phase List */}
      <div className="space-y-3">
        {phases.map((phase, index) => (
          <div key={phase.id} className="border-2 border-wool-200 rounded-xl overflow-hidden">
            <div className="bg-wool-50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center text-sm font-bold text-sage-700">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-wool-700 flex items-center gap-2">
                    <span>{phaseTypes.find(t => t.id === phase.type)?.icon}</span>
                    {phaseTypes.find(t => t.id === phase.type)?.name}
                  </div>
                  <div className="text-sm text-wool-500">
                    {getPhaseDescription(phase)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingPhase(editingPhase === phase.id ? null : phase.id)}
                  className="p-2 text-wool-500 hover:bg-wool-200 rounded-lg transition-colors"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deletePhase(phase.id)}
                  className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Configuration Panel */}
            {editingPhase === phase.id && (
              <div className="p-4 bg-white border-t border-wool-200">
                {renderPhaseConfig(phase)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Phase Button */}
      <button
        onClick={() => setShowPhaseSelector(true)}
        className="w-full p-4 border-2 border-dashed border-wool-300 rounded-xl text-wool-500 hover:border-sage-400 hover:text-sage-600 transition-colors flex items-center justify-center gap-2"
      >
        <span className="text-xl">➕</span>
        Add Phase
      </button>

      {/* Preview */}
      {phases.length > 0 && (
        result.error ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ Error</h4>
            <div className="text-sm text-red-600">
              {result.error}
            </div>
          </div>
        ) : (
          <div className="card-info">
            <h4 className="text-sm font-semibold text-lavender-700 mb-3">Preview</h4>
            
            <div className="space-y-2 text-sm">
              <div className="text-lavender-700">
                <span className="font-medium">Instruction:</span> {result.instruction}
              </div>
              <div className="text-lavender-600">
                {result.startingStitches} stitches → {result.endingStitches} stitches 
                ({Math.abs(result.netStitchChange)} {result.netStitchChange > 0 ? 'increases' : 'decreases'}, {result.totalRows} rows, {construction})
              </div>
              <div className="text-lavender-600">
                <span className="font-medium">Phases:</span> {phases.length} configured
              </div>
            </div>
          </div>
        )
      )}

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
          disabled={!result.instruction || result.error || phases.length === 0}
          className="btn-primary flex-1"
        >
          Add Step
        </button>
      </div>

      {/* Phase Selector Modal */}
      {showPhaseSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-wool-700">Choose Phase Type</h3>
              <button
                onClick={() => setShowPhaseSelector(false)}
                className="p-2 hover:bg-wool-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {phaseTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => addPhase(type.id)}
                  className="w-full p-4 text-left border-2 border-wool-200 rounded-xl hover:border-sage-400 hover:bg-sage-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <div className="font-semibold text-wool-700">{type.name}</div>
                      <div className="text-sm text-wool-500">{type.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseConfig;