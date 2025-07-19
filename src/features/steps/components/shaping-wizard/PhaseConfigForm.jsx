// src/features/steps/components/shaping-wizard/PhaseConfigForm.jsx
import React from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';

const PhaseConfigForm = ({ 
  tempPhaseConfig,
  setTempPhaseConfig,
  phaseTypes,
  phases,
  currentStitches,
  construction,
  editingPhaseId,
  onSave,
  onBack,
  getPhasePreview,
  getStitchContext,
  calculatePhaseEndingStitches,
  phaseNumber
}) => {
  const phaseType = phaseTypes.find(t => t.id === tempPhaseConfig.type);

  // Calculate contextual max for Times input
const getMaxTimes = () => {
  if (tempPhaseConfig.type !== 'decrease') {
    return 999; // No limits for increases, setup, bind_off
  }
  
  const availableStitches = getStitchContext().availableStitches;
  const position = tempPhaseConfig.position;
  
  if (!position || availableStitches <= 2) {
    return 1; // Minimum safe value
  }
  
  const stitchesPerRow = position === 'both_ends' ? 2 : 1;
  const maxTimes = Math.floor((availableStitches - 2) / stitchesPerRow);
  
  return Math.max(1, maxTimes);
};
  
  return (
    <div className="p-6 stack-lg">
      {/* Header */}
      <div>
        <h2 className="content-header-primary flex items-center gap-2">
       <span>{phaseType?.icon}</span>
       Phase {phaseNumber}: {phaseType?.name}
      </h2>
        <p className="text-wool-500 mb-4 text-left">{phaseType?.description}</p>
      </div>

      {/* Configuration based on type */}
      <div className="stack-lg">
        {tempPhaseConfig.type === 'setup' ? (
          // Setup Rows Configuration
          <div>
            <label className="form-label">
              Number of Rows
            </label>
            <IncrementInput
              value={tempPhaseConfig.rows}
              onChange={(value) => setTempPhaseConfig(prev => ({ ...prev, rows: value }))}
              label="rows"
              unit="rows"
              min={1}
            />
          </div>
        ) : tempPhaseConfig.type === 'bind_off' ? (
          // Bind Off Configuration
          <>
            <div>
              <label className="form-label">
                Amount Per Row
              </label>
              <IncrementInput
                value={tempPhaseConfig.amount}
                onChange={(value) => setTempPhaseConfig(prev => ({ ...prev, amount: value }))}
                label="amount per row"
                unit="stitches"
                min={1}
              />
            </div>

            <div>
              <label className="form-label">
                Number of Rows
              </label>
              
              {/* Preset + Custom for Bind Offs */}
              <div className="stack-sm">
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
                <div className="card-compact bg-wool-50">
                  <div className="form-label-sm">Custom Row Count</div>
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
      onClick={() => {
        setTempPhaseConfig(prev => {
          const newConfig = { ...prev, position: option.value };
          
          // Force correction of times value with new position
          if (newConfig.type === 'decrease' && newConfig.times) {
            const availableStitches = getStitchContext().availableStitches;
            const stitchesPerRow = option.value === 'both_ends' ? 2 : 1;
            const maxTimes = Math.max(1, Math.floor((availableStitches - 2) / stitchesPerRow));
            const correctedTimes = Math.min(newConfig.times, maxTimes);
            
            IntelliKnitLogger.debug('Position Change', `Position: ${option.value}, Times: ${newConfig.times} → ${correctedTimes}`);
            
            newConfig.times = correctedTimes;
          }
          
          return newConfig;
        });
      }}
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

           {/* Unified Frequency Selection */}
<div>
  <label className="form-label">
    Frequency
  </label>
  
  {/* Unified Frequency Card */}
  <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
    
    {/* Preset Buttons */}
    <div className="grid grid-cols-3 gap-2 mb-4">
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
    
    {/* Custom Interval - Connected Visual Treatment */}
    <div className="border-t border-wool-100 pt-3">
      <div className="form-label-sm mb-2">Custom Interval</div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-wool-600">Every</span>
        <IncrementInput
          value={tempPhaseConfig.frequency}
          onChange={(value) => {
            const correctedValue = Math.max(value, 1);
            setTempPhaseConfig(prev => ({ ...prev, frequency: correctedValue }));
          }}
          label="frequency"
          unit="rows"
          min={1}
          className="mx-2"
          size="sm"
        />
        {/* <span className="text-sm text-wool-600">rows</span> */}
      </div>
    </div>
  </div>
</div>

            <div>
              <label className="form-label">
                Times
              </label>
<IncrementInput
  value={tempPhaseConfig.times}
  onChange={(value) => {
    const maxTimes = getMaxTimes();
    const correctedValue = Math.min(Math.max(value, 1), maxTimes);
    IntelliKnitLogger.debug('Times Input', `Original: ${value}, Corrected: ${correctedValue}, Max: ${maxTimes}`);
    setTempPhaseConfig(prev => ({ ...prev, times: correctedValue }));
  }}
  label="number of times"
  unit="times"
  min={1}
  max={getMaxTimes()}
/>
            </div>
          </>
        )}
      </div>

      {/* Live Preview Box */}
      {tempPhaseConfig.type && (
        <div className="card-info">
          <h4 className="text-sm font-semibold text-lavender-700 mb-3">Preview</h4>
          
          <div className="space-y-2 text-sm">
            <div className="text-lavender-700">
              <span className="font-medium">Instruction:</span> {getPhasePreview(tempPhaseConfig)}
            </div>
            <div className="text-lavender-600">
              {getStitchContext().availableStitches} stitches → {calculatePhaseEndingStitches()} stitches ({construction})
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-6">
        <button
          onClick={onBack}
          className="btn-tertiary flex-1"
        >
          ← Back
        </button>
        <button
          onClick={onSave}
          className="btn-primary flex-1"
        >
          {editingPhaseId ? 'Update Phase' : 'Add Phase'}
        </button>
      </div>
    </div>
  );
};

export default PhaseConfigForm;