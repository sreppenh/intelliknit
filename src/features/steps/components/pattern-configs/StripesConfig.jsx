// src/features/steps/components/pattern-configs/StripesConfig.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';

const StripesConfig = ({ wizardData, updateWizardData, construction }) => {
    // Initialize stripe sequence from existing data or create default
    const [stripeSequence, setStripeSequence] = useState(() => {
        if (wizardData.stitchPattern?.stripeSequence) {
            return wizardData.stitchPattern.stripeSequence;
        }
        // Default: simple 2-color stripe
        return [
            { rows: 4, color: "A" },
            { rows: 2, color: "B" }
        ];
    });

    // Auto-calculate total rows whenever sequence changes
    useEffect(() => {
        const totalRows = stripeSequence.reduce((sum, stripe) => sum + stripe.rows, 0);

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            stripeSequence: stripeSequence,
            rowsInPattern: totalRows.toString()
        });
    }, [stripeSequence, updateWizardData, wizardData.stitchPattern]);

    const addStripe = () => {
        // Get next available color letter
        const usedColors = stripeSequence.map(s => s.color);
        const nextColor = String.fromCharCode(65 + usedColors.length); // A, B, C, D...

        setStripeSequence([...stripeSequence, { rows: 2, color: nextColor }]);
    };

    const removeStripe = (index) => {
        if (stripeSequence.length > 1) { // Keep at least one stripe
            setStripeSequence(stripeSequence.filter((_, i) => i !== index));
        }
    };

    const updateStripe = (index, field, value) => {
        const newSequence = [...stripeSequence];
        if (field === 'rows') {
            newSequence[index].rows = parseInt(value) || 1;
        } else {
            newSequence[index].color = value.toUpperCase();
        }
        setStripeSequence(newSequence);
    };

    const moveStripe = (index, direction) => {
        const newSequence = [...stripeSequence];
        const newIndex = direction === 'up' ? index - 1 : index + 1;

        if (newIndex >= 0 && newIndex < newSequence.length) {
            [newSequence[index], newSequence[newIndex]] = [newSequence[newIndex], newSequence[index]];
            setStripeSequence(newSequence);
        }
    };

    const insertQuickPattern = (pattern) => {
        let newSequence;

        switch (pattern) {
            case 'thin':
                newSequence = [
                    { rows: 1, color: "A" },
                    { rows: 1, color: "B" }
                ];
                break;
            case 'classic':
                newSequence = [
                    { rows: 4, color: "A" },
                    { rows: 4, color: "B" }
                ];
                break;
            case 'wide':
                newSequence = [
                    { rows: 8, color: "A" },
                    { rows: 2, color: "B" }
                ];
                break;
            case 'graduated':
                newSequence = [
                    { rows: 1, color: "A" },
                    { rows: 2, color: "B" },
                    { rows: 3, color: "C" },
                    { rows: 4, color: "D" },
                    { rows: 3, color: "C" },
                    { rows: 2, color: "B" }
                ];
                break;
            default:
                return;
        }

        setStripeSequence(newSequence);
    };

    const totalRows = stripeSequence.reduce((sum, stripe) => sum + stripe.rows, 0);
    const rowUnit = construction === 'round' ? 'rounds' : 'rows';

    return (
        <div className="space-y-6">
            {/* Quick Pattern Templates */}
            <div>
                <label className="form-label">Quick Patterns</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { key: 'thin', label: '🌈 Thin Stripes', desc: '1-1 alternating' },
                        { key: 'classic', label: '📏 Classic Stripes', desc: '4-4 even' },
                        { key: 'wide', label: '🎯 Wide Accent', desc: '8-2 uneven' },
                        { key: 'graduated', label: '📊 Graduated', desc: '1-2-3-4-3-2' }
                    ].map(pattern => (
                        <button
                            key={pattern.key}
                            onClick={() => insertQuickPattern(pattern.key)}
                            className="text-left p-3 rounded-xl border-2 border-wool-200 hover:border-sage-300 hover:bg-sage-50 transition-colors bg-white"
                        >
                            <div className="text-sm font-medium mb-1">{pattern.label}</div>
                            <div className="text-xs text-wool-600">{pattern.desc}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Stripe Sequence Editor */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="form-label">Stripe Sequence</label>
                    <button
                        onClick={addStripe}
                        className="btn-secondary btn-sm flex items-center gap-1"
                    >
                        <Plus size={14} />
                        Add Stripe
                    </button>
                </div>

                <div className="space-y-2">
                    {stripeSequence.map((stripe, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-wool-200">
                            {/* Drag Handle */}
                            <div className="text-wool-400 cursor-move">
                                <GripVertical size={16} />
                            </div>

                            {/* Row Count Input */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={stripe.rows}
                                    onChange={(e) => updateStripe(index, 'rows', e.target.value)}
                                    min="1"
                                    className="w-16 text-center border-2 border-wool-200 rounded-lg px-2 py-1 text-sm"
                                />
                                <span className="text-sm text-wool-600">{rowUnit}</span>
                            </div>

                            {/* Color Input */}
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm text-wool-600">of Color</span>
                                <input
                                    type="text"
                                    value={stripe.color}
                                    onChange={(e) => updateStripe(index, 'color', e.target.value)}
                                    maxLength="1"
                                    className="w-12 text-center border-2 border-wool-200 rounded-lg px-2 py-1 text-sm font-mono font-bold"
                                    placeholder="A"
                                />
                            </div>

                            {/* Move and Delete Buttons */}
                            <div className="flex items-center gap-1">
                                {index > 0 && (
                                    <button
                                        onClick={() => moveStripe(index, 'up')}
                                        className="p-1 text-wool-400 hover:text-wool-600 transition-colors"
                                        title="Move up"
                                    >
                                        ↑
                                    </button>
                                )}
                                {index < stripeSequence.length - 1 && (
                                    <button
                                        onClick={() => moveStripe(index, 'down')}
                                        className="p-1 text-wool-400 hover:text-wool-600 transition-colors"
                                        title="Move down"
                                    >
                                        ↓
                                    </button>
                                )}
                                {stripeSequence.length > 1 && (
                                    <button
                                        onClick={() => removeStripe(index)}
                                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                        title="Remove stripe"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pattern Summary */}
            <div className="bg-sage-50 rounded-xl p-4 border-2 border-sage-200">
                <h4 className="text-sm font-semibold text-sage-700 mb-2">📋 Pattern Summary</h4>
                <div className="text-sm text-sage-600 space-y-1">
                    <div><strong>Total {rowUnit} per repeat:</strong> {totalRows}</div>
                    <div><strong>Sequence:</strong> {stripeSequence.map(s => `${s.rows} ${s.color}`).join(' → ')}</div>
                    <div className="text-xs mt-2 opacity-75">
                        This sequence will repeat based on the duration you set in the next step
                    </div>
                </div>
            </div>

            {/* Color Mapping Info */}
            <div className="help-block">
                <h4 className="text-sm font-semibold text-sage-700 mb-2">🎨 About Color Letters</h4>
                <div className="text-sm text-sage-600 space-y-1">
                    <div>• Use letters A, B, C, etc. to represent different colors</div>
                    <div>• You can map these to actual yarn colors in your project details</div>
                    <div>• Example: A = "Wolf Gray", B = "Burnt Cinnamon"</div>
                </div>
            </div>
        </div>
    );
};

export default StripesConfig;