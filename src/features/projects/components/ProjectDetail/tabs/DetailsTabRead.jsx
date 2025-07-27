import React, { useState } from 'react';

/**
 * DetailsTabRead - Enhanced read-only view for project details
 * 
 * Features:
 * - Clean pattern identity section
 * - Logical information categories
 * - Left-aligned materials display
 * - Natural information hierarchy
 * - Fixed yarn display for enhanced format
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

    // Format yarn for display - handles both old string format and new object format
    const formatYarnDisplay = (yarns) => {
        if (!yarns || yarns.length === 0) return [];

        const formattedYarns = [];

        yarns.forEach(yarn => {
            if (typeof yarn === 'string') {
                // Old format - just display as is
                if (yarn.trim()) {
                    formattedYarns.push(yarn.trim());
                }
            } else if (yarn && yarn.name) {
                // New format - create flat list entries
                const yarnName = yarn.name.trim();
                if (!yarnName) return;

                const colors = yarn.colors?.filter(c => c.color && c.color.trim()) || [];

                if (colors.length === 0) {
                    // Just yarn name
                    formattedYarns.push(yarnName);
                } else {
                    // Create separate entries for each color
                    colors.forEach(colorData => {
                        const color = colorData.color.trim();
                        const skeins = colorData.skeins ? ` (${colorData.skeins} skeins)` : '';
                        formattedYarns.push(`${yarnName} - ${color}${skeins}`);
                    });
                }
            }
        });

        return formattedYarns;
    };

    return (
        <div className="p-6">
            {/* Pattern Identity Section */}
            {/* Pattern Identity Section - Enhanced */}
            <div className="content-header-with-buttons">
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-wool-800 leading-tight mb-1">
                        📖 {project.name || 'Untitled Project'}
                    </h2>
                    {project.designer && (
                        <p className="text-lg text-wool-600 ml-6 mb-1">
                            by {project.designer}
                        </p>
                    )}
                    {project.source && (
                        <p className="text-sm text-wool-500 ml-6">
                            Pattern from {project.source}
                        </p>
                    )}
                </div>
                <div className="button-group">
                    <button onClick={onEdit} className="btn-primary btn-sm">
                        Edit Project
                    </button>
                </div>
            </div>

            {/* Content Sections */}
            <div className="space-y-4">
                {/* Project Details - Personal Info Only */}
                {(project.recipient || project.size) && (
                    <div className="read-mode-section field-group-info">
                        <h3 className="text-sm font-semibold text-wool-600 mb-3">👤 Project Details</h3>
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
                        <h3 className="text-sm font-semibold text-wool-600 mb-3">⚙️ Project Settings</h3>
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
                        <h3 className="text-sm font-semibold text-wool-600 mb-3">🧶 Materials</h3>
                        <div className="space-y-3 text-left">
                            {/* Yarn - Fixed Display */}
                            {formatYarnDisplay(project.yarns).length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-wool-700 mb-2">
                                        Yarn
                                    </h4>
                                    <div className="space-y-1">
                                        {formatYarnDisplay(project.yarns).map((yarnDisplay, index) => (
                                            <div key={index} className="text-sm text-wool-700">• {yarnDisplay}</div>
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
                    <h3 className="text-sm font-semibold text-wool-600 mb-3">📅 Timeline</h3>
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
                        <h3 className="text-sm font-semibold text-wool-600 mb-3">💭 Notes</h3>
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