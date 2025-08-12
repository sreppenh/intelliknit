// src/features/steps/components/EditEvenDistributionForm.jsx
import React, { useState } from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import IncrementInput from '../../../shared/components/IncrementInput';
import PageHeader from '../../../shared/components/PageHeader';
import { formatKnittingInstruction } from '../../../shared/utils/knittingNotation';

const EditEvenDistributionForm = ({
    componentIndex,
    editingStepIndex,
    onBack, onGoToLanding
}) => {
    const { currentProject, dispatch } = useProjectsContext();

    const component = currentProject.components[componentIndex];
    const step = component.steps[editingStepIndex];
    const construction = step.construction || 'flat';

    // Get current stitches for calculations
    const getCurrentStitches = () => {
        if (editingStepIndex === 0) {
            return step.startingStitches || 0;
        }
        const previousStep = component.steps[editingStepIndex - 1];
        return previousStep?.endingStitches || previousStep?.expectedStitches || 0;
    };

    const currentStitches = getCurrentStitches();

    // Initialize form data from existing step
    const existingConfig = step.wizardConfig?.shapingConfig?.config || {};
    const [formData, setFormData] = useState({
        action: existingConfig.action || 'decrease',
        amount: existingConfig.amount || 1,
        description: existingConfig.description || ''
    });

    const updateFormData = (updates) => {
        setFormData(prev => ({ ...prev, ...updates }));
    };

    // Even distribution calculator (same logic as original)
    const calculateEvenDistribution = () => {
        const { action, amount } = formData;

        const targetStitches = action === 'increase' ? currentStitches + amount : currentStitches - amount;
        const stitchChange = targetStitches - currentStitches;
        const numChanges = Math.abs(stitchChange);

        if (numChanges === 0) return { instruction: 'No changes needed', sections: [] };

        // Error checking for impossible scenarios
        if (targetStitches <= 0) {
            return {
                error: `Cannot end with ${targetStitches} stitches - must be at least 1 stitch`,
                instruction: '',
                sections: []
            };
        }

        // Calculate sections: circular = numChanges, flat = numChanges + 1
        const numSections = construction === 'round' ? numChanges : numChanges + 1;
        const totalStitchesInSections = currentStitches;

        // Check if we have enough stitches for the sections
        if (totalStitchesInSections < numSections) {
            return {
                error: `Impossible: ${numChanges} ${action}s would create ${numSections} sections, but only ${totalStitchesInSections} stitches available`,
                instruction: '',
                sections: []
            };
        }

        // Calculate stitches available for K sections
        let totalStitchesForSections;
        if (stitchChange < 0) {
            totalStitchesForSections = currentStitches - (2 * numChanges);
        } else {
            totalStitchesForSections = currentStitches;
        }

        const avgSectionSize = totalStitchesForSections / numSections;

        // Create sections with varying sizes
        const sections = [];
        const baseSize = Math.floor(avgSectionSize);
        const remainder = totalStitchesForSections % numSections;

        // Distribute larger sections more evenly
        if (construction === 'round') {
            for (let i = 0; i < numSections; i++) {
                const interval = remainder > 0 ? Math.ceil(numSections / remainder) : 1;
                const shouldBeLarger = remainder > 0 && (i % interval) === 0 && sections.filter(s => s === baseSize + 1).length < remainder;
                sections.push(shouldBeLarger ? baseSize + 1 : baseSize);
            }
        } else {
            for (let i = 0; i < numSections; i++) {
                const center = Math.floor(numSections / 2);
                const distanceFromCenter = Math.abs(i - center);
                const shouldBeLarger = remainder > 0 && distanceFromCenter <= Math.floor(remainder / 2);
                sections.push(shouldBeLarger ? baseSize + 1 : baseSize);
            }
        }

        // Generate instruction
        const changeType = stitchChange > 0 ? 'inc' : 'K2tog';
        const parts = [];

        for (let i = 0; i < sections.length; i++) {
            if (sections[i] > 0) {
                parts.push(`K${sections[i]}`);
            }
            if (i < sections.length - 1) {
                parts.push(changeType);
            }
            if (construction === 'round' && i === sections.length - 1) {
                parts.push(changeType);
            }
        }

        return {
            instruction: parts.join(', '),
            sections,
            startingStitches: currentStitches,
            endingStitches: targetStitches,
            changeCount: numChanges,
            construction
        };
    };

    const result = calculateEvenDistribution();

    const canSave = () => {
        return formData.action && formData.amount > 0 && !result.error && result.changeCount > 0;
    };

    const handleSave = () => {
        // Create updated shaping configuration
        const updatedShapingConfig = {
            type: 'even_distribution',
            config: {
                action: formData.action,
                amount: formData.amount,
                description: formData.description,
                construction: construction,
                calculation: result
            }
        };

        // Update the step with new shaping data
        const updatedWizardConfig = {
            ...step.wizardConfig,
            shapingConfig: updatedShapingConfig
        };

        // Update step with new ending stitches from calculation
        const updatedStep = {
            ...step,
            wizardConfig: updatedWizardConfig,
            endingStitches: result.endingStitches,
            description: result.instruction // Update description with new instruction
        };

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
                            <h2 className="content-header-primary">⚖️ Even Distribution</h2>
                            <p className="content-subheader">Spread increases or decreases evenly across the {construction === 'round' ? 'round' : 'row'}</p>
                        </div>

                        {/* Action Selection - Radio button style */}
                        <div className="space-y-4">
                            {/* Decrease Option */}
                            <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${formData.action === 'decrease'
                                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="radio"
                                        name="action_type"
                                        value="decrease"
                                        checked={formData.action === 'decrease'}
                                        onChange={() => updateFormData({ action: 'decrease' })}
                                        className="w-4 h-4 text-sage-600 mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="text-2xl">📉</div>
                                            <div className="text-left">
                                                <div className="font-semibold text-base">Decrease</div>
                                                <div className="text-sm opacity-75">Remove stitches evenly across {construction === 'round' ? 'round' : 'row'}</div>
                                            </div>
                                        </div>

                                        {formData.action === 'decrease' && (
                                            <div className="mt-3 space-y-2">
                                                <IncrementInput
                                                    value={formData.amount}
                                                    onChange={(value) => updateFormData({ amount: value })}
                                                    label="amount to decrease"
                                                    unit="stitches"
                                                    min={1}
                                                    contextualMax={Math.floor(currentStitches / 2)}
                                                    size="sm"
                                                />

                                                {formData.amount > 0 && (
                                                    <div className="text-xs text-sage-600 bg-sage-50 rounded-lg p-2">
                                                        <strong>Result:</strong> {currentStitches} → {currentStitches - formData.amount} stitches
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </label>

                            {/* Increase Option */}
                            <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${formData.action === 'increase'
                                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="radio"
                                        name="action_type"
                                        value="increase"
                                        checked={formData.action === 'increase'}
                                        onChange={() => updateFormData({ action: 'increase' })}
                                        className="w-4 h-4 text-sage-600 mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="text-2xl">📈</div>
                                            <div className="text-left">
                                                <div className="font-semibold text-base">Increase</div>
                                                <div className="text-sm opacity-75">Add stitches evenly across {construction === 'round' ? 'round' : 'row'}</div>
                                            </div>
                                        </div>

                                        {formData.action === 'increase' && (
                                            <div className="mt-3 space-y-2">
                                                <IncrementInput
                                                    value={formData.amount}
                                                    onChange={(value) => updateFormData({ amount: value })}
                                                    label="amount to increase"
                                                    unit="stitches"
                                                    min={1}
                                                    contextualMax={construction === 'round' ? currentStitches : currentStitches - 1}
                                                    size="sm"
                                                />

                                                {formData.amount > 0 && (
                                                    <div className="text-xs text-sage-600 bg-sage-50 rounded-lg p-2">
                                                        <strong>Result:</strong> {currentStitches} → {currentStitches + formData.amount} stitches
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Optional Description */}
                        <div>
                            <label className="form-label">
                                Notes (optional)
                            </label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => updateFormData({ description: e.target.value })}
                                className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                                placeholder="e.g., 'for crown decreases', 'armhole shaping'"
                            />
                        </div>

                        {/* Preview */}
                        {result.error ? (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ Error</h4>
                                <div className="text-sm text-red-600">
                                    {result.error}
                                </div>
                            </div>
                        ) : result.instruction && (
                            <div className="card-info">
                                <h4 className="text-sm font-semibold text-lavender-700 mb-3">Preview</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="text-lavender-700">
                                        <span className="font-medium">Instruction:</span> {formatKnittingInstruction(result.instruction)}
                                    </div>
                                    <div className="text-lavender-600">
                                        {result.startingStitches} stitches → {result.endingStitches} stitches
                                        ({result.construction})
                                    </div>
                                </div>
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

export default EditEvenDistributionForm;