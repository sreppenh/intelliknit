import React, { useState } from 'react';

/**
 * DetailsTabRead - Purpose-driven section structure with smart status display
 * 
 * Features:
 * - Project Context, Physical Specs, Technical Specifications separation
 * - Smart status display using existing project personality logic
 * - Consistent formatting with "labels only when needed" principle
 * - Timeline bullet format for compactness
 * - Materials section unchanged (already perfect)
 */
const DetailsTabRead = ({ project, onEdit }) => {
    const [isNotesExpanded, setIsNotesExpanded] = useState(false);

    // Smart status calculation (matches ProjectList.jsx logic)
    const getProjectStatus = () => {
        if (project.completed) return { emoji: '🎉', text: 'Completed' };
        if (project.frogged) return { emoji: '🐸', text: 'Frogged' };

        // Calculate streak for fire status
        const getStreakDays = () => {
            if (!project.activityLog || project.activityLog.length === 0) return 0;
            let streak = 0;
            const today = new Date();
            const msPerDay = 24 * 60 * 60 * 1000;

            for (let i = 0; i < 30; i++) {
                const checkDate = new Date(today.getTime() - (i * msPerDay));
                const dayString = checkDate.toISOString().split('T')[0];
                if (project.activityLog.includes(dayString)) {
                    streak = i + 1;
                } else if (i === 0) {
                    continue;
                } else {
                    break;
                }
            }
            return streak;
        };

        const streakDays = getStreakDays();
        if (streakDays >= 3) {
            const fireLevel = streakDays >= 7 ? '🔥🔥🔥' : streakDays >= 5 ? '🔥🔥' : '🔥';
            return { emoji: '🔥', text: `On fire! ${streakDays} day streak` };
        }

        // Check for dormant (14+ days inactive)
        const lastActivity = new Date(project.lastActivityAt || project.createdAt);
        const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceActivity > 14 && project.components?.length > 0) {
            return { emoji: '😴', text: 'Taking a nap...' };
        }

        // Check for empty (no components)
        if (!project.components || project.components.length === 0) {
            return { emoji: '💭', text: 'Ready to begin' };
        }

        // Default: active
        return { emoji: '🧶', text: 'In progress' };
    };

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

    const status = getProjectStatus();

    return (
        <div className="p-6">
            {/* Pattern Identity - Enhanced header */}
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

            {/* Content Sections - Purpose-driven organization */}
            <div className="space-y-4">
                {/* Project Context - Who, Why, When + Status */}
                {(project.recipient || project.occasion || project.deadline || project.priority || status.text) && (
                    <div className="read-mode-section">
                        <h3 className="section-header-secondary">🎯 Project Context</h3>
                        <div className="text-sm text-wool-700 space-y-1 text-left">
                            {/* Status prominently at top */}
                            <div className="font-semibold text-wool-800">{status.emoji} {status.text}</div>
                            {project.recipient && <div>For {project.recipient}</div>}
                            {project.occasion && <div>{project.occasion}</div>}
                            {project.deadline && <div>Due {formatDate(project.deadline)}</div>}
                            {project.priority && project.priority !== 'normal' && (
                                <div>{project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} priority</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Physical Specs - Size, Progress */}
                {(project.size || project.progress) && (
                    <div className="read-mode-section">
                        <h3 className="section-header-secondary">📏 Physical Specs</h3>
                        <div className="text-sm text-wool-700 space-y-1 text-left">
                            {project.size && <div>Size {project.size}</div>}
                            {project.progress !== undefined && project.progress !== null && (
                                <div>{project.progress}% complete</div>
                            )}
                        </div>
                    </div>
                )}

                {/* Technical Specifications - Units, Construction, Gauge */}
                {(project.defaultUnits || project.construction || project.gauge) && (
                    <div className="read-mode-section">
                        <h3 className="section-header-secondary">📐 Technical Specifications</h3>
                        <div className="text-sm text-wool-700 space-y-1 text-left">
                            {project.defaultUnits && (
                                <div>Measured in {project.defaultUnits === 'inches' ? 'inches' : 'centimeters'}</div>
                            )}
                            {project.construction && (
                                <div>{project.construction.charAt(0).toUpperCase() + project.construction.slice(1)} construction</div>
                            )}
                            {project.gauge && <div>Gauge: {project.gauge}</div>}
                        </div>
                    </div>
                )}

                {/* Materials - Keep exactly as-is (you love this section!) */}
                {(project.yarns?.length > 0 || project.needles?.length > 0) && (
                    <div className="read-mode-section">
                        <h3 className="section-header-secondary">🧶 Materials</h3>
                        <div className="space-y-3 text-left">
                            {/* Yarn */}
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
                        </div>
                    </div>
                )}

                {/* Timeline - Bullet format with colored dates */}
                <div className="read-mode-section">
                    <h3 className="section-header-secondary">📅 Timeline</h3>
                    <div className="text-sm text-wool-700 space-y-1 text-left">
                        <div>• Created: <span className="text-wool-500">{formatDate(project.createdAt)}</span></div>
                        {project.startedAt && (
                            <div>• Started: <span className="text-wool-500">{formatDate(project.startedAt)}</span></div>
                        )}
                        {project.lastActivityAt && (
                            <div>• Last Modified: <span className="text-wool-500">{formatDate(project.lastActivityAt)}</span></div>
                        )}
                        {project.completedAt && (
                            <div>• Completed: <span className="text-wool-500">{formatDate(project.completedAt)}</span></div>
                        )}
                    </div>
                </div>

                {/* Notes - Keep exactly as-is */}
                {project.notes && (
                    <div className="read-mode-section">
                        <h3 className="section-header-secondary">💭 Notes</h3>
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