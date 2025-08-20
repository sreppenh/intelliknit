// src/features/steps/components/pattern-configs/CustomActionEditor.jsx
import React, { useState } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';

/**
 * CustomActionEditor - Ultra-compact custom action editor
 * 
 * Feels like part of the keyboard, not a separate screen
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
        <div className="space-y-3">
            {/* Minimal Header */}
            <div className="text-left">
                <div className="text-sm font-medium text-wool-700">
                    {editingAction ? 'Edit' : 'Create'} Custom Action
                </div>
                <div className="text-xs text-wool-500">
                    {patternType === 'Lace Pattern' ? 'Lace' :
                        patternType === 'Cable Pattern' ? 'Cable' : 'General'} pattern
                </div>
            </div>

            {/* Name Input */}
            <div>
                <label className="block text-sm font-medium text-wool-700 mb-1">
                    Name
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
                    className="w-full px-3 py-2 border-2 border-wool-300 rounded-lg text-sm focus:border-yarn-500 focus:outline-none"
                    autoFocus
                />
                <div className="text-xs text-wool-500 mt-1">8 characters max</div>
            </div>

            {/* Stitches Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium text-wool-700 mb-1">
                        Consumes
                    </label>
                    <IncrementInput
                        value={formData.consumed}
                        onChange={(value) => setFormData(prev => ({
                            ...prev,
                            consumed: value
                        }))}
                        min={0}
                        max={10}
                        unit="sts"
                        size="sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-wool-700 mb-1">
                        Produces
                    </label>
                    <IncrementInput
                        value={formData.stitches}
                        onChange={(value) => setFormData(prev => ({
                            ...prev,
                            stitches: value
                        }))}
                        min={0}
                        max={10}
                        unit="sts"
                        size="sm"
                    />
                </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                    onClick={handleCancel}
                    className="h-10 bg-wool-100 text-wool-700 rounded-lg text-sm font-medium hover:bg-wool-200 border border-wool-200"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!formData.name.trim()}
                    className={`h-10 rounded-lg text-sm font-medium ${formData.name.trim()
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