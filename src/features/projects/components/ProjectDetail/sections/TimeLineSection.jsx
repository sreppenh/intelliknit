import React, { useState, useEffect } from 'react';
import { StandardModal } from '../../../../../shared/components/modals/StandardModal';

/**
 * 📅 TimelineSection - Smart Date Management with Auto-Detection
 * 
 * ✨ NEW FEATURES:
 * - Auto-detects "Started Knitting" from first row completion
 * - No more manual "Started Knitting" prompt
 * - Shows activity-based dates automatically
 * - Still allows manual override if needed
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
        if (project.startedAt && project.lastActivityAt === project.startedAt) return false; // Same as started
        return true;
    };

    // ✨ NEW: Smart detection for "Started Knitting"
    const getStartedKnittingDisplay = () => {
        // Priority 1: Manual startedAt date (user override)
        if (project.startedAt) {
            return {
                type: 'started',
                date: project.startedAt,
                label: 'Started knitting',
                display: `Started knitting ${formatDate(project.startedAt)}`,
                isAutoDetected: false
            };
        }

        // Priority 2: Auto-detect from first activity
        if (project.activityLog && project.activityLog.length > 0) {
            const firstActivity = project.activityLog[0];
            return {
                type: 'started_auto',
                date: firstActivity,
                label: 'Started knitting',
                display: `Started knitting ${formatDate(firstActivity)} (auto-detected)`,
                isAutoDetected: true
            };
        }

        // Priority 3: Not started yet
        return null;
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

        // 2. Started knitting (auto-detected or manual)
        const startedEntry = getStartedKnittingDisplay();
        if (startedEntry) {
            entries.push(startedEntry);
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

        // Started date - allow clearing or setting manual override
        if (timelineForm.startedAt !== project.startedAt) {
            updates.startedAt = timelineForm.startedAt || undefined;
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
                            {entry.isAutoDetected ? (
                                <div className="text-sage-600 italic">
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

            {/* Timeline Edit Modal - NOW USING STANDARDMODAL */}
            <StandardModal
                isOpen={showTimelineModal}
                onClose={handleCloseModal}
                onConfirm={handleSaveTimeline}
                category="input"
                colorScheme="sage"
                title="📅 Project Timeline"
                subtitle="Update project dates"
                primaryButtonText="Save Timeline"
                secondaryButtonText="Cancel"
            >
                {/* Read-only system dates */}
                <div className="bg-wool-50 border border-wool-200 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium text-wool-700 mb-2">System Dates</h4>
                    <div className="text-sm text-wool-600 space-y-1">
                        <div>Created: {formatDate(project.createdAt)}</div>
                        {project.lastActivityAt && project.lastActivityAt !== project.createdAt && (
                            <div>Last Modified: {formatDate(project.lastActivityAt)}</div>
                        )}
                        {project.activityLog && project.activityLog.length > 0 && (
                            <div className="text-sage-600 italic">
                                First Activity: {formatDate(project.activityLog[0])} (auto-detected)
                            </div>
                        )}
                    </div>
                </div>

                {/* Editable user dates */}
                <div className="space-y-4">
                    <div>
                        <label className="form-label">
                            Started Knitting
                            {!project.startedAt && project.activityLog?.length > 0 && (
                                <span className="text-xs text-sage-600 ml-2">(auto-detected from first activity)</span>
                            )}
                        </label>
                        <input
                            data-modal-focus
                            type="date"
                            value={timelineForm.startedAt || ''}
                            onChange={(e) => setTimelineForm(prev => ({ ...prev, startedAt: e.target.value }))}
                            placeholder={project.activityLog?.[0] || ''}
                            className="details-input-field"
                        />
                        <p className="text-xs text-wool-500 mt-1">
                            Leave blank to use auto-detected date, or set a manual override
                        </p>
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
                </div>
            </StandardModal>
        </>
    );
};

export default TimelineSection;