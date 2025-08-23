import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, X } from 'lucide-react';
import IncrementInput from '../../../../../shared/components/IncrementInput';
import PageHeader from '../../../../../shared/components/PageHeader';
import { StandardModal } from '../../../../../shared/components/modals/StandardModal';

/**
 * 🧶 YarnsSection - Full-screen yarn and color management
 */
const YarnsSection = ({
    project,
    formData,
    handleInputChange
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showYarnModal, setShowYarnModal] = useState(false);
    const [editingYarnIndex, setEditingYarnIndex] = useState(null);

    // Unsaved changes warning modal
    const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);

    // Separate temp form state for editing
    const [tempFormState, setTempFormState] = useState({
        yarns: [],
        colorCount: 2,
        colorMapping: {}
    });

    // Track if there are unsaved changes
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Yarn modal form state
    const [yarnForm, setYarnForm] = useState({
        brand: '',
        color: '',
        colorHex: '',
        letter: '',
        skeins: 1
    });

    // Yarn modal unsaved changes tracking
    const [yarnModalHasChanges, setYarnModalHasChanges] = useState(false);
    const [showYarnUnsavedModal, setShowYarnUnsavedModal] = useState(false);

    // Conflict preview state
    const [conflictPreview, setConflictPreview] = useState(null);

    // Get current data - use temp state when editing, real data when not
    const yarns = isEditing ? tempFormState.yarns : (formData?.yarns || project?.yarns || []);
    const colorCount = isEditing ? tempFormState.colorCount : (formData?.colorCount || project?.colorCount || 2);
    const colorMapping = isEditing ? tempFormState.colorMapping : (formData?.colorMapping || project?.colorMapping || {});

    // Initialize temp form state when entering edit mode
    useEffect(() => {
        if (isEditing && !hasUnsavedChanges) {
            setTempFormState({
                yarns: formData?.yarns || project?.yarns || [],
                colorCount: formData?.colorCount || project?.colorCount || 2,
                colorMapping: formData?.colorMapping || project?.colorMapping || {}
            });
        }
    }, [isEditing, formData, project, hasUnsavedChanges]);

    // Handle temp form changes (only updates temp state)
    const handleTempInputChange = (field, value) => {
        setTempFormState(prev => ({
            ...prev,
            [field]: value
        }));
        setHasUnsavedChanges(true);
    };

    // Handle save changes
    const handleSaveChanges = () => {
        // Commit temp state to real project data
        handleInputChange('yarns', tempFormState.yarns);
        handleInputChange('colorCount', tempFormState.colorCount);
        handleInputChange('colorMapping', tempFormState.colorMapping);

        setHasUnsavedChanges(false);
        setIsEditing(false);
    };

    // Handle cancel with unsaved changes check
    const handleCancel = () => {
        if (hasUnsavedChanges) {
            setShowUnsavedChangesModal(true);
        } else {
            setIsEditing(false);
        }
    };

    // Handle confirmed cancel (discard changes)
    const handleConfirmCancel = () => {
        setHasUnsavedChanges(false);
        setTempFormState({
            yarns: [],
            colorCount: 2,
            colorMapping: {}
        });
        setShowUnsavedChangesModal(false);
        setIsEditing(false);
    };

    // Rainbow color palette for yarn selection
    const colorPalette = [
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
    ];

    // Get available color letters (use temp state when editing)
    const getAvailableLetters = () => {
        const count = isEditing ? tempFormState.colorCount : colorCount;
        return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
    };

    // Get color for letter assignment
    const getColorForLetter = (letter) => {
        const yarnWithLetter = yarns.find(y => y.letter === letter);
        return yarnWithLetter ? yarnWithLetter.colorHex || '#f3f4f6' : '#f3f4f6';
    };

    // Handle add yarn (use temp state for available letters)
    const handleAddYarn = () => {
        console.log('🎯 Opening Add Yarn modal'); // Debug log
        const availableLetters = getAvailableLetters();
        setYarnForm({
            brand: '',
            color: '',
            colorHex: colorPalette[0].hex,
            letter: availableLetters.find(letter => !tempFormState.yarns.some(y => y.letter === letter)) || '',
            skeins: 1
        });
        setEditingYarnIndex(null);
        setConflictPreview(null);
        setYarnModalHasChanges(false);
        setShowYarnModal(true);
    };

    // Handle edit yarn (use temp state)
    const handleEditYarn = (yarnIndex) => {
        const yarn = tempFormState.yarns[yarnIndex];
        setYarnForm({
            brand: yarn.brand || '',
            color: yarn.color || '',
            colorHex: yarn.colorHex || colorPalette[0].hex,
            letter: yarn.letter || '',
            skeins: yarn.skeins || 1
        });
        setEditingYarnIndex(yarnIndex);
        setConflictPreview(null);
        setYarnModalHasChanges(false);
        setShowYarnModal(true);
    };

    // Handle delete yarn (now uses temp state)
    const handleDeleteYarn = (yarnIndex) => {
        const updatedYarns = tempFormState.yarns.filter((_, index) => index !== yarnIndex);
        const updatedMapping = { ...tempFormState.colorMapping };

        // Remove letter mapping for deleted yarn
        const deletedYarn = tempFormState.yarns[yarnIndex];
        if (deletedYarn.letter) {
            delete updatedMapping[deletedYarn.letter];
        }

        setTempFormState(prev => ({
            ...prev,
            yarns: updatedYarns,
            colorMapping: updatedMapping
        }));
        setHasUnsavedChanges(true);
    };

    // Check for letter conflicts using temp state
    const checkConflicts = (newYarnData) => {
        if (!newYarnData.letter) return null;

        const existingYarnIndex = tempFormState.yarns.findIndex(y => y.letter === newYarnData.letter);
        const isCurrentYarn = editingYarnIndex !== null && existingYarnIndex === editingYarnIndex;

        if (existingYarnIndex !== -1 && !isCurrentYarn) {
            const conflictYarn = tempFormState.yarns[existingYarnIndex];
            return {
                newYarn: newYarnData,
                conflictYarn: conflictYarn,
                action: 'unassign'
            };
        }

        return null;
    };

    // Handle yarn form changes
    const handleYarnFormChange = (field, value) => {
        const updatedForm = { ...yarnForm, [field]: value };
        setYarnForm(updatedForm);
        setYarnModalHasChanges(true);

        // Check for conflicts when letter changes
        if (field === 'letter') {
            const conflict = checkConflicts(updatedForm);
            setConflictPreview(conflict);
        }
    };

    // Handle yarn modal close with unsaved check
    const handleYarnModalClose = () => {
        if (yarnModalHasChanges) {
            setShowYarnUnsavedModal(true);
        } else {
            setShowYarnModal(false);
            setYarnModalHasChanges(false);
        }
    };

    // Handle confirmed yarn modal cancel
    const handleConfirmYarnCancel = () => {
        setShowYarnModal(false);
        setShowYarnUnsavedModal(false);
        setYarnModalHasChanges(false);
        setConflictPreview(null);
    };

    // Handle save yarn (now uses temp state)
    const handleSaveYarn = () => {
        let updatedYarns = [...tempFormState.yarns];
        let updatedMapping = { ...tempFormState.colorMapping };

        // Handle conflicts first
        if (conflictPreview) {
            // Remove letter from conflicted yarn
            const conflictIndex = tempFormState.yarns.findIndex(y => y.letter === yarnForm.letter);
            if (conflictIndex !== -1) {
                updatedYarns[conflictIndex] = { ...updatedYarns[conflictIndex], letter: '' };
                delete updatedMapping[yarnForm.letter];
            }
        }

        // Add or update the current yarn
        if (editingYarnIndex !== null) {
            // Editing existing yarn
            const oldYarn = tempFormState.yarns[editingYarnIndex];
            if (oldYarn.letter && oldYarn.letter !== yarnForm.letter) {
                delete updatedMapping[oldYarn.letter];
            }
            updatedYarns[editingYarnIndex] = { ...yarnForm, id: oldYarn.id || Date.now() };
        } else {
            // Adding new yarn
            updatedYarns.push({ ...yarnForm, id: Date.now() });
        }

        // Update color mapping
        if (yarnForm.letter) {
            updatedMapping[yarnForm.letter] = `${yarnForm.brand} - ${yarnForm.color}`;
        }

        // Update temp state
        setTempFormState(prev => ({
            ...prev,
            yarns: updatedYarns,
            colorMapping: updatedMapping
        }));
        setHasUnsavedChanges(true);

        setShowYarnModal(false);
        setYarnModalHasChanges(false);
        setConflictPreview(null);
    };

    // Add/Edit Yarn Modal using StandardModal - MOVED TO TOP
    const yarnModal = (
        <StandardModal
            isOpen={showYarnModal}
            onClose={handleYarnModalClose}
            onConfirm={handleSaveYarn}
            category="input"
            colorScheme="sage"
            title={editingYarnIndex !== null ? 'Edit Yarn' : 'Add New Yarn'}
            subtitle="Configure yarn details and color assignment"
            primaryButtonText={editingYarnIndex !== null ? 'Save Changes' : 'Add Yarn'}
            secondaryButtonText="Cancel"
            primaryButtonProps={{
                disabled: !yarnForm.brand?.trim() || !yarnForm.color?.trim() || !yarnForm.colorHex
            }}
        >
            <div className="space-y-4">
                {/* Brand Name */}
                <div>
                    <label className="form-label">Brand Name</label>
                    <input
                        data-modal-focus
                        type="text"
                        value={yarnForm.brand}
                        onChange={(e) => handleYarnFormChange('brand', e.target.value)}
                        placeholder="e.g., Cascade Yarns"
                        className="w-full border-2 border-wool-200 rounded-xl px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                    />
                </div>

                {/* Color Name */}
                <div>
                    <label className="form-label">Color Name</label>
                    <input
                        type="text"
                        value={yarnForm.color}
                        onChange={(e) => handleYarnFormChange('color', e.target.value)}
                        placeholder="e.g., Forest Green"
                        className="w-full border-2 border-wool-200 rounded-xl px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                    />
                </div>

                {/* Color Picker */}
                <div>
                    <label className="form-label">Color Swatch</label>
                    <div className="grid grid-cols-6 gap-2">
                        {colorPalette.map((color) => (
                            <button
                                key={color.hex}
                                type="button"
                                onClick={() => handleYarnFormChange('colorHex', color.hex)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${yarnForm.colorHex === color.hex
                                    ? 'border-gray-800 scale-110'
                                    : 'border-gray-300 hover:scale-105'
                                    }`}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            />
                        ))}
                    </div>
                    <div className="mt-2 text-sm text-wool-600">
                        Selected: {colorPalette.find(c => c.hex === yarnForm.colorHex)?.name || 'Custom'}
                    </div>
                </div>

                {/* Letter Assignment - Visual Button Grid */}
                <div>
                    <label className="form-label">Assign to Letter (Optional)</label>
                    <div className="grid grid-cols-4 gap-2">
                        {/* None Button */}
                        <button
                            type="button"
                            onClick={() => handleYarnFormChange('letter', '')}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${yarnForm.letter === ''
                                    ? 'border-sage-500 bg-sage-50 text-sage-700'
                                    : 'border-wool-200 hover:border-wool-300 text-wool-600'
                                }`}
                        >
                            <div className="font-bold text-lg">—</div>
                            <div className="text-xs mt-1">None</div>
                        </button>

                        {/* Letter Buttons */}
                        {getAvailableLetters().map(letter => {
                            const assignedYarn = tempFormState.yarns.find(y => y.letter === letter);
                            const isCurrentYarn = editingYarnIndex !== null && tempFormState.yarns[editingYarnIndex]?.letter === letter;
                            const isSelected = yarnForm.letter === letter;
                            const isOccupied = assignedYarn && !isCurrentYarn;

                            return (
                                <button
                                    key={letter}
                                    type="button"
                                    onClick={() => handleYarnFormChange('letter', letter)}
                                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all relative ${isSelected
                                            ? 'border-sage-500 bg-sage-50 text-sage-700'
                                            : isOccupied
                                                ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                                                : 'border-wool-200 hover:border-wool-300 text-wool-600 hover:bg-wool-25'
                                        }`}
                                >
                                    <div className="font-bold text-lg">{letter}</div>
                                    <div className="text-xs mt-1">
                                        {isSelected ? 'Selected' : isOccupied ? 'Reassign' : 'Available'}
                                    </div>

                                    {/* Color dot if assigned */}
                                    {assignedYarn && (
                                        <div
                                            className="absolute top-1 right-1 w-3 h-3 rounded-full border border-gray-300"
                                            style={{ backgroundColor: assignedYarn.colorHex || '#f3f4f6' }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Helper text */}
                    <div className="text-xs text-wool-500 mt-2">
                        💡 Letters help organize colors in your pattern instructions
                    </div>
                </div>

                {/* Number of Skeins */}
                <div>
                    <label className="form-label">Number of Skeins</label>
                    <IncrementInput
                        value={yarnForm.skeins}
                        onChange={(value) => handleYarnFormChange('skeins', value)}
                        min={1}
                        max={50}
                        label="skeins"
                        size="sm"
                    />
                </div>

                {/* Conflict Preview */}
                {conflictPreview && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="text-sm font-medium text-yellow-800 mb-1">Preview Changes:</div>
                        <div className="text-sm text-yellow-700 space-y-1">
                            <div>✅ {yarnForm.brand} {yarnForm.color} → Letter {yarnForm.letter}</div>
                            <div>⚠️ {conflictPreview.conflictYarn.brand} {conflictPreview.conflictYarn.color} → Unassigned</div>
                        </div>
                    </div>
                )}
            </div>
        </StandardModal>
    );

    // Full-screen edit mode
    if (isEditing) {
        const fullScreenContent = (
            <div className="fixed inset-0 z-50 min-h-screen bg-yarn-50 overflow-y-auto">
                <div className="absolute inset-0 bg-yarn-50"></div>

                <div className="relative app-container bg-yarn-50 min-h-screen shadow-lg">
                    <PageHeader
                        useBranding={true}
                        onHome={() => { }}
                        compact={true}
                        onBack={handleCancel}
                        showCancelButton={true}
                        onCancel={handleCancel}
                    />

                    {/* Add proper spacing after PageHeader */}
                    <div className="px-6 pt-6">
                        <div className="content-header-primary">Yarns & Colors</div>
                    </div>

                    {/* Use proper DetailsTab spacing pattern: p-6 space-y-6 */}
                    <div className="p-6 space-y-6">
                        {/* Colors in Project Section */}
                        <div>
                            <label className="form-label">Colors in Project</label>
                            <IncrementInput
                                value={colorCount}
                                onChange={(value) => handleTempInputChange('colorCount', value)}
                                label="colors in this project"
                                unit="colors"
                                min={1}
                                max={12}
                                size="default"
                            />
                            <div className="form-help">
                                How many different colors will this project use?
                            </div>
                        </div>

                        {/* Current Yarns Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="form-label">Current Yarns</label>
                                <button
                                    onClick={handleAddYarn}
                                    className="btn-primary btn-sm flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Yarn
                                </button>
                            </div>

                            {yarns.length > 0 ? (
                                <div className="space-y-3">
                                    {yarns.map((yarn, index) => (
                                        <div key={yarn.id || index} className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-wool-200">
                                            {/* Color chip */}
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-gray-300"
                                                style={{
                                                    backgroundColor: yarn.colorHex || '#f3f4f6',
                                                    color: yarn.colorHex && yarn.colorHex !== '#ffffff' ? 'white' : '#6b7280'
                                                }}
                                            >
                                                {yarn.letter || '?'}
                                            </div>

                                            {/* Yarn info */}
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">
                                                    {yarn.brand} - {yarn.color}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {yarn.skeins} {yarn.skeins === 1 ? 'skein' : 'skeins'}
                                                    {yarn.letter && ` • Color ${yarn.letter}`}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditYarn(index)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                                    title="Edit yarn"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteYarn(index)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete yarn"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-2">🧶</div>
                                    <p>No yarns added yet</p>
                                    <p className="text-sm">Add your first yarn to get started</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save/Cancel Button Bar */}
                    <div className="sticky bottom-0 bg-yarn-50 border-t-2 border-wool-200 p-6 flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="flex-1 btn-tertiary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveChanges}
                            className="flex-1 btn-primary"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        );

        return (
            <>
                {createPortal(fullScreenContent, document.body)}
                {/* Render yarn modal separately to avoid portal conflicts */}
                {showYarnModal && createPortal(yarnModal, document.body)}

                {/* Yarn Modal Unsaved Changes Warning - Also use portal */}
                {showYarnUnsavedModal && createPortal(
                    <StandardModal
                        isOpen={showYarnUnsavedModal}
                        onClose={() => setShowYarnUnsavedModal(false)}
                        onConfirm={handleConfirmYarnCancel}
                        category="warning"
                        colorScheme="red"
                        title="Discard Yarn Changes?"
                        subtitle="You have unsaved changes to this yarn"
                        primaryButtonText="Discard Changes"
                        secondaryButtonText="Keep Editing"
                    >
                        <p className="text-sm text-gray-700">
                            Are you sure you want to close without saving? Your yarn details will be lost.
                        </p>
                    </StandardModal>,
                    document.body
                )}

                {/* Main Unsaved Changes Warning Modal */}
                <StandardModal
                    isOpen={showUnsavedChangesModal}
                    onClose={() => setShowUnsavedChangesModal(false)}
                    onConfirm={handleConfirmCancel}
                    category="warning"
                    colorScheme="red"
                    title="Unsaved Changes"
                    subtitle="You have unsaved changes that will be lost"
                    primaryButtonText="Discard Changes"
                    secondaryButtonText="Keep Editing"
                >
                    <p className="text-sm text-gray-700">
                        Are you sure you want to leave without saving? Your yarn and color changes will be lost.
                    </p>
                </StandardModal>
            </>
        );
    }

    // Read-only view
    return (
        <>
            <div
                className="read-mode-section hover:bg-sage-25 active:scale-95 cursor-pointer transition-all duration-200"
                onClick={() => setIsEditing(true)}
            >
                <div className="details-section-header">
                    <h3 className="section-header-secondary">🧶 Yarns & Colors</h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>

                <div className="space-y-3 text-left">
                    <div className="text-sm text-wool-700">
                        <strong>Colors in project:</strong> {colorCount}
                    </div>

                    {yarns.length > 0 ? (
                        <div className="text-sm text-wool-700">
                            <strong>Current yarns:</strong>
                            <div className="ml-4 mt-1 space-y-1">
                                {/* Sort yarns by letter assignment for display */}
                                {[...yarns]
                                    .sort((a, b) => {
                                        // Yarns with letters come first, sorted alphabetically
                                        // Yarns without letters come after
                                        if (a.letter && !b.letter) return -1;
                                        if (!a.letter && b.letter) return 1;
                                        if (a.letter && b.letter) return a.letter.localeCompare(b.letter);
                                        return 0;
                                    })
                                    .map((yarn, index) => (
                                        <div key={yarn.id || index} className="flex items-center gap-2">
                                            <div
                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                style={{ backgroundColor: yarn.colorHex || '#f3f4f6' }}
                                            />
                                            <span>
                                                {yarn.letter ? `${yarn.letter} - ` : ''}
                                                {yarn.brand}: {yarn.color} ({yarn.skeins} {yarn.skeins === 1 ? 'skein' : 'skeins'})
                                            </span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-wool-500 italic">
                            + Add yarn details
                        </div>
                    )}
                </div>
            </div>

            {/* Render modal outside of read-only view if open */}
            {showYarnModal && createPortal(yarnModal, document.body)}
        </>
    );
};

export default YarnsSection;