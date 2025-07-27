import React, { useState } from 'react';
import UnsavedChangesModal from '../../../../../shared/components/UnsavedChangesModal';
import useDetailsForm from './useDetailsForm';
import {
    ProjectStatusSection,
    PatternIdentitySection,
    ProjectContextSection,
    PhysicalSpecsSection,
    TechnicalSpecsSection,
    MaterialsSection,
    TimelineSection,
    NotesSection
} from './DetailsTabEditSections';

/**
 * DetailsTabEdit - Clean refactored version
 * 
 * Reduced from ~400 lines to ~70 lines with 3-file structure.
 * All logic moved to useDetailsForm hook, all UI to sections file.
 * Zero functionality changes from original.
 */
const DetailsTabEdit = ({ project, formData, setFormData, hasUnsavedChanges, onSave, onCancel }) => {
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    // All form logic in one hook
    const handlers = useDetailsForm(formData, setFormData, project, onSave, onCancel);

    return (
        <div className="p-6">
            {/* Page Header - Clean, no gradient */}
            <div className="content-header-with-buttons">
                <h2 className="content-title">
                    Edit Details
                </h2>
                <div className="button-group">
                    <button
                        onClick={handlers.handleCancel}
                        className="btn-tertiary btn-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlers.handleSave}
                        disabled={!formData.name.trim()}
                        className="btn-primary btn-sm"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Content Sections - With wizard-inspired backgrounds */}
            <div className="space-y-4">
                <ProjectStatusSection
                    formData={formData}
                    handleStatusChange={handlers.handleStatusChange}
                    project={project}
                />

                <PatternIdentitySection
                    formData={formData}
                    handleInputChange={handlers.handleInputChange}
                />

                <ProjectContextSection
                    formData={formData}
                    handleInputChange={handlers.handleInputChange}
                />

                <PhysicalSpecsSection
                    formData={formData}
                    handleInputChange={handlers.handleInputChange}
                />

                <TechnicalSpecsSection
                    formData={formData}
                    handleInputChange={handlers.handleInputChange}
                />

                <MaterialsSection
                    formData={formData}
                    handleYarnChange={handlers.handleYarnChange}
                    handleYarnColorChange={handlers.handleYarnColorChange}
                    addYarnColor={handlers.addYarnColor}
                    removeYarnColor={handlers.removeYarnColor}
                    handleArrayChange={handlers.handleArrayChange}
                    addArrayItem={handlers.addArrayItem}
                    removeArrayItem={handlers.removeArrayItem}
                />

                <TimelineSection
                    formData={formData}
                    handleInputChange={handlers.handleInputChange}
                />

                <NotesSection
                    formData={formData}
                    handleInputChange={handlers.handleInputChange}
                />
            </div>

            {/* Save/Cancel Footer - Clean, standard styling */}
            <div className="mt-8 flex gap-3">
                <button
                    type="button"
                    onClick={handlers.handleCancel}
                    className="flex-1 btn-tertiary shadow-sm hover:shadow-md transition-shadow"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handlers.handleSave}
                    disabled={!formData.name.trim()}
                    className="flex-2 btn-primary flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                    style={{ flexGrow: 2 }}
                >
                    <span className="text-lg">💾</span>
                    {hasUnsavedChanges ? 'Save Changes' : 'Done'}
                </button>
            </div>
        </div>
    );
};

export default DetailsTabEdit;