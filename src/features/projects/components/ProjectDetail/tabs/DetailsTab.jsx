import React, { useState, useEffect } from 'react';
import DetailsTabRead from './DetailsTabRead';
import DetailsTabEdit from './DetailsTabEdit';

/**
 * DetailsTab - Main coordinator for read-only/edit mode toggle
 * 
 * Handles:
 * - Mode switching between read and edit
 * - Shared state management
 * - Data persistence coordination
 */
const DetailsTab = ({ project, onProjectUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Initialize form data when project changes
    useEffect(() => {
        setFormData({
            name: project?.name || '',
            size: project?.size || '',
            defaultUnits: project?.defaultUnits || 'inches',
            gauge: project?.gauge || '',
            yarns: project?.yarns || [''],
            needles: project?.needles || [''],
            source: project?.source || '',
            designer: project?.designer || '',
            recipient: project?.recipient || '',
            notes: project?.notes || ''
        });
        setHasUnsavedChanges(false);
    }, [project]);

    // Check for changes
    useEffect(() => {
        if (!project) return;

        const originalData = {
            name: project.name || '',
            size: project.size || '',
            defaultUnits: project.defaultUnits || 'inches',
            gauge: project.gauge || '',
            yarns: project.yarns || [''],
            needles: project.needles || [''],
            source: project.source || '',
            designer: project.designer || '',
            recipient: project.recipient || '',
            notes: project.notes || ''
        };

        const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
        setHasUnsavedChanges(hasChanges);
    }, [formData, project]);

    // Mode switching handlers
    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        if (!formData.name.trim()) return;

        const updatedProject = {
            ...project,
            ...formData,
            // Clean up empty array items
            yarns: formData.yarns.filter(yarn => yarn.trim() !== ''),
            needles: formData.needles.filter(needle => needle.trim() !== '')
        };

        onProjectUpdate(updatedProject);
        setIsEditing(false);
        setHasUnsavedChanges(false);
    };

    const handleCancel = () => {
        // Reset form data to original project data
        setFormData({
            name: project?.name || '',
            size: project?.size || '',
            defaultUnits: project?.defaultUnits || 'inches',
            gauge: project?.gauge || '',
            yarns: project?.yarns || [''],
            needles: project?.needles || [''],
            source: project?.source || '',
            designer: project?.designer || '',
            recipient: project?.recipient || '',
            notes: project?.notes || ''
        });

        setIsEditing(false);
        setHasUnsavedChanges(false);
    };

    // Shared props for both modes
    const sharedProps = {
        project,
        formData,
        setFormData,
        hasUnsavedChanges,
        onEdit: handleEdit,
        onSave: handleSave,
        onCancel: handleCancel
    };

    // Render appropriate mode
    if (isEditing) {
        return <DetailsTabEdit {...sharedProps} />;
    }

    return <DetailsTabRead {...sharedProps} />;
};

export default DetailsTab;