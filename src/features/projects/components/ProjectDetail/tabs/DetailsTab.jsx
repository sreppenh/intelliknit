import React, { useState, useEffect } from 'react';
import useProjectUpdate from '../../../../../shared/hooks/useProjectUpdate';
import { getProjectStatus } from '../../../../../shared/utils/projectStatus';
import UnitsConstructionSection from '../sections/UnitsConstruction';
import ProjectContextSection from '../sections/ProjectContextSection';
import ProjectStatusSection from '../sections/ProjectStatusSection';
import NeedlesSection from '../sections/NeedlesSection';
import YarnsSection from '../sections/YarnsSection';
import GaugeSection from '../sections/GaugeSection';
import NotesSection from '../sections/NotesSection';
import TimelineSection from '../sections/TimeLineSection';


const DetailsTab = ({ project, onProjectUpdate }) => {
    const [isNotesExpanded, setIsNotesExpanded] = useState(false);

    // Pattern Identity Modal State
    const [showPatternIdentityModal, setShowPatternIdentityModal] = useState(false);
    const [patternIdentityForm, setPatternIdentityForm] = useState({
        name: '',
        designer: '',
        source: ''
    });

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

    // Use shared project update hook
    const { updateField, addArrayItem, removeArrayItem } = useProjectUpdate(onProjectUpdate);

    const handleInputChange = (field, value) => {
        console.log('🔧 DetailsTab handleInputChange called:', { field, value });
        // ADD THIS DEBUG LINE:
        if (field === 'needles') {
            console.log('🔧 NEEDLES DETAIL DEBUG:', JSON.stringify(value, null, 2));
        }
        updateField(project, field, value);
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

    // Pattern Identity Modal Handlers
    const handlePatternIdentityEdit = () => {
        setPatternIdentityForm({
            name: project.name || '',
            designer: project.designer || '',
            source: project.source || ''
        });
        setShowPatternIdentityModal(true);
    };

    const handlePatternIdentitySave = () => {
        if (!patternIdentityForm.name.trim()) return;

        const updatedProject = {
            ...project,
            name: patternIdentityForm.name.trim(),
            designer: patternIdentityForm.designer.trim() || undefined,
            source: patternIdentityForm.source.trim() || undefined
        };

        onProjectUpdate(updatedProject);
        setShowPatternIdentityModal(false);
    };

    // Modal behavior handlers
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showPatternIdentityModal) {
                setShowPatternIdentityModal(false);
            }
        };

        const handleEnterKey = (event) => {
            if (event.key === 'Enter' && showPatternIdentityModal && patternIdentityForm.name.trim()) {
                event.preventDefault();
                handlePatternIdentitySave();
            }
        };

        if (showPatternIdentityModal) {
            document.addEventListener('keydown', handleEscKey);
            document.addEventListener('keydown', handleEnterKey);

            // Auto-focus project name input
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
    }, [showPatternIdentityModal, patternIdentityForm.name]);

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            setShowPatternIdentityModal(false);
        }
    };

    return (
        <div className="p-6">
            {/* Pattern Identity - Enhanced header with inline editing */}
            <div className="content-header-with-buttons">
                <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-wool-800 leading-tight mb-1">
                        📖 {project.name || 'Untitled Project'}
                    </h2>
                    {project.designer ? (
                        <p className="text-lg text-wool-600 ml-6 mb-1">
                            by {project.designer}
                        </p>
                    ) : (
                        <p
                            className="text-lg text-wool-400 ml-6 mb-1 cursor-pointer hover:text-sage-500 transition-colors"
                            onClick={handlePatternIdentityEdit}
                        >
                            + Add designer
                        </p>
                    )}
                    {project.source ? (
                        <p className="text-sm text-wool-500 ml-6">
                            Pattern from {project.source}
                        </p>
                    ) : (
                        <p
                            className="text-sm text-wool-400 ml-6 cursor-pointer hover:text-sage-500 transition-colors"
                            onClick={handlePatternIdentityEdit}
                        >
                            + Add pattern source
                        </p>
                    )}
                </div>
                <div className="button-group">
                    <button onClick={handlePatternIdentityEdit} className="text-wool-600 hover:text-sage-600 text-xl">
                        ✏️
                    </button>
                </div>
            </div>

            {/* Content Sections - Purpose-driven organization */}
            <div className="space-y-4">
                {/* Project Status - Revolutionary Action Center */}
                <ProjectStatusSection
                    project={project}
                    formData={project}
                    handleInputChange={handleInputChange}
                    handleStatusChange={(field, value) => {
                        // Handle boolean status changes
                        const updatedProject = {
                            ...project,
                            [field]: value
                        };
                        onProjectUpdate(updatedProject);
                    }}
                    onProjectUpdate={onProjectUpdate}
                />

                {/* Project Context - New conversational section */}
                <ProjectContextSection
                    project={project}
                    isEditing={false}
                    onEdit={() => console.log('Starting project context edit...')}
                    formData={project}
                    handleInputChange={handleInputChange}
                />

                <YarnsSection
                    project={project}
                    formData={project}
                    handleInputChange={handleInputChange}
                />

                {/* Units & Construction - New inline editing section */}
                <UnitsConstructionSection
                    project={project}
                    isEditing={false}
                    onEdit={() => console.log('Starting inline edit...')}
                    formData={project}
                    handleInputChange={handleInputChange}
                />

                {/* Needles - New Interactive Section */}
                <NeedlesSection
                    project={project}
                    formData={project}
                    handleInputChange={handleInputChange}
                    addArrayItem={(field, itemData) => addArrayItem(project, field, itemData)}
                    removeArrayItem={(field, index) => removeArrayItem(project, field, index)}
                />

                {/* Gauge - Technical Precision Section */}
                <GaugeSection
                    project={project}
                    formData={project}
                    handleInputChange={handleInputChange}
                />

                {/* Timeline - Bullet format with colored dates */}
                <TimelineSection
                    project={project}
                    formData={project}
                    handleInputChange={handleInputChange}
                />

                <NotesSection
                    project={project}
                    formData={project}
                    handleInputChange={handleInputChange}
                />
            </div>

            {/* Pattern Identity Edit Modal */}
            {showPatternIdentityModal && (
                <div className="modal-overlay" onClick={handleBackdropClick}>
                    <div className="modal-content-light">
                        <div className="modal-header-light">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">📝</div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold">Pattern Identity</h2>
                                    <p className="text-sage-600 text-sm">Update project and pattern information</p>
                                </div>
                                <button
                                    onClick={() => setShowPatternIdentityModal(false)}
                                    className="text-sage-600 text-xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="form-label">Project Name (Required)</label>
                                <input
                                    data-modal-focus
                                    type="text"
                                    value={patternIdentityForm.name}
                                    onChange={(e) => setPatternIdentityForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="details-input-field"
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div>
                                <label className="form-label">Designer</label>
                                <input
                                    type="text"
                                    value={patternIdentityForm.designer}
                                    onChange={(e) => setPatternIdentityForm(prev => ({ ...prev, designer: e.target.value }))}
                                    className="details-input-field"
                                    placeholder="e.g., Jane Smith"
                                />
                            </div>

                            <div>
                                <label className="form-label">Pattern Source</label>
                                <input
                                    type="text"
                                    value={patternIdentityForm.source}
                                    onChange={(e) => setPatternIdentityForm(prev => ({ ...prev, source: e.target.value }))}
                                    className="details-input-field"
                                    placeholder="e.g., Ravelry, The Big Book of Cables"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    data-modal-cancel
                                    onClick={() => setShowPatternIdentityModal(false)}
                                    className="btn-tertiary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    data-modal-primary
                                    onClick={handlePatternIdentitySave}
                                    disabled={!patternIdentityForm.name.trim()}
                                    className="btn-primary flex-1"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailsTab;