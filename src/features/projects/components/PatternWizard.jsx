import React, { useState } from 'react';
import PatternSelector from '../../steps/components/wizard-steps/PatternSelector';
import PatternConfiguration from '../../steps/components/wizard-steps/PatternConfiguration';

const PatternWizard = ({
    componentData,
    defaultPatternData,
    setDefaultPatternData,
    currentProject,
    onComplete,
    onCancel
}) => {
    const [wizardStep, setWizardStep] = useState(1);

    const canProceed = () => {
        if (wizardStep === 1) {
            return !!defaultPatternData.stitchPattern.pattern;
        }
        // Add validation for step 2 if needed
        return true;
    };

    return (
        <div className="fixed inset-0 bg-yarn-50 z-50 flex flex-col">
            {/* Header */}
            <div className="bg-sage-500 text-white px-6 py-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="text-white text-lg hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                    >
                        ←
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold">Configure Default Pattern</h1>
                        <p className="text-sage-100 text-sm">
                            {wizardStep === 1 ? 'Select Pattern' : 'Configure Pattern'}
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {wizardStep === 1 ? (
                    <div className="p-6">
                        <PatternSelector
                            wizardData={defaultPatternData}
                            updateWizardData={(key, value) => {
                                setDefaultPatternData(prev => ({
                                    ...prev,
                                    [key]: value
                                }));
                            }}
                            construction={componentData.construction}
                            mode="component-default"
                        />
                    </div>
                ) : (
                    <div className="p-6">
                        <PatternConfiguration
                            wizardData={defaultPatternData}
                            updateWizardData={(key, value) => {
                                setDefaultPatternData(prev => ({
                                    ...prev,
                                    [key]: value
                                }));
                            }}
                            construction={componentData.construction}
                            currentStitches={componentData.startStitches}
                            project={currentProject}
                            mode="component-default"
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-white border-t-2 border-wool-200 p-6">
                <div className="flex gap-3">
                    {wizardStep === 2 && (
                        <button
                            onClick={() => setWizardStep(1)}
                            className="flex-1 btn-tertiary"
                        >
                            ← Back
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (wizardStep === 1 && defaultPatternData.stitchPattern.pattern) {
                                // Import and use shouldSkipConfiguration
                                const { shouldSkipConfiguration } = require('../../../shared/utils/PatternCategories');

                                if (shouldSkipConfiguration({ stitchPattern: defaultPatternData.stitchPattern })) {
                                    // Simple pattern - save immediately
                                    onComplete();
                                } else {
                                    // Complex pattern - go to configuration
                                    setWizardStep(2);
                                }
                            } else if (wizardStep === 2) {
                                onComplete();
                            }
                        }}
                        disabled={!canProceed()}
                        className="flex-2 btn-primary"
                        style={{ flexGrow: 2 }}
                    >
                        {wizardStep === 1 ? 'Continue →' : 'Save Pattern Default'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatternWizard;