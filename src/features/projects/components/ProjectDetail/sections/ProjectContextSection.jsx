import React, { useState, useEffect } from 'react';
import { StandardModal } from '../../../../../shared/components/modals/StandardModal';

/**
 * ProjectContextSection - Conversational Project Context fields
 * 
 * Now using StandardModal pattern for consistency with UnitsConstructionSection
 * Handles recipient, size, occasion, deadline, priority with beautiful
 * conversational language and smart empty states.
 */
const ProjectContextSection = ({
    project,
    isEditing,
    onEdit,
    formData,
    handleInputChange
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [tempFormData, setTempFormData] = useState({});

    // Initialize modal form data when opening - prevent reset flash
    useEffect(() => {
        if (showEditModal && Object.keys(tempFormData).length === 0) {
            setTempFormData({
                recipient: formData?.recipient || project?.recipient || '',
                size: formData?.size || project?.size || '',
                deadline: formData?.deadline || project?.deadline || '',
                priority: formData?.priority || project?.priority || 'normal'
            });
        }
    }, [showEditModal, formData, project]);

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
        // Update parent form data - batch all updates
        if (handleInputChange) {
            Object.keys(tempFormData).forEach(field => {
                handleInputChange(field, tempFormData[field]);
            });
        }
        setShowEditModal(false);
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setTempFormData({}); // Clear temp data for next time
    };

    const handleTempInputChange = (field, value) => {
        setTempFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Determine what data to display
    const displayData = isEditing ? formData : project;

    // Check if section has any content
    const hasContent = displayData?.recipient || displayData?.size ||
        displayData?.deadline || (displayData?.priority && displayData.priority !== 'normal');

    // Read View
    if (!showEditModal) {
        return (
            <div
                className="read-mode-section hover:bg-sage-25 active:scale-95 cursor-pointer transition-all duration-200"
                onClick={handleEditClick}
            >
                <div className="details-section-header">
                    <h3 className="section-header-secondary">🎯 Project Context</h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>

                {hasContent ? (
                    <div className="text-sm text-wool-700 space-y-1 text-left">
                        {/* Recipient */}
                        {displayData?.recipient ? (
                            <div>👤 For {displayData.recipient}</div>
                        ) : (
                            <div className="text-wool-500 italic">+ Add recipient</div>
                        )}

                        {/* Size */}
                        {displayData?.size ? (
                            <div>📏 Size {displayData.size}</div>
                        ) : (
                            <div className="text-wool-500 italic">+ Add size</div>
                        )}

                        {/* Deadline */}
                        {displayData?.deadline ? (
                            <div>📅 Due {formatDate(displayData.deadline)}</div>
                        ) : (
                            <div className="text-wool-500 italic">+ Add deadline</div>
                        )}

                        {/* Priority - Smart icons by level */}
                        {displayData?.priority && displayData.priority !== 'normal' ? (
                            <div>
                                {displayData.priority === 'high' && '🔥 High priority'}
                                {displayData.priority === 'low' && '🌱 Low priority'}
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="text-sm text-wool-500 italic">
                        + Add project context details
                    </div>
                )}
            </div>
        );
    }

    // Edit Modal using StandardModal
    return (
        <>
            {/* Background section for read view */}
            <div className="read-mode-section">
                <div className="details-section-header">
                    <h3 className="section-header-secondary">🎯 Project Context</h3>
                    <button
                        onClick={handleEditClick}
                        className="details-edit-button"
                        title="Edit project context"
                    >
                        ✏️
                    </button>
                </div>

                {hasContent ? (
                    <div className="text-sm text-wool-700 space-y-1 text-left">
                        {displayData?.recipient ? (
                            <div>👤 For {displayData.recipient}</div>
                        ) : (
                            <div className="text-wool-500 italic">+ Add recipient</div>
                        )}

                        {displayData?.size ? (
                            <div>📏 Size {displayData.size}</div>
                        ) : (
                            <div className="text-wool-500 italic">+ Add size</div>
                        )}

                        {displayData?.deadline ? (
                            <div>📅 Due {formatDate(displayData.deadline)}</div>
                        ) : (
                            <div className="text-wool-500 italic">+ Add deadline</div>
                        )}

                        {displayData?.priority && displayData.priority !== 'normal' ? (
                            <div>
                                {displayData.priority === 'high' && '🔥 High priority'}
                                {displayData.priority === 'low' && '🌱 Low priority'}
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="text-sm text-wool-500 italic">
                        + Add project context details
                    </div>
                )}
            </div>

            {/* StandardModal */}
            <StandardModal
                isOpen={showEditModal}
                onClose={handleCancelEdit}
                onConfirm={handleSaveEdit}
                category="input"
                colorScheme="sage"
                title="🎯 Project Context"
                subtitle="Set project details and context"
                primaryButtonText="Save Changes"
                secondaryButtonText="Cancel"
            >
                <div className="space-y-4">
                    {/* Recipient */}
                    <div>
                        <label className="form-label">Recipient</label>
                        <input
                            type="text"
                            value={tempFormData.recipient || ''}
                            onChange={(e) => handleTempInputChange('recipient', e.target.value)}
                            placeholder="e.g., Mom, Myself, Sarah"
                            className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                        />
                    </div>

                    {/* Size */}
                    <div>
                        <label className="form-label">Size</label>
                        <input
                            type="text"
                            value={tempFormData.size || ''}
                            onChange={(e) => handleTempInputChange('size', e.target.value)}
                            placeholder="e.g., Medium, 36 inches, Newborn"
                            className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                        />
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="form-label">
                            Deadline
                            <span className="text-xs text-wool-500 ml-1">(MM/DD/YYYY)</span>
                        </label>
                        <input
                            type="date"
                            value={tempFormData.deadline || ''}
                            onChange={(e) => handleTempInputChange('deadline', e.target.value)}
                            className="details-input-field shadow-sm focus:shadow-md transition-shadow text-left"
                        />
                    </div>

                    {/* Priority - Toggle buttons matching your existing style */}
                    <div>
                        <label className="form-label">Priority</label>
                        <div className="bg-wool-100 border-2 border-wool-200 rounded-xl p-1">
                            <div className="grid grid-cols-3 gap-1">
                                {['high', 'normal', 'low'].map((priority) => (
                                    <button
                                        key={priority}
                                        type="button"
                                        onClick={() => handleTempInputChange('priority', priority)}
                                        className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${tempFormData.priority === priority
                                                ? 'bg-sage-500 text-white shadow-sm'
                                                : 'text-wool-600 hover:text-sage-600'
                                            }`}
                                    >
                                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </StandardModal>
        </>
    );
};

export default ProjectContextSection;