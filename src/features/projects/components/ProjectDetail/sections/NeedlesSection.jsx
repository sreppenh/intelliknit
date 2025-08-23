import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, X } from 'lucide-react';
import PageHeader from '../../../../../shared/components/PageHeader';
import { StandardModal } from '../../../../../shared/components/modals/StandardModal';

/**
 * 🪡 NeedlesSection - Full-screen needle management
 */
const NeedlesSection = ({
    project,
    formData,
    handleInputChange
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showNeedleModal, setShowNeedleModal] = useState(false);
    const [editingNeedleIndex, setEditingNeedleIndex] = useState(null);

    // Unsaved changes warning modal
    const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);

    // Separate temp form state for editing
    const [tempFormState, setTempFormState] = useState({
        needles: []
    });

    // Track if there are unsaved changes
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Needle modal form state
    const [needleForm, setNeedleForm] = useState({
        size: '',
        type: ''
    });

    // Needle modal unsaved changes tracking
    const [needleModalHasChanges, setNeedleModalHasChanges] = useState(false);
    const [showNeedleUnsavedModal, setShowNeedleUnsavedModal] = useState(false);

    // Get current data - use temp state when editing, real data when not
    const needles = isEditing ? tempFormState.needles : (formData?.needles || project?.needles || []);

    // Initialize temp form state when entering edit mode
    useEffect(() => {
        if (isEditing && !hasUnsavedChanges) {
            setTempFormState({
                needles: formData?.needles || project?.needles || []
            });
        }
    }, [isEditing, formData, project, hasUnsavedChanges]);

    // Handle save changes
    const handleSaveChanges = () => {
        // Commit temp state to real project data
        handleInputChange('needles', tempFormState.needles);

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
            needles: []
        });
        setShowUnsavedChangesModal(false);
        setIsEditing(false);
    };

    // Handle add needle
    const handleAddNeedle = () => {
        setNeedleForm({
            size: '',
            type: ''
        });
        setEditingNeedleIndex(null);
        setNeedleModalHasChanges(false);
        setShowNeedleModal(true);
    };

    // Handle edit needle (use temp state)
    const handleEditNeedle = (needleIndex) => {
        const needle = tempFormState.needles[needleIndex];
        setNeedleForm({
            size: needle.size || '',
            type: needle.type || ''
        });
        setEditingNeedleIndex(needleIndex);
        setNeedleModalHasChanges(false);
        setShowNeedleModal(true);
    };

    // Handle delete needle (now uses temp state)
    const handleDeleteNeedle = (needleIndex) => {
        const updatedNeedles = tempFormState.needles.filter((_, index) => index !== needleIndex);
        setTempFormState(prev => ({
            ...prev,
            needles: updatedNeedles
        }));
        setHasUnsavedChanges(true);
    };

    // Handle needle form changes
    const handleNeedleFormChange = (field, value) => {
        setNeedleForm(prev => ({
            ...prev,
            [field]: value
        }));
        setNeedleModalHasChanges(true);
    };

    // Handle needle modal close with unsaved check
    const handleNeedleModalClose = () => {
        if (needleModalHasChanges) {
            setShowNeedleUnsavedModal(true);
        } else {
            setShowNeedleModal(false);
            setNeedleModalHasChanges(false);
        }
    };

    // Handle confirmed needle modal cancel
    const handleConfirmNeedleCancel = () => {
        setShowNeedleModal(false);
        setShowNeedleUnsavedModal(false);
        setNeedleModalHasChanges(false);
    };

    // Handle save needle (now uses temp state)
    const handleSaveNeedle = () => {
        let updatedNeedles = [...tempFormState.needles];

        const needleToSave = {
            size: needleForm.size,
            type: needleForm.type || 'straight',
            length: '',
            id: Date.now()
        };

        // Add or update the needle
        if (editingNeedleIndex !== null) {
            // Editing existing needle
            const oldNeedle = tempFormState.needles[editingNeedleIndex];
            updatedNeedles[editingNeedleIndex] = { ...needleToSave, id: oldNeedle.id || Date.now() };
        } else {
            // Adding new needle
            updatedNeedles.push(needleToSave);
        }

        // Update temp state
        setTempFormState(prev => ({
            ...prev,
            needles: updatedNeedles
        }));
        setHasUnsavedChanges(true);

        setShowNeedleModal(false);
        setNeedleModalHasChanges(false);
    };

    // Needle sizes for dropdown
    const needleSizes = [
        'US 0 (2mm)', 'US 1 (2.25mm)', 'US 2 (2.75mm)', 'US 3 (3.25mm)',
        'US 4 (3.5mm)', 'US 5 (3.75mm)', 'US 6 (4mm)', 'US 7 (4.5mm)',
        'US 8 (5mm)', 'US 9 (5.5mm)', 'US 10 (6mm)', 'US 10.5 (6.5mm)',
        'US 11 (8mm)', 'US 13 (9mm)', 'US 15 (10mm)', 'US 17 (12mm)',
        'US 19 (15mm)', 'US 35 (19mm)', 'US 50 (25mm)'
    ];

    // Needle types for dropdown
    const needleTypes = [
        { value: 'straight', label: 'Straight' },
        { value: 'circular', label: 'Circular' },
        { value: 'double pointed', label: 'Double Pointed' },
        { value: 'interchangeable', label: 'Interchangeable' }
    ];

    // Format needle for display
    const formatNeedleDisplay = (needle) => {
        let display = needle.size || 'Unknown size';
        if (needle.type && needle.type !== 'straight') {
            display += ` ${needle.type}`;
        }
        return display;
    };

    // Add/Edit Needle Modal
    const needleModal = (
        <StandardModal
            isOpen={showNeedleModal}
            onClose={handleNeedleModalClose}
            onConfirm={handleSaveNeedle}
            category="input"
            colorScheme="sage"
            title={editingNeedleIndex !== null ? 'Edit Needle' : 'Add New Needle'}
            subtitle="Configure needle details"
            primaryButtonText={editingNeedleIndex !== null ? 'Save Changes' : 'Add Needle'}
            secondaryButtonText="Cancel"
            primaryButtonProps={{
                disabled: !needleForm.size?.trim()
            }}
        >
            <div className="space-y-4">
                {/* Needle Size */}
                <div>
                    <label className="form-label">Needle Size (Required)</label>
                    <select
                        data-modal-focus
                        value={needleForm.size}
                        onChange={(e) => handleNeedleFormChange('size', e.target.value)}
                        className="w-full border-2 border-wool-200 rounded-xl px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                        style={{ fontSize: '16px', minHeight: '44px' }}
                    >
                        <option value="">Select size...</option>
                        {needleSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>

                {/* Needle Type */}
                <div>
                    <label className="form-label">Needle Type</label>
                    <select
                        value={needleForm.type}
                        onChange={(e) => handleNeedleFormChange('type', e.target.value)}
                        className="w-full border-2 border-wool-200 rounded-xl px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                    >
                        <option value="">Select type...</option>
                        {needleTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                    <div className="form-help">
                        Defaults to "Straight" if not specified
                    </div>
                </div>
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
                        <div className="content-header-primary">Needles</div>
                    </div>

                    {/* Use proper DetailsTab spacing pattern: p-6 space-y-6 */}
                    <div className="p-6 space-y-6">
                        {/* Current Needles Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="form-label">Current Needles</label>
                                <button
                                    onClick={handleAddNeedle}
                                    className="btn-primary btn-sm flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Add Needle
                                </button>
                            </div>

                            {needles.length > 0 ? (
                                <div className="space-y-3">
                                    {needles.map((needle, index) => (
                                        <div key={needle.id || index} className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-wool-200">
                                            {/* Needle icon */}
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-sage-100 text-sage-700 border-2 border-sage-200">
                                                🪡
                                            </div>

                                            {/* Needle info */}
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">
                                                    {formatNeedleDisplay(needle)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    Knitting needle
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditNeedle(index)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                                    title="Edit needle"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteNeedle(index)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete needle"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-4xl mb-2">🪡</div>
                                    <p>No needles added yet</p>
                                    <p className="text-sm">Add your first needle to get started</p>
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
                {/* Render needle modal separately to avoid portal conflicts */}
                {showNeedleModal && createPortal(needleModal, document.body)}

                {/* Needle Modal Unsaved Changes Warning - Also use portal */}
                {showNeedleUnsavedModal && createPortal(
                    <StandardModal
                        isOpen={showNeedleUnsavedModal}
                        onClose={() => setShowNeedleUnsavedModal(false)}
                        onConfirm={handleConfirmNeedleCancel}
                        category="warning"
                        colorScheme="red"
                        title="Discard Needle Changes?"
                        subtitle="You have unsaved changes to this needle"
                        primaryButtonText="Discard Changes"
                        secondaryButtonText="Keep Editing"
                    >
                        <p className="text-sm text-gray-700">
                            Are you sure you want to close without saving? Your needle details will be lost.
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
                        Are you sure you want to leave without saving? Your needle changes will be lost.
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
                    <h3 className="section-header-secondary">🪡 Needles</h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>

                <div className="space-y-3 text-left">
                    {needles.length > 0 ? (
                        <div className="text-sm text-wool-700">
                            <strong>Current needles:</strong>
                            <div className="ml-4 mt-1 space-y-1">
                                {needles.map((needle, index) => (
                                    <div key={needle.id || index} className="py-1">
                                        {formatNeedleDisplay(needle)}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-wool-500 italic">
                            + Add needle information
                        </div>
                    )}
                </div>
            </div>

            {/* Render modal outside of read-only view if open */}
            {showNeedleModal && createPortal(needleModal, document.body)}
        </>
    );
};

export default NeedlesSection;