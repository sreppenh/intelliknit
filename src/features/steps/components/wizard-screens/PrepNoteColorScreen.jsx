// src/features/steps/components/wizard-screens/PrepNoteColorScreen.jsx
import React, { useState, useEffect } from 'react';
import useYarnManager from '../../../../shared/hooks/useYarnManager';
import { formatColorworkDisplay, getYarnByLetter, getYarnDisplayName, getSortedYarnLetters } from '../../../../shared/utils/colorworkDisplayUtils';


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
    const [useDefaultPattern, setUseDefaultPattern] = useState(false);

    // Color state
    const [useDefaultColor, setUseDefaultColor] = useState(false);
    const [colorChoice, setColorChoice] = useState(null);
    const [selectedYarnIds, setSelectedYarnIds] = useState([]);

    // Auto-handle components without colorMode set (legacy)
    useEffect(() => {
        if (!component.colorMode) {
            onContinue('pattern-selection');
        }
    }, [component.colorMode, onContinue]);

    // Generate yarn options
    const sortedYarns = getSortedYarnLetters(yarns);

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
                <h2 className="content-header-primary">Set up step</h2>
                <p className="content-subheader">Configure pattern and color for this step</p>
            </div>

            {/* Setup Notes */}
            <div>
                <label className="form-label">
                    Setup Notes <span className="text-wool-400 text-sm font-normal">(Optional)</span>
                </label>
                <textarea
                    value={prepNote}
                    onChange={(e) => setPrepNote(e.target.value)}
                    placeholder="e.g., Switch to US 6 needles, place stitch markers, check gauge"
                    rows={2}
                    className="input-field-lg resize-none"
                />
            </div>

            {/* Pattern Checkbox */}
            {component.defaultPattern && (
                <div>
                    <label className="form-label">Pattern</label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-wool-200 cursor-pointer hover:border-sage-300 transition-colors">
                        <input
                            type="checkbox"
                            checked={useDefaultPattern}
                            onChange={(e) => setUseDefaultPattern(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span>Use default: {component.defaultPattern.pattern}</span>
                    </label>
                </div>
            )}

            {/* Color Checkbox */}
            {component.colorMode === 'multiple' && component.defaultColorwork && (
                <div>
                    <label className="form-label">Color</label>
                    <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-wool-200 cursor-pointer hover:border-sage-300 transition-colors">
                        <input
                            type="checkbox"
                            checked={useDefaultColor}
                            onChange={(e) => setUseDefaultColor(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <span>Use default: {formatColorworkDisplay(component.defaultColorwork, yarns)}</span>
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