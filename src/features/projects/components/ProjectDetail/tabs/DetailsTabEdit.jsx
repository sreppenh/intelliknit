import React, { useState } from 'react';
import UnsavedChangesModal from '../../../../../shared/components/UnsavedChangesModal';

/**
 * DetailsTabEdit - Group 2 Complete: Field Layout & Organization
 * 
 * Changes:
 * - Stacked all adjacent fields (no more grid-cols-2)
 * - Added all missing fields: occasion, deadline, priority, progress, startedAt
 * - Reorganized sections to match read view structure
 * - Comprehensive field layout improvements
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

    const handleYarnChange = (yarnIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            yarns: prev.yarns.map((yarn, i) =>
                i === yarnIndex ? { ...yarn, [field]: value } : yarn
            )
        }));
    };

    const handleYarnColorChange = (yarnIndex, colorIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            yarns: prev.yarns.map((yarn, i) =>
                i === yarnIndex ? {
                    ...yarn,
                    colors: yarn.colors.map((color, ci) =>
                        ci === colorIndex ? { ...color, [field]: value } : color
                    )
                } : yarn
            )
        }));
    };

    const addYarnColor = (yarnIndex) => {
        setFormData(prev => ({
            ...prev,
            yarns: prev.yarns.map((yarn, i) =>
                i === yarnIndex ? {
                    ...yarn,
                    colors: [...yarn.colors, { color: '', skeins: '' }]
                } : yarn
            )
        }));
    };

    const removeYarnColor = (yarnIndex, colorIndex) => {
        setFormData(prev => ({
            ...prev,
            yarns: prev.yarns.map((yarn, i) =>
                i === yarnIndex ? {
                    ...yarn,
                    colors: yarn.colors.filter((_, ci) => ci !== colorIndex)
                } : yarn
            )
        }));
    };

    const addArrayItem = (field) => {
        if (field === 'yarns') {
            setFormData(prev => ({
                ...prev,
                yarns: [...prev.yarns, { name: '', colors: [{ color: '', skeins: '' }] }]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], '']
            }));
        }
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // Enhanced save with data transformation
    const handleSave = () => {
        if (!formData.name.trim()) return;

        // Keep the enhanced yarn format for storage, just clean up empty entries
        const transformedData = {
            ...formData,
            // Keep enhanced yarn format but clean up empty entries
            yarns: formData.yarns.filter(yarn => yarn.name && yarn.name.trim() !== ''),
            // Clean up empty needle items
            needles: formData.needles.filter(needle => needle.trim() !== '')
        };

        // Call the parent's save function with enhanced data
        onSave(transformedData);
    };

    // Simple cancel without modal
    const handleCancel = () => {
        onCancel();
    };

    const confirmCancel = () => {
        setShowUnsavedModal(false);
        onCancel();
    };

    // Initialize construction and ensure yarns have proper structure
    React.useEffect(() => {
        if (!formData.construction) {
            handleInputChange('construction', 'flat');
        }

        // Initialize new fields with defaults
        if (formData.priority === undefined) {
            handleInputChange('priority', 'normal');
        }

        // Convert old yarn format to new format if needed
        if (formData.yarns && formData.yarns.length > 0) {
            const hasOldFormat = formData.yarns.some(yarn =>
                typeof yarn === 'string' || (yarn && !yarn.colors)
            );

            if (hasOldFormat) {
                const updatedYarns = formData.yarns.map(yarn => {
                    if (typeof yarn === 'string') {
                        return { name: yarn, colors: [{ color: '', skeins: '' }] };
                    } else if (yarn && !yarn.colors) {
                        return {
                            name: yarn.name || '',
                            colors: [{ color: yarn.color || '', skeins: '' }]
                        };
                    }
                    return yarn;
                });
                setFormData(prev => ({ ...prev, yarns: updatedYarns }));
            }
        }
    }, []);

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="content-header-with-buttons">
                <h2 className="content-title">
                    Edit Details
                </h2>
                <div className="button-group">
                    <button
                        onClick={handleCancel}
                        className="btn-tertiary btn-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!formData.name.trim()}
                        className="btn-primary btn-sm"
                    >
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Content Sections - Reorganized to match read view */}
            <div className="space-y-4">
                {/* Pattern Identity */}
                <div className="bg-white rounded-xl p-5 border-2 border-wool-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <h3 className="section-header-primary">
                        📝 Pattern Identity
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Project Name (Required)</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                                placeholder="Enter project name"
                            />
                        </div>
                        <div>
                            <label className="form-label">Pattern Source</label>
                            <input
                                type="text"
                                value={formData.source}
                                onChange={(e) => handleInputChange('source', e.target.value)}
                                placeholder="e.g., Ravelry, The Big Book of Cables"
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="form-label">Designer</label>
                            <input
                                type="text"
                                value={formData.designer}
                                onChange={(e) => handleInputChange('designer', e.target.value)}
                                placeholder="e.g., Jane Doe"
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                            />
                        </div>
                    </div>
                </div>

                {/* Project Context - New section with new fields */}
                <div className="bg-white rounded-xl p-5 border-2 border-lavender-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <h3 className="section-header-primary text-lavender-700">
                        🎯 Project Context
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Recipient</label>
                            <input
                                type="text"
                                value={formData.recipient}
                                onChange={(e) => handleInputChange('recipient', e.target.value)}
                                placeholder="e.g., Mom, Myself, Sarah"
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="form-label">Occasion</label>
                            <input
                                type="text"
                                value={formData.occasion || ''}
                                onChange={(e) => handleInputChange('occasion', e.target.value)}
                                placeholder="e.g., Birthday, Christmas, Just because"
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="form-label">Deadline</label>
                            <input
                                type="date"
                                value={formData.deadline || ''}
                                onChange={(e) => handleInputChange('deadline', e.target.value)}
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="form-label">Priority</label>
                            <div className="bg-wool-100 border-2 border-wool-200 rounded-xl p-1">
                                <div className="grid grid-cols-4 gap-1">
                                    {['high', 'normal', 'low', 'someday'].map((priority) => (
                                        <button
                                            key={priority}
                                            type="button"
                                            onClick={() => handleInputChange('priority', priority)}
                                            className={`py-2 px-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${formData.priority === priority ? 'bg-lavender-500 text-white shadow-sm' : 'text-wool-600 hover:text-lavender-600'}`}
                                        >
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Physical Specs - Size and Progress */}
                <div className="bg-white rounded-xl p-5 border-2 border-yarn-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <h3 className="section-header-primary text-yarn-700">
                        📏 Physical Specs
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Size</label>
                            <input
                                type="text"
                                value={formData.size}
                                onChange={(e) => handleInputChange('size', e.target.value)}
                                placeholder="e.g., Medium, 36 inches, Newborn"
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="form-label">Progress (Optional)</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.progress || ''}
                                    onChange={(e) => handleInputChange('progress', e.target.value ? parseInt(e.target.value) : '')}
                                    placeholder="0"
                                    className="w-20 details-input-field text-center shadow-sm focus:shadow-md transition-shadow"
                                />
                                <span className="text-sm text-wool-600">% complete</span>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Status</label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="completed"
                                        checked={formData.completed || false}
                                        onChange={(e) => handleInputChange('completed', e.target.checked)}
                                        className="w-4 h-4 text-sage-600 border-wool-300 rounded focus:ring-sage-500"
                                    />
                                    <label htmlFor="completed" className="text-sm font-medium text-wool-700">
                                        Project is completed
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="frogged"
                                        checked={formData.frogged || false}
                                        onChange={(e) => handleInputChange('frogged', e.target.checked)}
                                        className="w-4 h-4 text-red-600 border-wool-300 rounded focus:ring-red-500"
                                    />
                                    <label htmlFor="frogged" className="text-sm font-medium text-wool-700">
                                        Project has been frogged
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-white rounded-xl p-5 border-2 border-sage-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <h3 className="section-header-primary text-sage-700">
                        📐 Technical Specifications
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Preferred Units</label>
                            <div className="bg-wool-100 border-2 border-wool-200 rounded-xl p-1">
                                <div className="grid grid-cols-2 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange('defaultUnits', 'inches')}
                                        className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 ${formData.defaultUnits === 'inches' ? 'bg-sage-500 text-white shadow-sm' : 'text-wool-600 hover:text-sage-600'}`}
                                    >
                                        🇺🇸 Inches
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange('defaultUnits', 'cm')}
                                        className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 ${formData.defaultUnits === 'cm' ? 'bg-sage-500 text-white shadow-sm' : 'text-wool-600 hover:text-sage-600'}`}
                                    >
                                        🇪🇺 Centimeters
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Construction</label>
                            <div className="bg-wool-100 border-2 border-wool-200 rounded-xl p-1">
                                <div className="grid grid-cols-2 gap-1">
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange('construction', 'flat')}
                                        className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 ${formData.construction === 'flat' ? 'bg-sage-500 text-white shadow-sm' : 'text-wool-600 hover:text-sage-600'}`}
                                    >
                                        📐 Flat
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleInputChange('construction', 'round')}
                                        className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-200 ${formData.construction === 'round' ? 'bg-sage-500 text-white shadow-sm' : 'text-wool-600 hover:text-sage-600'}`}
                                    >
                                        ⭕ Round
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Gauge</label>
                            <input
                                type="text"
                                value={formData.gauge}
                                onChange={(e) => handleInputChange('gauge', e.target.value)}
                                placeholder="e.g., 18 sts = 4 inches in stockinette"
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                            />
                        </div>
                    </div>
                </div>

                {/* Materials - Streamlined visual hierarchy */}
                <div className="bg-white rounded-xl p-5 border-2 border-yarn-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <h3 className="section-header-primary text-yarn-700">
                        🧶 Materials
                    </h3>
                    <div className="space-y-5">
                        {/* Yarn with Colors and Skeins - Cleaner hierarchy */}
                        <div>
                            <label className="form-label">Yarn</label>
                            <div className="space-y-3">
                                {formData.yarns.map((yarn, yarnIndex) => (
                                    <div key={yarnIndex} className="border border-yarn-200 rounded-lg p-4 bg-yarn-25">
                                        {/* Yarn Name - Simplified */}
                                        <div className="flex gap-3 items-start mb-3">
                                            <input
                                                type="text"
                                                value={yarn.name || ''}
                                                onChange={(e) => handleYarnChange(yarnIndex, 'name', e.target.value)}
                                                placeholder="e.g., Cascade 220 Worsted"
                                                className="flex-1 details-input-field font-medium"
                                            />
                                            {formData.yarns.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem('yarns', yarnIndex)}
                                                    className="array-remove-button"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        {/* Colors and Skeins - Cleaner nested style */}
                                        <div className="space-y-2 ml-2">
                                            {yarn.colors?.map((colorData, colorIndex) => (
                                                <div key={colorIndex} className="flex gap-2 items-center bg-white rounded-lg p-2 border border-yarn-150">
                                                    <input
                                                        type="text"
                                                        value={colorData.color || ''}
                                                        onChange={(e) => handleYarnColorChange(yarnIndex, colorIndex, 'color', e.target.value)}
                                                        placeholder="Color name"
                                                        className="flex-1 details-input-field text-sm"
                                                    />
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="text"
                                                            value={colorData.skeins || ''}
                                                            onChange={(e) => handleYarnColorChange(yarnIndex, colorIndex, 'skeins', e.target.value)}
                                                            placeholder="0"
                                                            className="w-16 details-input-field text-sm text-center"
                                                        />
                                                        <span className="text-xs text-wool-600 font-medium">skeins</span>
                                                    </div>
                                                    {yarn.colors.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeYarnColor(yarnIndex, colorIndex)}
                                                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors"
                                                        >
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addYarnColor(yarnIndex)}
                                                className="text-sm text-yarn-600 hover:text-yarn-700 font-medium bg-yarn-50 hover:bg-yarn-100 px-3 py-1 rounded-md transition-colors"
                                            >
                                                + Add Color
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('yarns')}
                                    className="array-add-button shadow-sm hover:shadow-md transition-shadow"
                                >
                                    + Add Another Yarn
                                </button>
                            </div>
                        </div>

                        {/* Needles - Simplified */}
                        <div>
                            <label className="form-label">Needles</label>
                            <div className="space-y-3">
                                {formData.needles.map((needle, index) => (
                                    <div key={index} className="flex gap-3 items-center">
                                        <input
                                            type="text"
                                            value={needle}
                                            onChange={(e) => handleArrayChange('needles', index, e.target.value)}
                                            placeholder="e.g., US 8 (5mm) circular"
                                            className="flex-1 details-input-field shadow-sm focus:shadow-md transition-shadow"
                                        />
                                        {formData.needles.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeArrayItem('needles', index)}
                                                className="array-remove-button shadow-sm hover:shadow-md transition-shadow"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => addArrayItem('needles')}
                                    className="array-add-button shadow-sm hover:shadow-md transition-shadow"
                                >
                                    + Add Another Needle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline - New section for dates */}
                <div className="bg-white rounded-xl p-5 border-2 border-sage-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <h3 className="section-header-primary text-sage-700">
                        📅 Timeline
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Started Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.startedAt || ''}
                                onChange={(e) => handleInputChange('startedAt', e.target.value)}
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                            />
                        </div>
                        {formData.completed && (
                            <div>
                                <label className="form-label">Completed Date</label>
                                <input
                                    type="date"
                                    value={formData.completedAt || ''}
                                    onChange={(e) => handleInputChange('completedAt', e.target.value)}
                                    className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes - Removed redundant label */}
                {(formData.notes || formData.notes === '') && (
                    <div className="bg-white rounded-xl p-5 border-2 border-wool-300 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <h3 className="section-header-primary text-wool-700">
                            💭 Notes
                        </h3>
                        <div>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="Special notes, modifications, deadlines, or anything else you want to remember..."
                                className="details-textarea shadow-sm focus:shadow-md transition-shadow"
                            />
                            <div className="character-count">
                                {500 - formData.notes.length} characters remaining
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Save/Cancel Footer - Clean */}
            <div className="mt-8 bg-gradient-to-r from-sage-50 to-yarn-50 border-2 border-sage-200 rounded-xl p-4 shadow-sm">
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex-1 btn-tertiary shadow-sm hover:shadow-md transition-shadow"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={!formData.name.trim()}
                        className="flex-2 btn-primary flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
                        style={{ flexGrow: 2 }}
                    >
                        <span className="text-lg">💾</span>
                        {hasUnsavedChanges ? 'Save Changes' : 'Done'}
                    </button>
                </div>
            </div>
        </div >
    );
};

export default DetailsTabEdit;