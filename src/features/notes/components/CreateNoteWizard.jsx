/**
 * Two-Page Create Note Wizard - Streamlined with proper yarn integration
 */

import React, { useState } from 'react';
import PageHeader from '../../../shared/components/PageHeader';
import SegmentedControl from '../../../shared/components/SegmentedControl';
import IncrementInput from '../../../shared/components/IncrementInput';
import { useNotesContext } from '../hooks/useNotesContext';
import StandardModal from '../../../shared/components/modals/StandardModal';

const CreateNoteWizard = ({ onBack, onGoToLanding, onNoteCreated }) => {
    const { createNote } = useNotesContext();
    const [currentPage, setCurrentPage] = useState(1);

    // Add these state variables at the top with your other useState calls:
    const [showColorModal, setShowColorModal] = useState(false);
    const [editingColorIndex, setEditingColorIndex] = useState(null);

    // Page 1 - Essentials
    const [essentials, setEssentials] = useState({
        name: '',
        startingStitches: 40,
        construction: 'flat',
        units: 'inches'
    });

    // Page 2 - Optional details (including full yarn system)
    const [optionalData, setOptionalData] = useState({
        textNotes: '', // This is the description that was missing
        colorCount: 1, // This feeds into yarn system
        yarns: [],
        colorMapping: {},
        needleInfo: ''
    });

    const updateEssential = (field, value) => {
        setEssentials(prev => ({ ...prev, [field]: value }));
    };

    const updateOptional = (field, value) => {
        setOptionalData(prev => ({ ...prev, [field]: value }));
    };

    // Handle yarn section updates (this integrates with your existing YarnsSection)
    const handleYarnUpdate = (field, value) => {
        updateOptional(field, value);
    };

    const applyGaugeSwatchTemplate = () => {
        setEssentials({
            name: 'Stockinette Gauge Swatch',
            startingStitches: 30,
            construction: 'flat',
            units: 'inches'
        });
    };

    const canProceedToPage2 = () => {
        return essentials.name.trim() && essentials.startingStitches > 0;
    };

    const canCreateNote = () => {
        return canProceedToPage2(); // Same requirements since page 2 is optional
    };

    const handleCreateNote = async () => {
        if (!canCreateNote()) return;

        // Generate yarn placeholders if no specific yarns but multiple colors
        let finalYarns = optionalData.yarns;
        if (finalYarns.length === 0 && optionalData.colorCount > 1) {
            finalYarns = [];
            for (let i = 0; i < optionalData.colorCount; i++) {
                const letter = String.fromCharCode(65 + i);
                finalYarns.push({
                    letter,
                    brand: '',
                    color: '',
                    colorHex: '#f3f4f6'
                });
            }
        }

        const newNote = {
            name: essentials.name.trim(),
            textNotes: optionalData.textNotes.trim(),
            startingStitches: parseInt(essentials.startingStitches),
            construction: essentials.construction,
            numberOfColors: optionalData.colorCount,
            yarns: finalYarns,
            colorCount: optionalData.colorCount,
            colorMapping: optionalData.colorMapping,
            needleInfo: optionalData.needleInfo.trim(),
            defaultUnits: essentials.units,
            components: [{
                id: `comp_${Date.now()}`,
                name: 'Pattern',
                construction: essentials.construction,
                startingStitches: parseInt(essentials.startingStitches),
                steps: []
            }]
        };

        const createdNote = await createNote(newNote);
        if (createdNote && onNoteCreated) {
            onNoteCreated(createdNote);
        }
    };

    // Page 1 - Essentials
    if (currentPage === 1) {
        return (
            <div className="min-h-screen bg-lavender-50">
                <div className="app-container bg-lavender-50 min-h-screen shadow-lg">
                    <PageHeader
                        useBranding={true}
                        onHome={onGoToLanding}
                        compact={true}
                        onBack={onBack}
                        showCancelButton={true}
                        onCancel={onBack}
                    />

                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-wool-700 mb-1">Create Note</h2>

                        </div>

                        {/* Essential Fields */}
                        <div className="bg-white rounded-xl p-6 border-2 border-lavender-200">

                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Note Name</label>
                                    <input
                                        type="text"
                                        value={essentials.name}
                                        onChange={(e) => updateEssential('name', e.target.value)}
                                        placeholder="e.g., Fair Isle Swatch, Gauge Test"
                                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-lavender-500 focus:ring-0 transition-colors bg-white"
                                        maxLength={100}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="form-label">Starting Stitches</label>
                                    <IncrementInput
                                        value={essentials.startingStitches}
                                        onChange={(value) => updateEssential('startingStitches', value)}
                                        min={1}
                                        max={500}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <SegmentedControl.Construction
                                        value={essentials.construction}
                                        onChange={(value) => updateEssential('construction', value)}
                                    />
                                </div>

                                <div>
                                    <SegmentedControl.Units
                                        value={essentials.units}
                                        onChange={(value) => updateEssential('units', value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex gap-3">
                            <button
                                onClick={onBack}
                                className="flex-1 btn-tertiary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setCurrentPage(2)}
                                disabled={!canProceedToPage2()}
                                className="flex-2 btn-primary"
                            >
                                Add Details →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Page 2 - Optional Details
    return (
        <div className="min-h-screen bg-lavender-50">
            <div className="app-container bg-lavender-50 min-h-screen shadow-lg">
                <PageHeader
                    useBranding={true}
                    onHome={onGoToLanding}
                    compact={true}
                    onBack={() => setCurrentPage(1)}
                    showCancelButton={true}
                    onCancel={() => setCurrentPage(1)}
                />

                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-wool-700 mb-1">Optional Details</h2>
                        <p className="text-wool-600 text-sm mb-4">Add colors, yarns, and other details</p>

                    </div>

                    {/* Current essentials summary */}
                    <div className="bg-white rounded-xl p-4 border-2 border-wool-200">
                        <div className="text-sm text-wool-600">
                            <strong>{essentials.name}</strong> • {essentials.startingStitches} stitches • {essentials.construction} • {essentials.units}
                        </div>
                    </div>

                    {/* Optional Details */}
                    <div className="bg-white rounded-xl p-6 border-2 border-wool-200">
                        <h3 className="text-lg font-semibold text-wool-700 mb-4">Additional Information</h3>

                        <div className="space-y-4">
                            {/* Description - Always visible */}
                            <div>
                                <label className="form-label">Description (Optional)</label>
                                <textarea
                                    value={optionalData.textNotes}
                                    onChange={(e) => updateOptional('textNotes', e.target.value)}
                                    placeholder="What are you testing or working on?"
                                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white resize-none"
                                    rows={2}
                                    maxLength={200}
                                />
                                <div className="text-xs text-wool-500 mt-1">
                                    {200 - optionalData.textNotes.length} characters remaining
                                </div>
                            </div>

                            {/* Simple Color System */}
                            <div>
                                <label className="form-label">Number of Colors</label>
                                <IncrementInput
                                    value={optionalData.colorCount}
                                    onChange={(value) => updateOptional('colorCount', value)}
                                    min={1}
                                    max={26}
                                    className="w-full"
                                />
                                <div className="text-xs text-wool-500 mt-1">
                                    Colors will be labeled A, B, C, etc. in patterns
                                </div>
                            </div>

                            {/* Simple Color Picker - only show if more than 1 color */}
                            {/* Simple Color Picker - only show if more than 1 color */}
                            {/* Compact Color Preview with Modal */}
                            {optionalData.colorCount > 1 && (
                                <div>
                                    <label className="form-label">Colors</label>
                                    <div className="flex items-center gap-2 mb-2">
                                        {Array.from({ length: optionalData.colorCount }, (_, i) => {
                                            const letter = String.fromCharCode(65 + i);
                                            const currentColor = optionalData.yarns[i]?.colorHex || '#f3f4f6';

                                            return (
                                                <button
                                                    key={letter}
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingColorIndex(i);
                                                        setShowColorModal(true);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-2 border-2 border-wool-200 rounded-lg hover:border-sage-300 transition-colors"
                                                >
                                                    <div
                                                        className="w-5 h-5 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: currentColor }}
                                                    />
                                                    <span className="text-sm font-medium">{letter}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="text-xs text-wool-500">
                                        Click to pick colors • Colors appear as A, B, C in patterns
                                    </div>
                                </div>
                            )}

                            {/* Needle Information - Always visible */}
                            <div>
                                <label className="form-label">Needle Information (Optional)</label>
                                <input
                                    type="text"
                                    value={optionalData.needleInfo}
                                    onChange={(e) => updateOptional('needleInfo', e.target.value)}
                                    placeholder="e.g., US 8, 5.0mm"
                                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                                    maxLength={50}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setCurrentPage(1)}
                            className="flex-1 btn-secondary"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={handleCreateNote}

                            className="flex-2 btn-primary"
                            disabled={!canCreateNote()}
                        >
                            Create Note
                        </button>
                    </div>
                </div>


                <StandardModal
                    isOpen={showColorModal}
                    onClose={() => {
                        setShowColorModal(false);
                        setEditingColorIndex(null);
                    }}
                    category="selection"
                    colorScheme="sage"
                    title={`Pick Color ${editingColorIndex !== null ? String.fromCharCode(65 + editingColorIndex) : ''}`}
                    subtitle="Choose from the color palette"
                    hideButtons={true}  // If StandardModal supports this
                    icon="🎨"
                >
                    <div>
                        <div className="grid grid-cols-6 gap-2">
                            {[
                                // Reds
                                { name: 'Cherry', hex: '#dc2626' },
                                { name: 'Burgundy', hex: '#7f1d1d' },
                                { name: 'Dusty Rose', hex: '#be185d' },
                                // Oranges  
                                { name: 'Coral', hex: '#f97316' },
                                { name: 'Rust', hex: '#c2410c' },
                                { name: 'Peach', hex: '#fed7aa' },
                                // Yellows
                                { name: 'Sunshine', hex: '#eab308' },
                                { name: 'Mustard', hex: '#a16207' },
                                { name: 'Cream', hex: '#fef3c7' },
                                // Greens
                                { name: 'Sage', hex: '#4a8a4a' },
                                { name: 'Forest', hex: '#166534' },
                                { name: 'Mint', hex: '#6ee7b7' },
                                // Blues
                                { name: 'Sky', hex: '#3b82f6' },
                                { name: 'Navy', hex: '#1e3a8a' },
                                { name: 'Teal', hex: '#0891b2' },
                                // Purples
                                { name: 'Lavender', hex: '#9b7cb6' },
                                { name: 'Plum', hex: '#7c3aed' },
                                { name: 'Violet', hex: '#a855f7' },
                                // Pinks
                                { name: 'Blush', hex: '#fda4af' },
                                { name: 'Magenta', hex: '#ec4899' },
                                { name: 'Rose', hex: '#f472b6' },
                                // Neutrals
                                { name: 'Charcoal', hex: '#374151' },
                                { name: 'Stone', hex: '#78716c' },
                                { name: 'Silver', hex: '#d1d5db' },
                                { name: 'Ivory', hex: '#fffbeb' },
                                { name: 'White', hex: '#ffffff' },
                                { name: 'Black', hex: '#000000' }
                            ].map((color) => (
                                <button
                                    key={color.hex}
                                    type="button"
                                    onClick={() => {
                                        if (editingColorIndex !== null) {
                                            const newYarns = [...optionalData.yarns];
                                            newYarns[editingColorIndex] = {
                                                letter: String.fromCharCode(65 + editingColorIndex),
                                                brand: '',
                                                color: color.name,
                                                colorHex: color.hex
                                            };
                                            updateOptional('yarns', newYarns);
                                            setShowColorModal(false);
                                        }
                                    }}
                                    className="w-10 h-10 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-all hover:scale-105"
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                />
                            ))}
                        </div>
                        <div className="text-xs text-wool-500 mt-3 text-center">
                            Click any color to select it
                        </div>
                    </div>
                </StandardModal>






            </div>

        </div>


    );

};





export default CreateNoteWizard;