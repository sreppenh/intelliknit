// src/features/steps/components/pattern-configs/ColorworkPatternConfig.jsx
import React from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';

const ColorworkPatternConfig = ({ wizardData, updateWizardData, construction, mode = 'create' }) => {
    // Colorwork type options
    const colorworkTypes = [
        { name: 'Fair Isle', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', desc: 'Traditional stranded colorwork' },
        { name: 'Intarsia', icon: '🎨', desc: 'Large color blocks' },
        { name: 'Stripes', icon: '🌈', desc: 'Horizontal color bands' }
    ];

    const selectedColorworkType = wizardData.stitchPattern.colorworkType;

    const handleColorworkTypeSelect = (type) => {
        updateWizardData('stitchPattern', { colorworkType: type });
    };

    return (
        <div className="stack-lg">
            {/* Colorwork Type Selector */}
            <div>
                <label className="form-label">
                    Colorwork Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {colorworkTypes.map(type => (
                        <button
                            key={type.name}
                            onClick={() => handleColorworkTypeSelect(type.name)}
                            className={`selection-button ${selectedColorworkType === type.name
                                ? 'selection-button-selected'
                                : ''
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

            {/* Pattern Description */}
            <div>
                <label className="form-label">
                    Pattern Description
                </label>
                <textarea
                    value={wizardData.stitchPattern.customText || ''}
                    onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
                    placeholder={`Describe your ${selectedColorworkType ? selectedColorworkType.toLowerCase() : 'colorwork'} pattern...`}
                    rows={3}
                    className="input-field-lg resize-none"
                />
                <label className="form-help">
                    Describe the pattern sequence, special techniques, or any important notes
                </label>
            </div>

            {/* Rows in Pattern */}
            <div>
                <label className="form-label">
                    Rows in Pattern
                </label>
                <IncrementInput
                    value={wizardData.stitchPattern.rowsInPattern}
                    onChange={(value) => updateWizardData('stitchPattern', { rowsInPattern: value })}
                    label="rows in pattern"
                    unit="rows"
                    construction={construction}
                />
                <label className="form-help">
                    Number of {construction === 'round' ? 'rounds' : 'rows'} in one complete pattern repeat
                </label>
            </div>

            {/* Helper info based on selected type */}
            {selectedColorworkType && (
                <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 {selectedColorworkType} Tips</h4>
                    <div className="text-sm text-yarn-600 space-y-1">
                        {selectedColorworkType === 'Fair Isle' && (
                            <>
                                <div>• List color names or codes</div>
                                <div>• Describe the motif or pattern sequence</div>
                                <div>• Note any chart references</div>
                                <div>• Include float management techniques</div>
                            </>
                        )}
                        {selectedColorworkType === 'Intarsia' && (
                            <>
                                <div>• List color names or codes</div>
                                <div>• Describe the motif or pattern sequence</div>
                                <div>• Note any chart references</div>
                                <div>• Include bobbin or yarn management notes</div>
                            </>
                        )}
                        {selectedColorworkType === 'Stripes' && (
                            <>
                                <div>• List colors and row counts: "2 rows Navy, 4 rows Cream"</div>
                                <div>• Note any special color change techniques</div>
                                <div>• Include total repeat if complex sequence</div>
                                <div>• Mention if stripes are jogless (for circular knitting)</div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorworkPatternConfig;