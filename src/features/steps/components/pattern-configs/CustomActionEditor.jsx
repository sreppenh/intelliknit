// src/features/steps/components/pattern-configs/CustomActionEditor.jsx
import React, { useState } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';

/**
 * CustomActionEditor - Compact custom action creation/editing interface
 * 
 * Designed to fit naturally within the PatternInputContainer space
 * without feeling like a separate screen
 */
const CustomActionEditor = ({
    patternType,
    currentProject,
    updateProject,
    editingAction = null,
    editingIndex = null,
    onSave,
    onCancel
}) => {

    // Form state
    const [formData, setFormData] = useState({
        name: editingAction?.name || '',
        consumed: editingAction?.consumed || 1,
        stitches: editingAction?.stitches || 1
    });

    // Get pattern key for storage
    const getPatternKey = () => {
        return patternType === 'Lace Pattern' ? 'lace' :
            patternType === 'Cable Pattern' ? 'cable' : 'general';
    };

    // Handle save
    const handleSave = () => {
        if (!formData.name.trim()) {
            alert('Please enter a name for the custom action');
            return;
        }

        const trimmedAction = formData.name.trim().substring(0, 8);
        const customActionData = {
            name: trimmedAction,
            consumed: formData.consumed,
            stitches: formData.stitches
        };

        const key = getPatternKey();
        const currentCustomActions = currentProject?.customKeyboardActions || {};
        const patternActions = [...(currentCustomActions[key] || [])];

        // Ensure we have 4 slots
        while (patternActions.length < 4) {
            patternActions.push('Custom');
        }

        // Update the specific slot
        patternActions[editingIndex] = customActionData;

        const updatedCustomActions = {
            ...currentCustomActions,
            [key]: patternActions
        };

        updateProject({ customKeyboardActions: updatedCustomActions });
        onSave(); // Return to keyboard mode
    };

    // Handle cancel
    const handleCancel = () => {
        onCancel(); // Return to keyboard mode
    };

    return (
        <div className="space-y-4">
            {/* Compact Header */}
            <div>
                <h4 className="text-base font-semibold text-wool-700">
                    {editingAction ? 'Edit Custom Action' : 'Create Custom Action'}
                </h4>
                <p className="text-xs text-wool-500">
                    {patternType === 'Lace Pattern' ? 'Lace' :
                        patternType === 'Cable Pattern' ? 'Cable' : 'General'} pattern stitch
                </p>
            </div>

            {/* Compact Form */}
            <div className="space-y-3">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-wool-700 mb-1">
                        Action Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            name: e.target.value.substring(0, 8)
                        }))}
                        maxLength={8}
                        placeholder="e.g., Bobble"
                        className="w-full px-3 py-2 border-2 border-wool-300 rounded-lg text-sm focus:border-yarn-500 focus:outline-none transition-colors"
                        autoFocus
                    />
                    <p className="text-xs text-wool-500 mt-1">Maximum 8 characters for button display</p>
                </div>

                {/* Consumed & Produced in a grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-wool-700 mb-1">
                            Stitches Consumed
                        </label>
                        <IncrementInput
                            value={formData.consumed}
                            onChange={(value) => setFormData(prev => ({
                                ...prev,
                                consumed: value
                            }))}
                            min={0}
                            max={10}
                            unit="stitches"
                            size="sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-wool-700 mb-1">
                            Stitches Produced
                        </label>
                        <IncrementInput
                            value={formData.stitches}
                            onChange={(value) => setFormData(prev => ({
                                ...prev,
                                stitches: value
                            }))}
                            min={0}
                            max={10}
                            unit="stitches"
                            size="sm"
                        />
                    </div>
                </div>
            </div>

            {/* Compact Net Effect */}
            {formData.consumed !== formData.stitches && (
                <div className="bg-sage-50 border border-sage-200 rounded-lg p-2 text-center">
                    <span className="text-xs text-sage-700">
                        Net:
                        <span className={`font-bold ml-1 ${formData.stitches > formData.consumed ? 'text-green-600' : 'text-red-600'
                            }`}>
                            {formData.stitches > formData.consumed ? '+' : ''}
                            {formData.stitches - formData.consumed} stitches
                        </span>
                    </span>
                </div>
            )}

            {/* Compact Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={handleCancel}
                    className="h-9 bg-wool-100 text-wool-700 rounded-lg text-sm font-medium hover:bg-wool-200 border border-wool-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!formData.name.trim()}
                    className={`h-9 rounded-lg text-sm font-medium transition-colors ${formData.name.trim()
                            ? 'bg-sage-500 text-white hover:bg-sage-600'
                            : 'bg-wool-300 text-wool-500 cursor-not-allowed'
                        }`}
                >
                    {editingAction ? 'Save' : 'Create'}
                </button>
            </div>
        </div>
    );
};

export default CustomActionEditor;