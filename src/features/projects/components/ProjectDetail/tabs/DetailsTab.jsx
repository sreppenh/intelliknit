import React, { useState, useEffect } from 'react';
import { getProjectStatus } from '../../../../../shared/utils/projectStatus';
import UnitsConstructionSection from '../sections/UnitsConstruction';


const DetailsTab = ({ project, onProjectUpdate }) => {
    const [isNotesExpanded, setIsNotesExpanded] = useState(false);

    // Format functions (copied from DetailsTabRead)
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleInputChange = (field, value) => {
        // Update the project immediately when saving from modal
        const updatedProject = {
            ...project,
            [field]: value
        };
        onProjectUpdate(updatedProject);
    };

    const formatYarnDisplay = (yarns) => {
        if (!yarns || yarns.length === 0) return [];

        const formattedYarns = [];

        yarns.forEach(yarn => {
            if (typeof yarn === 'string') {
                if (yarn.trim()) {
                    formattedYarns.push(yarn.trim());
                }
            } else if (yarn && yarn.name) {
                const yarnName = yarn.name.trim();
                if (!yarnName) return;

                const colors = yarn.colors?.filter(c => c.color && c.color.trim()) || [];

                if (colors.length === 0) {
                    formattedYarns.push(yarnName);
                } else {
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

    const status = getProjectStatus(project);

    const handleEdit = () => {
        // For now, just a placeholder - we'll add inline editing later
        console.log('Edit functionality coming soon');
    };

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
                    <button onClick={handleEdit} className="btn-primary btn-sm">
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

                {/* Units & Construction - New inline editing section */}
                <UnitsConstructionSection
                    project={project}
                    isEditing={false}
                    onEdit={() => console.log('Starting inline edit...')}
                    formData={null}
                    handleInputChange={null}
                />

                {/* Gauge - Remaining Technical Specs */}
                {project.gauge && (
                    <div className="read-mode-section">
                        <h3 className="section-header-secondary">⚖️ Gauge</h3>
                        <div className="text-sm text-wool-700 space-y-1 text-left">
                            <div>Gauge: {project.gauge}</div>
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

export default DetailsTab;