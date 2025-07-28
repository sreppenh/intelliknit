import React from 'react';
import { getSmartProjectStatus } from '../../../../../shared/utils/projectStatus';

/**
 * DetailsTabEditSections - All UI sections extracted from actual DetailsTabEdit.jsx
 * 
 * Extracted exactly from your working code - zero visual/functionality changes.
 */

export const ProjectStatusSection = ({ formData, handleStatusChange, project }) => {
    const autoStatus = getSmartProjectStatus(project);

    // Determine current selection
    const getCurrentStatus = () => {
        if (formData.completed) return 'completed';
        if (formData.frogged) return 'frogged';
        return 'auto';
    };

    const handleStatusSelect = (value) => {
        switch (value) {
            case 'completed':
                handleStatusChange('completed', true);
                handleStatusChange('frogged', false);
                break;
            case 'frogged':
                handleStatusChange('frogged', true);
                handleStatusChange('completed', false);
                break;
            case 'auto':
                handleStatusChange('completed', false);
                handleStatusChange('frogged', false);
                break;
        }
    };

    return (
        <div className="bg-gradient-to-r from-sage-50 to-yarn-50 border-l-4 border-sage-300 rounded-xl p-4 shadow-sm">
            <h3 className="section-header-secondary text-sage-700">
                🎯 Project Status
            </h3>

            <select
                value={getCurrentStatus()}
                onChange={(e) => handleStatusSelect(e.target.value)}
                className="w-full bg-white border-2 border-wool-200 rounded-lg px-4 py-3 text-base font-medium focus:border-sage-500 focus:ring-2 focus:ring-sage-300 focus:ring-opacity-50 transition-colors"
            >
                <option value="auto">{autoStatus.emoji} {autoStatus.text}</option>
                <option value="completed">🎉 Completed</option>
                <option value="frogged">🐸 Frogged</option>
            </select>
        </div>
    );
};

export const PatternIdentitySection = ({ formData, handleInputChange }) => (
    <div className="bg-gradient-to-r from-wool-50 to-sage-50 border-l-4 border-wool-300 rounded-xl p-5 shadow-sm">
        <h3 className="section-header-secondary">
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
);

export const ProjectContextSection = ({ formData, handleInputChange }) => (
    <div className="bg-gradient-to-r from-lavender-50 to-sage-50 border-l-4 border-lavender-300 rounded-xl p-5 shadow-sm">
        <h3 className="section-header-secondary text-lavender-700">
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
                <label className="form-label">Deadline <span className="text-xs text-wool-500">(MM/DD/YYYY)</span></label>
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
);

export const PhysicalSpecsSection = ({ formData, handleInputChange }) => (
    <div className="bg-gradient-to-r from-yarn-50 to-wool-50 border-l-4 border-yarn-300 rounded-xl p-5 shadow-sm">
        <h3 className="section-header-secondary text-yarn-700">
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
                        inputMode="numeric"
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
);

export const MaterialsSection = ({
    formData,
    handleYarnChange,
    handleYarnColorChange,
    addYarnColor,
    removeYarnColor,
    handleArrayChange,
    handleNeedleChange,
    addArrayItem,
    removeArrayItem
}) => (
    <div className="bg-gradient-to-r from-yarn-50 to-wool-50 border-l-4 border-yarn-300 rounded-xl p-5 shadow-sm">
        <h3 className="section-header-secondary text-yarn-700">
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
                                        className="remove-button-lg"
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
                                                type="number"
                                                inputMode="numeric"
                                                min="0"
                                                step="0.5"
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
                                                className="array-remove-button"
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
                        className="add-button"
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
                        <div key={index} className="border border-yarn-200 rounded-lg p-4 bg-yarn-25">
                            <div className="space-y-3">
                                <div className="flex gap-3 items-start">
                                    <div className="flex-1">
                                        <select
                                            value={needle.size || ''}
                                            onChange={(e) => handleNeedleChange(index, 'size', e.target.value)}
                                            className="w-full details-input-field text-sm"
                                        >
                                            <option value="">Select size...</option>
                                            <option value="US 0 (2.0mm)">US 0 (2.0mm)</option>
                                            <option value="US 1 (2.25mm)">US 1 (2.25mm)</option>
                                            <option value="US 2 (2.75mm)">US 2 (2.75mm)</option>
                                            <option value="US 3 (3.25mm)">US 3 (3.25mm)</option>
                                            <option value="US 4 (3.5mm)">US 4 (3.5mm)</option>
                                            <option value="US 5 (3.75mm)">US 5 (3.75mm)</option>
                                            <option value="US 6 (4.0mm)">US 6 (4.0mm)</option>
                                            <option value="US 7 (4.5mm)">US 7 (4.5mm)</option>
                                            <option value="US 8 (5.0mm)">US 8 (5.0mm)</option>
                                            <option value="US 9 (5.5mm)">US 9 (5.5mm)</option>
                                            <option value="US 10 (6.0mm)">US 10 (6.0mm)</option>
                                            <option value="US 10.5 (6.5mm)">US 10.5 (6.5mm)</option>
                                            <option value="US 11 (8.0mm)">US 11 (8.0mm)</option>
                                            <option value="US 13 (9.0mm)">US 13 (9.0mm)</option>
                                            <option value="US 15 (10.0mm)">US 15 (10.0mm)</option>
                                            <option value="US 17 (12.0mm)">US 17 (12.0mm)</option>
                                            <option value="US 19 (15.0mm)">US 19 (15.0mm)</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <select
                                            value={needle.type || 'circular'}
                                            onChange={(e) => handleNeedleChange(index, 'type', e.target.value)}
                                            className="w-full details-input-field text-sm"
                                        >
                                            <option value="circular">Circular</option>
                                            <option value="straight">Straight</option>
                                            <option value="dpn">Double Pointed</option>
                                        </select>
                                    </div>
                                    {formData.needles.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayItem('needles', index)}
                                            className="remove-button-lg"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                            </div>

                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addArrayItem('needles')}
                        className="add-button"
                    >
                        + Add Another Needle
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export const TechnicalSpecsSection = ({ formData, handleInputChange, handleGaugeChange, handleGaugeMeasurementChange }) => (
    <div className="bg-gradient-to-r from-sage-50 to-lavender-50 border-l-4 border-sage-300 rounded-xl p-5 shadow-sm">
        <h3 className="section-header-secondary text-sage-700">
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
            {/* Structured Gauge */}
            <div>
                <label className="form-label">Gauge</label>
                <div className="space-y-4 bg-wool-50 border border-wool-200 rounded-lg p-4">
                    {/* Pattern */}
                    <div>
                        <label className="text-xs font-medium text-wool-600 mb-1 block text-left">Pattern</label>
                        <select
                            value={formData.gauge?.pattern || 'stockinette'}
                            onChange={(e) => handleGaugeChange('pattern', e.target.value)}
                            className="w-full details-input-field text-sm"
                        >
                            <option value="stockinette">Stockinette</option>
                            <option value="ribbing">Ribbing</option>
                            <option value="seed">Seed Stitch</option>
                            <option value="garter">Garter</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    {/* Gauge Notes - Always visible */}
                    <div>
                        <label className="text-xs font-medium text-wool-600 mb-1 block text-left">Gauge Notes</label>
                        <input
                            type="text"
                            value={formData.gauge?.customPattern || formData.gauge?.blockingNotes || ''}
                            onChange={(e) => handleGaugeChange('gaugeNotes', e.target.value)}
                            placeholder="e.g., after wet blocking, custom stitch pattern details..."
                            className="w-full details-input-field text-sm"
                        />
                    </div>

                    {/* Needle Used */}
                    <div>
                        <label className="text-xs font-medium text-wool-600 mb-1 block text-left">Needle Used</label>
                        <select
                            value={formData.gauge?.needleIndex || 0}
                            onChange={(e) => handleGaugeChange('needleIndex', parseInt(e.target.value))}
                            className="w-full details-input-field text-sm"
                        >
                            {formData.needles.map((needle, index) => (
                                <option key={index} value={index}>
                                    {typeof needle === 'string'
                                        ? needle
                                        : `${needle.size || 'Unknown'} ${needle.type || ''}`
                                    }
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Stitch Gauge */}
                    <div>
                        <label className="text-xs font-medium text-wool-600 mb-1 block text-left">Stitch Gauge</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                inputMode="numeric"
                                value={formData.gauge?.stitchGauge?.stitches || ''}
                                onChange={(e) => handleGaugeMeasurementChange('stitchGauge', 'stitches', e.target.value)}
                                placeholder="18"
                                className="w-20 details-input-field text-sm text-center"
                            />
                            <span className="text-sm text-wool-600">sts =</span>
                            <input
                                type="number"
                                inputMode="numeric"
                                step="0.1"
                                value={formData.gauge?.stitchGauge?.measurement || ''}
                                onChange={(e) => handleGaugeMeasurementChange('stitchGauge', 'measurement', e.target.value)}
                                placeholder="4"
                                className="w-20 details-input-field text-sm text-center"
                            />
                            <span className="text-sm text-wool-600">{formData.defaultUnits}</span>
                        </div>
                    </div>

                    {/* Row Gauge */}
                    <div>
                        <label className="text-xs font-medium text-wool-600 mb-1 block text-left">Row Gauge</label>
                        <div className="flex gap-2 items-center">
                            <input
                                type="number"
                                inputMode="numeric"
                                value={formData.gauge?.rowGauge?.rows || ''}
                                onChange={(e) => handleGaugeMeasurementChange('rowGauge', 'rows', e.target.value)}
                                placeholder="24"
                                className="w-20 details-input-field text-sm text-center"
                            />
                            <span className="text-sm text-wool-600">rows =</span>
                            <input
                                type="number"
                                inputMode="numeric"
                                step="0.1"
                                value={formData.gauge?.rowGauge?.measurement || ''}
                                onChange={(e) => handleGaugeMeasurementChange('rowGauge', 'measurement', e.target.value)}
                                placeholder="4"
                                className="w-20 details-input-field text-sm text-center"
                            />
                            <span className="text-sm text-wool-600">{formData.defaultUnits}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const TimelineSection = ({ formData, handleInputChange }) => {
    // Only render if project is completed or frogged
    if (!formData.completed && !formData.frogged) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-sage-50 to-lavender-50 border-l-4 border-sage-300 rounded-xl p-5 shadow-sm">
            <h3 className="section-header-secondary text-sage-700">
                📅 Timeline
            </h3>
            <div className="space-y-4">
                {formData.completed && (
                    <div>
                        <label className="form-label">Completed <span className="text-xs text-wool-500">(MM/DD/YYYY)</span></label>
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
                        <label className="form-label">Frogged <span className="text-xs text-wool-500">(MM/DD/YYYY)</span></label>
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
    );
};

export const NotesSection = ({ formData, handleInputChange }) => {
    // Only render if notes field exists (even if empty)
    if (!(formData.notes || formData.notes === '')) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-wool-50 to-yarn-50 border-l-4 border-wool-400 rounded-xl p-5 shadow-sm">
            <h3 className="section-header-secondary text-wool-700">
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
    );
};