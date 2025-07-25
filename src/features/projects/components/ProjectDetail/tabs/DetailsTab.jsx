import React, { useState, useEffect } from 'react';

/**
 * Enhanced DetailsTab with Read-Only/Edit Mode Toggle
 * 
 * Features:
 * - Read-only view with rich information display
 * - In-tab editing mode toggle
 * - Enhanced notes section with rich text
 * - Unsaved changes protection
 * - Mobile-optimized form fields
 */

const DetailsTab = ({ project, onProjectUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isNotesExpanded, setIsNotesExpanded] = useState(false);

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
        if (hasUnsavedChanges) {
            const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
            if (!confirmCancel) return;
        }

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

    // Read-only view
    if (!isEditing) {
        return (
            <div className="p-6 space-y-6">
                {/* Project Basics */}
                <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-wool-700 mb-3">📋 Project Basics</h3>
                        <button
                            onClick={handleEdit}
                            className="bg-sage-500 text-white text-xs px-3 py-1.5 rounded-md font-medium hover:bg-sage-600 transition-colors"
                        >
                            Edit
                        </button>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-wool-600">Name:</span>
                            <span className="font-medium">{project.name || 'Untitled Project'}</span>
                        </div>
                        {project.size && (
                            <div className="flex justify-between">
                                <span className="text-wool-600">Size:</span>
                                <span className="font-medium">{project.size}</span>
                            </div>
                        )}
                        {project.projectType && (
                            <div className="flex justify-between">
                                <span className="text-wool-600">Type:</span>
                                <span className="font-medium capitalize">{project.projectType.replace('_', ' ')}</span>
                            </div>
                        )}
                        {project.defaultUnits && (
                            <div className="flex justify-between">
                                <span className="text-wool-600">Units:</span>
                                <span className="font-medium">{project.defaultUnits === 'inches' ? 'Inches' : 'Centimeters'}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Materials */}
                {(project.yarns?.length > 0 || project.needles?.length > 0 || project.gauge) && (
                    <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm space-y-3">
                        <h3 className="font-semibold text-wool-700 mb-3">🧶 Materials</h3>
                        <div className="space-y-2 text-sm">
                            {project.yarns?.filter(yarn => yarn.trim()).length > 0 && (
                                <div>
                                    <span className="text-wool-600 block mb-1">Yarn:</span>
                                    {project.yarns.filter(yarn => yarn.trim()).map((yarn, index) => (
                                        <div key={index} className="ml-2 text-wool-700">• {yarn}</div>
                                    ))}
                                </div>
                            )}
                            {project.needles?.filter(needle => needle.trim()).length > 0 && (
                                <div>
                                    <span className="text-wool-600 block mb-1">Needles:</span>
                                    {project.needles.filter(needle => needle.trim()).map((needle, index) => (
                                        <div key={index} className="ml-2 text-wool-700">• {needle}</div>
                                    ))}
                                </div>
                            )}
                            {project.gauge && (
                                <div className="flex justify-between">
                                    <span className="text-wool-600">Gauge:</span>
                                    <span className="font-medium">{project.gauge}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Project Information */}
                {(project.designer || project.recipient || project.source) && (
                    <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm space-y-3">
                        <h3 className="font-semibold text-wool-700 mb-3">ℹ️ Project Information</h3>
                        <div className="space-y-2 text-sm">
                            {project.designer && (
                                <div className="flex justify-between">
                                    <span className="text-wool-600">Designer:</span>
                                    <span className="font-medium">{project.designer}</span>
                                </div>
                            )}
                            {project.recipient && (
                                <div className="flex justify-between">
                                    <span className="text-wool-600">Recipient:</span>
                                    <span className="font-medium">{project.recipient}</span>
                                </div>
                            )}
                            {project.source && (
                                <div className="flex justify-between">
                                    <span className="text-wool-600">Pattern Source:</span>
                                    <span className="font-medium">{project.source}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Timeline */}
                <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm space-y-3">
                    <h3 className="font-semibold text-wool-700 mb-3">📅 Timeline</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-wool-600">Created:</span>
                            <span className="font-medium">{formatDate(project.createdAt)}</span>
                        </div>
                        {project.lastActivityAt && (
                            <div className="flex justify-between">
                                <span className="text-wool-600">Last Modified:</span>
                                <span className="font-medium">{formatDate(project.lastActivityAt)}</span>
                            </div>
                        )}
                        {project.completedAt && (
                            <div className="flex justify-between">
                                <span className="text-wool-600">Completed:</span>
                                <span className="font-medium">{formatDate(project.completedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm space-y-3">
                    <h3 className="font-semibold text-wool-700 mb-3">💭 Notes</h3>
                    {project.notes ? (
                        <div className="text-sm text-wool-700">
                            {project.notes.length > 200 && !isNotesExpanded ? (
                                <div>
                                    <p className="whitespace-pre-wrap">{project.notes.substring(0, 200)}...</p>
                                    <button
                                        onClick={() => setIsNotesExpanded(true)}
                                        className="text-sage-600 hover:text-sage-700 font-medium mt-2"
                                    >
                                        Read more
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="whitespace-pre-wrap">{project.notes}</p>
                                    {project.notes.length > 200 && isNotesExpanded && (
                                        <button
                                            onClick={() => setIsNotesExpanded(false)}
                                            className="text-sage-600 hover:text-sage-700 font-medium mt-2"
                                        >
                                            Show less
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-wool-500 text-sm">
                            <p>No notes yet. Click Edit to add project notes.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Edit mode view
    return (
        <div className="p-6 bg-sage-50 space-y-6">
            {/* Edit Mode Header */}
            <div className="bg-sage-100 border border-sage-300 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">✏️</span>
                        <span className="font-semibold text-sage-800">Edit Mode</span>
                        {hasUnsavedChanges && (
                            <span className="text-xs bg-yarn-100 text-yarn-700 px-2 py-1 rounded-full">
                                Unsaved changes
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="bg-wool-300 text-wool-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-wool-400 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!formData.name.trim()}
                            className="bg-yarn-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>

            {/* Basic Info Section */}
            <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm space-y-4">
                <h3 className="font-semibold text-wool-700">📋 Basic Info</h3>

                <div>
                    <label className="block text-sm font-medium text-wool-600 mb-2">
                        Project Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                        placeholder="Enter project name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-wool-600 mb-2">
                        Size
                    </label>
                    <input
                        type="text"
                        value={formData.size}
                        onChange={(e) => handleInputChange('size', e.target.value)}
                        placeholder="e.g., Medium, 36 inches, Newborn"
                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-wool-600 mb-2">
                        Preferred Units
                    </label>
                    <div className="bg-wool-100 border-2 border-wool-200 rounded-xl p-1">
                        <div className="grid grid-cols-2 gap-1">
                            <button
                                onClick={() => handleInputChange('defaultUnits', 'inches')}
                                className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${formData.defaultUnits === 'inches'
                                    ? 'bg-sage-500 text-white shadow-sm'
                                    : 'text-wool-600 hover:text-sage-600'
                                    }`}
                            >
                                🇺🇸 Inches
                            </button>
                            <button
                                onClick={() => handleInputChange('defaultUnits', 'cm')}
                                className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${formData.defaultUnits === 'cm'
                                    ? 'bg-sage-500 text-white shadow-sm'
                                    : 'text-wool-600 hover:text-sage-600'
                                    }`}
                            >
                                🌍 CM
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Materials Section */}
            <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm space-y-4">
                <h3 className="font-semibold text-wool-700">🧶 Materials</h3>

                {/* Yarn */}
                <div>
                    <label className="block text-sm font-medium text-wool-600 mb-2">
                        Yarn
                    </label>
                    <div className="space-y-2">
                        {formData.yarns.map((yarn, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={yarn}
                                    onChange={(e) => handleArrayChange('yarns', index, e.target.value)}
                                    placeholder="e.g., Cascade 220 Worsted in Red"
                                    className="flex-1 border-2 border-wool-200 rounded-xl px-4 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                                />
                                {formData.yarns.length > 1 && (
                                    <button
                                        onClick={() => removeArrayItem('yarns', index)}
                                        className="bg-red-100 text-red-600 px-3 py-2 rounded-xl hover:bg-red-200 transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('yarns')}
                            className="w-full bg-wool-100 text-wool-600 py-2 px-4 rounded-xl font-medium hover:bg-wool-200 transition-colors border-2 border-dashed border-wool-300"
                        >
                            + Add Another Yarn
                        </button>
                    </div>
                </div>

                {/* Needles */}
                <div>
                    <label className="block text-sm font-medium text-wool-600 mb-2">
                        Needles
                    </label>
                    <div className="space-y-2">
                        {formData.needles.map((needle, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={needle}
                                    onChange={(e) => handleArrayChange('needles', index, e.target.value)}
                                    placeholder="e.g., US 8 (5mm) circular"
                                    className="flex-1 border-2 border-wool-200 rounded-xl px-4 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                                />
                                {formData.needles.length > 1 && (
                                    <button
                                        onClick={() => removeArrayItem('needles', index)}
                                        className="bg-red-100 text-red-600 px-3 py-2 rounded-xl hover:bg-red-200 transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            onClick={() => addArrayItem('needles')}
                            className="w-full bg-wool-100 text-wool-600 py-2 px-4 rounded-xl font-medium hover:bg-wool-200 transition-colors border-2 border-dashed border-wool-300"
                        >
                            + Add Another Needle
                        </button>
                    </div>
                </div>

                {/* Gauge */}
                <div>
                    <label className="block text-sm font-medium text-wool-600 mb-2">
                        Gauge
                    </label>
                    <input
                        type="text"
                        value={formData.gauge}
                        onChange={(e) => handleInputChange('gauge', e.target.value)}
                        placeholder="e.g., 18 sts = 4 inches in stockinette"
                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                    />
                </div>
            </div>

            {/* Project Information Section */}
            <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm space-y-4">
                <h3 className="font-semibold text-wool-700">ℹ️ Project Information</h3>

                <div>
                    <label className="block text-sm font-medium text-wool-600 mb-2">
                        Pattern Source
                    </label>
                    <input
                        type="text"
                        value={formData.source}
                        onChange={(e) => handleInputChange('source', e.target.value)}
                        placeholder="e.g., Ravelry, book, magazine, original"
                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-wool-600 mb-2">
                        Designer
                    </label>
                    <input
                        type="text"
                        value={formData.designer}
                        onChange={(e) => handleInputChange('designer', e.target.value)}
                        placeholder="e.g., Jane Doe, Original design"
                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-wool-600 mb-2">
                        Recipient
                    </label>
                    <input
                        type="text"
                        value={formData.recipient}
                        onChange={(e) => handleInputChange('recipient', e.target.value)}
                        placeholder="e.g., Mom, Baby Emma, Myself"
                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                    />
                </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm space-y-4">
                <h3 className="font-semibold text-wool-700">💭 Notes</h3>

                <div>
                    <label className="block text-sm font-medium text-wool-600 mb-2">
                        Project Notes
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Special notes, modifications, deadlines, or anything else you want to remember..."
                        rows={6}
                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white resize-none"
                    />
                    <div className="text-xs text-wool-500 mt-1">
                        {formData.notes.length} characters
                    </div>
                </div>
            </div>

            {/* Save/Cancel Footer */}
            <div className="flex gap-3">
                <button
                    onClick={handleCancel}
                    className="flex-1 bg-wool-300 text-wool-700 py-4 px-6 rounded-xl font-semibold text-base hover:bg-wool-400 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!formData.name.trim()}
                    className="flex-2 bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                    style={{ flexGrow: 2 }}
                >
                    <span className="text-lg">💾</span>
                    {hasUnsavedChanges ? 'Save Changes' : 'Done'}
                </button>
            </div>
        </div>
    );
};

export default DetailsTab;