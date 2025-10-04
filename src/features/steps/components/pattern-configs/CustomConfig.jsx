// src/features/steps/components/pattern-configs/CustomConfig.jsx
import React, { useState } from 'react';
import CustomSequenceConfig from './CustomSequenceConfig';
import CustomDescriptionConfig from './CustomDescriptionConfig';

const CustomConfig = ({ wizardData, updateWizardData, construction, currentStitches, mode }) => {
    // Determine which sub-pattern is selected
    const subPattern = wizardData.stitchPattern?.pattern;

    // If no sub-pattern selected yet, show selector
    if (!subPattern || subPattern === 'Custom') {
        return (
            <div className="space-y-4">
                <div className="text-center mb-6">
                    <h3 className="content-header-secondary mb-2">Choose Custom Type</h3>
                    <p className="text-sm text-wool-600">Select how you'd like to define this step</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => updateWizardData('stitchPattern', {
                            ...wizardData.stitchPattern,
                            pattern: 'Custom Row-by-Row'
                        })}
                        className="card-selectable text-left p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">📝</div>
                            <div className="flex-1">
                                <div className="font-semibold text-base mb-1">Custom Row-by-Row</div>
                                <div className="text-sm text-wool-600">
                                    Define a row-by-row sequence with stitch changes. Perfect for patterns with regular increases/decreases.
                                </div>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => updateWizardData('stitchPattern', {
                            ...wizardData.stitchPattern,
                            pattern: 'Custom Description'
                        })}
                        className="card-selectable text-left p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className="text-2xl">✍️</div>
                            <div className="flex-1">
                                <div className="font-semibold text-base mb-1">Custom Description</div>
                                <div className="text-sm text-wool-600">
                                    Enter a free-form description for unique or one-off instructions.
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // Route to appropriate config component
    if (subPattern === 'Custom Row-by-Row') {
        return (
            <CustomSequenceConfig
                wizardData={wizardData}
                updateWizardData={updateWizardData}
                construction={construction}
                currentStitches={currentStitches}
                mode={mode}
            />
        );
    }

    if (subPattern === 'Custom Description') {
        return (
            <CustomDescriptionConfig
                wizardData={wizardData}
                updateWizardData={updateWizardData}
                mode={mode}
            />
        );
    }

    return null;
};

export default CustomConfig;