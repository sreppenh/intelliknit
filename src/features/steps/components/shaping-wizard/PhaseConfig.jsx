import React, { useState } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';


const PhaseConfig = ({ 
  shapingData, 
  setShapingData, 
  currentStitches, 
  construction,
  onComplete,
  onBack 
}) => {
  const [phases, setPhases] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('summary'); // 'summary', 'type-select', 'configure'
  const [editingPhaseId, setEditingPhaseId] = useState(null);
  const [tempPhaseConfig, setTempPhaseConfig] = useState({});

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
    },
    {
      id: 'bind_off',
      name: 'Bind Off',
      icon: '📤',
      description: 'Remove stitches by binding off'
    }
  ];

  const getDefaultConfigForType = (type) => {
    switch (type) {
      case 'decrease':
        return {
          amount: 1,
          frequency: 1, // every other row
          times: 1,
          position: 'both_ends'
        };
      case 'increase':
        return {
          amount: 1,
          frequency: 1, // every other row  
          times: 1,
          position: 'both_ends'
        };
      case 'setup':
        return {
          rows: 1
        };
      case 'bind_off':
        return {
          amount: 1,
          frequency: 1,
          position: 'beginning' // Only beginning for bind-offs
        };
      default:
        return {};
    }
  };

  const handleAddPhase = () => {
    setEditingPhaseId(null);
    setCurrentScreen('type-select');
  };

  const handleEditPhase = (phaseId) => {
    const phase = phases.find(p => p.id === phaseId);
    setEditingPhaseId(phaseId);
    setTempPhaseConfig(phase.config);
    setCurrentScreen('configure');
  };

  const handleTypeSelect = (type) => {
    if (editingPhaseId) {
      // Editing existing phase - keep existing config but change type
      const existingPhase = phases.find(p => p.id === editingPhaseId);
      setTempPhaseConfig({ ...existingPhase.config, type });
    } else {
      // Adding new phase
      setTempPhaseConfig({ type, ...getDefaultConfigForType(type) });
    }
    setCurrentScreen('configure');
  };

const handleSavePhaseConfig = () => {
  if (editingPhaseId) {
    // Update existing phase
    setPhases(phases.map(p => 
      p.id === editingPhaseId 
        ? { ...p, type: tempPhaseConfig.type, config: tempPhaseConfig }
        : p
    ));
  } else {
    // Add new phase
    const newPhase = {
      id: crypto.randomUUID(),
      type: tempPhaseConfig.type,
      config: tempPhaseConfig
    };
    setPhases([...phases, newPhase]);
  }
  
  setCurrentScreen('summary');
  setEditingPhaseId(null);
  setTempPhaseConfig({});
};

  const handleDeletePhase = (phaseId) => {
    setPhases(phases.filter(p => p.id !== phaseId));
  };

  const calculateSequentialPhases = () => {
    if (phases.length === 0) {
      return {
        error: 'Please add at least one phase',
        instruction: '',
        startingStitches: currentStitches,
        endingStitches: currentStitches,
        totalRows: 0,
        netStitchChange: 0,
        phases: []
      };
    }

    let currentStitchCount = currentStitches;
    let totalRows = 0;
    let instructions = [];
    let netStitchChange = 0;
    let phaseDetails = [];

    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const { type, config } = phase;

      if (type === 'setup') {
        totalRows += config.rows;
        instructions.push(`work ${config.rows} plain rows`);
        phaseDetails.push({
          type: 'setup',
          rows: config.rows,
          startingStitches: currentStitchCount,
          endingStitches: currentStitchCount
        });
      } else if (type === 'bind_off') {
        const totalBindOff = config.amount * config.frequency;
        const phaseRows = config.frequency;
        
        currentStitchCount -= totalBindOff;
        totalRows += phaseRows;
        netStitchChange -= totalBindOff;
        
        const positionText = config.position === 'beginning' ? 'at beginning' : 'at end';
        instructions.push(`bind off ${config.amount} sts ${positionText} of next ${config.frequency} rows`);
        
        phaseDetails.push({
          type: 'bind_off',
          amount: config.amount,
          frequency: config.frequency,
          position: config.position,
          rows: phaseRows,
          stitchChange: -totalBindOff,
          startingStitches: currentStitchCount + totalBindOff,
          endingStitches: currentStitchCount
        });
      } else if (type === 'decrease' || type === 'increase') {
        const isDecrease = type === 'decrease';
        
        // Calculate stitch change per shaping row
        const stitchChangePerRow = config.position === 'both_ends' ? 
          config.amount * 2 : config.amount;
        
        // Calculate total stitch change for this phase
        const totalStitchChangeForPhase = stitchChangePerRow * config.times * (isDecrease ? -1 : 1);
        
        // Calculate total rows for this phase  
        const phaseRows = config.times * config.frequency;
        
        // Update counters
        currentStitchCount += totalStitchChangeForPhase;
        totalRows += phaseRows;
        netStitchChange += totalStitchChangeForPhase;
        
        // Generate instruction text
        const actionText = isDecrease ? 'decrease' : 'increase';
        const positionText = config.position === 'both_ends' ? 'at each end' : 
                           config.position === 'beginning' ? 'at beginning' :
                           'at end';
        const frequencyText = config.frequency === 1 ? 'every row' : 
                             config.frequency === 2 ? 'every other row' :
                             `every ${config.frequency} rows`;
        
        instructions.push(`${actionText} ${config.amount} st ${positionText} ${frequencyText} ${config.times} times`);
        
        phaseDetails.push({
          type: type,
          amount: config.amount,
          frequency: config.frequency,
          times: config.times,
          position: config.position,
          rows: phaseRows,
          stitchChange: totalStitchChangeForPhase,
          startingStitches: currentStitchCount - totalStitchChangeForPhase,
          endingStitches: currentStitchCount
        });
      }
    }
    
    // Check for impossible scenarios
    if (currentStitchCount < 0) {
      return {
        error: `Calculation results in ${currentStitchCount} stitches - cannot bind off more stitches than available`,
        instruction: '',
        startingStitches: currentStitches,
        endingStitches: currentStitches,
        totalRows: 0,
        netStitchChange: 0,
        phases: []
      };
    }

    return {
      instruction: instructions.join(', then '),
      startingStitches: currentStitches,
      endingStitches: currentStitchCount,
      totalRows: totalRows,
      netStitchChange: netStitchChange,
      phases: phaseDetails,
      construction: construction
    };
  };

  const getPhaseDescription = (phase) => {
    const { type, config } = phase;
    
    switch (type) {
      case 'decrease':
        const decFreqText = config.frequency === 1 ? 'every row' : 
                           config.frequency === 2 ? 'every other row' :
                           `every ${config.frequency} rows`;
        const decPosText = config.position === 'both_ends' ? 'at each end' :
                          config.position === 'beginning' ? 'at beginning' :
                          'at end';
        const decTotalRows = config.times * config.frequency;
        return `Dec ${config.amount} st ${decPosText} ${decFreqText} ${config.times} times (${decTotalRows} rows)`;
      case 'increase':
        const incFreqText = config.frequency === 1 ? 'every row' : 
                           config.frequency === 2 ? 'every other row' :
                           `every ${config.frequency} rows`;
        const incPosText = config.position === 'both_ends' ? 'at each end' :
                          config.position === 'beginning' ? 'at beginning' :
                          'at end';
        const incTotalRows = config.times * config.frequency;
        return `Inc ${config.amount} st ${incPosText} ${incFreqText} ${config.times} times (${incTotalRows} rows)`;
      case 'setup':
        return `Work ${config.rows} plain ${config.rows === 1 ? 'row' : 'rows'}`;
      case 'bind_off':
        const bindPosText = config.position === 'beginning' ? 'at beginning' : 'at end';
        const bindTotalStitches = config.amount * config.frequency;
        return `Bind off ${config.amount} sts ${bindPosText} of next ${config.frequency} ${config.frequency === 1 ? 'row' : 'rows'} (${bindTotalStitches} sts total)`;
      default:
        return 'Unknown phase';
    }
  };

  const result = calculateSequentialPhases();

  const handleComplete = () => {
    onComplete({
      phases: phases,
      construction: construction,
      calculation: result
    });
  };

  // Screen 1: Summary (main screen)
  if (currentScreen === 'summary') {
    return (
      <div className="p-6 stack-lg">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-wool-700 mb-3 text-left">📈 Sequential Phases</h2>
          <p className="text-wool-500 mb-4 text-left">
            {phases.length === 0 ? 'Build your shaping sequence step by step' : 'Review and modify your sequence'}
          </p>
        </div>

        {/* Phase List or Empty State */}
        {phases.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-wool-600 mb-2">Ready to build complex shaping?</h3>
            <p className="text-wool-500 mb-4 px-4">Create sophisticated patterns like sleeve caps, shoulder shaping, or gradual waist decreases</p>
            <div className="bg-sage-50 border-2 border-sage-200 rounded-lg p-3 mb-6 mx-4">
              <div className="text-xs font-semibold text-sage-700 mb-1 text-left">Example: Sleeve Cap Shaping</div>
              <div className="text-xs text-sage-600 text-left">
                • Work 6 plain rows<br/>
                • Dec 1 at each end every other row 5 times<br/>
                • Work 2 plain rows<br/>
                • Dec 1 at each end every row 3 times
              </div>
            </div>
            <button
              onClick={handleAddPhase}
              className="btn-primary"
            >
              Add Your First Phase
            </button>
          </div>
        ) : (
          <>
            {/* Phase Summary List */}
            <div>
              <h3 className="text-lg font-semibold text-wool-700 mb-3 text-left">Your Sequence</h3>
              
              <div className="space-y-3">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="border-2 border-wool-200 rounded-xl">
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
                          onClick={() => handleEditPhase(phase.id)}
                          className="p-2 text-wool-500 hover:bg-wool-200 rounded-lg transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeletePhase(phase.id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Another Phase */}
            <button
              onClick={handleAddPhase}
              className="w-full p-4 border-2 border-dashed border-wool-300 rounded-xl text-wool-500 hover:border-sage-400 hover:text-sage-600 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-xl">➕</span>
              Add Another Phase
            </button>

            {/* Preview */}
            {result.error ? (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ Error</h4>
                <div className="text-sm text-red-600">
                  {result.error}
                </div>
              </div>
            ) : (
              <div className="card-info">
                <h4 className="text-sm font-semibold text-lavender-700 mb-3 text-left">Preview</h4>
                
                <div className="space-y-2 text-sm text-left">
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
          </>
        )}
      </div>
    );
  }

  // Screen 2: Type Selection
  if (currentScreen === 'type-select') {
    return (
      <div className="p-6 stack-lg">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-wool-700 mb-3 text-left">Choose Phase Type</h2>
          <p className="text-wool-500 mb-4 text-left">What kind of shaping do you want to add?</p>
        </div>

        {/* Phase Type Grid */}
        <div className="grid grid-cols-2 gap-3">
          {phaseTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeSelect(type.id)}
              className="p-4 border-2 border-wool-200 rounded-xl hover:border-sage-400 hover:bg-sage-50 transition-colors text-left"
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
            onClick={() => setCurrentScreen('summary')}
            className="btn-tertiary w-full"
          >
            ← Back to Summary
          </button>
        </div>
      </div>
    );
  }

  // Screen 3: Configure Phase
  if (currentScreen === 'configure') {
    const phaseType = phaseTypes.find(t => t.id === tempPhaseConfig.type);
    
    return (
      <div className="p-6 stack-lg">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-wool-700 mb-3 text-left flex items-center gap-2">
            <span>{phaseType?.icon}</span>
            {phaseType?.name}
          </h2>
          <p className="text-wool-500 mb-4 text-left">{phaseType?.description}</p>
        </div>

        {/* Configuration based on type */}
        <div className="space-y-6">
          {tempPhaseConfig.type === 'setup' ? (
            // Setup Rows Configuration
            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3 text-left">
                Number of Rows
              </label>
          
             
<IncrementInput
  value={tempPhaseConfig.rows}
  onChange={(value) => setTempPhaseConfig(prev => ({ ...prev, rows: value }))}
  label="rows"
  unit="rows"
/>

            </div>
          ) : tempPhaseConfig.type === 'bind_off' ? (
            // Bind Off Configuration
            <>
              <div>
                <label className="block text-sm font-semibold text-wool-700 mb-3 text-left">
                  Amount Per Row
                </label>
           
<IncrementInput
  value={tempPhaseConfig.amount}  // ← CORRECT FIELD
  onChange={(value) => setTempPhaseConfig(prev => ({ ...prev, amount: value }))}
  label="amount per row"  // ← CORRECT LABEL
  unit="stitches"  // ← CORRECT UNIT
/>

              </div>

              <div>
                <label className="block text-sm font-semibold text-wool-700 mb-3 text-left">
                  Number of Rows
                </label>
                
                {/* Preset + Custom for Bind Offs */}
                <div className="space-y-3">
                  {/* Quick Presets for common bind off patterns */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 1, label: '1 Row' },
                      { value: 2, label: '2 Rows' },
                      { value: 3, label: '3 Rows' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setTempPhaseConfig(prev => ({ ...prev, frequency: option.value }))}
                        className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                          tempPhaseConfig.frequency === option.value
                            ? 'border-sage-500 bg-sage-100 text-sage-700'
                            : 'border-wool-200 hover:border-sage-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Row Count */}
                  <div className="bg-wool-50 border-2 border-wool-200 rounded-lg p-3">
                    <div className="text-xs font-semibold text-wool-700 mb-2 text-left">Custom Row Count</div>
                    
<IncrementInput
  value={tempPhaseConfig.frequency}
  onChange={(value) => setTempPhaseConfig(prev => ({ ...prev, frequency: value }))}
  label="frequency"
  unit="rows"
/>
                  </div>




</div>
              </div>

              {/* Real-time validation for bind offs */}
              {tempPhaseConfig.type === 'bind_off' && tempPhaseConfig.amount && tempPhaseConfig.frequency && (() => {
                const totalBindOff = tempPhaseConfig.amount * tempPhaseConfig.frequency;
                let stitchesAfterPreviousPhases = currentStitches;
                for (const phase of phases) {
                  if (phase.type === 'bind_off') {
                    stitchesAfterPreviousPhases -= (phase.config.amount * phase.config.frequency);
                  }
                }
                
                if (totalBindOff > stitchesAfterPreviousPhases) {
                  return (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ Error</h4>
                      <div className="text-sm text-red-600">
                        Cannot bind off {totalBindOff} stitches - only {stitchesAfterPreviousPhases} stitches available
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

            </>
          ) : (

            // Increase/Decrease Configuration
<>
  <div>
    <label className="form-label">
      Position
    </label>
<div className="grid grid-cols-3 gap-2">
  {[
    { value: 'beginning', label: 'Beginning' },
    { value: 'end', label: 'End' },
    { value: 'both_ends', label: 'Both Ends' }
  ].map(option => (
        <button
          key={option.value}
          onClick={() => setTempPhaseConfig(prev => ({ ...prev, position: option.value }))}
          className={`p-3 text-sm border-2 rounded-lg transition-colors ${
            tempPhaseConfig.position === option.value
              ? 'border-sage-500 bg-sage-100 text-sage-700'
              : 'border-wool-200 hover:border-sage-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>

              <div>
                <label className="block text-sm font-semibold text-wool-700 mb-3 text-left">
                  Frequency
                </label>
                
                {/* Preset + Custom Integrated Layout */}
                <div className="space-y-3">
                  {/* Quick Presets Row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 1, label: 'Every Row' },
                      { value: 2, label: 'Every Other' },
                      { value: 4, label: 'Every 4th' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setTempPhaseConfig(prev => ({ ...prev, frequency: option.value }))}
                        className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                          tempPhaseConfig.frequency === option.value
                            ? 'border-sage-500 bg-sage-100 text-sage-700'
                            : 'border-wool-200 hover:border-sage-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Interval - Integrated Style */}
                  <div className="bg-wool-50 border-2 border-wool-200 rounded-lg p-3">
                    <div className="text-xs font-semibold text-wool-700 mb-2 text-left">Custom Interval</div>
                    <div className="increment-input-group justify-center">
  <span className="text-sm text-wool-600">Every</span>
  <IncrementInput
    value={tempPhaseConfig.frequency}
    onChange={(value) => setTempPhaseConfig(prev => ({ ...prev, frequency: value }))}
    label="frequency"
    unit="rows"
    min={1}
    className="mx-2"
  />
</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-wool-700 mb-3 text-left">
                  Times
                </label>
                <IncrementInput
  value={tempPhaseConfig.times}
  onChange={(value) => setTempPhaseConfig(prev => ({ ...prev, times: value }))}
  label="number of times"
  unit="times"
/>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-6">
          <button
            onClick={() => {
              if (editingPhaseId) {
                // If editing existing phase, go back to summary
                setCurrentScreen('summary');
                setEditingPhaseId(null);
                setTempPhaseConfig({});
              } else {
                // If adding new phase, go back to type selection
                setCurrentScreen('type-select');
              }
            }}
            className="btn-tertiary flex-1"
          >
            ← Back
          </button>
          <button
            onClick={handleSavePhaseConfig}
            className="btn-primary flex-1"
          >
            {editingPhaseId ? 'Update Phase' : 'Add Phase'}
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default PhaseConfig;