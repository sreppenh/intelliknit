// src/features/steps/components/pattern-configs/CustomActionEditor.jsx
import React, { useState } from 'react';
import IncrementInput from '../../../../../shared/components/IncrementInput';

/**
 * CustomActionEditor - Simple, clean layout matching IntelliKnit design
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

        const trimmedAction = formData.name.trim().substring(0, 6);
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
        <div className="bg-yarn-50 border border-yarn-200 rounded-lg p-4 space-y-4">
            {/* Small header - left aligned */}
            <div className="text-sm text-yarn-700">
                {editingAction ? 'Edit' : 'Create'} Custom Action
            </div>

            {/* Action Name */}
            <div>
                <label className="form-label">Action Name:</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        name: e.target.value.substring(0, 6)
                    }))}
                    maxLength={6}
                    placeholder="e.g., Bobble"
                    className="input-field"
                    autoFocus
                />
            </div>

            {/* Stitches Consumed */}
            <div>
                <label className="form-label">Stitches Consumed:</label>
                <IncrementInput
                    value={formData.consumed}
                    onChange={(value) => setFormData(prev => ({
                        ...prev,
                        consumed: value
                    }))}
                    min={0}
                    max={10}
                    label="consumed"
                    construction="flat"
                />
            </div>

            {/* Stitches Produced */}
            <div>
                <label className="form-label">Stitches Produced:</label>
                <IncrementInput
                    value={formData.stitches}
                    onChange={(value) => setFormData(prev => ({
                        ...prev,
                        stitches: value
                    }))}
                    min={0}
                    max={10}
                    label="produced"
                    construction="flat"
                />
            </div>

            {/* Buttons using proper CSS classes */}
            <div className="flex gap-3">
                <button
                    onClick={handleCancel}
                    className="flex-1 btn-tertiary"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!formData.name.trim()}
                    className="flex-1 btn-primary"
                >
                    {editingAction ? 'Save' : 'Create'}
                </button>
            </div>
        </div>
    );
};

export default CustomActionEditor;