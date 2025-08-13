// src/features/steps/components/shaping-wizard/SequentialPhasesWizard.jsx
import React, { useState } from 'react';
import PageHeader from '../../../../shared/components/PageHeader';

/**
 * SequentialPhasesWizard - Single-screen progressive wizard for phase configuration
 * 
 * Phase 1: Basic structure + phase type selection
 * Following PatternSelector patterns for progressive revelation
 */
const SequentialPhasesWizard = ({
    currentStitches,
    construction,
    initialPhaseData = {},
    mode = 'creation',
    onSave,
    onCancel,
    onGoToLanding
}) => {

    // Phase configuration state
    const [phaseConfig, setPhaseConfig] = useState({
        type: initialPhaseData.type || null,
        action: initialPhaseData.action || null, // increase/decrease (for type-specific config)
        position: initialPhaseData.position || null,
        frequency: initialPhaseData.frequency || null,
        mode: initialPhaseData.mode || 'times', // 'times' or 'target'
        times: initialPhaseData.times || 1,
        target: initialPhaseData.target || null,
        rows: initialPhaseData.rows || 1, // for setup type
        amount: initialPhaseData.amount || 1
    });

    const isEditMode = mode === 'edit';

    // Phase type definitions (matching existing PhaseConfigTypeSelector)
    const phaseTypes = [
        {
            id: 'increase',
            name: 'Increase Phase',
            icon: '📈',
            description: 'Add stitches at specified positions and frequencies'
        },
        {
            id: 'decrease',
            name: 'Decrease Phase',
            icon: '📉',
            description: 'Remove stitches at specified positions and frequencies'
        },
        {
            id: 'setup',
            name: 'Setup Rows',
            icon: '📋',
            description: 'Work plain rows between shaping phases'
        },
        {
            id: 'bind_off',
            name: 'Bind Off Phase',
            icon: '✂️',
            description: 'Remove stitches by binding off'
        }
    ];

    // Update phase config
    const updatePhaseConfig = (updates) => {
        setPhaseConfig(prev => ({ ...prev, ...updates }));
    };

    // Handle phase type selection
    const handlePhaseTypeSelect = (typeId) => {
        updatePhaseConfig({
            type: typeId,
            // Reset subsequent fields when type changes
            action: typeId === 'increase' ? 'increase' : typeId === 'decrease' ? 'decrease' : null,
            position: null,
            frequency: null,
            mode: 'times',
            times: 1,
            target: null,
            rows: 1,
            amount: 1
        });
    };

    // Validation helpers
    const canSave = () => {
        if (!phaseConfig.type) return false;

        switch (phaseConfig.type) {
            case 'setup':
                return phaseConfig.rows > 0;
            case 'increase':
            case 'decrease':
                return phaseConfig.position && phaseConfig.frequency &&
                    ((phaseConfig.mode === 'times' && phaseConfig.times > 0) ||
                        (phaseConfig.mode === 'target' && phaseConfig.target > 0));
            case 'bind_off':
                return phaseConfig.amount > 0;
            default:
                return false;
        }
    };

    // Save handler
    const handleSave = () => {
        if (onSave && canSave()) {
            onSave(phaseConfig);
        }
    };

    return (
        <div className="min-h-screen bg-yarn-50">
            <div className="app-container bg-white min-h-screen shadow-lg">
                <PageHeader
                    useBranding={true}
                    onHome={onGoToLanding}
                    compact={true}
                    onBack={onCancel}
                    showCancelButton={true}
                    onCancel={onCancel}
                />

                <div className="p-6 bg-yarn-50">
                    <div className="space-y-6">
                        {/* Mode indicator for edit mode */}
                        {isEditMode && (
                            <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-3 mb-4">
                                <p className="text-sm text-yarn-600 font-medium">
                                    🔧 Edit Mode - Phase Configuration
                                </p>
                                <p className="text-xs text-yarn-500 mt-1">
                                    Update your phase settings
                                </p>
                            </div>
                        )}

                        {/* Header */}
                        <div className="text-center">
                            <h2 className="content-header-primary">Add Phase</h2>
                            <p className="content-subheader">
                                What kind of shaping do you want to add?
                            </p>
                        </div>

                        {/* Phase Type Selection */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                {phaseTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => handlePhaseTypeSelect(type.id)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${phaseConfig.type === type.id
                                                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">{type.icon}</div>
                                        <div className="text-sm font-medium mb-1">{type.name}</div>
                                        <div className="text-xs opacity-75">{type.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Progressive Configuration - Shows when type is selected */}
                        {phaseConfig.type && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-2xl border-2 border-wool-200 shadow-sm p-4">
                                    <h3 className="text-sm font-semibold text-wool-700 mb-4 text-left flex items-center gap-2">
                                        <span>{phaseTypes.find(t => t.id === phaseConfig.type)?.icon}</span>
                                        Configure {phaseTypes.find(t => t.id === phaseConfig.type)?.name}
                                    </h3>

                                    {/* Configuration fields will be added in Phase 2 */}
                                    <div className="text-center py-8 text-wool-500">
                                        <div className="text-4xl mb-2">🚧</div>
                                        <p className="text-sm">Configuration options coming in Phase 2</p>
                                        <p className="text-xs">Selected: {phaseConfig.type}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preview Section - Placeholder for Phase 3 */}
                        {phaseConfig.type && (
                            <div className="card-info">
                                <h4 className="text-sm font-semibold text-lavender-700 mb-3">Preview</h4>
                                <div className="text-sm text-lavender-600">
                                    Preview will show here in Phase 3
                                </div>
                            </div>
                        )}

                        {/* Save Actions */}
                        <div className="pt-4 border-t border-wool-200">
                            <div className="flex gap-3">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 btn-tertiary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!canSave()}
                                    className="flex-1 btn-primary"
                                >
                                    {isEditMode ? 'Update Phase' : 'Add Phase'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SequentialPhasesWizard;