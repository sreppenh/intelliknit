import React, { useState, useEffect } from 'react';

/**
 * 📅 TimelineSection - Smart Date Management Showcase
 * 
 * Features:
 * - Comprehensive project lifecycle display
 * - Smart conditional date logic
 * - Separation between system and user dates
 * - Perfect Project Status integration
 * - Selective inline editing for user dates only
 */
const TimelineSection = ({
    project,
    formData,
    handleInputChange
}) => {
    // Local state management
    const [showTimelineModal, setShowTimelineModal] = useState(false);
    const [timelineForm, setTimelineForm] = useState({
        startedAt: '',
        completedAt: '',
        froggedAt: ''
    });

    // Use existing formatDate helper (exact copy from DetailsTab)
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Smart display logic for lastActivityAt
    const shouldShowLastActivity = () => {
        if (!project.lastActivityAt) return false;
        if (project.completed || project.frogged) return false; // Status dates take priority
        if (project.lastActivityAt === project.createdAt) return false; // Same as creation
        return true;
    };

    // Build chronological timeline data
    const buildTimelineEntries = () => {
        const entries = [];

        // 1. Created (always show)
        entries.push({
            type: 'created',
            date: project.createdAt,
            label: 'Created',
            display: `Created ${formatDate(project.createdAt)}`
        });

        // 2. Started knitting (if exists, or add prompt)
        if (project.startedAt) {
            entries.push({
                type: 'started',
                date: project.startedAt,
                label: 'Started knitting',
                display: `Started knitting ${formatDate(project.startedAt)}`
            });
        } else {
            entries.push({
                type: 'started_prompt',
                display: '+ Add started knitting date',
                isPrompt: true
            });
        }

        // 3. Last modified (conditional)
        if (shouldShowLastActivity()) {
            entries.push({
                type: 'lastActivity',
                date: project.lastActivityAt,
                label: 'Last modified',
                display: `Last modified ${formatDate(project.lastActivityAt)}`
            });
        }

        // 4. Completed (if project is completed)
        if (project.completed && project.completedAt) {
            entries.push({
                type: 'completed',
                date: project.completedAt,
                label: 'Completed',
                display: `Completed ${formatDate(project.completedAt)}`
            });
        }

        // 5. Frogged (if project is frogged)
        if (project.frogged && project.froggedAt) {
            entries.push({
                type: 'frogged',
                date: project.froggedAt,
                label: 'Frogged',
                display: `Frogged ${formatDate(project.froggedAt)}`
            });
        }

        return entries;
    };

    const timelineEntries = buildTimelineEntries();

    // Modal handlers
    const handleEditTimeline = () => {
        setTimelineForm({
            startedAt: project.startedAt || '',
            completedAt: project.completedAt || '',
            froggedAt: project.froggedAt || ''
        });
        setShowTimelineModal(true);
    };

    const handleSaveTimeline = () => {
        // Update only the user-editable dates
        const updates = {};

        // Started date - allow clearing
        if (timelineForm.startedAt) {
            updates.startedAt = timelineForm.startedAt;
        } else {
            updates.startedAt = undefined; // Allow clearing
        }

        // Completed date - only if project is completed
        if (project.completed) {
            if (timelineForm.completedAt) {
                updates.completedAt = timelineForm.completedAt;
            } else {
                updates.completedAt = undefined;
            }
        }

        // Frogged date - only if project is frogged
        if (project.frogged) {
            if (timelineForm.froggedAt) {
                updates.froggedAt = timelineForm.froggedAt;
            } else {
                updates.froggedAt = undefined;
            }
        }

        // Apply updates using existing handler pattern
        Object.keys(updates).forEach(key => {
            handleInputChange(key, updates[key]);
        });

        setShowTimelineModal(false);
    };

    const handleCloseModal = () => {
        setShowTimelineModal(false);
    };

    // Modal behavior compliance
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showTimelineModal) {
                handleCloseModal();
            }
        };

        const handleEnterKey = (event) => {
            if (event.key === 'Enter' && showTimelineModal) {
                event.preventDefault();
                handleSaveTimeline();
            }
        };

        if (showTimelineModal) {
            document.addEventListener('keydown', handleEscKey);
            document.addEventListener('keydown', handleEnterKey);

            // Auto-focus first editable date input
            setTimeout(() => {
                const focusElement = document.querySelector('[data-modal-focus]');
                if (focusElement) {
                    focusElement.focus();
                }
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('keydown', handleEnterKey);
        };
    }, [showTimelineModal]);

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            handleCloseModal();
        }
    };

    // 📖 Read View - Conversational Timeline Display
    return (
        <>
            <div
                className="read-mode-section hover:bg-sage-25 active:scale-95 cursor-pointer transition-all duration-200"
                onClick={handleEditTimeline}
            >
                <div className="details-section-header">
                    <h3 className="section-header-secondary">📅 Timeline</h3>
                    <div className="details-edit-button pointer-events-none">
                        ✏️
                    </div>
                </div>

                <div className="text-sm text-wool-700 space-y-1 text-left">
                    {timelineEntries.map((entry, index) => (
                        <div key={`${entry.type}-${index}`}>
                            {entry.isPrompt ? (
                                <div className="text-wool-400 italic">
                                    {entry.display}
                                </div>
                            ) : (
                                <div>
                                    {entry.display}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Timeline Edit Modal */}
            {showTimelineModal && (
                <div className="modal-overlay" onClick={handleBackdropClick}>
                    <div className="modal-content-light">
                        <div className="modal-header-light">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">📅</div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold">Project Timeline</h2>
                                    <p className="text-sage-600 text-sm">Update project dates</p>
                                </div>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-sage-600 text-xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Read-only system dates */}
                            <div className="bg-wool-50 border border-wool-200 rounded-lg p-3">
                                <h4 className="text-sm font-medium text-wool-700 mb-2">System Dates</h4>
                                <div className="text-sm text-wool-600 space-y-1">
                                    <div>Created: {formatDate(project.createdAt)}</div>
                                    {project.lastActivityAt && project.lastActivityAt !== project.createdAt && (
                                        <div>Last Modified: {formatDate(project.lastActivityAt)}</div>
                                    )}
                                </div>
                            </div>

                            {/* Editable user dates */}
                            <div>
                                <label className="form-label">Started Knitting</label>
                                <input
                                    data-modal-focus
                                    type="date"
                                    value={timelineForm.startedAt || ''}
                                    onChange={(e) => setTimelineForm(prev => ({ ...prev, startedAt: e.target.value }))}
                                    className="details-input-field"
                                />
                            </div>

                            {project.completed && (
                                <div>
                                    <label className="form-label">Completed</label>
                                    <input
                                        type="date"
                                        value={timelineForm.completedAt || ''}
                                        onChange={(e) => setTimelineForm(prev => ({ ...prev, completedAt: e.target.value }))}
                                        className="details-input-field"
                                    />
                                </div>
                            )}

                            {project.frogged && (
                                <div>
                                    <label className="form-label">Frogged</label>
                                    <input
                                        type="date"
                                        value={timelineForm.froggedAt || ''}
                                        onChange={(e) => setTimelineForm(prev => ({ ...prev, froggedAt: e.target.value }))}
                                        className="details-input-field"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    data-modal-cancel
                                    onClick={handleCloseModal}
                                    className="btn-tertiary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    data-modal-primary
                                    onClick={handleSaveTimeline}
                                    className="btn-primary flex-1"
                                >
                                    Save Timeline
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TimelineSection;