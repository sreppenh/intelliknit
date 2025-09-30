import React, { useState } from 'react';
import PatternSelector from '../../steps/components/wizard-steps/PatternSelector';
import PatternConfiguration from '../../steps/components/wizard-steps/PatternConfiguration';
import PageHeader from '../../../shared/components/PageHeader';

const PatternWizard = ({
    componentData,
    defaultPatternData,
    setDefaultPatternData,
    currentProject,
    onComplete,
    onBack
}) => {
    const [wizardStep, setWizardStep] = useState(1);

    const canProceed = () => {
        if (wizardStep === 1) {
            return !!defaultPatternData.stitchPattern.pattern;
        }
        return true;
    };

    const handleBack = () => {
        if (wizardStep === 2) {
            setWizardStep(1);
        } else {
            onBack();
        }
    };

    const handleContinue = () => {
        if (wizardStep === 1 && defaultPatternData.stitchPattern.pattern) {
            const { shouldSkipConfiguration } = require('../../../shared/utils/PatternCategories');

            if (shouldSkipConfiguration({ stitchPattern: defaultPatternData.stitchPattern })) {
                onComplete();
            } else {
                setWizardStep(2);
            }
        } else if (wizardStep === 2) {
            onComplete();
        }
    };

    return (
        <div className="min-h-screen bg-yarn-50">
            <div className="app-container bg-white min-h-screen shadow-lg">
                <PageHeader
                    title="Configure Default Pattern"
                    subtitle={wizardStep === 1 ? 'Select Pattern' : 'Configure Pattern'}
                    onBack={handleBack}
                />

                <div className="p-6 bg-yarn-50 stack-lg">
                    {wizardStep === 1 ? (
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
                    ) : (
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
                    )}

                    {/* Navigation Buttons */}
                    <div className="pt-6 border-t border-wool-100">
                        <div className="flex gap-3">
                            <button
                                onClick={handleBack}
                                className="flex-1 btn-tertiary"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleContinue}
                                disabled={!canProceed()}
                                className="flex-2 btn-primary"
                                style={{ flexGrow: 2 }}
                            >
                                {wizardStep === 1 ? 'Continue →' : 'Save Pattern Default'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatternWizard;