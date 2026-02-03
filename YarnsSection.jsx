import React, { useState, useEffect } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import IncrementInput from '../../../../../shared/components/IncrementInput';
import PageHeader from '../../../../../shared/components/PageHeader';
import { StandardModal, FullScreenModal } from '../../../../../shared/components/modals/StandardModal';
import YarnManagerModal from '../../../../../shared/components/yarns/YarnManagerModal';
/**
 * 🧶 YarnsSection - Full-screen yarn and color management
 * Now using enhanced StandardModal with FullScreenModal support
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

    // Get current data - use temp state when editing, real data when not
    const yarns = isEditing ? (tempFormState.yarns || []) : (formData?.yarns || project?.yarns || []);
    const colorCount = isEditing ? tempFormState.colorCount : (formData?.colorCount || project?.colorCount || 2);

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

    // Then use in your component:
    const getAvailableLetters = () => {
        const count = isEditing ? (tempFormState.colorCount || 2) : (colorCount || 2);
        return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
    };

    // Handle add yarn (use temp state for available letters + auto-assign next letter)
    const handleAddYarn = () => {
        setEditingYarnIndex(null);
        setShowYarnModal(true);
    };

    // Handle edit yarn (use temp state)
    const handleEditYarn = (yarnIndex) => {
        setEditingYarnIndex(yarnIndex);
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

    // Handle save yarn (now uses temp state AND auto-updates colorCount)
    const handleSaveYarn = ({ yarn, conflict }) => {
        let updatedYarns = [...tempFormState.yarns];
        let updatedMapping = { ...tempFormState.colorMapping };

        // Handle conflict if exists
        if (conflict) {
            const conflictIndex = updatedYarns.findIndex(y => y.id === conflict.conflictYarn.id);
            if (conflictIndex !== -1) {
                updatedYarns[conflictIndex] = {
                    ...updatedYarns[conflictIndex],
                    letter: ''
                };
                delete updatedMapping[conflict.conflictYarn.letter];
            }
        }

        // Add or update yarn
        if (editingYarnIndex !== null) {
            const oldYarn = updatedYarns[editingYarnIndex];
            if (oldYarn.letter && oldYarn.letter !== yarn.letter) {
                delete updatedMapping[oldYarn.letter];
            }
            updatedYarns[editingYarnIndex] = yarn;
        } else {
            updatedYarns.push(yarn);
        }

        // Update color mapping
        if (yarn.letter) {
            updatedMapping[yarn.letter] = `${yarn.brand} - ${yarn.color}`;
        }

        // Auto-update color count
        const currentColorCount = tempFormState.colorCount;
        const suggestedColorCount = Math.max(currentColorCount, updatedYarns.length);

        setTempFormState(prev => ({
            ...prev,
            yarns: updatedYarns,
            colorMapping: updatedMapping,
            colorCount: suggestedColorCount
        }));
        setHasUnsavedChanges(true);
        setShowYarnModal(false);
    };

    // Read-only view
    if (!isEditing) {
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
                                    {[...yarns]
                                        .sort((a, b) => {
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
            </>
        );
    }

    // Full-screen editing mode using FullScreenModal
    return (
        <>
            <FullScreenModal
                isOpen={isEditing}
                onClose={handleCancel}
                backgroundTheme="yarn"
                title="Yarns & Colors"
            >
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
                                {[...yarns]
                                    .sort((a, b) => {
                                        // Assigned letters come first, alphabetically
                                        if (a.letter && !b.letter) return -1;
                                        if (!a.letter && b.letter) return 1;
                                        if (a.letter && b.letter) return a.letter.localeCompare(b.letter);
                                        return 0; // Keep unassigned in original order
                                    })
                                    .map((yarn, index) => (
                                        <div key={yarn.id || index} className="flex items-start gap-4 p-4 bg-white rounded-xl border-2 border-wool-200">
                                            {/* Color chip - aligned to top */}
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 border-gray-300 flex-shrink-0"
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
                                                    className="delete-icon"
                                                    title="Delete yarn"
                                                    aria-label={`Delete yarn: ${yarn?.color || yarn?.brand || `yarn ${index + 1}`}`}
                                                >
                                                    ×
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
            </FullScreenModal>

            {/* Add/Edit Yarn Modal */}
            <YarnManagerModal
                isOpen={showYarnModal}
                onClose={() => setShowYarnModal(false)}
                onSave={handleSaveYarn}
                existingYarns={tempFormState.yarns || []}
                editingYarn={editingYarnIndex !== null ? tempFormState.yarns[editingYarnIndex] : null}
                availableLetters={getAvailableLetters()}
                autoAssignNextLetter={true}
                showSkeins={true}
            />

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
};

export default YarnsSection;