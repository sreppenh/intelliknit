import React, { useState } from 'react';

/**
 * DetailsTabRead - Enhanced read-only view for project details
 * 
 * Features:
 * - Clean pattern identity section
 * - Logical information categories
 * - Left-aligned materials display
 * - Natural information hierarchy
 */
const DetailsTabRead = ({ project, onEdit }) => {
    const [isNotesExpanded, setIsNotesExpanded] = useState(false);

    // Format dates for display
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6">
            {/* Pattern Identity Section */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-4">
                        {/* Pattern Title - Cleaner Layout */}
                        <h2 className="text-xl font-semibold text-wool-800 leading-tight mb-1">
                            📖 {project.name || 'Untitled Project'}
                        </h2>

                        {/* Designer on separate line */}
                        {project.designer && (
                            <p className="text-lg text-wool-600 ml-6 mb-1">
                                by {project.designer}
                            </p>
                        )}

                        {/* Pattern Source */}
                        {project.source && (
                            <p className="text-sm text-wool-500 ml-6">
                                Pattern from {project.source}
                            </p>
                        )}
                    </div>

                    {/* Edit Button */}
                    <button
                        onClick={onEdit}
                        className="details-edit-button flex-shrink-0"
                    >
                        Edit Project
                    </button>
                </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-4">
                {/* Project Details - Personal Info Only */}
                {(project.recipient || project.size) && (
                    <div className="read-mode-section field-group-info">
                        <h3 className="text-sm font-semibold text-wool-600 mb-3 uppercase tracking-wide">👤 Project Details</h3>
                        <div className="text-sm text-wool-700">
                            {project.recipient && `For ${project.recipient}`}
                            {project.recipient && project.size && ' • '}
                            {project.size && `Size ${project.size}`}
                        </div>
                    </div>
                )}

                {/* Technical Defaults */}
                {(project.defaultUnits || project.construction) && (
                    <div className="read-mode-section field-group-basics">
                        <h3 className="text-sm font-semibold text-wool-600 mb-3 uppercase tracking-wide">⚙️ Project Settings</h3>
                        <div className="text-sm text-wool-700">
                            {project.defaultUnits && (project.defaultUnits === 'inches' ? 'Inches' : 'Centimeters')}
                            {project.defaultUnits && project.construction && ' • '}
                            {project.construction && `${project.construction.charAt(0).toUpperCase() + project.construction.slice(1)} Construction`}
                        </div>
                    </div>
                )}

                {/* Materials - Left Aligned */}
                {(project.yarns?.length > 0 || project.needles?.length > 0 || project.gauge) && (
                    <div className="read-mode-section field-group-materials">
                        <h3 className="text-sm font-semibold text-wool-600 mb-3 uppercase tracking-wide">🧶 Materials</h3>
                        <div className="space-y-3 text-left">
                            {/* Yarn */}
                            {project.yarns?.filter(yarn => yarn.trim()).length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-wool-700 mb-2">
                                        Yarn
                                    </h4>
                                    <div className="space-y-1">
                                        {project.yarns.filter(yarn => yarn.trim()).map((yarn, index) => (
                                            <div key={index} className="text-sm text-wool-700">• {yarn}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Needles */}
                            {project.needles?.filter(needle => needle.trim()).length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-wool-700 mb-2">
                                        Needles
                                    </h4>
                                    <div className="space-y-1">
                                        {project.needles.filter(needle => needle.trim()).map((needle, index) => (
                                            <div key={index} className="text-sm text-wool-700">• {needle}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Gauge */}
                            {project.gauge && (
                                <div>
                                    <h4 className="text-sm font-medium text-wool-700 mb-2">
                                        Gauge
                                    </h4>
                                    <div className="text-sm text-wool-700">{project.gauge}</div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="read-mode-section field-group-timeline">
                    <h3 className="text-sm font-semibold text-wool-600 mb-3 uppercase tracking-wide">📅 Timeline</h3>
                    <div className="space-y-1">
                        <div className="timeline-entry">
                            <span className="timeline-label">Created:</span>
                            <span className="timeline-date">{formatDate(project.createdAt)}</span>
                        </div>
                        {project.lastActivityAt && (
                            <div className="timeline-entry">
                                <span className="timeline-label">Last Modified:</span>
                                <span className="timeline-date">{formatDate(project.lastActivityAt)}</span>
                            </div>
                        )}
                        {project.completedAt && (
                            <div className="timeline-entry">
                                <span className="timeline-label">Completed:</span>
                                <span className="timeline-date">{formatDate(project.completedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes - Read Only, Left Aligned */}
                {project.notes && (
                    <div className="read-mode-section field-group-notes">
                        <h3 className="text-sm font-semibold text-wool-600 mb-3 uppercase tracking-wide">💭 Notes</h3>
                        <div className="text-left">
                            {project.notes.length > 300 && !isNotesExpanded ? (
                                <div>
                                    <p className="whitespace-pre-wrap text-sm text-wool-700 leading-relaxed">{project.notes.substring(0, 300)}...</p>
                                    <button
                                        onClick={() => setIsNotesExpanded(true)}
                                        className="text-sage-600 hover:text-sage-700 font-medium text-sm mt-2 underline"
                                    >
                                        Read more
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="whitespace-pre-wrap text-sm text-wool-700 leading-relaxed">{project.notes}</p>
                                    {project.notes.length > 300 && isNotesExpanded && (
                                        <button
                                            onClick={() => setIsNotesExpanded(false)}
                                            className="text-sage-600 hover:text-sage-700 font-medium text-sm mt-2 underline"
                                        >
                                            Show less
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsTabRead;