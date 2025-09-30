// src/features/steps/components/wizard-screens/PrepNoteColorScreen.jsx
import React, { useState, useEffect } from 'react';
import useYarnManager from '../../../../shared/hooks/useYarnManager';
import { formatColorworkDisplay, getYarnByLetter, getYarnDisplayName } from '../../../../shared/utils/colorworkDisplayUtils';


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
    const [useDefaultPattern, setUseDefaultPattern] = useState(!!component.defaultPattern);

    // Color state
    const [useDefaultColor, setUseDefaultColor] = useState(!!component.defaultColorwork);
    const [colorChoice, setColorChoice] = useState(null);
    const [selectedYarnIds, setSelectedYarnIds] = useState([]);

    // Auto-handle components without colorMode set (legacy)
    useEffect(() => {
        if (!component.colorMode) {
            onContinue('pattern-selection');
        }
    }, [component.colorMode, onContinue]);

    // Generate yarn options
    const sortedYarns = Array.from({ length: 4 }, (_, i) => {
        const letter = String.fromCharCode(65 + i);
        return getYarnByLetter(yarns, letter);
    });

    const handleContinue = () => {
        // Save prep note
        updateWizardData('prepNote', prepNote);

        // Determine what needs to be configured
        const needsPatternOverride = component.defaultPattern && !useDefaultPattern;

        // Handle color based on override choice
        if (component.colorMode === 'single') {
            // Single color component - use component's color
            updateWizardData('colorwork', {
                type: 'single',
                yarnId: component.singleColorYarnId
            });
        } else if (component.defaultColorwork && useDefaultColor) {
            // Using color default
            updateWizardData('colorwork', component.defaultColorwork);
        } else if (!useDefaultColor) {
            // Color override - save the selected color config
            if (colorChoice === 'single') {
                const yarnId = typeof selectedYarnIds[0] === 'string' ?
                    parseInt(selectedYarnIds[0]) : selectedYarnIds[0];
                updateWizardData('colorwork', {
                    type: 'single',
                    yarnId: yarnId
                });
            } else if (colorChoice === 'multi-strand') {
                updateWizardData('colorwork', {
                    type: 'multi-strand',
                    yarnIds: selectedYarnIds
                });
            } else if (colorChoice === 'stripes') {
                // Stripes will be configured in separate screen
                onContinue('stripes-config');
                return;
            }
        }

        // Route based on pattern
        if (needsPatternOverride) {
            onContinue('pattern-override');
        } else {
            // Using pattern default or no default exists
            if (component.defaultPattern && useDefaultPattern) {
                updateWizardData('stitchPattern', component.defaultPattern);
            }

            // Skip to duration/shaping if using defaults, or pattern selection if no default
            if (component.defaultPattern && useDefaultPattern) {
                onContinue('duration-shaping');
            } else {
                onContinue('pattern-selection');
            }
        }
    };

    const canContinue = () => {
        // Pattern validation - always allow if using default or override chosen
        if (component.defaultPattern && !useDefaultPattern) {
            // Override chosen - they'll configure it on next screen
        }

        // Color validation
        if (component.colorMode === 'single') return true;
        if (component.defaultColorwork && useDefaultColor) return true;
        if (!component.defaultColorwork) {
            // No default - must pick color
            if (!colorChoice) return false;
            if (colorChoice === 'stripes') return true;
            if (colorChoice === 'single') return selectedYarnIds.length === 1;
            if (colorChoice === 'multi-strand') return selectedYarnIds.length >= 2;
            return false;
        }
        if (!useDefaultColor) {
            // Override chosen - must configure
            if (!colorChoice) return false;
            if (colorChoice === 'stripes') return true;
            if (colorChoice === 'single') return selectedYarnIds.length === 1;
            if (colorChoice === 'multi-strand') return selectedYarnIds.length >= 2;
            return false;
        }

        return true;
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

            {/* Color Configuration */}
            {component.colorMode === 'multiple' && (
                <>
                    {/* Color Toggle - if default exists */}
                    {component.defaultColorwork && (
                        <div>
                            <label className="form-label">Color</label>
                            <p className="text-xs text-wool-600 mb-2 text-left">
                                Default: {formatColorworkDisplay(component.defaultColorwork, yarns)}
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

                    {/* Color Selection - show if no default OR override chosen */}
                    {(!component.defaultColorwork || !useDefaultColor) && (
                        <div>
                            <label className="form-label">Colors for This Step</label>
                            <div className="space-y-3">
                                {/* Single Color Option */}
                                <button
                                    onClick={() => {
                                        setColorChoice('single');
                                        setSelectedYarnIds([]);
                                    }}
                                    className={`w-full card-interactive ${colorChoice === 'single' ? 'ring-2 ring-sage-500' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-sage-200 flex items-center justify-center">
                                            <span className="text-lg">🎨</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold">Single Color</div>
                                            <div className="text-xs text-wool-600">Use one yarn for this step</div>
                                        </div>
                                    </div>
                                </button>

                                {/* Stripes Option */}
                                <button
                                    onClick={() => setColorChoice('stripes')}
                                    className={`w-full card-interactive ${colorChoice === 'stripes' ? 'ring-2 ring-sage-500' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-b from-rose-300 via-amber-300 to-sage-300 flex items-center justify-center">
                                            <span className="text-lg font-bold text-white">═</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold">Stripes</div>
                                            <div className="text-xs text-wool-600">Alternating color pattern</div>
                                        </div>
                                    </div>
                                </button>

                                {/* Multi-Strand Option */}
                                <button
                                    onClick={() => {
                                        setColorChoice('multi-strand');
                                        setSelectedYarnIds([]);
                                    }}
                                    className={`w-full card-interactive ${colorChoice === 'multi-strand' ? 'ring-2 ring-sage-500' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sage-400 to-yarn-400 flex items-center justify-center">
                                            <span className="text-lg font-bold text-white">⫽</span>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold">Multiple Colors</div>
                                            <div className="text-xs text-wool-600">Hold multiple strands together</div>
                                        </div>
                                    </div>
                                </button>
                            </div>

                            {/* Yarn Selection Grid */}
                            {(colorChoice === 'single' || colorChoice === 'multi-strand') && (
                                <div className="mt-4">
                                    <label className="form-label">
                                        Select {colorChoice === 'single' ? 'Yarn' : 'Yarns'}
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {sortedYarns.map(yarn => {
                                            const isSelected = selectedYarnIds.includes(yarn.id);
                                            const displayName = getYarnDisplayName(yarn);

                                            return (
                                                <button>
                                                    {/* ... */}
                                                    <div className="text-xs text-center truncate">{displayName}</div>
                                                    {isSelected && (
                                                        <div className="text-sage-600 text-center mt-1">✓</div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Pattern Toggle */}
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