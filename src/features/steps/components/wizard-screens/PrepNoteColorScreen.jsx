import React, { useState } from 'react';
import PageHeader from '../../../../shared/components/PageHeader';
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

    const handleContinue = () => {
        // Save prep note
        updateWizardData('prepNote', prepNote);

        // Handle color choice
        if (component.colorMode === 'single') {
            // Auto-assign component's yarn
            updateWizardData('colorwork', {
                type: 'single',
                yarnId: component.singleColorYarnId
            });
            onContinue('pattern-selection');
        } else if (colorChoice === 'single') {
            updateWizardData('colorwork', {
                type: 'single',
                yarnId: selectedYarnIds[0]
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

    const toggleYarnSelection = (yarnId) => {
        if (colorChoice === 'single') {
            setSelectedYarnIds([yarnId]);
        } else if (colorChoice === 'multi-strand') {
            setSelectedYarnIds(prev =>
                prev.includes(yarnId)
                    ? prev.filter(id => id !== yarnId)
                    : [...prev, yarnId]
            );
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

    return (
        <div className="min-h-screen bg-yarn-50">
            <PageHeader
                title="Step Setup"
                subtitle="Add optional prep note and choose colors"
                onBack={onBack}
                onCancel={onCancel}
            />

            <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

                {/* Prep Note (always visible, optional) */}
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

                {/* Color Choice (only if multiple colors) */}
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
                                    onClick={() => setColorChoice('stripes')}
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

                        {/* Yarn Selection (for single or multi-strand) */}
                        {(colorChoice === 'single' || colorChoice === 'multi-strand') && (
                            <div>
                                <label className="form-label text-sm">
                                    {colorChoice === 'single' ? 'Select Yarn' : 'Select Yarns to Hold Together'}
                                </label>
                                <div className="space-y-2">
                                    {sortedYarns.map(yarn => (
                                        <button
                                            key={yarn.id}
                                            onClick={() => toggleYarnSelection(yarn.id)}
                                            className={`w-full p-2 rounded-lg border-2 flex items-center gap-2 transition-all ${selectedYarnIds.includes(yarn.id)
                                                    ? 'border-sage-500 bg-sage-50'
                                                    : 'border-wool-200 hover:border-wool-300'
                                                }`}
                                        >
                                            <div
                                                className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                                                style={{ backgroundColor: yarn.colorHex }}
                                            />
                                            <div className="text-left text-xs flex-1">
                                                <div className="font-medium">{yarn.color} (Color {yarn.letter})</div>
                                            </div>
                                            {colorChoice === 'multi-strand' && selectedYarnIds.includes(yarn.id) && (
                                                <span className="text-sage-600">✓</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Continue Button */}
                <button
                    onClick={handleContinue}
                    disabled={!canContinue()}
                    className="btn-primary w-full"
                >
                    Continue to Pattern
                </button>
            </div>
        </div>
    );
};

export default PrepNoteColorScreen;