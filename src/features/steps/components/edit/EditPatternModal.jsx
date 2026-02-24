// src/features/steps/components/EditPatternModal.jsx
import React, { useState, useEffect } from 'react';
import { PATTERN_CATEGORIES } from '../../../../shared/utils/PatternCategories';
import { requiresAdvancedPatternEdit, getPatternConfigurationTips } from '../../../../shared/utils/stepDisplayUtils';
import { StandardModal } from '../../../../shared/components/modals/StandardModal';

const EditPatternModal = ({
    isOpen,
    onClose,
    onSave,
    currentStep,
    title = "Edit Pattern",
    onRouteToAdvancedEdit,
}) => {
    const [patternData, setPatternData] = useState({
        category: '',
        pattern: '',
        customText: '',
        rowsInPattern: '',
        method: '',
        colorworkType: ''
    });
    const [selectedQuickCategory, setSelectedQuickCategory] = useState(null);

    // Initialize pattern data from current step
    useEffect(() => {
        if (isOpen && currentStep?.wizardConfig?.stitchPattern) {
            const stepPattern = currentStep.wizardConfig.stitchPattern;
            setPatternData({
                category: stepPattern.category || '',
                pattern: stepPattern.pattern || '',
                customText: stepPattern.customText || '',
                rowsInPattern: stepPattern.rowsInPattern || '',
                method: stepPattern.method || '',
                colorworkType: stepPattern.colorworkType || ''
            });

            // Set drawer state for basic patterns
            if (stepPattern.category && PATTERN_CATEGORIES[stepPattern.category]?.type === 'quick') {
                setSelectedQuickCategory(stepPattern.category);
            }
        }
    }, [isOpen, currentStep]);

    // Check if this is an advanced pattern that needs full-screen editing
    const shouldRouteToAdvancedEdit = currentStep ? requiresAdvancedPatternEdit(currentStep) : false;

    // Route to advanced edit if needed
    useEffect(() => {
        if (isOpen && shouldRouteToAdvancedEdit && onRouteToAdvancedEdit) {
            onClose();
            onRouteToAdvancedEdit();
        }
    }, [isOpen, shouldRouteToAdvancedEdit, onRouteToAdvancedEdit, onClose]);

    const updatePatternData = (updates) => {
        setPatternData(prev => ({ ...prev, ...updates }));
    };

    const handleQuickCategorySelect = (categoryKey) => {
        setSelectedQuickCategory(selectedQuickCategory === categoryKey ? null : categoryKey);
    };

    const handleBasicPatternSelect = (categoryKey, pattern) => {
        updatePatternData({
            category: categoryKey,
            pattern: pattern.name,
            customText: '',
            rowsInPattern: '',
            method: '',
            colorworkType: ''
        });
    };

    // Route to Pattern Builder — close modal first, then navigate
    const handleSwitchToPatternBuilder = () => {
        onClose();
        onRouteToAdvancedEdit?.();
    };

    const handleSave = () => {
        onSave(patternData);
        onClose();
    };

    const isBasicPattern = () => {
        return patternData.category && PATTERN_CATEGORIES[patternData.category]?.type === 'quick';
    };

    const isAdvancedPattern = () => {
        return patternData.category && PATTERN_CATEGORIES[patternData.category]?.type === 'advanced';
    };

    const canSave = () => {
        if (isBasicPattern()) {
            return patternData.category && patternData.pattern;
        }

        if (isAdvancedPattern()) {
            const { pattern, customText, rowsInPattern, colorworkType } = patternData;

            if (pattern === 'Custom pattern') {
                return customText && customText.trim() !== '';
            }

            if (pattern === 'Colorwork') {
                return colorworkType &&
                    customText && customText.trim() !== '' &&
                    rowsInPattern && parseInt(rowsInPattern) > 0;
            }

            if (['Lace Pattern', 'Cable Pattern'].includes(pattern)) {
                return customText && customText.trim() !== '' &&
                    rowsInPattern && parseInt(rowsInPattern) > 0;
            }

            return true;
        }

        return false;
    };

    const configurationTips = getPatternConfigurationTips(patternData.pattern);

    if (shouldRouteToAdvancedEdit) {
        return null;
    }

    return (
        <StandardModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleSave}
            category="complex"
            colorScheme="sage"
            title={`🧶 ${title}`}
            subtitle="Update your pattern settings"
            showButtons={false}
            modalOptions={{ maxHeight: '90vh', overflow: 'auto' }}
        >
            <div className="space-y-5">
                {/* Case 1: Basic Pattern Editing */}
                {isBasicPattern() && (
                    <div className="space-y-4">
                        {/* Category + pattern drill-down — unchanged */}
                        <div className="bg-white rounded-2xl border-2 border-wool-200 shadow-sm p-4">
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {Object.entries(PATTERN_CATEGORIES)
                                    .filter(([_, category]) => category.type === 'quick')
                                    .map(([key, category]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleQuickCategorySelect(key)}
                                            className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${selectedQuickCategory === key
                                                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                                : 'border-wool-200 bg-sage-50 text-wool-700 hover:border-sage-300 hover:bg-sage-100 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="text-xl mb-1">{category.icon}</div>
                                            <div className="text-xs font-medium">{category.name}</div>
                                        </button>
                                    ))}
                            </div>

                            {selectedQuickCategory && (
                                <div className="border-t border-wool-200 pt-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        {PATTERN_CATEGORIES[selectedQuickCategory].patterns.map(pattern => (
                                            <button
                                                key={pattern.name}
                                                onClick={() => handleBasicPatternSelect(selectedQuickCategory, pattern)}
                                                className={`card-selectable ${patternData.pattern === pattern.name
                                                    ? 'card-selectable-selected'
                                                    : ''
                                                    }`}
                                            >
                                                <div className="text-lg mb-1">{pattern.icon}</div>
                                                <div className="text-xs font-medium mb-0.5">{pattern.name}</div>
                                                <div className="text-xs opacity-70">{pattern.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── NEW: Pattern Builder escape hatch ── */}
                        {onRouteToAdvancedEdit && (
                            <button
                                onClick={handleSwitchToPatternBuilder}
                                className="w-full p-3 rounded-xl border-2 border-yarn-300 bg-yarn-50 hover:border-yarn-400 hover:bg-yarn-100 transition-all duration-200 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-xl flex-shrink-0">🔨</div>
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-wool-800">
                                            Switch to Pattern Builder
                                        </div>
                                        <div className="text-xs text-wool-500">
                                            Build a custom row-by-row pattern instead
                                        </div>
                                    </div>
                                    <div className="text-wool-400 text-sm">→</div>
                                </div>
                            </button>
                        )}
                    </div>
                )}

                {/* Case 2: Advanced Pattern Configuration — unchanged */}
                {isAdvancedPattern() && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-wool-700 mb-1">Configure {patternData.pattern}</h3>
                            <p className="text-sm text-wool-500">Update the details for your {patternData.pattern.toLowerCase()}</p>
                        </div>

                        {patternData.pattern === 'Colorwork' && (
                            <>
                                <div>
                                    <label className="form-label">
                                        Colorwork Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { name: 'Fair Isle', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', desc: 'Traditional stranded colorwork' },
                                            { name: 'Intarsia', icon: '🎨', desc: 'Large color blocks' },
                                            { name: 'Stripes', icon: '🌈', desc: 'Horizontal color bands' }
                                        ].map(type => (
                                            <button
                                                key={type.name}
                                                onClick={() => updatePatternData({ colorworkType: type.name })}
                                                className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${patternData.colorworkType === type.name
                                                    ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
                                                    : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="text-2xl">{type.icon}</div>
                                                    <div className="text-left">
                                                        <div className="font-semibold text-sm">{type.name}</div>
                                                        <div className="text-xs opacity-75">{type.desc}</div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="form-label">
                                        Pattern Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={patternData.customText}
                                        onChange={(e) => updatePatternData({ customText: e.target.value })}
                                        placeholder={`Describe your ${patternData.colorworkType?.toLowerCase() || 'colorwork'} pattern...`}
                                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        Rows in Pattern Repeat <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={patternData.rowsInPattern}
                                        onChange={(e) => updatePatternData({ rowsInPattern: e.target.value })}
                                        placeholder="e.g., 4"
                                        min="1"
                                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                                    />
                                </div>
                            </>
                        )}

                        {patternData.pattern === 'Custom pattern' && (
                            <div>
                                <label className="form-label">
                                    Pattern Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={patternData.customText}
                                    onChange={(e) => updatePatternData({ customText: e.target.value })}
                                    placeholder="Describe your pattern (e.g., K2, P2 ribbing with cable every 6th row)"
                                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                                    rows="3"
                                />
                            </div>
                        )}

                        {['Lace Pattern', 'Cable Pattern'].includes(patternData.pattern) && (
                            <>
                                <div>
                                    <label className="form-label">
                                        Pattern Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={patternData.customText}
                                        onChange={(e) => updatePatternData({ customText: e.target.value })}
                                        placeholder={`Describe your ${patternData.pattern.toLowerCase()} (e.g., chart reference, written instructions)`}
                                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        Rows in Pattern Repeat <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={patternData.rowsInPattern}
                                        onChange={(e) => updatePatternData({ rowsInPattern: e.target.value })}
                                        placeholder="e.g., 4"
                                        min="1"
                                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                                    />
                                </div>
                            </>
                        )}

                        {configurationTips.length > 0 && (
                            <div className="help-block">
                                <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 Configuration Tips</h4>
                                <div className="text-sm text-sage-600 space-y-1">
                                    {configurationTips.map((tip, index) => (
                                        <div key={index}>• {tip}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
                <button
                    onClick={onClose}
                    data-modal-cancel
                    className="flex-1 btn-tertiary"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={!canSave()}
                    data-modal-primary
                    className="flex-1 btn-primary"
                >
                    Save Changes
                </button>
            </div>
        </StandardModal>
    );
};

export default EditPatternModal;