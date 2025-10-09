// src/features/steps/components/wizard-screens/PrepNoteColorScreen.jsx
import React, { useState, useEffect } from 'react';
import useYarnManager from '../../../../shared/hooks/useYarnManager';
import { formatColorworkDisplay } from '../../../../shared/utils/colorworkDisplayUtils';

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

    // Pattern state
    const [useDefaultPattern, setUseDefaultPattern] = useState(
        component.defaultPattern ? true : false
    );

    // Color state  
    const [useDefaultColor, setUseDefaultColor] = useState(
        component.colorMode === 'multiple' && component.defaultColorwork ? true : false
    );

    // Auto-handle components without colorMode set (legacy)
    useEffect(() => {
        if (!component.colorMode) {
            onContinue('pattern-selection');
        }
    }, [component.colorMode, onContinue]);

    const handleContinue = () => {
        updateWizardData('prepNote', prepNote);

        // Check what needs configuration
        const needsPatternConfig = component.defaultPattern && !useDefaultPattern;
        const needsColorConfig = component.colorMode === 'multiple' &&
            ((component.defaultColorwork && !useDefaultColor) ||
                !component.defaultColorwork);

        if (needsColorConfig) {
            onContinue('color-selection');
        } else if (needsPatternConfig) {
            onContinue('pattern-selection');
        } else {
            // Save defaults and skip ahead
            if (useDefaultPattern) {
                updateWizardData('stitchPattern', component.defaultPattern);
            }
            if (useDefaultColor && component.colorMode === 'multiple') {
                updateWizardData('colorwork', component.defaultColorwork);
            }
            onContinue('duration-shaping');
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

            {/* Helper Text */}
            <div className="text-sm text-wool-600 text-center py-2 border-t border-b border-wool-200">
                Uncheck any option below to customize it for this step
            </div>

            {/* Color Checkbox */}
            {component.colorMode === 'multiple' && component.defaultColorwork && (
                <div>
                    <label className="form-label">Color</label>
                    <label className={`checkbox-container ${useDefaultColor ? 'checkbox-container-checked' : ''}`}>
                        <input
                            type="checkbox"
                            checked={useDefaultColor}
                            onChange={(e) => setUseDefaultColor(e.target.checked)}
                            className="checkbox-sage"
                        />
                        <span className={`checkbox-label ${useDefaultColor ? 'checkbox-label-checked' : ''}`}>
                            {formatColorworkDisplay(component.defaultColorwork, yarns)}
                        </span>
                    </label>
                </div>
            )}

            {/* Pattern Checkbox */}
            {component.defaultPattern && (
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
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrepNoteColorScreen;