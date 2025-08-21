// src/features/steps/components/pattern-configs/StripesConfig.jsx
import React, { useState } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';

const StripesConfig = ({ wizardData, updateWizardData, construction }) => {
    const [activeTab, setActiveTab] = useState('simple'); // 'simple' or 'complex'

    const handlePatternChange = (value) => {
        updateWizardData('stitchPattern', { customText: value });
    };

    const handleRowsChange = (value) => {
        updateWizardData('stitchPattern', { rowsInPattern: value });
    };

    // Helper to add common stripe patterns
    const insertPattern = (pattern) => {
        const current = wizardData.stitchPattern.customText || '';
        const newText = current ? `${current}\n${pattern}` : pattern;
        handlePatternChange(newText);
    };

    return (
        <div className="space-y-6">
            {/* Pattern Type Toggle */}
            <div>
                <label className="form-label">Stripe Pattern Type</label>
                <div className="flex gap-2 p-1 bg-wool-100 rounded-lg">
                    <button
                        onClick={() => setActiveTab('simple')}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'simple'
                            ? 'bg-white text-sage-700 shadow-sm'
                            : 'text-wool-600 hover:text-wool-800'
                            }`}
                    >
                        🌈 Simple Stripes
                    </button>
                    <button
                        onClick={() => setActiveTab('complex')}
                        className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${activeTab === 'complex'
                            ? 'bg-white text-sage-700 shadow-sm'
                            : 'text-wool-600 hover:text-wool-800'
                            }`}
                    >
                        🎨 Complex Pattern
                    </button>
                </div>
            </div>

            {/* Simple Stripes Tab */}
            {activeTab === 'simple' && (
                <div className="space-y-4">
                    {/* Quick Pattern Buttons */}
                    <div>
                        <label className="form-label">Quick Patterns</label>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                '2 rows Color A, 2 rows Color B',
                                '4 rows Color A, 2 rows Color B',
                                '6 rows Color A, 1 row Color B',
                                '1 row Color A, 1 row Color B (thin stripes)'
                            ].map((pattern, index) => (
                                <button
                                    key={index}
                                    onClick={() => insertPattern(pattern)}
                                    className="text-left p-3 rounded-lg border-2 border-wool-200 hover:border-sage-300 hover:bg-sage-50 transition-colors text-sm"
                                >
                                    {pattern}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Construction-Specific Tips */}
                    {construction === 'round' && (
                        <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
                            <h4 className="text-sm font-semibold text-yarn-700 mb-2">🔄 Circular Knitting Tips</h4>
                            <div className="text-sm text-yarn-600 space-y-1">
                                <div>• Consider jogless stripes for smooth color transitions</div>
                                <div>• Slip the first stitch of each color change round</div>
                                <div>• Plan color changes at an inconspicuous spot</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Complex Pattern Tab */}
            {activeTab === 'complex' && (
                <div className="space-y-4">
                    {/* Advanced Pattern Ideas */}
                    <div>
                        <label className="form-label">Pattern Ideas</label>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                'Graduated stripes: 1,2,3,4,3,2,1 rows',
                                'Random width: 1-5 rows each color',
                                'Ombré fade: gradually changing colors',
                                'Color sequence: A,B,C,A,B,C repeat'
                            ].map((idea, index) => (
                                <button
                                    key={index}
                                    onClick={() => insertPattern(idea)}
                                    className="text-left p-3 rounded-lg border-2 border-wool-200 hover:border-lavender-300 hover:bg-lavender-50 transition-colors text-sm"
                                >
                                    💡 {idea}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Pattern Description */}
            <div>
                <label className="form-label">
                    Stripe Pattern Description
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                    value={wizardData.stitchPattern.customText || ''}
                    onChange={(e) => handlePatternChange(e.target.value)}
                    placeholder="Describe your stripe pattern...

Examples:
• 4 rows Navy, 2 rows Cream, repeat
• Alternating 1 row Red, 1 row White
• 6 rows Main Color, 2 rows Contrast, 2 rows Accent"
                    rows={6}
                    className="input-field-lg resize-none font-mono text-sm"
                />
                <label className="form-help">
                    Describe the color sequence, row counts, and any special techniques
                </label>
            </div>

            {/* Rows in Pattern */}
            <div>
                <label className="form-label">
                    Rows in Complete Pattern
                    <span className="text-red-500 ml-1">*</span>
                </label>
                <IncrementInput
                    value={wizardData.stitchPattern.rowsInPattern}
                    onChange={handleRowsChange}
                    label="rows in complete stripe pattern"
                    unit={construction === 'round' ? 'rounds' : 'rows'}
                    construction={construction}
                    min={1}
                />
                <label className="form-help">
                    Total {construction === 'round' ? 'rounds' : 'rows'} for one complete stripe sequence
                </label>
            </div>

            {/* Color Management Tips */}
            <div className="bg-sage-100 border-2 border-sage-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-sage-700 mb-2">🎨 Color Management Tips</h4>
                <div className="text-sm text-sage-600 space-y-1">
                    <div>• Cut yarn leaving 6" tails for weaving in</div>
                    <div>• Consider carrying unused colors up the side</div>
                    <div>• Plan color changes for the least visible area</div>
                    <div>• Keep consistent tension across color changes</div>
                </div>
            </div>
        </div>
    );
};

export default StripesConfig;