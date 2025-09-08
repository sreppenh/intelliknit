// src/features/steps/components/shaping-wizard/EvenDistributionForm.jsx
import React, { useState } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { formatKnittingInstruction } from '../../../../shared/utils/knittingNotation';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';

/**
 * EvenDistributionForm - Pure form component for even distribution shaping
 * 
 * Extracted from EvenDistributionConfig to eliminate duplication with EditEvenDistributionForm.
 * This component handles the form UI and calculation logic only.
 */
const EvenDistributionForm = ({
    currentStitches,
    construction,
    initialConfig = {},
    mode = 'create',
    onSave,
    onCancel,
    showSaveActions = false
}) => {
    const terms = getConstructionTerms(construction);
    // Initialize config from props or defaults
    const getInitialConfig = () => {
        if (initialConfig && Object.keys(initialConfig).length > 0) {
            return {
                action: initialConfig.action || 'decrease',
                amount: initialConfig.amount || 1,
                description: initialConfig.description || ''
            };
        }

        return {
            action: 'decrease',
            amount: 1,
            description: ''
        };
    };

    const [config, setConfig] = useState(getInitialConfig());
    const isEditMode = mode === 'edit';

    // Even distribution calculator (consolidated from both original files)
    const calculateEvenDistribution = () => {
        const { action, amount } = config;

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
            // Circular: spread larger sections evenly around the circle
            for (let i = 0; i < numSections; i++) {
                const interval = remainder > 0 ? Math.ceil(numSections / remainder) : 1;
                const shouldBeLarger = remainder > 0 && (i % interval) === 0 && sections.filter(s => s === baseSize + 1).length < remainder;
                sections.push(shouldBeLarger ? baseSize + 1 : baseSize);
            }
        } else {
            // FIXED FLAT: Center-weight, but respect remainder count exactly
            const center = Math.floor(numSections / 2);

            // Create array of distances from center with their indices
            const distanceMap = [];
            for (let i = 0; i < numSections; i++) {
                distanceMap.push({
                    index: i,
                    distance: Math.abs(i - center)
                });
            }

            // Sort by distance (closest to center first)
            distanceMap.sort((a, b) => a.distance - b.distance);

            // Give +1 to exactly `remainder` closest positions to center
            const largerIndices = new Set();
            for (let i = 0; i < remainder; i++) {
                largerIndices.add(distanceMap[i].index);
            }

            // Build sections array
            for (let i = 0; i < numSections; i++) {
                sections.push(largerIndices.has(i) ? baseSize + 1 : baseSize);
            }
        }

        // Generate instruction
        const changeType = stitchChange > 0 ? 'inc' : 'K2tog';
        const parts = [];

        for (let i = 0; i < sections.length; i++) {
            if (sections[i] > 0) {  // Only add if section has stitches
                parts.push(`K${sections[i]}`);
            }
            // Add decrease after each section except the last one for flat construction
            if (i < sections.length - 1) {
                parts.push(changeType);
            }
            // For round construction, add decrease after every section (including last)
            if (construction === 'round' && i === sections.length - 1) {
                parts.push(changeType);
            }
        }

        // Debug logging (from original)
        IntelliKnitLogger.debug('Stitch Math', {
            totalStitchesForSections: totalStitchesForSections,
            avgSectionSize: avgSectionSize,
            baseSize: baseSize,
            remainder: remainder
        });

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

    // Validation
    const canSave = () => {
        return config.action && config.amount > 0 && !result.error && result.changeCount > 0;
    };

    // Save handlers
    const handleSave = () => {
        if (onSave && canSave()) {
            onSave({
                ...config,
                construction,
                calculation: result
            });
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="space-y-6">
            {/* Mode indicator for edit mode */}
            {isEditMode && (
                <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-3 mb-4">
                    <p className="text-sm text-yarn-600 font-medium">
                        🔧 Edit Mode - Even Distribution Configuration
                    </p>
                    <p className="text-xs text-yarn-500 mt-1">
                        Update your increase/decrease distribution settings
                    </p>
                </div>
            )}

            <div>
                <h2 className="content-header-primary">⚖️ Even Distribution</h2>

                <p className="content-subheader">Spread increases or decreases evenly across the {terms.row}</p>
            </div>

            {/* Action Selection - Radio button style */}
            <div className="space-y-4">

                {/* Increase Option */}
                <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${config.action === 'increase'
                    ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                    : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                    }`}>
                    <div className="flex items-start gap-4">
                        <input
                            type="radio"
                            name="action_type"
                            value="increase"
                            checked={config.action === 'increase'}
                            onChange={() => setConfig(prev => ({ ...prev, action: 'increase' }))}
                            className="w-4 h-4 text-sage-600 mt-1"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-2xl">📈</div>
                                <div className="text-left">
                                    <div className="font-semibold text-base">Increase</div>
                                    <div className="text-sm opacity-75">Add stitches evenly across {terms.row}</div>
                                </div>
                            </div>

                            {config.action === 'increase' && (
                                <div className="mt-3 space-y-2">
                                    <IncrementInput
                                        value={config.amount}
                                        onChange={(value) => setConfig(prev => ({ ...prev, amount: value }))}
                                        label="amount to increase"
                                        unit="stitches"
                                        min={1}
                                        contextualMax={construction === 'round' ? currentStitches : currentStitches - 1}
                                        size="sm"
                                    />

                                    {config.amount > 0 && (
                                        <div className="text-xs text-sage-600 bg-sage-50 rounded-lg p-2">
                                            <strong>Result:</strong> {currentStitches} → {currentStitches + config.amount} stitches
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </label>


                {/* Decrease Option */}
                <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${config.action === 'decrease'
                    ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                    : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                    }`}>
                    <div className="flex items-start gap-4">
                        <input
                            type="radio"
                            name="action_type"
                            value="decrease"
                            checked={config.action === 'decrease'}
                            onChange={() => setConfig(prev => ({ ...prev, action: 'decrease' }))}
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

                            {config.action === 'decrease' && (
                                <div className="mt-3 space-y-2">
                                    <IncrementInput
                                        value={config.amount}
                                        onChange={(value) => setConfig(prev => ({ ...prev, amount: value }))}
                                        label="amount to decrease"
                                        unit="stitches"
                                        min={1}
                                        contextualMax={Math.floor(currentStitches / 2)}
                                        size="sm"
                                    />

                                    {config.amount > 0 && (
                                        <div className="text-xs text-sage-600 bg-sage-50 rounded-lg p-2">
                                            <strong>Result:</strong> {currentStitches} → {currentStitches - config.amount} stitches
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
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
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

export default EvenDistributionForm;