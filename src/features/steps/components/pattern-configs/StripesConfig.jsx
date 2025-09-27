import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, X, List, Palette } from 'lucide-react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { StandardModal } from '../../../../shared/components/modals/StandardModal';
import useYarnManager from '../../../../shared/hooks/useYarnManager';

const StripesConfig = ({ wizardData, updateWizardData, construction, onSave, onCancel, project }) => {
    // Stripe sequence state
    const [stripeSequence, setStripeSequence] = useState([]);

    useEffect(() => {
        if (wizardData.stitchPattern?.stripeSequence && wizardData.stitchPattern.stripeSequence.length > 0) {
            console.log('🔧 StripesConfig - Loading stripe sequence:', wizardData.stitchPattern.stripeSequence);
            setStripeSequence(wizardData.stitchPattern.stripeSequence);
        }
    }, [wizardData.stitchPattern?.stripeSequence]);

    // View toggle state
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'visual'

    // Modal states
    const [showStripeModal, setShowStripeModal] = useState(false);
    const [editingStripeIndex, setEditingStripeIndex] = useState(null);
    const [stripeForm, setStripeForm] = useState({
        rows: 2,
        color: 'A'
    });

    // Modal unsaved changes tracking
    const [stripeModalHasChanges, setStripeModalHasChanges] = useState(false);
    const [showStripeUnsavedModal, setShowStripeUnsavedModal] = useState(false);

    // Get project color data
    const { yarns, availableLetters, addYarn } = useYarnManager();

    // Keep these for the component to use
    const projectColorCount = project?.colorCount || 6;
    const colorMapping = project?.colorMapping || {};

    useEffect(() => {
        const totalRows = stripeSequence.reduce((sum, stripe) => sum + stripe.rows, 0);

        updateWizardData('stitchPattern', {
            ...wizardData.stitchPattern,
            stripeSequence: stripeSequence,
            rowsInPattern: totalRows > 0 ? totalRows.toString() : '',
            customText: stripeSequence.length >= 2 ? 'Stripe pattern configured' : ''
        });
    }, [stripeSequence]); // Only depend on stripeSequence to prevent infinite loops


    useEffect(() => {
        console.log('🔧 StripesConfig DEBUG:', {
            'project?.colorCount': project?.colorCount,
            'project?.yarns?.length': project?.yarns?.length,
            'project?.yarns': project?.yarns,
            'projectColorCount (final)': projectColorCount,
            'actual yarns': yarns,
            'available colors': getAvailableColors()
        });
    }, [project, projectColorCount, yarns]);



    // Get available color letters
    const getAvailableColors = () => {
        const maxLetters = Math.min(projectColorCount, 26);
        return Array.from({ length: maxLetters }, (_, i) => String.fromCharCode(65 + i));
    };

    // Get color info for a letter
    const getColorInfo = (letter) => {
        const yarn = yarns.find(y => y.letter === letter);
        return {
            name: yarn?.color || colorMapping[letter] || `Color ${letter}`, // Just color name, not brand
            displayName: yarn?.color || `Color ${letter}`, // What to show in UI
            hex: yarn?.colorHex || '#f3f4f6',
            hasMapping: !!(yarn?.color || colorMapping[letter]),
            hasYarn: !!yarn
        };
    };

    // Handle add stripe
    const handleAddStripe = () => {
        setStripeForm({
            rows: 2,
            color: getAvailableColors()[0] || 'A'
        });
        setEditingStripeIndex(null);
        setStripeModalHasChanges(false);
        setShowStripeModal(true);
    };

    // Handle edit stripe
    const handleEditStripe = (stripeIndex) => {
        const stripe = stripeSequence[stripeIndex];
        setStripeForm({
            rows: stripe.rows,
            color: stripe.color
        });
        setEditingStripeIndex(stripeIndex);
        setStripeModalHasChanges(false);
        setShowStripeModal(true);
    };

    // Handle delete stripe
    const handleDeleteStripe = (stripeIndex) => {
        setStripeSequence(prev => prev.filter((_, index) => index !== stripeIndex));
    };

    // Handle stripe form changes
    const handleStripeFormChange = (field, value) => {
        setStripeForm(prev => ({
            ...prev,
            [field]: value
        }));
        setStripeModalHasChanges(true);
    };

    // Handle stripe modal close with unsaved check
    const handleStripeModalClose = () => {
        if (stripeModalHasChanges) {
            setShowStripeUnsavedModal(true);
        } else {
            setShowStripeModal(false);
            setStripeModalHasChanges(false);
        }
    };

    // Handle confirmed stripe modal cancel
    const handleConfirmStripeCancel = () => {
        setShowStripeModal(false);
        setShowStripeUnsavedModal(false);
        setStripeModalHasChanges(false);
    };

    // Handle save stripe
    const handleSaveStripe = () => {
        let updatedStripes = [...stripeSequence];

        const stripeToSave = {
            rows: parseInt(stripeForm.rows) || 1,
            color: stripeForm.color,
            id: Date.now()
        };

        if (editingStripeIndex !== null) {
            // Editing existing stripe
            const oldStripe = stripeSequence[editingStripeIndex];
            updatedStripes[editingStripeIndex] = { ...stripeToSave, id: oldStripe.id || Date.now() };
        } else {
            // Adding new stripe
            updatedStripes.push(stripeToSave);
        }

        setStripeSequence(updatedStripes);
        setShowStripeModal(false);
        setStripeModalHasChanges(false);
    };

    // Quick pattern templates
    const insertQuickPattern = (pattern) => {
        let newSequence;
        switch (pattern) {
            case 'classic':
                newSequence = [
                    { rows: 4, color: "A", id: Date.now() + 1 },
                    { rows: 4, color: "B", id: Date.now() + 2 }
                ];
                break;
            case 'thin':
                newSequence = [
                    { rows: 1, color: "A", id: Date.now() + 1 },
                    { rows: 1, color: "B", id: Date.now() + 2 }
                ];
                break;
            case 'accent':
                newSequence = [
                    { rows: 6, color: "A", id: Date.now() + 1 },
                    { rows: 2, color: "B", id: Date.now() + 2 }
                ];
                break;
            default:
                return;
        }
        setStripeSequence(newSequence);
    };

    const totalRows = stripeSequence.reduce((sum, stripe) => sum + stripe.rows, 0);
    const rowUnit = construction === 'round' ? 'rounds' : 'rows';

    // Add/Edit Stripe Modal
    const stripeModal = (
        <StandardModal
            isOpen={showStripeModal}
            onClose={handleStripeModalClose}
            onConfirm={handleSaveStripe}
            category="input"
            colorScheme="sage"
            title={editingStripeIndex !== null ? 'Edit Stripe' : 'Add New Stripe'}
            subtitle="Configure stripe details"
            primaryButtonText={editingStripeIndex !== null ? 'Save Changes' : 'Add Stripe'}
            secondaryButtonText="Cancel"
            primaryButtonProps={{
                disabled: !stripeForm.rows || stripeForm.rows <= 0
            }}
        >
            <div className="space-y-4">
                {/* Number of rows */}
                <div>
                    <label className="form-label">How many {rowUnit}?</label>
                    <IncrementInput
                        value={stripeForm.rows}
                        onChange={(value) => handleStripeFormChange('rows', parseInt(value) || 1)}
                        label={`${rowUnit} in this stripe`}
                        unit={rowUnit}
                        min={1}
                        max={50}
                        size="sm"
                    />
                </div>

                {/* Color Selection */}
                <div>
                    <label className="form-label">What color?</label>

                    {/* Color Selection Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {getAvailableColors().map(letter => {
                            const colorInfo = getColorInfo(letter);
                            const isSelected = stripeForm.color === letter;

                            return (
                                <button
                                    key={letter}
                                    type="button"
                                    onClick={() => handleStripeFormChange('color', letter)}
                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all relative text-center ${isSelected
                                        ? 'border-sage-500 bg-sage-50 text-sage-700'
                                        : 'border-wool-200 hover:border-wool-300 text-wool-600 hover:bg-wool-25'
                                        }`}
                                >
                                    {/* Color swatch */}
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mb-2"
                                        style={{ backgroundColor: colorInfo.hex }}
                                    />
                                    <div className="font-bold text-sm">{letter}</div>
                                    <div className="text-xs mt-1">
                                        {colorInfo.hasYarn ? (
                                            <span className="truncate block" title={colorInfo.displayName}>
                                                {colorInfo.displayName.length > 8
                                                    ? colorInfo.displayName.substring(0, 8) + '...'
                                                    : colorInfo.displayName
                                                }
                                            </span>
                                        ) : (
                                            `Color ${letter}`
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Preview */}
                    <div className="mt-3 text-sm text-wool-600 text-center">
                        Will add: <strong>{stripeForm.rows} {rowUnit} of {getColorInfo(stripeForm.color).displayName}</strong>
                    </div>
                </div>
            </div>
        </StandardModal>
    );

    const canProceed = stripeSequence.length > 0;


    return (
        <div className="space-y-6">
            {/* Add Stripe Button and Toggle - Split layout */}
            <div className="flex items-center justify-between mb-4">
                {/* View Toggle - Left side */}
                {stripeSequence.length > 0 && (
                    <div className="flex bg-wool-100 border border-wool-200 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${viewMode === 'cards'
                                ? 'bg-white text-wool-700 shadow-sm'
                                : 'text-wool-600 hover:text-wool-800'
                                }`}
                        >
                            <List size={12} className="inline mr-1" />
                            Cards
                        </button>
                        <button
                            onClick={() => setViewMode('visual')}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all ${viewMode === 'visual'
                                ? 'bg-white text-wool-700 shadow-sm'
                                : 'text-wool-600 hover:text-wool-800'
                                }`}
                        >
                            <Palette size={12} className="inline mr-1" />
                            Visual
                        </button>
                    </div>
                )}

                {/* Add empty div when no toggle to maintain right alignment */}
                {stripeSequence.length === 0 && <div></div>}


                {/* Add Stripe Button - Right side */}
                <button
                    onClick={handleAddStripe}
                    className="btn-secondary btn-sm flex items-center gap-2"
                >
                    <Plus size={16} />
                    Add Stripe
                </button>
            </div>

            {/* Quick Patterns - Only when empty */}
            {stripeSequence.length === 0 && (
                <div>
                    <label className="form-label">Quick Start</label>
                    <div className="grid grid-cols-1 gap-2">
                        {[
                            { key: 'classic', label: 'Classic Stripes', desc: '4-4 even stripes' },
                            { key: 'thin', label: 'Thin Stripes', desc: '1-1 alternating' },
                            { key: 'accent', label: 'Accent Stripes', desc: '6-2 main + accent' }
                        ].map(pattern => (
                            <button
                                key={pattern.key}
                                onClick={() => insertQuickPattern(pattern.key)}
                                className="text-left p-3 rounded-xl border-2 border-wool-200 hover:border-sage-300 hover:bg-sage-50 transition-colors bg-white"
                            >
                                <div className="text-sm font-medium">{pattern.label}</div>
                                <div className="text-xs text-wool-600">{pattern.desc}</div>
                            </button>
                        ))}
                    </div>
                    <div className="text-center mt-4 mb-2">
                        <div className="text-sm text-wool-500">or build custom:</div>
                    </div>
                </div>
            )}

            {/* Stripe Display */}
            {stripeSequence.length > 0 && (
                <div>
                    {viewMode === 'cards' ? (
                        /* Card View - Match Yarns & Colors format exactly */
                        <div className="space-y-3">
                            {stripeSequence.map((stripe, index) => {
                                const colorInfo = getColorInfo(stripe.color);
                                return (
                                    <div key={stripe.id || index} className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-wool-200">
                                        {/* Color chip - exactly like Yarns */}
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-gray-300 flex-shrink-0"
                                            style={{
                                                backgroundColor: colorInfo.hex,
                                                color: colorInfo.hex && colorInfo.hex !== '#ffffff' ? 'white' : '#6b7280'
                                            }}
                                        >
                                            {stripe.color}
                                        </div>

                                        {/* Stripe info - match Yarns format */}
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                                {colorInfo.hasYarn ? (
                                                    `${colorInfo.displayName}`
                                                ) : colorInfo.hasMapping ? (
                                                    `${colorInfo.name}`
                                                ) : (
                                                    `Color ${stripe.color}`
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {stripe.rows} {stripe.rows === 1 ? rowUnit.slice(0, -1) : rowUnit}
                                                {colorInfo.hasYarn && ` • Color ${stripe.color}`}
                                            </div>
                                        </div>

                                        {/* Actions - exactly like Yarns */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEditStripe(index)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                                title="Edit stripe"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStripe(index)}
                                                className="delete-icon"
                                                title="Delete stripe"
                                                aria-label={`Delete stripe ${index + 1}: ${colorInfo.displayName}`}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (

                        /* Visual View - Replace the existing visual view section */
                        <div className="bg-white rounded-xl border-2 border-wool-200 p-6">
                            <div className="text-sm text-wool-600 mb-4 text-center">
                                Stripe Pattern Preview ({totalRows} {rowUnit} total)
                            </div>

                            {/* Visual stripe bars - proportional thickness, no text inside */}
                            <div className="space-y-1">
                                {stripeSequence.map((stripe, index) => {
                                    const colorInfo = getColorInfo(stripe.color);
                                    // Proportional height: each row gets equal visual weight
                                    const heightPx = stripe.rows * 12; // 12px per row (adjust this value as needed)

                                    return (
                                        <div key={stripe.id || index} className="relative">
                                            <div
                                                className="w-full rounded border border-gray-300"
                                                style={{
                                                    backgroundColor: colorInfo.hex,
                                                    height: `${heightPx}px`
                                                }}
                                                title={`${stripe.rows} ${stripe.rows === 1 ? rowUnit.slice(0, -1) : rowUnit} of ${colorInfo.displayName}`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Legend - Enhanced with row counts */}
                            <div className="mt-4 pt-4 border-t border-wool-200">
                                <div className="text-xs text-wool-600 mb-2">Pattern Sequence:</div>
                                <div className="flex flex-wrap gap-3">
                                    {stripeSequence.map((stripe, index) => {
                                        const colorInfo = getColorInfo(stripe.color);
                                        return (
                                            <div key={`${stripe.color}-${index}`} className="flex items-center gap-2">
                                                <div
                                                    className="w-4 h-4 rounded border border-gray-300"
                                                    style={{ backgroundColor: colorInfo.hex }}
                                                />
                                                <span className="text-xs text-wool-700">
                                                    {stripe.color}: {stripe.rows} {stripe.rows === 1 ? rowUnit.slice(0, -1) : rowUnit}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Empty state */}
            {stripeSequence.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🌈</div>
                    <p>No stripes added yet</p>
                    <p className="text-sm">Use quick start or add your first stripe</p>
                </div>
            )}

            {/* Pattern Summary - Lavender box like Even Distribution */}
            {stripeSequence.length > 0 && (
                <div className="card-info">
                    <h4 className="text-sm font-semibold text-lavender-700 mb-3">📊 Pattern Summary</h4>
                    <div className="space-y-2 text-sm">
                        <div className="text-lavender-700">
                            <span className="font-medium">{stripeSequence.length} stripes</span> in <span className="font-medium">{[...new Set(stripeSequence.map(s => s.color))].length} colors</span>. <span className="font-medium">{totalRows} {rowUnit} repeat</span>.
                        </div>
                        {/*}   <div className="text-lavender-600">
                            Sequence: {stripeSequence.map(s => `${s.rows} ${getColorInfo(s.color).displayName}`).join(' → ')}
                        </div> */}
                    </div>
                </div>
            )}

            {/* Color Mapping Help - Wool box for unmapped colors */}
            {stripeSequence.length > 0 && Object.keys(colorMapping).length === 0 && (
                <div className="bg-wool-50 rounded-xl p-4 border border-wool-200">
                    <h4 className="text-sm font-semibold text-wool-700 mb-3">🎨 Color Mapping</h4>
                    <div className="text-sm text-wool-600">
                        Map letters to actual yarn colors in <strong>Project Details → Yarns & Colors</strong> to see your stripe pattern with real colors in the visual preview.
                    </div>
                </div>
            )}

            {/* Render modal */}
            {showStripeModal && createPortal(stripeModal, document.body)}

            {/* Stripe Modal Unsaved Changes Warning */}
            {showStripeUnsavedModal && createPortal(
                <StandardModal
                    isOpen={showStripeUnsavedModal}
                    onClose={() => setShowStripeUnsavedModal(false)}
                    onConfirm={handleConfirmStripeCancel}
                    category="warning"
                    colorScheme="red"
                    title="Discard Stripe Changes?"
                    subtitle="You have unsaved changes to this stripe"
                    primaryButtonText="Discard Changes"
                    secondaryButtonText="Keep Editing"
                >
                    <p className="text-sm text-gray-700">
                        Are you sure you want to close without saving? Your stripe details will be lost.
                    </p>
                </StandardModal>,
                document.body
            )}

        </div>
    );
};

export default StripesConfig;