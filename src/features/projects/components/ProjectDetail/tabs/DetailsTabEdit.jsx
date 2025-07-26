import React, { useState } from 'react';
import UnsavedChangesModal from '../../../../../shared/components/UnsavedChangesModal';

/**
 * DetailsTabEdit - Enhanced edit mode for project details
 * 
 * Features:
 * - Enhanced form fields with proper styling
 * - Array management for yarns and needles
 * - Unsaved changes protection
 * - Mobile-optimized form experience
 */
const DetailsTabEdit = ({ project, formData, setFormData, hasUnsavedChanges, onSave, onCancel }) => {
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // Enhanced cancel with modal
    const handleCancel = () => {
        if (hasUnsavedChanges) {
            setShowUnsavedModal(true);
            return;
        }
        onCancel();
    };

    const confirmCancel = () => {
        setShowUnsavedModal(false);
        onCancel();
    };

    return (
        <div className="p-6 space-y-6">
            {/* Edit Mode Header */}
            <div className="edit-mode-header">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-lg">✏️</span>
                        <span className="font-semibold text-sage-800">Edit Mode</span>
                        {hasUnsavedChanges && (
                            <span className="unsaved-changes-badge">
                                Unsaved changes
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="btn-tertiary btn-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSave}
                            disabled={!formData.name.trim()}
                            className="btn-primary btn-sm"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>

            {/* Basic Info Section */}
            <div className="edit-mode-container field-group-basics">
                <h3 className="content-header-secondary">📋 Basic Info</h3>

                <div className="details-form-field">
                    <label className="form-label form-label-required">
                        Project Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="details-input-field"
                        placeholder="Enter project name"
                    />
                </div>

                <div className="details-form-field">
                    <label className="form-label">
                        Size
                    </label>
                    <input
                        type="text"
                        value={formData.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                        placeholder="e.g., Medium, 36 inches, Newborn"
                        className="details-input-field"
                    />
                </div>

                <div className="details-form-field">
                    <label className="form-label">
                        Preferred Units
                    </label>
                    <div className="details-segmented-control">
                        <div className="grid grid-cols-2 gap-1">
                            <button
                                onClick={() => handleInputChange('defaultUnits', 'inches')}
                                className={`details-segmented-option ${formData.defaultUnits === 'inches' ? 'details-segmented-option-active' : ''}`}
                            >
                                🇺🇸 Inches
                            </button>
                            <button
                                onClick={() => handleInputChange('defaultUnits', 'cm')}
                                className={`details-segmented-option ${formData.defaultUnits === 'cm' ? 'details-segmented-option-active' : ''}`}
                            >
                                🇪🇺 Centimeters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Materials Section */}
            <div className="edit-mode-container field-group-materials">
                <h3 className="content-header-secondary">🧶 Materials</h3>

                {/* Yarn */}
                <div className="details-form-field">
                    <label className="form-label">
                        Yarn
                    </label>
                    <div className="array-input-group">
                        {formData.yarns.map((yarn, index) => (
                            <div key={index} className="array-input-item">
                                <input
                                    type="text"
                                    value={yarn}
                                    onChange={(e) => handleArrayChange('yarns', index, e.target.value)}
                                    placeholder="e.g., Cascade 220 Worsted in Red"
                                    className="flex-1 details-input-field"
                                />
                                {formData.yarns.length > 1 && (
                                    <button
                                        onClick={() => removeArrayItem('yarns', index)}
                                        className="array-remove-button"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('yarns')}
                            className="array-add-button"
                        >
                            + Add Another Yarn
                        </button>
                    </div>
                </div>

                {/* Needles */}
                <div className="details-form-field">
                    <label className="form-label">
                        Needles
                    </label>
                    <div className="array-input-group">
                        {formData.needles.map((needle, index) => (
                            <div key={index} className="array-input-item">
                                <input
                                    type="text"
                                    value={needle}
                                    onChange={(e) => handleArrayChange('needles', index, e.target.value)}
                                    placeholder="e.g., US 8 (5mm) circular"
                                    className="flex-1 details-input-field"
                                />
                                {formData.needles.length > 1 && (
                                    <button
                                        onClick={() => removeArrayItem('needles', index)}
                                        className="array-remove-button"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('needles')}
                            className="array-add-button"
                        >
                            + Add Another Needle
                        </button>
                    </div>
                </div>

                {/* Gauge */}
                <div className="details-form-field">
                    <label className="form-label">
                        Gauge
                    </label>
                    <input
                        type="text"
                        value={formData.gauge}
                        onChange={(e) => handleInputChange('gauge', e.target.value)}
                        placeholder="e.g., 18 sts = 4 inches in stockinette"
                        className="details-input-field"
                    />
                </div>
            </div>

            {/* Project Information Section */}
            <div className="edit-mode-container field-group-info">
                <h3 className="content-header-secondary">ℹ️ Project Information</h3>

                <div className="details-form-field">
                    <label className="form-label">
                        Pattern Source
                    </label>
                    <input
                        type="text"
                        value={formData.source}
                        onChange={(e) => handleInputChange('source', e.target.value)}
                        placeholder="e.g., Ravelry, book, magazine, original"
                        className="details-input-field"
                    />
                </div>

                <div className="details-form-field">
                    <label className="form-label">
                        Designer
                    </label>
                    <input
                        type="text"
                        value={formData.designer}
                        onChange={(e) => handleInputChange('designer', e.target.value)}
                        placeholder="e.g., Jane Doe, Original design"
                        className="details-input-field"
                    />
                </div>

                <div className="details-form-field">
                    <label className="form-label">
                        Recipient
                    </label>
                    <input
                        type="text"
                        value={formData.recipient}
                        onChange={(e) => handleInputChange('recipient', e.target.value)}
                        placeholder="e.g., Mom, Baby Emma, Myself"
                        className="details-input-field"
                    />
                </div>
            </div>

            {/* Notes Section */}
            <div className="edit-mode-container field-group-notes">
                <h3 className="content-header-secondary">💭 Notes</h3>

                <div className="details-form-field">
                    <label className="form-label">
                        Project Notes
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Special notes, modifications, deadlines, or anything else you want to remember..."
                        className="details-textarea"
                    />
                    <div className="character-count">
                        {formData.notes.length} characters
                    </div>
                </div>
            </div>

            {/* Save/Cancel Footer */}
            <div className="flex gap-3">
                <button
                    onClick={handleCancel}
                    className="flex-1 btn-tertiary"
                >
                    Cancel
                </button>
                <button
                    onClick={onSave}
                    disabled={!formData.name.trim()}
                    className="flex-2 btn-primary flex items-center justify-center gap-2"
                    style={{ flexGrow: 2 }}
                >
                    <span className="text-lg">💾</span>
                    {hasUnsavedChanges ? 'Save Changes' : 'Done'}
                </button>
            </div>

            {/* Unsaved Changes Modal */}
            <UnsavedChangesModal
                isOpen={showUnsavedModal}
                onConfirmExit={confirmCancel}
                onCancel={() => setShowUnsavedModal(false)}
                title="You have unsaved changes"
                message="Are you sure you want to exit without saving your changes?"
            />
        </div>
    );
};

export default DetailsTabEdit;