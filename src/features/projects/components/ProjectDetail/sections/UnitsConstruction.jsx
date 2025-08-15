import React, { useState, useEffect } from 'react';
import SegmentedControl from '../../../../../shared/components/SegmentedControl';

/**
 * UnitsConstructionSection - Extracted Units & Construction fields
 * 
 * Handles both read and edit modes:
 * - Read: Shows current values in conversational format
 * - Edit: Modal with toggle buttons (exact same styling as original)
 * 
 * Zero functionality changes - pure architectural extraction
 */
const UnitsConstructionSection = ({
    project,
    isEditing,
    onEdit,
    formData,
    handleInputChange
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [tempFormData, setTempFormData] = useState({});

    // Initialize modal form data when opening
    // CHANGE TO (prevent reset flash):
    useEffect(() => {
        if (showEditModal && Object.keys(tempFormData).length === 0) { // Only set if empty
            setTempFormData({
                defaultUnits: formData?.defaultUnits || project?.defaultUnits || 'inches',
                construction: formData?.construction || project?.construction || 'flat'
            });
        }
    }, [showEditModal, formData, project]);

    // Handle ESC key and backdrop click
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showEditModal) {
                handleCancelEdit();
            }
        };

        if (showEditModal) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showEditModal]);

    const handleEditClick = () => {
        if (isEditing) {
            // Already in edit mode - just show modal
            setShowEditModal(true);
        } else {
            // Not in edit mode - trigger parent edit mode first
            onEdit();
            setShowEditModal(true);
        }
    };

    const handleSaveEdit = () => {
        // Update parent form data
        if (handleInputChange) {
            handleInputChange('defaultUnits', tempFormData.defaultUnits);
            handleInputChange('construction', tempFormData.construction);
        }
        setShowEditModal(false);
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setTempFormData({}); // ADD THIS LINE to clear for next time
    };

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            handleCancelEdit();
        }
    };

    const handleTempInputChange = (field, value) => {
        setTempFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Determine if section has content
    const hasContent = project?.defaultUnits || project?.construction;
    const displayData = isEditing ? formData : project;

    // Read View
    if (!showEditModal) {
        return (
            <div
                className="read-mode-section hover:bg-sage-25 active:scale-95 cursor-pointer transition-all duration-200"
                onClick={handleEditClick}
            >
                <div className="details-section-header">
                    <h3 className="section-header-secondary">📏 Units & Construction</h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>
                {hasContent ? (
                    <div className="text-sm text-wool-700 space-y-1 text-left">
                        {displayData?.defaultUnits && (
                            <div>Measured in {displayData.defaultUnits === 'inches' ? 'inches' : 'centimeters'}</div>
                        )}
                        {displayData?.construction && (
                            <div>{displayData.construction.charAt(0).toUpperCase() + displayData.construction.slice(1)} construction</div>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-wool-500 italic">
                        + Add measurement units and construction type
                    </div>
                )}
            </div>
        );
    }

    // Edit Modal
    return (
        <>
            {/* Background section for read view */}
            <div className="read-mode-section">
                <div className="details-section-header">
                    <h3 className="section-header-secondary">📏 Units & Construction</h3>
                    <button
                        onClick={handleEditClick}
                        className="details-edit-button"
                        title="Edit units and construction"
                    >
                        ✏️
                    </button>
                </div>

                {hasContent ? (
                    <div className="text-sm text-wool-700 space-y-1 text-left">
                        {displayData?.defaultUnits && (
                            <div>Measured in {displayData.defaultUnits === 'inches' ? 'inches' : 'centimeters'}</div>
                        )}
                        {displayData?.construction && (
                            <div>{displayData.construction.charAt(0).toUpperCase() + displayData.construction.slice(1)} construction</div>
                        )}
                    </div>
                ) : (
                    <div className="text-sm text-wool-500 italic">
                        + Add measurement units and construction type
                    </div>
                )}
            </div>

            {/* Modal */}
            <div className="modal" onClick={handleBackdropClick}>
                <div className="modal-content-light">
                    {/* Modal Header */}
                    <div className="modal-header-light relative flex items-center justify-center py-4 px-6 rounded-t-2xl bg-sage-200">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold">📏 Units & Construction</h2>
                            <p className="text-sage-600 text-sm">Set your measurement preferences</p>
                        </div>

                        <button
                            onClick={handleCancelEdit} // Replace with your actual close handler
                            className="absolute right-4 text-sage-600 text-2xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6">
                        <div className="space-y-4">

                            <SegmentedControl.Units
                                value={tempFormData.defaultUnits}
                                onChange={(value) => handleTempInputChange('defaultUnits', value)}
                            />


                            <SegmentedControl.Construction
                                value={tempFormData.construction}
                                onChange={(value) => handleTempInputChange('construction', value)}
                            />
                        </div>

                        {/* Modal Actions */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleCancelEdit}
                                className="flex-1 btn-tertiary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 btn-primary"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UnitsConstructionSection;