// src/features/steps/components/wizard-screens/PrepNoteColorScreen.jsx
import React, { useState, useEffect } from 'react';
import useYarnManager from '../../../../shared/hooks/useYarnManager';
import { formatColorworkDisplay } from '../../../../shared/utils/colorworkDisplayUtils';
import { getStepStartingSide } from '../../../../shared/utils/sideIntelligence';
import SegmentedControl from '../../../../shared/components/SegmentedControl';

const PrepNoteColorScreen = ({
    wizardData,
    updateWizardData,
    component,
    onContinue,
    onBack,
    onCancel,
    onFinishComponent
}) => {
    const { yarns } = useYarnManager();
    const [prepNote, setPrepNote] = useState(wizardData.prepNote || '');

    // Pattern state
    const [useDefaultPattern, setUseDefaultPattern] = useState(
        component.defaultPattern ? true : false
    );

    // Check if previous step has a continuable color pattern
    const getPreviousStepPattern = () => {
        if (!component?.steps || component.steps.length === 0) return null;

        const prevStep = component.steps[component.steps.length - 1];
        const prevColorwork = prevStep?.colorwork || prevStep?.wizardConfig?.colorwork;

        if (!prevColorwork) return null;

        // Only allow continuation for complex patterns
        const continuableTypes = ['stripes', 'marled_stripes', 'two_color_brioche'];
        if (continuableTypes.includes(prevColorwork.type)) {
            return {
                type: prevColorwork.type,
                stepNumber: component.steps.length,
                data: prevColorwork,
                displayName: prevColorwork.type === 'stripes' ? 'Stripes' :
                    prevColorwork.type === 'marled_stripes' ? 'Marled Stripes' :
                        'Two-Color Brioche'
            };
        }

        return null;
    };

    const previousPattern = getPreviousStepPattern();

    // Color state - default to continuing pattern if available
    const [useContinuePattern, setUseContinuePattern] = useState(!!previousPattern);

    // ✨ NEW: Starting Side state for flat construction
    const stepIndex = component.steps.length; // Index of step we're creating
    const expectedStartingSide = getStepStartingSide(component, stepIndex);
    const [startingSide, setStartingSide] = useState(
        wizardData.sideTracking?.startingSide || expectedStartingSide
    );
    const isOverride = startingSide !== expectedStartingSide;

    // Auto-handle components without colorMode set (legacy)
    useEffect(() => {
        if (!component.colorMode) {
            onContinue('pattern-selection');
        }
    }, [component.colorMode, onContinue]);

    const handleContinue = () => {
        updateWizardData('prepNote', prepNote);

        // ✨ NEW: Save side tracking for flat construction
        if (component.construction === 'flat') {
            updateWizardData('sideTracking', {
                startingSide: startingSide,
                userOverride: isOverride,
                expectedStartingSide: expectedStartingSide
            });
        }

        // ✅ FIX: Copy colorwork FIRST if continuing pattern
        if (useContinuePattern && previousPattern) {
            updateWizardData('colorwork', {
                ...previousPattern.data,
                continuedFromStep: previousPattern.stepNumber
            });
        }

        // Check what needs configuration
        const needsPatternConfig = !component.defaultPattern ||
            component.defaultPattern.pattern === 'None' ||
            !useDefaultPattern;

        // Check if we need color configuration (skip if continuing)
        const needsColorConfig = component.colorMode === 'multiple' && !useContinuePattern;

        if (needsColorConfig) {
            onContinue('color-selection');
        } else if (needsPatternConfig) {
            onContinue('pattern-selection');
        } else {
            // Save defaults
            if (useDefaultPattern) {
                updateWizardData('stitchPattern', component.defaultPattern);
            }
            onContinue('duration-shaping');
        }
    };

    const handleSideChange = (side) => {
        setStartingSide(side);
    };

    // ✨ NEW: Handle finish component with prep note
    const handleFinishComponent = () => {
        // Save any prep note entered
        updateWizardData('prepNote', prepNote);

        // Call parent handler to launch ComponentEndingWizard
        if (onFinishComponent) {
            onFinishComponent();
        }
    };

    const canContinue = () => {
        return true; // Always allow continue - routing handles what happens next
    };

    return (
        <div className="stack-lg">
            <div>
                <h2 className="content-header-primary">Step Options</h2>
                <p className="content-subheader">Add notes and modify settings</p>
            </div>

            {/* Preparation Note */}
            <div>
                <label className="form-label">
                    Preparation Note <span className="text-wool-400 text-sm font-normal">(Optional)</span>
                </label>
                <textarea
                    value={prepNote}
                    onChange={(e) => setPrepNote(e.target.value)}
                    placeholder="e.g., Switch to US 6 needles, place stitch markers, check gauge"
                    rows={2}
                    className="input-field-lg resize-none"
                />
            </div>

            {/* ✨ NEW: Starting Side Toggle - Only for flat construction */}
            {component.construction === 'flat' && (
                <div>
                    <label className="form-label">
                        Starting Side
                    </label>
                    <div className="space-y-2">
                        <SegmentedControl
                            options={[
                                { value: 'RS', label: 'RS (Right Side)' },
                                { value: 'WS', label: 'WS (Wrong Side)' }
                            ]}
                            value={startingSide}
                            onChange={handleSideChange}
                        />
                        <div className="text-xs text-wool-500">
                            {isOverride ? (
                                <span className="text-yarn-600 font-medium">
                                    ⚠️ Overriding expected side ({expectedStartingSide})
                                </span>
                            ) : (
                                <span>
                                    Expected: {expectedStartingSide}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Helper Text - only show if there are options to customize */}
            {((previousPattern && component.colorMode === 'multiple') ||
                (component.defaultPattern && component.defaultPattern.pattern !== 'None')) && (
                    <div className="text-sm text-wool-600 text-center py-2 border-t border-b border-wool-200">
                        Uncheck any option below to customize it for this step
                    </div>
                )}

            {/* Color Checkbox - Continue Pattern */}
            {previousPattern && component.colorMode === 'multiple' && (
                <div>
                    <label className="form-label">Color</label>
                    <label className={`checkbox-container ${useContinuePattern ? 'checkbox-container-checked' : ''}`}>
                        <input
                            type="checkbox"
                            checked={useContinuePattern}
                            onChange={(e) => setUseContinuePattern(e.target.checked)}
                            className="checkbox-sage"
                        />
                        <span className={`checkbox-label ${useContinuePattern ? 'checkbox-label-checked' : ''}`}>
                            Continue {previousPattern.displayName} from Step {previousPattern.stepNumber}
                        </span>
                    </label>
                </div>
            )}

            {/* Pattern Checkbox - ONLY show if NOT "None" */}
            {component.defaultPattern && component.defaultPattern.pattern !== 'None' && (
                <div>
                    <label className="form-label">Pattern</label>
                    <label className={`checkbox-container ${useDefaultPattern ? 'checkbox-container-checked' : ''}`}>
                        <input
                            type="checkbox"
                            checked={useDefaultPattern}
                            onChange={(e) => setUseDefaultPattern(e.target.checked)}
                            className="checkbox-sage"
                        />
                        <span className={`checkbox-label ${useDefaultPattern ? 'checkbox-label-checked' : ''}`}>
                            {component.defaultPattern.pattern}
                        </span>
                    </label>
                </div>
            )}

            {/* ✨ NEW: Finish Component Button - TERTIARY priority */}
            <div className="pt-4 border-t border-wool-200">
                <button
                    onClick={handleFinishComponent}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                    <span className="text-lg">🏁</span>
                    <span>Finish Component</span>
                </button>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-2">
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
                        Continue to Add Step
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrepNoteColorScreen;