import React, { useState } from 'react';
import { useNotesContext } from '../hooks/useNotesContext';
import { useStepGeneration } from '../../steps/hooks/useStepGeneration';
import { useStepCalculation } from '../../steps/hooks/useStepCalculation';
import PageHeader from '../../../shared/components/PageHeader';
import PatternSelector from '../../steps/components/wizard-steps/PatternSelector';
import PatternConfiguration from '../../steps/components/wizard-steps/PatternConfiguration';
import DurationShapingChoice from '../../steps/components/wizard-steps/DurationShapingChoice';
import DurationWizard from '../../steps/components/DurationWizard';
import ShapingWizard from '../../steps/components/ShapingWizard';
import { shouldSkipConfiguration } from '../../../shared/utils/PatternCategories';

const ConfigureNotePattern = ({ onBack, onGoToLanding }) => {
    const { currentNote, updateNote } = useNotesContext();
    const { generateInstruction } = useStepGeneration(currentNote?.construction || 'flat');
    const { calculateEffect } = useStepCalculation();

    // Wizard data for pattern configuration
    const [wizardData, setWizardData] = useState({
        stitchPattern: {
            category: null,
            pattern: null,
            customText: '',
            method: '',
            rowsInPattern: '',
            stitchCount: '',
            customDetails: '',
            entryMode: 'standard',
            rowInstructions: []
        },
        duration: {
            type: '',
            value: '',
            units: currentNote?.defaultUnits || 'inches',
            measurement: '',
            targetLength: ''
        },
        hasShaping: false,
        shapingConfig: {}
    });

    const [currentStep, setCurrentStep] = useState(1); // 1: Pattern Selection, 2: Configuration, 3: Duration/Shaping, 4: Duration Config
    const [showShapingWizard, setShowShapingWizard] = useState(false);
    const [construction, setConstruction] = useState(currentNote?.construction || 'flat');
    const [currentStitches, setCurrentStitches] = useState(currentNote?.startingStitches || 0);

    // Update wizard data helper
    const updateWizardData = (sectionOrKey, dataOrValue) => {

        setWizardData(prev => {
            if (typeof dataOrValue === 'boolean' || typeof dataOrValue === 'string' || typeof dataOrValue === 'number') {
                return {
                    ...prev,
                    [sectionOrKey]: dataOrValue
                };
            }
            return {
                ...prev,
                [sectionOrKey]: { ...prev[sectionOrKey], ...dataOrValue }
            };
        });
    };

    // Navigation helpers
    const canProceedFromStep1 = () => {
        return wizardData.stitchPattern.category && wizardData.stitchPattern.pattern;
    };

    const canProceedFromStep2 = () => {
        if (shouldSkipConfiguration(wizardData)) return true;

        // Use the same validation logic as the project wizard
        const { validatePatternConfiguration } = require('../../../shared/utils/stepDisplayUtils');

        const isValid = validatePatternConfiguration(wizardData.stitchPattern);

        return isValid;
    };

    const handleNext = () => {
        if (currentStep === 1) {
            // Check if we should skip configuration
            if (shouldSkipConfiguration(wizardData)) {
                setCurrentStep(3); // Skip to duration/shaping choice
            } else {
                setCurrentStep(2);
            }
        } else if (currentStep === 2) {
            // From configuration to duration/shaping choice
            setCurrentStep(3);
        } else if (currentStep === 3) {
            // Duration/Shaping choice handles its own advancement
            if (wizardData.hasShaping === false) {
                setCurrentStep(4); // Go to duration config
            } else {
                // For now, skip shaping and go to duration
                // TODO: Add shaping wizard integration
                setCurrentStep(4);
            }
        } else if (currentStep === 4) {
            handleSaveConfiguration();
        }
    };

    const handleSaveConfiguration = () => {

        // Generate step instruction and calculate effects
        const instruction = generateInstruction(wizardData);
        const currentStitches = currentNote?.startingStitches || 0;
        const effect = calculateEffect(wizardData, currentStitches, currentNote?.construction || 'flat');

        // Create proper step object
        const stepObject = {
            id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            description: instruction,
            type: effect.success ? 'calculated' : 'manual',
            patternType: effect.detection?.type,
            parsedData: effect.detection?.parsedData,
            construction: currentNote?.construction || 'flat',
            calculatedRows: effect.calculation?.rows || effect.rows || [],
            startingStitches: currentStitches,
            endingStitches: effect.endingStitches || currentStitches,
            totalRows: effect.totalRows || 1,
            expectedStitches: effect.endingStitches || currentStitches,
            completed: false,

            // Configuration data
            wizardConfig: wizardData,
            advancedWizardConfig: {
                hasShaping: wizardData.hasShaping,
                shapingConfig: wizardData.shapingConfig
            }
        };

        // Update the note with the new step
        const updatedNote = {
            ...currentNote,
            components: [{
                ...currentNote.components[0],
                steps: [stepObject] // Replace any existing step
            }],
            lastActivityAt: new Date().toISOString()
        };

        updateNote(updatedNote);

        // Navigate back to note detail
        onBack();
    };

    if (!currentNote) {
        return (
            <div className="min-h-screen bg-lavender-50 flex items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-wool-600 mb-2">Note not found</h3>
                    <button onClick={onBack} className="btn-primary btn-sm">← Back</button>
                </div>
            </div>
        );
    }

    // Show shaping wizard if active
    if (showShapingWizard) {
        return (
            <ShapingWizard
                wizardData={wizardData}
                updateWizardData={updateWizardData}
                currentStitches={currentStitches}
                construction={construction}
                setConstruction={setConstruction}
                setCurrentStitches={setCurrentStitches}
                component={currentNote.components[0]}
                componentIndex={0}
                editingStepIndex={null}
                onExitToComponentSteps={onBack}
                onBack={() => {
                    setShowShapingWizard(false);

                    // Check if shaping was actually completed
                    const hasCompletedShaping = wizardData.shapingConfig?.type &&
                        wizardData.shapingConfig?.config?.calculation;

                    if (hasCompletedShaping) {
                        // Shaping completed - advance to duration step
                        setCurrentStep(4);
                    } else {
                        // Shaping not completed - clear selection and stay on duration/shaping choice
                        updateWizardData('hasShaping', false);
                        updateWizardData('choiceMade', false);
                    }
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-lavender-50">
            <div className="app-container bg-white min-h-screen shadow-lg">

                <PageHeader
                    useBranding={true}
                    onHome={onGoToLanding}
                    onBack={currentStep === 1 ? onBack : () => setCurrentStep(1)}
                    showCancelButton={true}
                    onCancel={onBack}
                    compact={true}
                />

                {/* Context bar */}
                <div className="bg-lavender-100 border-b border-lavender-200 px-6 py-3">
                    <div className="flex items-center gap-3 text-sm">
                        <span className="text-lavender-600">📝</span>
                        <span className="font-medium text-lavender-800">{currentNote.name}</span>
                        <span className="text-lavender-600">→</span>
                        <span className="text-lavender-700">Configure Pattern</span>
                    </div>
                </div>

                <div className="p-6">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="content-header-secondary mb-2">Choose Pattern</h2>
                                <p className="text-wool-500 text-sm">Select the knitting pattern for your note</p>
                            </div>

                            <PatternSelector
                                wizardData={wizardData}
                                updateWizardData={updateWizardData}
                                navigation={{ canProceed: canProceedFromStep1 }}
                                existingPrepNote=""
                                onSavePrepNote={() => { }} // Notes don't use prep notes
                            />

                            <div className="flex gap-3 pt-4 border-t border-wool-100">
                                <button
                                    onClick={onBack}
                                    className="flex-1 btn-tertiary"
                                >
                                    ← Cancel
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceedFromStep1()}
                                    className="flex-2 btn-primary"
                                    style={{ flexGrow: 2 }}
                                >
                                    Continue →
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="content-header-secondary mb-2">Configure Pattern</h2>
                                <p className="text-wool-500 text-sm">
                                    Set up your {wizardData.stitchPattern.pattern} pattern
                                </p>
                            </div>

                            <PatternConfiguration
                                wizardData={wizardData}
                                updateWizardData={updateWizardData}
                                navigation={{ canProceed: canProceedFromStep2 }}
                                construction={currentNote?.construction || 'flat'}
                                existingPrepNote=""
                                onSavePrepNote={() => { }} // Notes don't use prep notes
                                currentStitches={currentNote?.startingStitches || 0}
                                project={{
                                    ...currentNote,
                                    customKeyboardActions: currentNote?.customKeyboardActions || {},
                                    // Ensure all expected project properties exist
                                    defaultUnits: currentNote?.defaultUnits || 'inches',
                                    yarns: currentNote?.yarns || [],
                                    gauge: currentNote?.gauge || null
                                }}
                            />

                            {/* Debug info */}
                            <div className="text-xs text-gray-500 mt-2">
                                Debug: currentStitches = {currentNote?.startingStitches || 0}
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-wool-100">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="flex-1 btn-tertiary"
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!canProceedFromStep2()}
                                    className="flex-2 btn-primary"
                                    style={{ flexGrow: 2 }}
                                >
                                    Continue →
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="content-header-secondary mb-2">Duration & Shaping</h2>
                                <p className="text-wool-500 text-sm">Choose how long to work this pattern</p>
                            </div>

                            <DurationShapingChoice
                                wizardData={wizardData}
                                updateWizardData={updateWizardData}
                                construction={construction}
                                onAdvanceStep={() => setCurrentStep(4)}
                                onShowShapingWizard={() => setShowShapingWizard(true)}
                                existingPrepNote=""
                                onSavePrepNote={() => { }}
                            />
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="content-header-secondary mb-2">Set Duration</h2>
                                <p className="text-wool-500 text-sm">Specify how long to work in this pattern</p>
                            </div>

                            <DurationWizard
                                wizardData={wizardData}
                                updateWizardData={updateWizardData}
                                currentStitches={currentNote?.startingStitches || 0}
                                construction={currentNote?.construction || 'flat'}
                                componentIndex={0}
                                editingStepIndex={null}
                                project={currentNote}
                                onBack={() => setCurrentStep(3)}
                                onExitToComponentSteps={onBack}
                                // Override the default save behavior
                                onComplete={handleSaveConfiguration}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfigureNotePattern;