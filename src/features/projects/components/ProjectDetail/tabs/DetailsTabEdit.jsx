import React, { useState } from 'react';
import UnsavedChangesModal from '../../../../../shared/components/UnsavedChangesModal';

/**
 * DetailsTabEdit - Complete Group 3 + Small Edits: Visual Polish & Final Improvements
 * 
 * Changes:
 * - Wizard-inspired light backgrounds for visual polish
 * - Status as prominent radio buttons (completed/frogged only)
 * - Smart timeline with conditional date fields
 * - Fixed date field styling (height, alignment, width)
 * - Cleaned priority selector (removed Someday)
 * - Standard save/cancel footer (no gradient)
 * - Comprehensive visual consistency
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

    // Enhanced save with data transformation and auto-date logic
    const handleSave = () => {
        if (!formData.name.trim()) return;

        const transformedData = {
            ...formData,
            // Auto-set completion date if completed is newly checked
            completedAt: formData.completed && !formData.completedAt ?
                new Date().toISOString().split('T')[0] : formData.completedAt,
            // Auto-set started date from creation if not set
            startedAt: formData.startedAt || project?.createdAt?.split('T')[0],
            // Keep enhanced yarn format but clean up empty entries
            yarns: formData.yarns.filter(yarn => yarn.name && yarn.name.trim() !== ''),
            // Clean up empty needle items
            needles: formData.needles.filter(needle => needle.trim() !== '')
        };

        onSave(transformedData);
    };

    // Handle status changes with smart date setting
    const handleStatusChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // If marking as completed, clear frogged
            if (field === 'completed' && value) {
                newData.frogged = false;
                if (!newData.completedAt) {
                    newData.completedAt = new Date().toISOString().split('T')[0];
                }
            }

            // If marking as frogged, clear completed
            if (field === 'frogged' && value) {
                newData.completed = false;
                newData.completedAt = '';
            }

            return newData;
        });
    };

    const handleCancel = () => {
        onCancel();
    };

    // Initialize defaults
    React.useEffect(() => {
        if (!formData.construction) {
            handleInputChange('construction', 'flat');
        }
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
            {/* Page Header - Clean, no gradient */}
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

            {/* Content Sections - With wizard-inspired backgrounds */}
            <div className="space-y-4">
                {/* Project Status - Prominent, compact section */}
                <div className="bg-gradient-to-r from-sage-50 to-yarn-50 border-l-4 border-sage-300 rounded-xl p-4 shadow-sm">
                    <h3 className="section-header-primary text-sage-700">
                        🎯 Project Status
                    </h3>
                    <div className="flex gap-6">
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                id="completed"
                                name="status"
                                checked={formData.completed || false}
                                onChange={(e) => handleStatusChange('completed', e.target.checked)}
                                className="w-4 h-4 text-sage-600 border-wool-300 focus:ring-sage-500"
                            />
                            <label htmlFor="completed" className="text-sm font-medium text-wool-700">
                                🎉 Completed
                            </label>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="radio"
                                id="frogged"
                                name="status"
                                checked={formData.frogged || false}
                                onChange={(e) => handleStatusChange('frogged', e.target.checked)}
                                className="w-4 h-4 text-red-600 border-wool-300 focus:ring-red-500"
                            />
                            <label htmlFor="frogged" className="text-sm font-medium text-wool-700">
                                🐸 Frogged
                            </label>
                        </div>
                    </div>
                </div>

                {/* Pattern Identity */}
                <div className="bg-gradient-to-r from-wool-50 to-sage-50 border-l-4 border-wool-300 rounded-xl p-5 shadow-sm">
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

                {/* Project Context */}
                <div className="bg-gradient-to-r from-lavender-50 to-sage-50 border-l-4 border-lavender-300 rounded-xl p-5 shadow-sm">
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
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow text-left"
                                style={{ textAlign: 'left' }}
                            />
                        </div>
                        <div>
                            <label className="form-label">Priority</label>
                            <div className="bg-wool-100 border-2 border-wool-200 rounded-xl p-1">
                                <div className="grid grid-cols-3 gap-1">
                                    {['high', 'normal', 'low'].map((priority) => (
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

                {/* Physical Specs */}
                <div className="bg-gradient-to-r from-yarn-50 to-wool-50 border-l-4 border-yarn-300 rounded-xl p-5 shadow-sm">
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
                    </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-gradient-to-r from-sage-50 to-lavender-50 border-l-4 border-sage-300 rounded-xl p-5 shadow-sm">
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

                {/* Materials */}
                <div className="bg-gradient-to-r from-yarn-50 to-wool-50 border-l-4 border-yarn-300 rounded-xl p-5 shadow-sm">
                    <h3 className="section-header-primary text-yarn-700">
                        🧶 Materials
                    </h3>
                    <div className="space-y-5">
                        {/* Yarn with Colors and Skeins */}
                        <div>
                            <label className="form-label">Yarn</label>
                            <div className="space-y-3">
                                {formData.yarns.map((yarn, yarnIndex) => (
                                    <div key={yarnIndex} className="border border-yarn-200 rounded-lg p-4 bg-yarn-25">
                                        {/* Yarn Name */}
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

                                        {/* Colors and Skeins */}
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

                        {/* Needles */}
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

                {/* Timeline - Smart conditional dates */}
                {(formData.completed || formData.frogged) && (
                    <div className="bg-gradient-to-r from-sage-50 to-lavender-50 border-l-4 border-sage-300 rounded-xl p-5 shadow-sm">
                        <h3 className="section-header-primary text-sage-700">
                            📅 Timeline
                        </h3>
                        <div className="space-y-4">
                            {formData.completed && (
                                <div>
                                    <label className="form-label">Completed</label>
                                    <input
                                        type="date"
                                        value={formData.completedAt || ''}
                                        onChange={(e) => handleInputChange('completedAt', e.target.value)}
                                        className="details-input-field shadow-sm focus:shadow-md transition-shadow text-left"
                                        style={{ textAlign: 'left' }}
                                    />
                                </div>
                            )}
                            {formData.frogged && (
                                <div>
                                    <label className="form-label">Frogged</label>
                                    <input
                                        type="date"
                                        value={formData.froggedAt || ''}
                                        onChange={(e) => handleInputChange('froggedAt', e.target.value)}
                                        className="details-input-field shadow-sm focus:shadow-md transition-shadow text-left"
                                        style={{ textAlign: 'left' }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {(formData.notes || formData.notes === '') && (
                    <div className="bg-gradient-to-r from-wool-50 to-yarn-50 border-l-4 border-wool-400 rounded-xl p-5 shadow-sm">
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

            {/* Save/Cancel Footer - Clean, standard styling */}
            <div className="mt-8 flex gap-3">
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
        </div >
    );
};

export default DetailsTabEdit;