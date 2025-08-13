// src/features/steps/components/EditDurationForm.jsx
import React, { useState } from 'react';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import IncrementInput from '../../../../shared/components/IncrementInput';
import PageHeader from '../../../../shared/components/PageHeader';

const EditDurationForm = ({
    componentIndex,
    editingStepIndex,
    onBack, onGoToLanding
}) => {
    const { currentProject, dispatch } = useProjectsContext();

    const component = currentProject.components[componentIndex];
    const step = component.steps[editingStepIndex];
    const construction = step.construction || 'flat';
    const pattern = step.wizardConfig?.stitchPattern?.pattern;

    // Initialize form data from existing step
    const [formData, setFormData] = useState({
        type: step.wizardConfig?.duration?.type || '',
        value: step.wizardConfig?.duration?.value || '',
        units: step.wizardConfig?.duration?.units || 'inches',
        reference: step.wizardConfig?.duration?.reference || '',
        completeRepeats: step.wizardConfig?.duration?.completeRepeats || false
    });

    const updateFormData = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleDurationTypeSelect = (type) => {
        updateFormData({ type, value: '' }); // Clear value when changing type
    };

    const patternHasRepeats = step.wizardConfig?.stitchPattern?.rowsInPattern &&
        parseInt(step.wizardConfig.stitchPattern.rowsInPattern) > 0;

    // Smart gauge calculation using real project data
    const calculateRowsFromLength = (inches) => {
        const projectGauge = currentProject?.gauge;

        if (!inches || !projectGauge?.rowGauge?.rows || !projectGauge?.rowGauge?.measurement) {
            return null;
        }

        // Handle unit conversion if needed
        const inputUnits = formData.units || 'inches';
        const gaugeUnits = currentProject?.defaultUnits || 'inches';

        let convertedInches = parseFloat(inches);
        if (inputUnits === 'cm' && gaugeUnits === 'inches') {
            convertedInches = convertedInches / 2.54; // cm to inches
        } else if (inputUnits === 'inches' && gaugeUnits === 'cm') {
            convertedInches = convertedInches * 2.54; // inches to cm
        }

        const rowsPerUnit = projectGauge.rowGauge.rows / projectGauge.rowGauge.measurement;
        return Math.round(convertedInches * rowsPerUnit);
    };

    const estimatedRows = formData.type === 'length' && formData.value
        ? calculateRowsFromLength(formData.value)
        : null;

    const canSave = () => {
        return formData.type && formData.value && (
            formData.type === 'until_length' ? true : parseFloat(formData.value) > 0
        );
    };

    const handleSave = () => {
        // Update the existing step with new duration data
        const updatedWizardConfig = {
            ...step.wizardConfig,
            duration: {
                type: formData.type,
                value: formData.value,
                units: formData.units,
                reference: formData.reference,
                completeRepeats: formData.completeRepeats
            }
        };

        // For repeats, recalculate total rows if pattern has rowsInPattern
        let updatedStep = {
            ...step,
            wizardConfig: updatedWizardConfig
        };

        if (formData.type === 'repeats' && step.wizardConfig?.stitchPattern?.rowsInPattern) {
            const repeats = parseInt(formData.value) || 1;
            const rowsInPattern = parseInt(step.wizardConfig.stitchPattern.rowsInPattern) || 1;
            updatedStep.totalRows = repeats * rowsInPattern;
        }

        dispatch({
            type: 'UPDATE_STEP',
            payload: {
                componentIndex,
                stepIndex: editingStepIndex,
                step: updatedStep
            }
        });

        onBack();
    };

    return (
        <div className="min-h-screen bg-yarn-50">
            <div className="app-container bg-white min-h-screen shadow-lg">
                <PageHeader
                    useBranding={true}
                    onHome={onGoToLanding}
                    compact={true}
                    onBack={onBack}
                    showCancelButton={true}
                    onCancel={onBack}
                />

                <div className="p-6 bg-yarn-50">
                    <div className="space-y-6">
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
                                        value={formData.value}
                                        onChange={(e) => updateFormData({ value: e.target.value, type: 'stitches' })}
                                        placeholder="Leave blank for all stitches"
                                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                                    />
                                    <p className="text-xs text-wool-500 mt-2">
                                        Leave blank to bind off all remaining stitches
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* Normal Duration Selection */
                            <div className="space-y-4">
                                {/* Rows Option */}
                                <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${formData.type === 'rows'
                                    ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                    : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                                    }`}>
                                    <div className="flex items-start gap-4">
                                        <input
                                            type="radio"
                                            name="duration_type"
                                            value="rows"
                                            checked={formData.type === 'rows'}
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

                                            {formData.type === 'rows' && (
                                                <div className="mt-3 space-y-2">
                                                    <IncrementInput
                                                        value={formData.value}
                                                        onChange={(value) => updateFormData({ value })}
                                                        label="number of rows"
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
                                <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${formData.type === 'length'
                                    ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                    : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                                    }`}>
                                    <div className="flex items-start gap-4">
                                        <input
                                            type="radio"
                                            name="duration_type"
                                            value="length"
                                            checked={formData.type === 'length'}
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

                                            {formData.type === 'length' && (
                                                <div className="mt-3 stack-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-sage-700">Add</span>
                                                        <IncrementInput
                                                            value={formData.value}
                                                            onChange={(value) => updateFormData({ value })}
                                                            label="length to add"
                                                            min={0.25}
                                                            useDecimals={true}
                                                            step={0.25}
                                                            size="sm"
                                                        />
                                                        <select
                                                            value={formData.units}
                                                            onChange={(e) => updateFormData({ units: e.target.value })}
                                                            className="border-2 border-sage-300 rounded-lg px-3 py-2 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                                                        >
                                                            <option value="inches">inches</option>
                                                            <option value="cm">cm</option>
                                                        </select>
                                                    </div>

                                                    {/* Smart gauge field */}
                                                    {estimatedRows && (
                                                        <div className="bg-sage-50 border border-sage-200 rounded-lg p-3">
                                                            <div className="text-sm text-sage-700">
                                                                <span className="font-medium">Estimated rows:</span> {estimatedRows}
                                                                <div className="text-xs text-sage-600 mt-1">
                                                                    Using gauge: {currentProject?.gauge?.rowGauge?.rows || '24'} rows = {currentProject?.gauge?.rowGauge?.measurement || '4'} {currentProject?.defaultUnits || 'inches'}
                                                                    {currentProject?.gauge?.pattern && ` in ${currentProject.gauge.pattern}`}
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
                                <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${formData.type === 'until_length'
                                    ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                    : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                                    }`}>
                                    <div className="flex items-start gap-4">
                                        <input
                                            type="radio"
                                            name="duration_type"
                                            value="until_length"
                                            checked={formData.type === 'until_length'}
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

                                            {formData.type === 'until_length' && (
                                                <div className="mt-3 stack-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-sage-700">Work until piece measures</span>
                                                        <IncrementInput
                                                            value={formData.value}
                                                            onChange={(value) => updateFormData({ value })}
                                                            label="target measurement"
                                                            min={0.25}
                                                            useDecimals={true}
                                                            step={0.25}
                                                            size="sm"
                                                        />
                                                        <select
                                                            value={formData.units}
                                                            onChange={(e) => updateFormData({ units: e.target.value })}
                                                            className="border-2 border-sage-300 rounded-lg px-3 py-2 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                                                        >
                                                            <option value="inches">inches</option>
                                                            <option value="cm">cm</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <input
                                                            type="text"
                                                            value={formData.reference}
                                                            onChange={(e) => updateFormData({ reference: e.target.value })}
                                                            placeholder="from cast on, from start of armhole, etc."
                                                            className="w-full border-2 border-sage-300 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white text-sage-600 placeholder-wool-400"
                                                        />
                                                        <p className="text-xs text-sage-600 mt-1">Reference point (e.g., from cast on, from start of armhole)</p>
                                                    </div>

                                                    {/* Complete repeats checkbox - only for patterns with repeats */}
                                                    {patternHasRepeats && (
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.completeRepeats}
                                                                onChange={(e) => updateFormData({ completeRepeats: e.target.checked })}
                                                                className="w-4 h-4 text-sage-600 mt-0.5"
                                                            />
                                                            <span className="text-sm text-sage-700 text-left">Complete pattern repeats only (no partial patterns)</span>
                                                        </label>
                                                    )}

                                                    <div className="text-xs text-sage-600">
                                                        💡 Work until your piece reaches the exact target measurement from your reference point
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </label>

                                {/* Pattern repeats - only show if pattern has repeats */}
                                {patternHasRepeats && (
                                    <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${formData.type === 'repeats'
                                        ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                        : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                                        }`}>
                                        <div className="flex items-start gap-4">
                                            <input
                                                type="radio"
                                                name="duration_type"
                                                value="repeats"
                                                checked={formData.type === 'repeats'}
                                                onChange={() => handleDurationTypeSelect('repeats')}
                                                className="w-4 h-4 text-sage-600 mt-1"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="text-2xl">🔄</div>
                                                    <div className="text-left">
                                                        <div className="font-semibold text-base">Pattern repeats</div>
                                                        <div className="text-sm opacity-75">Repeat the {step.wizardConfig.stitchPattern.rowsInPattern}-{construction === 'round' ? 'round' : 'row'} pattern</div>
                                                    </div>
                                                </div>

                                                {formData.type === 'repeats' && (
                                                    <div className="mt-3 space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-sage-700">Repeat the pattern</span>
                                                            <IncrementInput
                                                                value={formData.value}
                                                                onChange={(value) => updateFormData({ value })}
                                                                label="pattern repeats"
                                                                min={1}
                                                                size="sm"
                                                            />
                                                        </div>

                                                        {formData.value && (
                                                            <div className="text-xs text-sage-600 bg-sage-50 rounded-lg p-2">
                                                                <strong>Preview:</strong> Repeat the {step.wizardConfig.stitchPattern.rowsInPattern}-{construction === 'round' ? 'round' : 'row'} pattern {formData.value} times
                                                                ({(parseInt(step.wizardConfig.stitchPattern.rowsInPattern) || 0) * (parseInt(formData.value) || 0)} total {construction === 'round' ? 'rounds' : 'rows'})
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="pt-4 border-t border-wool-200">
                            <div className="flex gap-3">
                                <button
                                    onClick={onBack}
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditDurationForm;