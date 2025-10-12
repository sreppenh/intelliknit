import React from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { getPatternRepeatInfo, getValidTargetStitches, calculateRepeatsToTarget, calculateTargetRows } from '../../../../shared/utils/targetStitchUtils';

const DurationChoice = ({
  wizardData,
  updateWizardData,
  construction,
  project,
  mode,
  onSave,
  onCancel,
  showSaveActions = false,
  currentStitches = 0
}) => {
  const { pattern } = wizardData.stitchPattern;

  // SAFETY CHECK: Ensure duration exists
  if (!wizardData.duration) {
    console.log('Missing duration in wizardData:', wizardData);
    return <div>Loading...</div>;
  }

  // Skip duration for Cast On (already configured)
  if (pattern === 'Cast On') {
    return (
      <div className="stack-lg">
        <div className="success-block-center">
          <div className="text-2xl mb-2">🗝️</div>
          <h3 className="content-header-secondary mb-2">Cast On Ready!</h3>
          <p className="text-sm text-sage-600">Your cast on step is ready to add</p>
        </div>
      </div>
    );
  }

  const isEditMode = mode === 'edit';

  // Check if pattern has repeats (existing code)
  const patternHasRepeats = wizardData.stitchPattern?.rowsInPattern &&
    parseInt(wizardData.stitchPattern.rowsInPattern) > 0;

  // ✅ NEW: Check if pattern supports target-based repeats
  const repeatInfo = getPatternRepeatInfo(wizardData.stitchPattern);
  const supportsTargetRepeats = repeatInfo.hasRepeat && repeatInfo.stitchChangePerRepeat !== 0;

  // ✅ NEW: Calculate valid target stitches if applicable
  const validTargets = supportsTargetRepeats
    ? getValidTargetStitches(currentStitches, repeatInfo.stitchChangePerRepeat, 100)
    : [];

  // ✅ NEW: Check if color pattern exists
  const hasColorPattern = wizardData.colorwork?.type === 'stripes' &&
    wizardData.colorwork?.stripeSequence?.length > 0;

  const handleDurationTypeSelect = (type) => {
    updateWizardData('duration', { type, value: '' });
  };

  // Smart gauge calculation using real project data
  const calculateRowsFromLength = (inches) => {
    const projectGauge = project?.gauge;

    if (!inches || !projectGauge?.rowGauge?.rows || !projectGauge?.rowGauge?.measurement) {
      return null;
    }

    // Handle unit conversion if needed
    const inputUnits = wizardData.duration?.units || 'inches';
    const gaugeUnits = project?.defaultUnits || 'inches';

    let convertedInches = parseFloat(inches);
    if (inputUnits === 'cm' && gaugeUnits === 'inches') {
      convertedInches = convertedInches / 2.54; // cm to inches
    } else if (inputUnits === 'inches' && gaugeUnits === 'cm') {
      convertedInches = convertedInches * 2.54; // inches to cm
    }

    const rowsPerUnit = projectGauge.rowGauge.rows / projectGauge.rowGauge.measurement;
    return Math.round(convertedInches * rowsPerUnit);
  };

  const estimatedRows = wizardData.duration.type === 'length' && wizardData.duration.value
    ? calculateRowsFromLength(wizardData.duration.value)
    : null;

  // ✅ NEW: Calculate target repeat details
  const targetRepeatDetails = wizardData.duration.type === 'target_repeats' && wizardData.duration.targetStitches
    ? (() => {
      const targetStitches = parseInt(wizardData.duration.targetStitches);
      const calculation = calculateRepeatsToTarget(
        currentStitches,
        targetStitches,
        repeatInfo.stitchChangePerRepeat
      );

      const rowCalc = calculateTargetRows(
        calculation.repeats,
        repeatInfo.rowsInPattern,
        wizardData.duration.completeSequence || false,
        targetStitches,
        currentStitches,
        repeatInfo.stitchChangePerRepeat
      );

      return {
        ...calculation,
        ...rowCalc,
        changePerRepeat: repeatInfo.stitchChangePerRepeat,
        rowsPerRepeat: repeatInfo.rowsInPattern
      };
    })()
    : null;



  console.log('🔍 Duration Data:', {
    type: wizardData.duration.type,
    targetStitches: wizardData.duration.targetStitches,
    canSaveResult: wizardData.duration.targetStitches && parseInt(wizardData.duration.targetStitches) > 0
  });

  const canSave = () => {
    if (wizardData.duration.type === 'target_repeats') {
      return wizardData.duration.targetStitches && parseInt(wizardData.duration.targetStitches) > 0;
    }
    return wizardData.duration?.type && wizardData.duration?.value && (
      wizardData.duration.type === 'until_length' ? true : parseFloat(wizardData.duration.value) > 0
    );
  };

  // Save handlers for edit mode
  const handleSave = () => {
    if (onSave && canSave()) {
      onSave(wizardData.duration);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="stack-lg">
      {/* Mode indicator for edit mode */}
      {isEditMode && (
        <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-3 mb-4">
          <p className="text-sm text-yarn-600 font-medium">
            🔧 Edit Mode - Duration Configuration
          </p>
          <p className="text-xs text-yarn-500 mt-1">
            Update how you want to measure your {pattern?.toLowerCase()}
          </p>
        </div>
      )}

      <div>
        <h2 className="content-header-primary">Configure Length</h2>
        <p className="content-subheader">Choose how you want to measure your {pattern?.toLowerCase()}</p>
      </div>

      {/* Bind Off - Special case */}
      {pattern === 'Bind Off' ? (
        <div className="space-y-4">
          <div className="success-block">
            <div className="text-center">
              <div className="text-2xl mb-2">✂️</div>
              <h3 className="content-header-secondary mb-2">Bind Off Stitches</h3>
              <p className="text-sm text-sage-600">Specify how many stitches to bind off</p>
            </div>
          </div>

          <div>
            <label className="form-label">
              Number of Stitches to Bind Off
            </label>
            <input
              type="number"
              value={wizardData.duration.value}
              onChange={(e) => updateWizardData('duration', { value: e.target.value, type: 'stitches' })}
              placeholder="Leave blank for all stitches"
              className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
            />
            <p className="text-xs text-wool-500 mt-2">
              Leave blank to bind off all remaining stitches
            </p>
          </div>
        </div>
      ) : (
        /* Normal Duration Selection - Single Page with Radio Buttons */
        <div className="space-y-4">

          {/* Rows Option */}
          <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${wizardData.duration.type === 'rows'
            ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
            : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
            }`}>
            <div className="flex items-start gap-4">
              <input
                type="radio"
                name="duration_type"
                value="rows"
                checked={wizardData.duration.type === 'rows'}
                onChange={() => handleDurationTypeSelect('rows')}
                className="w-4 h-4 text-sage-600 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">📊</div>
                  <div className="text-left">
                    <div className="font-semibold text-base">{construction === 'round' ? 'Rounds' : 'Rows'}</div>
                    <div className="text-sm opacity-75">Count specific number of {construction === 'round' ? 'rounds' : 'rows'}</div>
                  </div>
                </div>

                {wizardData.duration.type === 'rows' && (
                  <div className="mt-3 space-y-2">
                    <IncrementInput
                      value={wizardData.duration.value}
                      onChange={(value) => updateWizardData('duration', { value })}
                      label="number of rows"
                      unit="rows"
                      construction={construction}
                      min={1}
                      size="sm"
                    />

                    <div className="text-xs text-sage-600">
                      💡 This is the total number of {construction === 'round' ? 'rounds' : 'rows'} to work for this section
                    </div>
                  </div>
                )}
              </div>
            </div>
          </label>

          {/* Length from current position */}
          <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${wizardData.duration.type === 'length'
            ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
            : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
            }`}>
            <div className="flex items-start gap-4">
              <input
                type="radio"
                name="duration_type"
                value="length"
                checked={wizardData.duration.type === 'length'}
                onChange={() => handleDurationTypeSelect('length')}
                className="w-4 h-4 text-sage-600 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">📏</div>
                  <div className="text-left">
                    <div className="font-semibold text-base">Length from current position</div>
                    <div className="text-sm opacity-75">Add specific length from where you are now</div>
                  </div>
                </div>

                {wizardData.duration.type === 'length' && (
                  <div className="mt-3 stack-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-sage-700">Add</span>
                      <IncrementInput
                        value={wizardData.duration.value}
                        onChange={(value) => updateWizardData('duration', { value })}
                        label="length to add"
                        min={0.25}
                        useDecimals={true}
                        step={0.25}
                        size="sm"
                      />
                      <span className="text-sm text-sage-700">
                        {project?.defaultUnits || 'inches'}
                      </span>
                    </div>

                    {/* Smart gauge field */}
                    {estimatedRows && (
                      <div className="bg-sage-50 border border-sage-200 rounded-lg p-3">
                        <div className="text-sm text-sage-700">
                          <span className="font-medium">Estimated rows:</span> {estimatedRows}
                          <div className="text-xs text-sage-600 mt-1">
                            Using gauge: {project?.gauge?.rowGauge?.rows || '24'} rows = {project?.gauge?.rowGauge?.measurement || '4'} {project?.defaultUnits || 'inches'}
                            {project?.gauge?.pattern && ` in ${project.gauge.pattern}`}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-sage-600">
                      💡 This adds length from your current position. Gauge calculation helps estimate rows needed
                    </div>
                  </div>
                )}

              </div>
            </div>
          </label>

          {/* Length until target */}
          {mode !== 'notepad' && (
            <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${wizardData.duration.type === 'until_length'
              ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
              : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
              }`}>
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="duration_type"
                  value="until_length"
                  checked={wizardData.duration.type === 'until_length'}
                  onChange={() => handleDurationTypeSelect('until_length')}
                  className="w-4 h-4 text-sage-600 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">📐</div>
                    <div className="text-left">
                      <div className="font-semibold text-base">Length until target</div>
                      <div className="text-sm opacity-75">Work until piece measures a specified length</div>
                    </div>
                  </div>

                  {wizardData.duration.type === 'until_length' && (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center gap-2 text-sm text-sage-700">
                        <span>Work until piece measures</span>
                        <IncrementInput
                          value={wizardData.duration.value}
                          onChange={(value) => updateWizardData('duration', { value })}
                          label="target measurement"
                          min={0.25}
                          useDecimals={true}
                          step={0.25}
                          size="sm"
                        />
                        <span>{wizardData.duration.units || project?.defaultUnits || 'inches'}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <label className="text-sage-700">from</label>
                        <input
                          type="text"
                          value={wizardData.duration.reference || ''}
                          onChange={(e) => updateWizardData('duration', { reference: e.target.value })}
                          placeholder="cast on, start of armhole, etc."
                          className="flex-1 border-2 border-sage-300 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </label>
          )}

          {/* Pattern repeats - only show if pattern has repeats */}
          {patternHasRepeats && (
            <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${wizardData.duration.type === 'repeats'
              ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
              : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
              }`}>
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="duration_type"
                  value="repeats"
                  checked={wizardData.duration.type === 'repeats'}
                  onChange={() => handleDurationTypeSelect('repeats')}
                  className="w-4 h-4 text-sage-600 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">🔄</div>
                    <div className="text-left">
                      <div className="font-semibold text-base">Pattern repeats</div>
                      <div className="text-sm opacity-75">Repeat the {wizardData.stitchPattern.rowsInPattern}-{construction === 'round' ? 'round' : 'row'} pattern</div>
                    </div>
                  </div>

                  {wizardData.duration.type === 'repeats' && (
                    <div className="mt-3 space-y-2">

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-sage-700">Repeat the pattern</span>
                        <IncrementInput
                          value={wizardData.duration.value}
                          onChange={(value) => updateWizardData('duration', { value })}
                          label="pattern repeats"
                          unit="times"
                          min={1}
                          size="sm"
                        />
                      </div>

                      {wizardData.duration.value && (
                        <div className="text-xs text-sage-600 bg-sage-50 rounded-lg p-2">
                          <strong>Preview:</strong> Repeat the {wizardData.stitchPattern.rowsInPattern}-{construction === 'round' ? 'round' : 'row'} pattern {wizardData.duration.value} times
                          ({(parseInt(wizardData.stitchPattern.rowsInPattern) || 0) * (parseInt(wizardData.duration.value) || 0)} total {construction === 'round' ? 'rounds' : 'rows'})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </label>
          )}

          {/* ✅ NEW: Target Stitch Count - only show for patterns with net stitch change */}
          {supportsTargetRepeats && (
            <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${wizardData.duration.type === 'target_repeats'
              ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
              : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
              }`}>
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="duration_type"
                  value="target_repeats"
                  checked={wizardData.duration.type === 'target_repeats'}
                  onChange={() => handleDurationTypeSelect('target_repeats')}
                  className="w-4 h-4 text-sage-600 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">🎯</div>
                    <div className="text-left">
                      <div className="font-semibold text-base">Until target stitch count</div>
                      <div className="text-sm opacity-75">Repeat pattern until reaching specific stitch count</div>
                    </div>
                  </div>

                  {wizardData.duration.type === 'target_repeats' && (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-sage-700">Target stitches:</span>
                        <IncrementInput
                          value={wizardData.duration.targetStitches}
                          onChange={(value) => updateWizardData('duration', { targetStitches: value })}
                          label="target stitch count"
                          unit="stitches"
                          min={repeatInfo.stitchChangePerRepeat > 0 ? currentStitches + repeatInfo.stitchChangePerRepeat : repeatInfo.stitchChangePerRepeat}
                          max={validTargets[validTargets.length - 1]}
                          size="sm"
                        />
                      </div>

                      <div className="text-xs text-sage-600 bg-white border border-sage-200 rounded-lg p-2">
                        <div><strong>Currently:</strong> {currentStitches} stitches</div>
                        <div><strong>Pattern change:</strong> {repeatInfo.stitchChangePerRepeat > 0 ? '+' : ''}{repeatInfo.stitchChangePerRepeat} stitches per repeat</div>
                      </div>

                      {targetRepeatDetails && (
                        <>
                          <div className="bg-sage-50 border border-sage-200 rounded-lg p-3">
                            <div className="text-sm text-sage-700">
                              <div className="font-medium mb-1">Calculation:</div>
                              <div className="text-xs space-y-1">
                                <div>• Needs {targetRepeatDetails.repeats} {targetRepeatDetails.repeats === 1 ? 'repeat' : 'repeats'}</div>
                                <div>• Total {construction === 'round' ? 'rounds' : 'rows'}: {targetRepeatDetails.totalRows}</div>
                                <div>• Ending stitches: {targetRepeatDetails.endingStitches}</div>
                              </div>
                            </div>
                          </div>

                          {/* Complete sequence toggle */}
                          <label className="flex items-start gap-3 p-3 bg-white border border-sage-200 rounded-lg cursor-pointer hover:bg-sage-50 transition-colors">
                            <input
                              type="checkbox"
                              checked={wizardData.duration.completeSequence || false}
                              onChange={(e) => updateWizardData('duration', { completeSequence: e.target.checked })}
                              className="w-4 h-4 text-sage-600 mt-0.5"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-sage-700">
                                Complete final repeat
                              </div>
                              <div className="text-xs text-sage-600 mt-1">
                                Finish all {repeatInfo.rowsInPattern} {construction === 'round' ? 'rounds' : 'rows'} even if target is reached mid-sequence
                              </div>
                            </div>
                          </label>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </label>
          )}

          {/* Color pattern repeats - only show if colorwork exists */}
          {hasColorPattern && (
            <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${wizardData.duration.type === 'color_repeats'
              ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
              : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
              }`}>
              <div className="flex items-start gap-4">
                <input
                  type="radio"
                  name="duration_type"
                  value="color_repeats"
                  checked={wizardData.duration.type === 'color_repeats'}
                  onChange={() => handleDurationTypeSelect('color_repeats')}
                  className="w-4 h-4 text-sage-600 mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">🎨</div>
                    <div className="text-left">
                      <div className="font-semibold text-base">Repeat Color Pattern</div>
                      <div className="text-sm opacity-75">Repeat the stripe sequence</div>
                    </div>
                  </div>

                  {wizardData.duration.type === 'color_repeats' && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-sage-700">Repeat the color pattern</span>
                        <IncrementInput
                          value={wizardData.duration.value}
                          onChange={(value) => updateWizardData('duration', { value })}
                          label="color repeats"
                          unit="times"
                          min={1}
                          size="sm"
                        />
                      </div>

                      {wizardData.duration.value && (() => {
                        // Calculate total rows in stripe sequence
                        const totalRowsInSequence = wizardData.colorwork.stripeSequence.reduce(
                          (sum, stripe) => sum + (stripe.rows || 0),
                          0
                        );
                        const totalRows = totalRowsInSequence * parseInt(wizardData.duration.value);

                        return (
                          <div className="text-xs text-sage-600 bg-sage-50 rounded-lg p-2">
                            <strong>Preview:</strong> Repeat the {totalRowsInSequence}-{construction === 'round' ? 'round' : 'row'} stripe pattern {wizardData.duration.value} times
                            ({totalRows} total {construction === 'round' ? 'rounds' : 'rows'})
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </label>
          )}
        </div>
      )}

      {/* Save Actions for Edit Mode */}
      {showSaveActions && (
        <div className="pt-4 border-t border-wool-200">
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 btn-tertiary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave()}
              className="flex-1 btn-primary"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DurationChoice;