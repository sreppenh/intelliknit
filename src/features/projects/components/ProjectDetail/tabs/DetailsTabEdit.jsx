import React, { useState } from 'react';
import UnsavedChangesModal from '../../../../../shared/components/UnsavedChangesModal';

/**
 * DetailsTabEdit - Streamlined edit mode for project details
 * 
 * Features:
 * - Compact layout matching read view
 * - Enhanced yarn management with color field
 * - Construction selector (flat/round)
 * - Minimal containers, clean gestalt
 * - Refined visual polish
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
            {/* Edit Mode Header - Clean without unsaved message */}
            <div className="mb-6">
                <div className="bg-gradient-to-r from-sage-50 to-yarn-50 border-2 border-sage-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-sage-500 rounded-lg flex items-center justify-center text-white text-lg shadow-sm">
                                ✏️
                            </div>
                            <h2 className="text-xl font-semibold text-sage-800 leading-tight">
                                Edit Details
                            </h2>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            <button
                                onClick={handleCancel}
                                className="btn-tertiary btn-sm shadow-sm hover:shadow-md transition-shadow"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!formData.name.trim()}
                                className="btn-primary btn-sm shadow-sm hover:shadow-md transition-shadow"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections - Clean like read view */}
            <div className="space-y-4">
                {/* Project Identity */}
                <div className="bg-white rounded-xl p-5 border-2 border-wool-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-wool-500 rounded-md flex items-center justify-center text-white text-sm shadow-sm">
                            📋
                        </div>
                        <h3 className="text-sm font-semibold text-wool-700 uppercase tracking-wide">Project Identity</h3>
                    </div>
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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Pattern Source</label>
                                <input
                                    type="text"
                                    value={formData.source}
                                    onChange={(e) => handleInputChange('source', e.target.value)}
                                    placeholder="e.g., Ravelry, book"
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
                </div>

                {/* Project Details */}
                <div className="bg-white rounded-xl p-5 border-2 border-lavender-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-lavender-500 rounded-md flex items-center justify-center text-white text-sm shadow-sm">
                            👤
                        </div>
                        <h3 className="text-sm font-semibold text-lavender-700 uppercase tracking-wide">Project Details</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Recipient</label>
                            <input
                                type="text"
                                value={formData.recipient}
                                onChange={(e) => handleInputChange('recipient', e.target.value)}
                                placeholder="e.g., Mom, Myself"
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                            />
                        </div>
                        <div>
                            <label className="form-label">Size</label>
                            <input
                                type="text"
                                value={formData.size}
                                onChange={(e) => handleInputChange('size', e.target.value)}
                                placeholder="e.g., Medium, 36 inches"
                                className="details-input-field shadow-sm focus:shadow-md transition-shadow"
                            />
                        </div>
                    </div>
                </div>

                {/* Project Settings */}
                <div className="bg-white rounded-xl p-5 border-2 border-sage-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-sage-500 rounded-md flex items-center justify-center text-white text-sm shadow-sm">
                            ⚙️
                        </div>
                        <h3 className="text-sm font-semibold text-sage-700 uppercase tracking-wide">Project Settings</h3>
                    </div>
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
                    </div>
                </div>

                {/* Materials */}
                <div className="bg-white rounded-xl p-5 border-2 border-yarn-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-yarn-500 rounded-md flex items-center justify-center text-white text-sm shadow-sm">
                            🧶
                        </div>
                        <h3 className="text-sm font-semibold text-yarn-700 uppercase tracking-wide">Materials</h3>
                    </div>
                    <div className="space-y-5">
                        {/* Yarn with Colors and Skeins */}
                        <div>
                            <label className="form-label">Yarn</label>
                            <div className="space-y-4">
                                {formData.yarns.map((yarn, yarnIndex) => (
                                    <div key={yarnIndex} className="bg-yarn-50 border-2 border-yarn-200 rounded-lg p-4 shadow-sm">
                                        {/* Yarn Name */}
                                        <div className="flex gap-3 items-start mb-3">
                                            <input
                                                type="text"
                                                value={yarn.name || ''}
                                                onChange={(e) => handleYarnChange(yarnIndex, 'name', e.target.value)}
                                                placeholder="e.g., Cascade 220 Worsted"
                                                className="flex-1 details-input-field font-medium shadow-sm focus:shadow-md transition-shadow"
                                            />
                                            {formData.yarns.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem('yarns', yarnIndex)}
                                                    className="array-remove-button shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>

                                        {/* Colors and Skeins */}
                                        <div className="space-y-2 ml-3">
                                            {yarn.colors?.map((colorData, colorIndex) => (
                                                <div key={colorIndex} className="flex gap-2 items-center bg-white rounded-lg p-2 shadow-sm">
                                                    <input
                                                        type="text"
                                                        value={colorData.color || ''}
                                                        onChange={(e) => handleYarnColorChange(yarnIndex, colorIndex, 'color', e.target.value)}
                                                        placeholder="Color name"
                                                        className="flex-1 details-input-field"
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
                                                className="text-sm text-yarn-600 hover:text-yarn-700 font-medium bg-yarn-100 hover:bg-yarn-200 px-3 py-1 rounded-md transition-colors"
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
                                    <div key={index} className="flex gap-3 items-center bg-yarn-50 rounded-lg p-3 shadow-sm">
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

                        {/* Gauge */}
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

                {/* Notes */}
                {(formData.notes || formData.notes === '') && (
                    <div className="bg-white rounded-xl p-5 border-2 border-wool-300 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-6 h-6 bg-wool-500 rounded-md flex items-center justify-center text-white text-sm shadow-sm">
                                💭
                            </div>
                            <h3 className="text-sm font-semibold text-wool-700 uppercase tracking-wide">Notes</h3>
                        </div>
                        <div>
                            <label className="form-label">Project Notes</label>
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


        </div>
    );
};

export default DetailsTabEdit;