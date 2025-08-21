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
import { StandardModal } from '../../../../../shared/components/modals/StandardModal';

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

    const handlePatternIdentityClose = () => {
        setShowPatternIdentityModal(false);
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

            {/* Pattern Identity Edit Modal - NOW USING STANDARDMODAL */}
            <StandardModal
                isOpen={showPatternIdentityModal}
                onClose={handlePatternIdentityClose}
                onConfirm={handlePatternIdentitySave}
                category="input"
                colorScheme="sage"
                title="📝 Pattern Identity"
                subtitle="Update project and pattern information"
                primaryButtonText="Save Changes"
                secondaryButtonText="Cancel"
                // Disable save button if name is empty
                primaryButtonProps={{
                    disabled: !patternIdentityForm.name.trim()
                }}
            >
                <div className="space-y-4">
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
                </div>
            </StandardModal>
        </div>
    );
};

export default DetailsTab;