// src/features/steps/components/wizard-screens/PrepNoteColorScreen.jsx
import React, { useState, useEffect } from 'react';
import useYarnManager from '../../../../shared/hooks/useYarnManager';
import PatternSelector from '../wizard-steps/PatternSelector';
import PatternConfiguration from '../wizard-steps/PatternConfiguration';

const PrepNoteColorScreen = ({
    wizardData,
    updateWizardData,
    component,
    onContinue,
    onBack,
    onCancel
}) => {
    const { yarns } = useYarnManager();
    const [prepNote, setPrepNote] = useState(wizardData.prepNote || '');
    const [colorChoice, setColorChoice] = useState(null);
    const [selectedYarnIds, setSelectedYarnIds] = useState([]);

    // Pattern state
    const [useDefaultPattern, setUseDefaultPattern] = useState(!!component.defaultPattern);
    const [overridePatternData, setOverridePatternData] = useState({
        stitchPattern: {
            category: null,
            pattern: null,
            customText: '',
            rowsInPattern: '',
            customDetails: '',
            method: ''
        }
    });

    // Color default state
    const [useDefaultColor, setUseDefaultColor] = useState(!!component.defaultColorwork);

    useEffect(() => {
        console.log('Component data:', {
            hasDefaultPattern: !!component.defaultPattern,
            defaultPattern: component.defaultPattern,
            hasDefaultColorwork: !!component.defaultColorwork,
            defaultColorwork: component.defaultColorwork,
            colorMode: component.colorMode
        });
    }, [component]);

    // Auto-handle components without colorMode set (legacy components)
    useEffect(() => {
        if (!component.colorMode) {
            onContinue('pattern-selection');
        }
    }, [component.colorMode, onContinue]);

    const getPreviousStepColor = () => {
        // For the first regular step (after initialization), use startStepColorYarnIds
        if (component.steps && component.steps.length === 1) {
            if (component.startStepColorYarnIds && component.startStepColorYarnIds.length > 0) {
                return {
                    type: component.startStepColorYarnIds.length === 1 ? 'single' : 'multi-strand',
                    yarnIds: component.startStepColorYarnIds
                };
            }
        }

        // For subsequent steps, check the last step's colorwork
        if (component.steps && component.steps.length > 1) {
            const lastStep = component.steps[component.steps.length - 1];
            if (lastStep.colorwork) {
                if (lastStep.colorwork.type === 'single') {
                    return { type: 'single', yarnIds: [lastStep.colorwork.yarnId] };
                }
                if (lastStep.colorwork.type === 'multi-strand') {
                    return { type: 'multi-strand', yarnIds: lastStep.colorwork.yarnIds };
                }
                if (lastStep.colorwork.type === 'stripes') {
                    return { type: 'stripes', yarnIds: [] };
                }
            }
        }

        // Fallback to component defaults
        if (component.colorMode === 'single' && component.singleColorYarnId) {
            return { type: 'single', yarnIds: [component.singleColorYarnId] };
        }

        return null;
    };

    const previousColor = getPreviousStepColor();

    // ✅ REMOVED: updatePrepNoteForColor function - color info is now generated dynamically

    const handleContinue = () => {
        // Save prep note
        updateWizardData('prepNote', prepNote);

        // Determine routing based on override choices
        if (component.defaultColorwork && !useDefaultColor) {
            // Need to override color - route to color selection
            onContinue('color-override');
        } else if (component.defaultPattern && !useDefaultPattern) {
            // Need to override pattern - route to pattern selection
            onContinue('pattern-override');
        } else {
            // Using all defaults - save them and continue
            if (component.defaultPattern) {
                updateWizardData('stitchPattern', component.defaultPattern);
            }
            if (component.defaultColorwork) {
                updateWizardData('colorwork', component.defaultColorwork);
            }
            // Skip to duration/shaping
            onContinue('duration-shaping');
        }
    };
    const canContinue = () => {
        // Pattern validation
        if (component.defaultPattern && !useDefaultPattern) {
            if (!overridePatternData.stitchPattern.pattern) return false;
        }

        // Color validation (existing logic)
        if (component.colorMode === 'single') return true;
        if (component.defaultColorwork && useDefaultColor) return true;
        if (!colorChoice) return false;
        if (colorChoice === 'stripes') return true;
        if (colorChoice === 'single') return selectedYarnIds.length === 1;
        if (colorChoice === 'multi-strand') return selectedYarnIds.length >= 2;
        return false;
    };

    // Generate yarn options based on component colorCount
    const { currentProject } = useYarnManager();

    // Generate all 4 color slots
    const sortedYarns = Array.from({ length: 4 }, (_, i) => {
        const letter = String.fromCharCode(65 + i); // A, B, C, D
        const existingYarn = yarns.find(y => y.letter === letter);

        return existingYarn || {
            id: `color-${letter}`,
            letter: letter,
            color: `Color ${letter}`,
            hex: '#cccccc'  // Gray for unassigned colors
        };
    });

    // Default to previous step's color if available
    useEffect(() => {
        if (previousColor && previousColor.type !== 'stripes' && selectedYarnIds.length === 0 && !colorChoice) {
            if (previousColor.yarnIds.length === 1) {
                setColorChoice('single');
                setSelectedYarnIds(previousColor.yarnIds);
            } else if (previousColor.yarnIds.length > 1) {
                setColorChoice('multi-strand');
                setSelectedYarnIds(previousColor.yarnIds);
            }
        }
    }, [previousColor, selectedYarnIds, colorChoice]); // ← CHANGE: Add dependencies

    return (
        <div className="stack-lg">
            <div>
                <h2 className="content-header-primary">Set up step</h2>
                <p className="content-subheader">Add preparation notes and yarn details</p>
            </div>

            {/* Color Choice - with defaults */}
            {component.colorMode === 'multiple' && (
                <>
                    {component.defaultColorwork && (
                        <div>
                            <label className="form-label">Color</label>
                            <p className="text-xs text-wool-600 mb-2">
                                This component uses {
                                    component.defaultColorwork.type === 'single' ? `Color ${component.defaultColorwork.colorLetter}` :
                                        component.defaultColorwork.advancedType === 'stripes' ? 'Stripes' :
                                            component.defaultColorwork.advancedType === 'fair_isle' ? 'Fair Isle' :
                                                component.defaultColorwork.advancedType === 'intarsia' ? 'Intarsia' :
                                                    'Multiple Colors'
                                } by default
                            </p>

                            <div className="segmented-control mb-4">
                                <div className="grid grid-cols-2 gap-1">
                                    <button
                                        onClick={() => {
                                            setUseDefaultColor(true);
                                            setColorChoice(null);
                                            setSelectedYarnIds([]);
                                        }}
                                        className={`segmented-option ${useDefaultColor ? 'segmented-option-active' : ''}`}
                                    >
                                        Use Default
                                    </button>
                                    <button
                                        onClick={() => setUseDefaultColor(false)}
                                        className={`segmented-option ${!useDefaultColor ? 'segmented-option-active' : ''}`}
                                    >
                                        Override
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Pattern Selection */}
            {component.defaultPattern && (
                <div>
                    <label className="form-label">Pattern</label>
                    <p className="text-xs text-wool-600 mb-2">
                        This component uses {component.defaultPattern.pattern} by default
                    </p>

                    <div className="segmented-control">
                        <div className="grid grid-cols-2 gap-1">
                            <button
                                onClick={() => setUseDefaultPattern(true)}
                                className={`segmented-option ${useDefaultPattern ? 'segmented-option-active' : ''}`}
                            >
                                Use Default
                            </button>
                            <button
                                onClick={() => setUseDefaultPattern(false)}
                                className={`segmented-option ${!useDefaultPattern ? 'segmented-option-active' : ''}`}
                            >
                                Override
                            </button>
                        </div>
                    </div>

                </div>
            )}

            {/* Prep Note - MOVED TO BOTTOM */}
            <div>
                <label className="form-label">
                    Additional Setup Notes <span className="text-wool-400 text-sm font-normal">(Optional)</span>
                </label>
                {/* ✅ NEW: Helper text explaining separation */}
                <div className="text-xs text-wool-500 mb-2">
                    Yarn changes are tracked automatically. Add any additional setup instructions here.
                </div>
                <textarea
                    value={prepNote}
                    onChange={(e) => setPrepNote(e.target.value)}
                    placeholder="e.g., Switch to US 6 needles, place stitch markers, check gauge"
                    rows={2}
                    className="input-field-lg resize-none"
                />
            </div>

            {/* Navigation Buttons */}
            <div className="pt-6 border-t border-wool-100">
                <div className="flex gap-3">
                    <button
                        onClick={onBack}
                        className="flex-1 btn-tertiary"
                    >
                        ← Cancel
                    </button>

                    <button
                        onClick={handleContinue}
                        disabled={!canContinue()}
                        className="flex-2 btn-primary"
                        style={{ flexGrow: 2 }}
                    >
                        Continue to Pattern
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrepNoteColorScreen;