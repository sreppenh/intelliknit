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

    const updatePrepNoteForColor = (newYarnIds) => {
        if (newYarnIds.length === 0) return;

        // Check if color changed from previous step
        const colorChanged = !previousColor ||
            JSON.stringify([...newYarnIds].sort()) !== JSON.stringify([...previousColor.yarnIds].sort());

        if (!colorChanged) return;

        // Generate prep note
        let note = '';
        if (newYarnIds.length === 1) {
            // Convert to number for comparison since dropdown returns strings
            const yarnId = typeof newYarnIds[0] === 'string' ? parseInt(newYarnIds[0]) : newYarnIds[0];
            const yarn = yarns.find(y => y.id === yarnId);
            if (yarn) {
                note = `Switch to Color ${yarn.letter} (${yarn.color})`;
            }
        } else {
            const selectedYarns = yarns
                .filter(y => newYarnIds.includes(y.id))
                .sort((a, b) => a.letter.localeCompare(b.letter));
            const colorNames = selectedYarns.map(y => `${y.letter} (${y.color})`).join(' and ');
            note = `Using Colors ${colorNames} together`;
        }

        setPrepNote(note);
    };

    const handleContinue = () => {
        updateWizardData('prepNote', prepNote);

        if (component.colorMode === 'single') {
            updateWizardData('colorwork', {
                type: 'single',
                yarnId: component.singleColorYarnId
            });
            onContinue('pattern-selection');
        } else if (colorChoice === 'single') {
            // Convert string ID to number
            const yarnId = typeof selectedYarnIds[0] === 'string' ? parseInt(selectedYarnIds[0]) : selectedYarnIds[0];
            updateWizardData('colorwork', {
                type: 'single',
                yarnId: yarnId
            });
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

    const sortedYarns = [...yarns].sort((a, b) => {
        if (!a.letter && !b.letter) return 0;
        if (!a.letter) return 1;
        if (!b.letter) return -1;
        return a.letter.localeCompare(b.letter);
    });

    // Default to previous step's color if available
    useEffect(() => {
        if (previousColor && previousColor.type !== 'stripes' && selectedYarnIds.length === 0) {
            if (previousColor.yarnIds.length === 1) {
                setColorChoice('single');
                setSelectedYarnIds(previousColor.yarnIds);
            } else if (previousColor.yarnIds.length > 1) {
                setColorChoice('multi-strand');
                setSelectedYarnIds(previousColor.yarnIds);
            }
        }
    }, []);

    return (
        <div className="stack-lg">
            <div>
                <h2 className="content-header-primary">Set up step</h2>
                <p className="content-subheader">Add preparation notes and yarn details</p>
                {/* <p className="content-subheader">Choose how you want to specify your pattern</p> */}
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
                                    setPrepNote(''); // Clear prep note when changing mode
                                }}
                                className={`w-full card-interactive ${colorChoice === 'single' ? 'ring-2 ring-sage-500' : ''
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
                                    setPrepNote(''); // Clear prep note
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
                                    setPrepNote(''); // Clear prep note
                                }}
                                className={`w-full card-interactive ${colorChoice === 'multi-strand' ? 'ring-2 ring-sage-500' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-300 to-blue-300 flex items-center justify-center">
                                        <span className="text-lg">🧵🧵</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold">Multi-Strand</div>
                                        <div className="text-xs text-wool-600">Hold 2+ yarns together</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Yarn Selection */}
                    {(colorChoice === 'single' || colorChoice === 'multi-strand') && (
                        <div>
                            <label className="form-label text-sm">
                                {colorChoice === 'single' ? 'Select Yarn' : 'Select Yarns to Hold Together'}
                            </label>

                            {colorChoice === 'single' ? (
                                <select
                                    value={selectedYarnIds[0] || ''}
                                    onChange={(e) => {
                                        const newIds = e.target.value ? [e.target.value] : [];
                                        setSelectedYarnIds(newIds);
                                        updatePrepNoteForColor(newIds);
                                    }}
                                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                                >
                                    <option value="">Select color...</option>
                                    {sortedYarns.map(yarn => (
                                        <option key={yarn.id} value={yarn.id}>
                                            {yarn.letter} - {yarn.color}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="grid grid-cols-3 gap-2">
                                    {sortedYarns.map(yarn => {
                                        const isSelected = selectedYarnIds.includes(yarn.id);
                                        return (
                                            <button
                                                key={yarn.id}
                                                type="button"
                                                onClick={() => {
                                                    const newIds = isSelected
                                                        ? selectedYarnIds.filter(id => id !== yarn.id)
                                                        : [...selectedYarnIds, yarn.id];
                                                    setSelectedYarnIds(newIds);
                                                    if (newIds.length >= 2) {
                                                        updatePrepNoteForColor(newIds);
                                                    }
                                                }}
                                                className={`p-3 rounded-lg border-2 transition-all ${isSelected
                                                    ? 'border-sage-500 bg-sage-50'
                                                    : 'border-wool-200 hover:border-wool-300'
                                                    }`}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mb-1"
                                                    style={{ backgroundColor: yarn.colorHex }}
                                                />
                                                <div className="text-xs font-medium text-center">{yarn.letter}</div>
                                                <div className="text-xs text-center truncate">{yarn.color}</div>
                                                {isSelected && (
                                                    <div className="text-sage-600 text-center mt-1">✓</div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Prep Note - MOVED TO BOTTOM */}
            <div>
                <label className="form-label">
                    Preparation Note <span className="text-wool-400 text-sm font-normal">(Optional)</span>
                </label>
                <textarea
                    value={prepNote}
                    onChange={(e) => setPrepNote(e.target.value)}
                    placeholder="e.g., Switch to US 6 needles, place stitch markers"
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