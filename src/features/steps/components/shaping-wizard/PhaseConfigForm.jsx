// src/features/steps/components/shaping-wizard/PhaseConfigForm.jsx
import React from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import ShapingHeader from './ShapingHeader';

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
  phaseNumber,
  onCancel,
  onGoToLanding,  // ADD
  wizard          // ADD
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

  // Calculate contextual max for Amount Per Row input
  const getMaxAmountPerRow = () => {
    if (tempPhaseConfig.type !== 'bind_off') {
      return 999; // No limits for other types
    }

    const availableStitches = getStitchContext().availableStitches;
    const frequency = tempPhaseConfig.frequency || 1;

    if (availableStitches <= 0) {
      return 1; // Minimum safe value
    }

    const maxAmount = Math.floor(availableStitches / frequency);
    return Math.max(1, maxAmount);
  };

  // Calculate contextual max for Number of Rows input  
  const getMaxFrequency = () => {
    if (tempPhaseConfig.type !== 'bind_off') {
      return 999; // No limits for other types
    }

    const availableStitches = getStitchContext().availableStitches;
    const amount = tempPhaseConfig.amount || 1;

    if (availableStitches <= 0) {
      return 1; // Minimum safe value
    }

    const maxFrequency = Math.floor(availableStitches / amount);
    return Math.max(1, maxFrequency);
  };

  return (
    <div>
      <ShapingHeader
        onBack={onBack}
        onGoToLanding={onGoToLanding}
        wizard={wizard}
        onCancel={onCancel}
      />
      <div className="p-6 stack-lg">
        {/* Header */}
        <div>
          <h2 className="content-header-primary flex items-center gap-2">
            <span>{phaseType?.icon}</span>
            Phase {phaseNumber}: {phaseType?.name}
          </h2>
          <p className="content-subheader text-left">{phaseType?.description}</p>
        </div>

        {/* Configuration based on type */}
        <div className="stack-lg">
          {tempPhaseConfig.type === 'setup' ? (
            // Setup Rows Configuration
            <div>
              <label className="form-label">
                How many plain {construction === 'round' ? 'rounds' : 'rows'}?
              </label>

              {/* Quick Presets */}
              <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4 mb-3">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[1, 3, 5].map(value => (
                    <button
                      key={value}
                      onClick={() => setTempPhaseConfig(prev => ({ ...prev, rows: value }))}
                      className={`p-3 text-sm border-2 rounded-lg transition-colors ${tempPhaseConfig.rows === value
                        ? 'border-sage-500 bg-sage-100 text-sage-700'
                        : 'border-wool-200 hover:border-sage-300'
                        }`}
                    >
                      {value} {construction === 'round' ? 'rounds' : 'rows'}
                    </button>
                  ))}
                </div>

                <div className="border-t border-wool-100 pt-3">
                  <div className="form-label-sm mb-2">Custom Count</div>
                  <IncrementInput
                    value={tempPhaseConfig.rows}
                    onChange={(value) => setTempPhaseConfig(prev => ({ ...prev, rows: value }))}
                    label="rows"
                    unit="rows"
                    construction={construction}
                    min={1}
                  />
                </div>
              </div>

              <div className="help-block">
                <div className="text-xs text-sage-600">
                  💡 Work even without any shaping between other phases
                </div>
              </div>
            </div>
          ) : tempPhaseConfig.type === 'bind_off' ? (
            // Bind Off Configuration
            <>

              {/* Unified Amount Per Row Selection */}
              <div>
                <label className="form-label">
                  How many stitches?
                </label>

                {/* Unified Amount Container */}
                <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">

                  {/* Bind Off All - Top Position */}
                  <div className="mb-4">
                    <button
                      onClick={() => {
                        const availableStitches = getStitchContext().availableStitches;
                        setTempPhaseConfig(prev => ({
                          ...prev,
                          amount: availableStitches,
                          frequency: 1
                        }));
                      }}
                      className={`w-full p-3 text-sm border-2 rounded-lg transition-colors ${tempPhaseConfig.amount === getStitchContext().availableStitches && tempPhaseConfig.frequency === 1
                        ? 'border-sage-500 bg-sage-100 text-sage-700'
                        : 'border-wool-200 hover:border-sage-300'
                        }`}
                    >
                      Bind Off All Remaining ({getStitchContext().availableStitches} stitches)
                    </button>
                  </div>

                  {/* Custom Amount Input - Connected Visual Treatment */}
                  <div className="border-t border-wool-100 pt-3">
                    <div className="form-label-sm mb-2">Custom Amount</div>
                    <IncrementInput
                      value={tempPhaseConfig.amount}
                      onChange={(value) => {
                        const maxAmount = getMaxAmountPerRow();
                        const correctedValue = Math.min(Math.max(value, 1), maxAmount);
                        setTempPhaseConfig(prev => ({ ...prev, amount: correctedValue }));
                      }}
                      label="amount per row"
                      unit="stitches"
                      min={1}
                      max={getMaxAmountPerRow()}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">
                  <label className="form-label">
                    Over how many {construction === 'round' ? 'rounds' : 'rows'}?
                  </label>
                </label>

                {/* Unified Number of Rows Selection */}
                <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                  {/* Quick Presets for common bind off patterns */}
                  <div className="grid grid-cols-3 gap-2">

                    {[
                      { value: 1, label: `1 ${construction === 'round' ? 'Round' : 'Row'}` },
                      { value: 2, label: `2 ${construction === 'round' ? 'Rounds' : 'Rows'}` },
                      { value: 3, label: `3 ${construction === 'round' ? 'Rounds' : 'Rows'}` }
                    ].map(option => {
                      const wouldBeValid = (tempPhaseConfig.amount || 1) * option.value <= getStitchContext().availableStitches;

                      return (
                        <button
                          key={option.value}
                          onClick={() => wouldBeValid && setTempPhaseConfig(prev => ({ ...prev, frequency: option.value }))}
                          disabled={!wouldBeValid}
                          className={`p-3 text-sm border-2 rounded-lg transition-colors ${!wouldBeValid
                            ? 'border-wool-200 bg-wool-100 text-wool-400 cursor-not-allowed'
                            : tempPhaseConfig.frequency === option.value
                              ? 'border-sage-500 bg-sage-100 text-sage-700'
                              : 'border-wool-200 hover:border-sage-300'
                            }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Row Count - Connected Visual Treatment */}
                  <div className="border-t border-wool-100 pt-3">
                    <div className="form-label-sm">Custom Row Count</div>
                    <IncrementInput
                      value={tempPhaseConfig.frequency}
                      onChange={(value) => {
                        const maxFrequency = getMaxFrequency();
                        const correctedValue = Math.min(Math.max(value, 1), maxFrequency);
                        setTempPhaseConfig(prev => ({ ...prev, frequency: correctedValue }));
                      }}
                      label="frequency"
                      unit="rows"
                      construction={construction}
                      min={1}
                      max={getMaxFrequency()}
                    />
                  </div>
                </div>
              </div>

              {/* Real-time validation for bind offs */}
              {tempPhaseConfig.type === 'bind_off' && tempPhaseConfig.amount && tempPhaseConfig.frequency && (() => {
                const totalBindOff = tempPhaseConfig.amount * tempPhaseConfig.frequency;
                const availableStitches = getStitchContext().availableStitches; // ✅ USE THE CORRECT CALCULATION

                if (totalBindOff > availableStitches) {
                  return (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ Error</h4>
                      <div className="text-sm text-red-600">
                        Cannot bind off {totalBindOff} stitches - only {availableStitches} stitches available
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
                  Where are you {tempPhaseConfig.type === 'increasing' ? 'increasing' : 'decreasing'}?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'beginning', label: `Beginning of ${construction === 'round' ? 'Round' : 'Row'}` },
                    { value: 'end', label: `End of ${construction === 'round' ? 'Round' : 'Row'}` }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTempPhaseConfig(prev => {
                          const currentPositions = prev.positions || [];
                          const isSelected = currentPositions.includes(option.value);

                          let newPositions;
                          if (isSelected) {
                            newPositions = currentPositions.filter(p => p !== option.value);
                          } else {
                            newPositions = [...currentPositions, option.value];
                          }

                          const legacyPosition = newPositions.length === 2 ? 'both_ends' :
                            newPositions.length === 1 ? newPositions[0] : null;

                          const newConfig = { ...prev, positions: newPositions, position: legacyPosition };

                          // 🔧 FIX: Recalculate values when position changes
                          const oldStitchesPerRow = prev.position === 'both_ends' ? 2 : 1;
                          const newStitchesPerRow = legacyPosition === 'both_ends' ? 2 : 1;

                          if (oldStitchesPerRow !== newStitchesPerRow) {
                            // Position changed - recalculate dependent values
                            if (prev.amountMode === 'target' && prev.targetStitches) {
                              const availableStitches = getStitchContext().availableStitches;

                              // Check if target is still mathematically possible
                              const totalChange = Math.abs(prev.targetStitches - availableStitches);
                              const isValidTarget = totalChange % newStitchesPerRow === 0;

                              if (!isValidTarget) {
                                // Adjust target to nearest valid value
                                const validChange = Math.floor(totalChange / newStitchesPerRow) * newStitchesPerRow;
                                const newTarget = prev.type === 'decrease' ?
                                  availableStitches - validChange :
                                  availableStitches + validChange;
                                newConfig.targetStitches = newTarget;
                              }

                              // Recalculate times
                              const finalChange = Math.abs((newConfig.targetStitches || prev.targetStitches) - availableStitches);
                              newConfig.times = Math.max(1, Math.ceil(finalChange / newStitchesPerRow));
                            } else if (prev.times) {
                              // In times mode - keep times the same, let preview show new result
                            }
                          }

                          return newConfig;
                        });
                      }}
                      className={`p-3 text-sm border-2 rounded-lg transition-colors ${(tempPhaseConfig.positions || []).includes(option.value)
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
                  How often?
                </label>

                {/* Unified Frequency Card */}
                <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">

                  {/* Preset Buttons - Simplified */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { value: 1, label: `Every ${construction === 'round' ? 'Round' : 'Row'}` },
                      { value: 2, label: `Every Other ${construction === 'round' ? 'Round' : 'Row'}` }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => setTempPhaseConfig(prev => ({ ...prev, frequency: option.value }))}
                        className={`p-3 text-sm border-2 rounded-lg transition-colors ${tempPhaseConfig.frequency === option.value
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
                    </div>
                  </div>
                </div>
              </div>


              {/* Times vs Target Selection */}
              <div>
                <label className="form-label">
                  Number of Times vs Target Stitch Count
                </label>

                {/* Mode Toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setTempPhaseConfig(prev => ({ ...prev, amountMode: 'times' }))}
                    className={`flex-1 p-2 text-sm border-2 rounded-lg transition-colors ${(tempPhaseConfig.amountMode || 'times') === 'times'
                      ? 'border-sage-500 bg-sage-100 text-sage-700'
                      : 'border-wool-200 hover:border-sage-300'
                      }`}
                  >
                    Number of Times
                  </button>
                  <button
                    onClick={() => setTempPhaseConfig(prev => ({ ...prev, amountMode: 'target' }))}
                    className={`flex-1 p-2 text-sm border-2 rounded-lg transition-colors ${tempPhaseConfig.amountMode === 'target'
                      ? 'border-sage-500 bg-sage-100 text-sage-700'
                      : 'border-wool-200 hover:border-sage-300'
                      }`}
                  >
                    Target Stitch Count
                  </button>
                </div>
                {/* Input based on mode */}
                {(tempPhaseConfig.amountMode || 'times') === 'times' ? (
                  <IncrementInput
                    value={tempPhaseConfig.times}
                    onChange={(value) => {
                      const maxTimes = getMaxTimes();
                      const correctedValue = Math.min(Math.max(value, 1), maxTimes);
                      setTempPhaseConfig(prev => ({ ...prev, times: correctedValue }));
                    }}
                    label="number of times"
                    unit="times"
                    min={1}
                    max={getMaxTimes()}
                  />
                ) : (
                  <>
                    <IncrementInput
                      value={tempPhaseConfig.targetStitches || calculatePhaseEndingStitches()}
                      onChange={(value) => {
                        // Simple onChange - just set the value, let min/max handle validation
                        setTempPhaseConfig(prev => ({
                          ...prev,
                          targetStitches: value,
                          times: Math.max(1, Math.ceil(Math.abs(value - getStitchContext().availableStitches) / (tempPhaseConfig.position === 'both_ends' ? 2 : 1)))
                        }));
                      }}
                      label="target stitch count"
                      unit="stitches"
                      // Fix the min/max to only allow mathematically possible values
                      min={(() => {
                        const available = getStitchContext().availableStitches;
                        const stitchesPerRow = tempPhaseConfig.position === 'both_ends' ? 2 : 1;

                        if (tempPhaseConfig.type === 'decrease') {
                          // For decreases: can go down to 0, but in valid increments
                          return tempPhaseConfig.position === 'both_ends' ?
                            (available % 2 === 0 ? 0 : 1) :  // Even start → even targets, odd start → odd targets
                            0;
                        } else {
                          // For increases: start from current + minimum increment
                          return available + stitchesPerRow;
                        }
                      })()}
                      max={(() => {
                        const available = getStitchContext().availableStitches;
                        if (tempPhaseConfig.type === 'decrease') {
                          return available - (tempPhaseConfig.position === 'both_ends' ? 2 : 1);
                        } else {
                          return 999; // No practical limit for increases
                        }
                      })()}
                      step={tempPhaseConfig.position === 'both_ends' ? 2 : 1}  // ← KEY: This forces valid increments
                    />
                    {tempPhaseConfig.targetStitches && (
                      <div className="text-xs text-wool-500 mt-1">
                        Will {tempPhaseConfig.type} {tempPhaseConfig.times} times to reach {tempPhaseConfig.targetStitches} stitches
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* Live Preview - Similar to EvenDistribution */}
        {tempPhaseConfig.type && (tempPhaseConfig.times || tempPhaseConfig.targetStitches) && (
          <div className="card-info">
            <h4 className="text-sm font-semibold text-lavender-700 mb-3">Preview</h4>
            <div className="space-y-2 text-sm">
              <div className="text-lavender-700">
                <span className="font-medium">Instruction:</span> {getPhasePreview(tempPhaseConfig)}
              </div>
              <div className="text-lavender-600">
                {getStitchContext().availableStitches} stitches → {calculatePhaseEndingStitches()} stitches
                ({construction})
              </div>
              {tempPhaseConfig.amountMode === 'target' && tempPhaseConfig.targetStitches && (
                <div className="text-lavender-600 text-xs">
                  Will {tempPhaseConfig.type} {tempPhaseConfig.times} times to reach target
                </div>
              )}
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
            disabled={(() => {
              if (!tempPhaseConfig.type) return true;

              // Setup phases just need rows
              if (tempPhaseConfig.type === 'setup') {
                return !tempPhaseConfig.rows;
              }

              // Bind off phases need amount and frequency
              if (tempPhaseConfig.type === 'bind_off') {
                return !tempPhaseConfig.amount || !tempPhaseConfig.frequency;
              }

              // Increase/decrease phases need positions and times/target
              return !tempPhaseConfig.positions ||
                tempPhaseConfig.positions.length === 0 ||
                !(tempPhaseConfig.times || tempPhaseConfig.targetStitches);
            })()}
            className="btn-primary flex-1"
          >
            {editingPhaseId ? 'Update Phase' : 'Add Phase'}
          </button>
        </div>
      </div></div>
  );
};

export default PhaseConfigForm;