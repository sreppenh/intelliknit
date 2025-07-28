import React, { useState, useEffect } from 'react';
import { getSmartProjectStatus } from '../../../../../shared/utils/projectStatus';

/**
 * ProjectStatusSection - The Ultimate Project Lifecycle Control Center
 * 
 * Revolutionary action-centered design that proves our entire architectural approach.
 * This isn't just a display section - it's the primary project lifecycle hub with
 * context-aware action buttons that change based on project state.
 * 
 * CRITICAL: This is the template for all action-heavy interfaces in IntelliKnit!
 */
const ProjectStatusSection = ({
    project,
    formData,
    handleInputChange,
    handleStatusChange,
    onProjectUpdate
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [tempFormData, setTempFormData] = useState({});

    // Get smart status using existing logic
    const status = getSmartProjectStatus(project);
    const displayData = formData || project;

    // Initialize modal form data when opening
    useEffect(() => {
        if (showEditModal) {
            setTempFormData({
                progress: displayData?.progress || 0,
                completedAt: displayData?.completedAt || '',
                froggedAt: displayData?.froggedAt || '',
                completed: displayData?.completed || false,
                frogged: displayData?.frogged || false
            });
        }
    }, [showEditModal, displayData]);

    // Handle ESC key for modal
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

    // === IMMEDIATE ACTION HANDLERS ===

    const handleMarkComplete = () => {
        const today = new Date().toISOString().split('T')[0];
        const updatedProject = {
            ...project,
            completed: true,
            frogged: false,
            completedAt: today,
            froggedAt: ''
        };
        onProjectUpdate(updatedProject);
    };

    const handleFrogProject = () => {
        const today = new Date().toISOString().split('T')[0];
        const updatedProject = {
            ...project,
            frogged: true,
            completed: false,
            froggedAt: today,
            completedAt: ''
        };
        onProjectUpdate(updatedProject);
    };

    const handleStartOver = () => {
        const updatedProject = {
            ...project,
            frogged: false,
            completed: false,
            froggedAt: '',
            completedAt: '',
            progress: 0
        };
        onProjectUpdate(updatedProject);
    };

    // === EDIT DETAILS MODAL HANDLERS ===

    const handleEditDetails = () => {
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        // Update using batched pattern for modal changes
        if (handleInputChange) {
            Object.keys(tempFormData).forEach(field => {
                if (field === 'completed' || field === 'frogged') {
                    handleStatusChange(field, tempFormData[field]);
                } else {
                    handleInputChange(field, tempFormData[field]);
                }
            });
        }
        setShowEditModal(false);
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
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

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // === CONTEXT-AWARE BUTTON RENDERING ===

    const renderActionButtons = () => {
        if (displayData?.completed) {
            // COMPLETED STATE
            return (
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleFrogProject}
                        className="btn-secondary btn-sm flex items-center gap-2"
                    >
                        <span>🐸</span>
                        Actually, Frog It
                    </button>
                    <button
                        onClick={handleEditDetails}
                        className="btn-tertiary btn-sm"
                    >
                        ✏️ Edit Details
                    </button>
                </div>
            );
        } else if (displayData?.frogged) {
            // FROGGED STATE  
            return (
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleStartOver}
                        className="btn-primary btn-sm flex items-center gap-2"
                    >
                        <span>🔄</span>
                        Start Over
                    </button>
                    <button
                        onClick={handleEditDetails}
                        className="btn-tertiary btn-sm"
                    >
                        ✏️ Edit Details
                    </button>
                </div>
            );
        } else {
            // ACTIVE/READY STATE
            return (
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleMarkComplete}
                        className="btn-primary btn-sm flex items-center gap-2
                        "
                    >
                        <span>🎉</span>
                        Mark Complete
                    </button>
                    <button
                        onClick={handleFrogProject}
                        className="btn-secondary btn-sm flex items-center gap-2"
                    >
                        <span>🐸</span>
                        Frog Project
                    </button>
                </div>
            );
        }
    };

    // === SMART STATUS DISPLAY ===

    const renderStatusDisplay = () => {
        if (displayData?.completed) {
            return (
                <div className="text-sm text-wool-700 space-y-1 text-left">
                    <div className="font-semibold text-wool-800">
                        🎉 Completed on {formatDate(displayData.completedAt)}
                    </div>
                </div>
            );
        } else if (displayData?.frogged) {
            return (
                <div className="text-sm text-wool-700 space-y-1 text-left">
                    <div className="font-semibold text-wool-800">
                        🐸 Frogged on {formatDate(displayData.froggedAt)}
                    </div>
                </div>
            );
        } else {
            // ACTIVE/READY STATE - Show smart status + progress
            return (
                <div className="text-sm text-wool-700 space-y-1 text-left">
                    <div className="font-semibold text-wool-800">
                        {status.emoji} {status.text}
                    </div>
                    {displayData?.progress > 0 && (
                        <div>{displayData.progress}% complete</div>
                    )}
                </div>
            );
        }
    };

    // === MAIN RENDER ===

    // Read View (No Edit Modal)
    if (!showEditModal) {
        return (
            <div className="read-mode-section">
                <div className="details-section-header">
                    <h3 className="section-header-secondary">🎯 Project Status</h3>
                    {/* NO edit button - actions ARE the interaction! */}
                </div>

                {renderStatusDisplay()}
                {renderActionButtons()}
            </div>
        );
    }

    // === EDIT DETAILS MODAL ===
    return (
        <>
            {/* Background section for read view */}
            <div className="read-mode-section">
                <div className="details-section-header">
                    <h3 className="section-header-secondary">🎯 Project Status</h3>
                </div>

                {renderStatusDisplay()}
                {renderActionButtons()}
            </div>

            {/* Modal Overlay */}
            <div className="modal-overlay" onClick={handleBackdropClick}>
                <div className="modal-content-light" style={{ maxWidth: '450px' }}>
                    {/* Modal Header */}
                    <div className="modal-header-light">
                        <div className="text-center">
                            <h2 className="text-lg font-semibold">🎯 Edit Project Status</h2>
                            <p className="text-sage-600 text-sm">Adjust dates and progress</p>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Progress */}
                            <div>
                                <label className="form-label">Progress</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        min="0"
                                        max="100"
                                        value={tempFormData.progress || ''}
                                        onChange={(e) => handleTempInputChange('progress', e.target.value ? parseInt(e.target.value) : 0)}
                                        placeholder="0"
                                        className="w-20 details-input-field text-center shadow-sm focus:shadow-md transition-shadow"
                                    />
                                    <span className="text-sm text-wool-600">% complete</span>
                                </div>
                            </div>

                            {/* Status Override */}
                            <div>
                                <label className="form-label">Status Override</label>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={tempFormData.completed || false}
                                            onChange={(e) => {
                                                handleTempInputChange('completed', e.target.checked);
                                                if (e.target.checked) {
                                                    handleTempInputChange('frogged', false);
                                                    if (!tempFormData.completedAt) {
                                                        handleTempInputChange('completedAt', new Date().toISOString().split('T')[0]);
                                                    }
                                                }
                                            }}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Mark as completed</span>
                                    </label>

                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={tempFormData.frogged || false}
                                            onChange={(e) => {
                                                handleTempInputChange('frogged', e.target.checked);
                                                if (e.target.checked) {
                                                    handleTempInputChange('completed', false);
                                                    if (!tempFormData.froggedAt) {
                                                        handleTempInputChange('froggedAt', new Date().toISOString().split('T')[0]);
                                                    }
                                                }
                                            }}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Mark as frogged</span>
                                    </label>
                                </div>
                            </div>

                            {/* Completion Date */}
                            {tempFormData.completed && (
                                <div>
                                    <label className="form-label">Completed Date</label>
                                    <input
                                        type="date"
                                        value={tempFormData.completedAt || ''}
                                        onChange={(e) => handleTempInputChange('completedAt', e.target.value)}
                                        className="details-input-field shadow-sm focus:shadow-md transition-shadow text-left"
                                        style={{ textAlign: 'left' }}
                                    />
                                </div>
                            )}

                            {/* Frogged Date */}
                            {tempFormData.frogged && (
                                <div>
                                    <label className="form-label">Frogged Date</label>
                                    <input
                                        type="date"
                                        value={tempFormData.froggedAt || ''}
                                        onChange={(e) => handleTempInputChange('froggedAt', e.target.value)}
                                        className="details-input-field shadow-sm focus:shadow-md transition-shadow text-left"
                                        style={{ textAlign: 'left' }}
                                    />
                                </div>
                            )}
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

export default ProjectStatusSection;