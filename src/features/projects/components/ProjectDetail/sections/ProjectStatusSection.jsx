import React, { useState, useEffect } from 'react';
import { getSmartProjectStatus } from '../../../../../shared/utils/projectStatus';
import IncrementInput from '../../../../../shared/components/IncrementInput';

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
            froggedAt: '',
            progress: 100 // Set to 100% when marking complete
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

    // === PROGRESS INCREMENT HANDLERS ===

    const handleProgressChange = (newProgress) => {
        const updatedProject = {
            ...project,
            progress: newProgress
        };

        // Auto-complete at 100%
        if (newProgress >= 100) {
            const today = new Date().toISOString().split('T')[0];
            updatedProject.completed = true;
            updatedProject.frogged = false;
            updatedProject.completedAt = today;
            updatedProject.progress = 100;
        }

        onProjectUpdate(updatedProject);
    };

    const handleProgressIncrement = () => {
        const currentProgress = displayData?.progress || 0;
        const newProgress = Math.min(currentProgress + 5, 100);
        handleProgressChange(newProgress);
    };

    const handleProgressDecrement = () => {
        const currentProgress = displayData?.progress || 0;
        const newProgress = Math.max(currentProgress - 5, 0);
        handleProgressChange(newProgress);
    };

    // === EDIT DETAILS MODAL HANDLERS ===

    const handleEditDetails = () => {
        setShowEditModal(true);
    };

    const handleSaveEdit = () => {
        // For status changes, we need atomic updates to prevent race conditions
        const currentStatus = getCurrentStatus();

        if (currentStatus === 'auto') {
            // Handle auto status as single atomic update - RESET PROGRESS TO 0
            const updatedProject = {
                ...project,
                completed: false,
                frogged: false,
                completedAt: '',
                froggedAt: '',
                progress: tempFormData.progress || 0  // Use form value, not original project
            };
            onProjectUpdate(updatedProject);
        } else if (currentStatus === 'completed') {
            // Handle completed status as single atomic update  
            const updatedProject = {
                ...project,
                completed: true,
                frogged: false,
                completedAt: tempFormData.completedAt || new Date().toISOString().split('T')[0],
                froggedAt: '',
                progress: tempFormData.progress || 100  // Default to 100% for completed
            };
            onProjectUpdate(updatedProject);
        } else if (currentStatus === 'frogged') {
            // Handle frogged status as single atomic update
            const updatedProject = {
                ...project,
                completed: false,
                frogged: true,
                completedAt: '',
                froggedAt: tempFormData.froggedAt || new Date().toISOString().split('T')[0],
                progress: tempFormData.progress || 0  // Reset progress for frogged
            };
            onProjectUpdate(updatedProject);
        } else {
            // Fallback: just update progress if no status change
            if (handleInputChange) {
                handleInputChange('progress', tempFormData.progress || 0);
            }
        }

        setShowEditModal(false);
    };

    // Status handling functions (copied from original)
    const getCurrentStatus = () => {
        if (tempFormData.completed) return 'completed';
        if (tempFormData.frogged) return 'frogged';
        return 'auto';
    };

    const handleStatusSelect = (value) => {
        switch (value) {
            case 'completed':
                handleTempInputChange('completed', true);
                handleTempInputChange('frogged', false);
                if (!tempFormData.completedAt) {
                    handleTempInputChange('completedAt', new Date().toISOString().split('T')[0]);
                }
                // Set progress to 100% when marking completed (unless already set)
                if (!tempFormData.progress || tempFormData.progress === 0) {
                    handleTempInputChange('progress', 100);
                }
                break;
            case 'frogged':
                handleTempInputChange('frogged', true);
                handleTempInputChange('completed', false);
                if (!tempFormData.froggedAt) {
                    handleTempInputChange('froggedAt', new Date().toISOString().split('T')[0]);
                }
                // Reset progress to 0% when frogging (unless user set otherwise)
                if (tempFormData.progress === 100) {
                    handleTempInputChange('progress', 0);
                }
                break;
            case 'auto':
                handleTempInputChange('completed', false);
                handleTempInputChange('frogged', false);
                handleTempInputChange('completedAt', '');
                handleTempInputChange('froggedAt', '');
                // DON'T reset progress - let user keep their current percentage
                break;
        }
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
            // COMPLETED STATE - Only Frog action
            return (
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleFrogProject}
                        className="btn-secondary btn-sm flex items-center gap-2"
                    >
                        <span>🐸</span>
                        Actually, Frog It
                    </button>
                </div>
            );
        } else if (displayData?.frogged) {
            // FROGGED STATE - No actions, just edit details via section tap
            return null;
        } else {
            // ACTIVE/READY STATE
            return (
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleMarkComplete}
                        className="btn-primary btn-sm flex items-center gap-2"
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
        // No separate status display needed - everything is in the title now!
        return null;
    };

    // === SMART TITLE WITH INLINE PROGRESS AND DATES ===
    const renderSectionTitle = () => {
        if (displayData?.completed) {
            return `🎉 Completed on ${formatDate(displayData.completedAt)}`;
        } else if (displayData?.frogged) {
            return `🐸 Frogged on ${formatDate(displayData.froggedAt)}`;
        } else {
            // ACTIVE/READY STATE - Show status with inline progress
            const progress = displayData?.progress || 0;
            const progressText = progress > 0 ? ` (${progress}% complete)` : '';
            return `${status.emoji} ${status.text}${progressText}`;
        }
    };

    // === MAIN RENDER ===

    // Read View (No Edit Modal)
    if (!showEditModal) {
        const statusDisplay = renderStatusDisplay();
        const actionButtons = renderActionButtons();

        // Add inline style to override padding-bottom for frogged state
        const sectionStyle = displayData?.frogged ? { paddingBottom: 0 } : {};

        return (
            <div
                className="read-mode-section hover:bg-sage-25 active:scale-95 cursor-pointer transition-all duration-200"
                style={sectionStyle}
                onClick={handleEditDetails}
            >
                <div className="details-section-header">
                    <h3 className="section-header-secondary">
                        {renderSectionTitle()}
                    </h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>

                {statusDisplay && statusDisplay}

                {/* Only render action buttons container if buttons exist */}
                {actionButtons && (
                    <div onClick={(e) => e.stopPropagation()}>
                        {actionButtons}
                    </div>
                )}
            </div>
        );
    }

    // === EDIT DETAILS MODAL ===
    return (
        <>
            {/* Background section for read view */}
            <div
                className="read-mode-section hover:bg-sage-25 active:scale-95 cursor-pointer transition-all duration-200"
                onClick={handleEditDetails}
            >
                <div className="details-section-header">
                    <h3 className="section-header-secondary">
                        {renderSectionTitle()}
                    </h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>

                {(() => {
                    const statusDisplay = renderStatusDisplay();
                    const actionButtons = renderActionButtons();

                    return (
                        <>
                            {statusDisplay && statusDisplay}

                            {/* Only render action buttons container if buttons exist */}
                            {actionButtons && (
                                <div onClick={(e) => e.stopPropagation()}>
                                    {actionButtons}
                                </div>
                            )}
                        </>
                    );
                })()}
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
                            {/* Progress with IncrementInput - Step by 5% */}
                            <div>
                                <label className="form-label">Progress</label>
                                <div className="flex items-center gap-3">
                                    <IncrementInput
                                        value={tempFormData.progress || 0}
                                        onChange={(value) => {
                                            // Round to nearest 5% increment
                                            const roundedValue = Math.round(value / 5) * 5;
                                            handleTempInputChange('progress', Math.min(100, Math.max(0, roundedValue)));
                                        }}
                                        min={0}
                                        max={100}
                                        step={5}
                                        unit="%"
                                        label="progress"
                                        size="sm"
                                    />
                                    <span className="text-sm text-wool-600">complete</span>
                                </div>
                            </div>

                            {/* Status Override - Use dropdown like original */}
                            <div>
                                <label className="form-label">Status Override</label>
                                <select
                                    value={getCurrentStatus()}
                                    onChange={(e) => handleStatusSelect(e.target.value)}
                                    className="w-full bg-white border-2 border-wool-200 rounded-lg px-4 py-3 text-base font-medium focus:border-sage-500 focus:ring-2 focus:ring-sage-300 focus:ring-opacity-50 transition-colors"
                                >
                                    <option value="auto">{status.emoji} {status.text}</option>
                                    <option value="completed">🎉 Completed</option>
                                    <option value="frogged">🐸 Frogged</option>
                                </select>
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