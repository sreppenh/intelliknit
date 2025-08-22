// src/features/steps/components/pattern-configs/StripesConfig.jsx
import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import IncrementInput from '../../../../shared/components/IncrementInput';

const StripesConfig = ({ wizardData, updateWizardData, construction, project }) => {
    // Stripe sequence state
    const [stripeSequence, setStripeSequence] = useState(() => {
        if (wizardData.stitchPattern?.stripeSequence) {
            return wizardData.stitchPattern.stripeSequence;
        }
        return [];
    });

    // ✅ NEW: Inline add stripe state (no modal needed)
    const [newStripe, setNewStripe] = useState({ rows: 2, color: 'A' });

    // ✅ UPDATED: Get project color data with better debugging
    const projectColorCount = project?.colorCount || 6;
    const colorMapping = project?.colorMapping || {};

    // ✅ DEBUG: Log what we're getting
    console.log('🎨 StripesConfig received:', {
        project,
        projectColorCount,
        colorMapping,
        hasProject: !!project
    });

    // Auto-calculate total rows and save to wizardData
    useEffect(() => {
        const totalRows = stripeSequence.reduce((sum, stripe) => sum + stripe.rows, 0);

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            stripeSequence: stripeSequence,
            rowsInPattern: totalRows > 0 ? totalRows.toString() : ''
        });
    }, [stripeSequence, updateWizardData, wizardData.stitchPattern]);

    // Get next available color letter (for suggesting, not restricting)
    const getNextColor = () => {
        const usedColors = stripeSequence.map(s => s.color);
        const maxLetters = Math.min(projectColorCount, 26);

        // ✅ FIX: Suggest next unused color, but don't restrict reuse
        for (let i = 0; i < maxLetters; i++) {
            const letter = String.fromCharCode(65 + i);
            if (!usedColors.includes(letter)) {
                return letter;
            }
        }
        // If all colors used, just return A (allows reuse)
        return 'A';
    };

    // Get available color letters based on project
    const getAvailableColors = () => {
        const maxLetters = Math.min(projectColorCount, 26);
        return Array.from({ length: maxLetters }, (_, i) => String.fromCharCode(65 + i));
    };

    // Get display name for color (mapped name or "Color X")
    const getColorDisplayName = (letter) => {
        return colorMapping[letter] || `Color ${letter}`;
    };

    // Initialize newStripe with next available color
    useEffect(() => {
        setNewStripe(prev => ({ ...prev, color: getNextColor() }));
    }, [stripeSequence]);

    // ✅ SIMPLIFIED: Add stripe directly inline
    const addStripe = () => {
        if (newStripe.rows > 0) {
            setStripeSequence([...stripeSequence, newStripe]);
            // Reset for next stripe with next available color
            setNewStripe({ rows: 2, color: getNextColor() });
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
    const canProceed = stripeSequence.length > 0;

    return (
        <div className="space-y-6">
            {/* ✅ MOVED: Current Stripe Sequence - Display ABOVE selection like Needles/Yarns */}
            {stripeSequence.length > 0 && (
                <div>
                    <label className="form-label">Current Stripe Sequence</label>

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
                                            {stripe.rows} {rowUnit} of {getColorDisplayName(stripe.color)}
                                        </div>
                                        <div className="text-xs text-wool-500">
                                            {/* Show letter if mapped to something different */}
                                            {colorMapping[stripe.color] ? `(Color ${stripe.color})` : ''}
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

                    {/* Enhanced Pattern Summary */}
                    <div className="bg-sage-50 rounded-xl p-4 border-2 border-sage-200">
                        <h4 className="text-sm font-semibold text-sage-700 mb-2">📋 Pattern Summary</h4>
                        <div className="text-sm text-sage-600 space-y-1">
                            <div><strong>Total {rowUnit} per repeat:</strong> {totalRows}</div>
                            <div><strong>Sequence:</strong> {stripeSequence.map(s =>
                                `${s.rows} ${getColorDisplayName(s.color)}`
                            ).join(' → ')}</div>
                            <div className="text-xs mt-2 opacity-75">
                                This sequence will repeat based on the duration you set in the next step
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Quick Patterns - Only show when starting fresh */}
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
                        <div className="text-sm text-wool-500 mb-3">or build custom:</div>
                    </div>
                </div>
            )}

            {/* ✅ NEW: Inline Add Stripe Section (YarnModal style) */}
            <div className="bg-white rounded-2xl border-2 border-wool-200 shadow-sm p-4">
                <h4 className="text-sm font-medium text-wool-700 mb-4">
                    {stripeSequence.length === 0 ? 'Create Your First Stripe' : 'Add Another Stripe'}
                </h4>

                {/* ✅ COMBINED: Both inputs on same screen */}
                <div className="space-y-4">
                    {/* How many rows */}
                    <div>
                        <label className="form-label">How many {rowUnit}?</label>
                        <IncrementInput
                            value={newStripe.rows}
                            onChange={(value) => setNewStripe({ ...newStripe, rows: parseInt(value) || 1 })}
                            label={`${rowUnit} in this stripe`}
                            unit={rowUnit}
                            construction={construction}
                            min={1}
                            max={50}
                        />
                    </div>

                    {/* ✅ CHANGED: Dropdown instead of letter boxes for better color name display */}
                    <div>
                        <label className="form-label">What color?</label>

                        <select
                            value={newStripe.color}
                            onChange={(e) => setNewStripe({ ...newStripe, color: e.target.value })}
                            className="w-full border-2 border-wool-200 rounded-xl px-3 py-3 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                        >
                            {getAvailableColors().map(letter => {
                                const displayName = getColorDisplayName(letter);

                                // ✅ NEW: Show both mapped name AND letter for clarity
                                const optionText = colorMapping[letter]
                                    ? `${letter} - ${colorMapping[letter]}`  // "A - Winter Wolf"
                                    : `${letter}`; // "B"

                                return (
                                    <option
                                        key={letter}
                                        value={letter}
                                    >
                                        {optionText}
                                    </option>
                                );
                            })}
                        </select>

                        {/* Preview of selection */}
                        <div className="mt-2 text-sm text-wool-600">
                            Will add: <strong>{newStripe.rows} {rowUnit} of {getColorDisplayName(newStripe.color)}</strong>
                        </div>
                    </div>

                    {/* Add Stripe Button */}
                    <button
                        onClick={addStripe}
                        disabled={!newStripe.rows || newStripe.rows <= 0}
                        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} className="inline mr-2" />
                        Add Stripe
                    </button>
                </div>
            </div>

            {/* Current Stripe Sequence was moved above */}

            {/* Enhanced Color Mapping Info */}
            <div className="help-block">
                <h4 className="text-sm font-semibold text-sage-700 mb-2">🎨 About Color Letters</h4>
                <div className="text-sm text-sage-600 space-y-1">
                    <div>• This project is set up for {projectColorCount} colors</div>
                    {Object.keys(colorMapping).length > 0 ? (
                        <div>• Current mapping: {Object.entries(colorMapping).map(([letter, name]) =>
                            `${letter}=${name.split(' ')[0]}`
                        ).join(', ')}</div>
                    ) : (
                        <div>• Map letters to yarn colors in Project Details → Yarns & Colors</div>
                    )}
                    <div>• Letters represent colors that will repeat across any duration</div>
                    {Object.keys(colorMapping).length > 0 && (
                        <div className="text-xs mt-1 opacity-75">
                            💡 When you change color mapping in project details, all stripe patterns update automatically!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StripesConfig;