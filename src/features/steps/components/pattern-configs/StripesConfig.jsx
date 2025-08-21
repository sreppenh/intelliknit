// src/features/steps/components/pattern-configs/StripesConfig.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import IncrementInput from '../../../../shared/components/IncrementInput';

const StripesConfig = ({ wizardData, updateWizardData, construction }) => {
    // Stripe sequence state
    const [stripeSequence, setStripeSequence] = useState(() => {
        if (wizardData.stitchPattern?.stripeSequence) {
            return wizardData.stitchPattern.stripeSequence;
        }
        // Start with empty sequence - user will add stripes
        return [];
    });

    // Add Stripe Wizard state
    const [showAddWizard, setShowAddWizard] = useState(false);
    const [wizardStep, setWizardStep] = useState(1); // 1: rows, 2: color
    const [newStripe, setNewStripe] = useState({ rows: 2, color: 'A' });

    // Auto-calculate total rows and save to wizardData
    useEffect(() => {
        const totalRows = stripeSequence.reduce((sum, stripe) => sum + stripe.rows, 0);

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            stripeSequence: stripeSequence,
            rowsInPattern: totalRows > 0 ? totalRows.toString() : ''
        });
    }, [stripeSequence, updateWizardData, wizardData.stitchPattern]);

    // Get next available color letter
    const getNextColor = () => {
        const usedColors = stripeSequence.map(s => s.color);
        const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let letter of allLetters) {
            if (!usedColors.includes(letter)) {
                return letter;
            }
        }
        return 'A'; // Fallback
    };

    // Start add stripe wizard
    const startAddStripe = () => {
        setNewStripe({ rows: 2, color: getNextColor() });
        setWizardStep(1);
        setShowAddWizard(true);
    };

    // Cancel add stripe wizard
    const cancelAddStripe = () => {
        setShowAddWizard(false);
        setWizardStep(1);
        setNewStripe({ rows: 2, color: 'A' });
    };

    // Go to next step in wizard
    const nextWizardStep = () => {
        if (wizardStep === 1) {
            setWizardStep(2);
        } else {
            // Finish - add stripe to sequence
            setStripeSequence([...stripeSequence, newStripe]);
            cancelAddStripe();
        }
    };

    // Go to previous step in wizard
    const prevWizardStep = () => {
        if (wizardStep === 2) {
            setWizardStep(1);
        }
    };

    // Remove stripe from sequence
    const removeStripe = (index) => {
        setStripeSequence(stripeSequence.filter((_, i) => i !== index));
    };

    // Quick pattern templates
    const insertQuickPattern = (pattern) => {
        let newSequence;

        switch (pattern) {
            case 'classic':
                newSequence = [
                    { rows: 4, color: "A" },
                    { rows: 4, color: "B" }
                ];
                break;
            case 'thin':
                newSequence = [
                    { rows: 1, color: "A" },
                    { rows: 1, color: "B" }
                ];
                break;
            case 'accent':
                newSequence = [
                    { rows: 6, color: "A" },
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

    // Can proceed if we have at least one stripe
    const canProceed = stripeSequence.length > 0;

    return (
        <div className="space-y-6">
            {/* Quick Patterns */}
            {stripeSequence.length === 0 && (
                <div>
                    <label className="form-label">Quick Start</label>
                    <div className="space-y-2">
                        {[
                            { key: 'classic', label: '📏 Classic Stripes', desc: '4-4 even stripes' },
                            { key: 'thin', label: '🌈 Thin Stripes', desc: '1-1 alternating' },
                            { key: 'accent', label: '🎯 Accent Stripes', desc: '6-2 with accent color' }
                        ].map(pattern => (
                            <button
                                key={pattern.key}
                                onClick={() => insertQuickPattern(pattern.key)}
                                className="w-full text-left p-3 rounded-xl border-2 border-wool-200 hover:border-sage-300 hover:bg-sage-50 transition-colors bg-white"
                            >
                                <div className="text-sm font-medium mb-1">{pattern.label}</div>
                                <div className="text-xs text-wool-600">{pattern.desc}</div>
                            </button>
                        ))}
                    </div>

                    <div className="text-center mt-4">
                        <div className="text-sm text-wool-500 mb-3">or</div>
                        <button
                            onClick={startAddStripe}
                            className="btn-primary flex items-center gap-2 mx-auto"
                        >
                            <Plus size={16} />
                            Build Custom Stripe Pattern
                        </button>
                    </div>
                </div>
            )}

            {/* Stripe Sequence Display */}
            {stripeSequence.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="form-label">Stripe Sequence</label>
                        <button
                            onClick={startAddStripe}
                            className="btn-secondary btn-sm flex items-center gap-1"
                        >
                            <Plus size={14} />
                            Add Stripe
                        </button>
                    </div>

                    {/* Stripe List */}
                    <div className="space-y-2 mb-4">
                        {stripeSequence.map((stripe, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-wool-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sm font-bold text-sage-700">
                                        {stripe.color}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">
                                            {stripe.rows} {rowUnit} of Color {stripe.color}
                                        </div>
                                        <div className="text-xs text-wool-500">
                                            {/* Future: Show actual color name if mapped */}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeStripe(index)}
                                    className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                    title="Remove stripe"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pattern Summary */}
                    <div className="bg-sage-50 rounded-xl p-4 border-2 border-sage-200">
                        <h4 className="text-sm font-semibold text-sage-700 mb-2">📋 Pattern Summary</h4>
                        <div className="text-sm text-sage-600 space-y-1">
                            <div><strong>Total {rowUnit} per repeat:</strong> {totalRows}</div>
                            <div><strong>Sequence:</strong> {stripeSequence.map(s => `${s.rows} ${s.color}`).join(' → ')}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Stripe Wizard Overlay */}
            {showAddWizard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Add Stripe</h3>
                            <button
                                onClick={cancelAddStripe}
                                className="text-wool-400 hover:text-wool-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Step 1: How many rows */}
                        {wizardStep === 1 && (
                            <div className="space-y-4">
                                <div className="text-center mb-6">
                                    <div className="text-sm text-wool-600 mb-2">Step 1 of 2</div>
                                    <h4 className="text-base font-medium">How many {rowUnit}?</h4>
                                </div>

                                <IncrementInput
                                    value={newStripe.rows}
                                    onChange={(value) => setNewStripe({ ...newStripe, rows: parseInt(value) || 1 })}
                                    label={`${rowUnit} in this stripe`}
                                    unit={rowUnit}
                                    construction={construction}
                                    min={1}
                                />

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={cancelAddStripe}
                                        className="flex-1 btn-tertiary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={nextWizardStep}
                                        className="flex-1 btn-primary"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: What color */}
                        {wizardStep === 2 && (
                            <div className="space-y-4">
                                <div className="text-center mb-6">
                                    <div className="text-sm text-wool-600 mb-2">Step 2 of 2</div>
                                    <h4 className="text-base font-medium">What color?</h4>
                                </div>

                                {/* Color Letter Selection */}
                                <div>
                                    <label className="form-label">Color Letter</label>
                                    <div className="grid grid-cols-6 gap-2">
                                        {['A', 'B', 'C', 'D', 'E', 'F'].map(letter => {
                                            const isUsed = stripeSequence.some(s => s.color === letter);
                                            const isSelected = newStripe.color === letter;

                                            return (
                                                <button
                                                    key={letter}
                                                    onClick={() => setNewStripe({ ...newStripe, color: letter })}
                                                    disabled={isUsed}
                                                    className={`aspect-square rounded-xl border-2 text-sm font-bold transition-colors ${isSelected
                                                            ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                            : isUsed
                                                                ? 'border-wool-200 bg-wool-100 text-wool-400 cursor-not-allowed'
                                                                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                                                        }`}
                                                >
                                                    {letter}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="text-xs text-wool-500 mt-2">
                                        {stripeSequence.length > 0 && 'Grayed out letters are already used'}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={prevWizardStep}
                                        className="flex-1 btn-tertiary"
                                    >
                                        ← Back
                                    </button>
                                    <button
                                        onClick={nextWizardStep}
                                        className="flex-1 btn-primary"
                                    >
                                        Add Stripe
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

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