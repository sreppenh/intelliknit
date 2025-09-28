// src/features/steps/components/wizard-screens/PrepNoteColorScreen.jsx
import React, { useState, useEffect } from 'react';
import useYarnManager from '../../../../shared/hooks/useYarnManager';

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
        // Save only user's custom notes - no auto-generated color text
        updateWizardData('prepNote', prepNote);

        if (component.colorMode === 'single') {
            updateWizardData('colorwork', {
                type: 'single',
                yarnId: component.singleColorYarnId
            });
            console.log('Saved colorwork to wizard:', { type: 'single', yarnId: component.singleColorYarnId });
            onContinue('pattern-selection');

        } else if (colorChoice === 'single') {
            // Convert string ID to number
            const yarnId = typeof selectedYarnIds[0] === 'string' ?
                parseInt(selectedYarnIds[0]) : selectedYarnIds[0];
            updateWizardData('colorwork', {
                type: 'single',
                yarnId: yarnId
            });
            console.log('Saved colorwork to wizard (multiple mode):', { type: 'single', yarnId: yarnId });
            onContinue('pattern-selection');
        } else if (colorChoice === 'stripes') {
            onContinue('stripes-config');
        } else if (colorChoice === 'multi-strand') {
            updateWizardData('colorwork', {
                type: 'multi-strand',
                yarnIds: selectedYarnIds
            });
            onContinue('pattern-selection');
        }
    };

    const canContinue = () => {
        if (component.colorMode === 'single') return true;
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

            {/* Color Choice - MOVED TO TOP */}
            {component.colorMode === 'multiple' && (
                <>
                    <div>
                        <label className="form-label">Colors for This Step</label>
                        <div className="space-y-3">

                            {/* Single Color Option */}
                            <button
                                onClick={() => {
                                    setColorChoice('single');
                                    setSelectedYarnIds([]);
                                    // ✅ CHANGED: Don't clear prepNote - it's for user notes only
                                }}
                                className={`w-full card-interactive ${colorChoice === 'single' ?
                                    'ring-2 ring-sage-500' : ''
                                    }`}
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
                                onClick={() => {
                                    setColorChoice('stripes');
                                    // ✅ CHANGED: Don't clear prepNote
                                }}
                                className={`w-full card-interactive ${colorChoice === 'stripes' ? 'ring-2 ring-sage-500' : ''
                                    }`}
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
                                    // ✅ CHANGED: Don't clear prepNote
                                }}
                                className={`w-full card-interactive ${colorChoice === 'multi-strand' ?
                                    'ring-2 ring-sage-500' : ''
                                    }`}
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
                                        const letter = yarn.letter || '?';
                                        const colorName = yarn.color || `Color ${letter}`;
                                        const colorHex = yarn.hex || yarn.colorHex || '#cccccc';
                                        const isSelected = selectedYarnIds.includes(yarn.id);

                                        return (
                                            <button
                                                key={yarn.id}
                                                type="button"
                                                onClick={() => {
                                                    const newSelectedYarns = colorChoice === 'single'
                                                        ? [yarn.id]
                                                        : isSelected
                                                            ? selectedYarnIds.filter(id => id !== yarn.id)
                                                            : [...selectedYarnIds, yarn.id];
                                                    setSelectedYarnIds(newSelectedYarns);
                                                    // ✅ NO updatePrepNoteForColor call here!
                                                }}
                                                className={`p-3 rounded-lg border-2 transition-all ${isSelected
                                                    ? 'border-sage-500 bg-sage-50'
                                                    : 'border-wool-200 hover:border-wool-300'
                                                    }`}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mb-1"
                                                    style={{ backgroundColor: colorHex }}
                                                />
                                                <div className="text-xs font-medium text-center">{letter}</div>
                                                <div className="text-xs text-center truncate">{colorName}</div>
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
                </>
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