// src/features/steps/components/wizard-screens/ColorSelectionScreen.jsx

import React, { useState, useEffect } from 'react';
import { getSortedYarnLetters } from '../../../../shared/utils/colorworkDisplayUtils';
import useYarnManager from '../../../../shared/hooks/useYarnManager';

const ColorSelectionScreen = ({
    wizardData,
    updateWizardData,
    component,
    onContinue,
    onBack,
    onCancel
}) => {
    const { yarns } = useYarnManager();
    const [colorChoice, setColorChoice] = useState(null);
    const [selectedLetters, setSelectedLetters] = useState([]);

    const handleContinue = () => {
        console.log('🎨 COLOR SELECTION - selectedLetters:', selectedLetters);

        if (colorChoice === 'single') {
            updateWizardData('colorwork', {
                type: 'single',
                letter: selectedLetters[0]
            });
            onContinue('pattern-selection');
        } else if (colorChoice === 'multi-strand') {
            updateWizardData('colorwork', {
                type: 'multi-strand',
                letters: selectedLetters
            });
            onContinue('pattern-selection');
        } else if (colorChoice === 'stripes') {
            onContinue('stripes-config');
        } else if (colorChoice === 'marled-stripes') {
            onContinue('marled-stripes-config');        } else if (colorChoice === 'continue-pattern') {
            // Copy previous step's colorwork data
            updateWizardData('colorwork', {
                ...previousPattern.data,
                continuedFromStep: previousPattern.stepNumber
            });
            onContinue('pattern-selection');
        } else if (colorChoice === 'fair-isle' || colorChoice === 'intarsia') {
            onContinue('pattern-selection');
        } else if (colorChoice === 'two-color-brioche') {
            updateWizardData('colorwork', {
                type: 'two_color_brioche',
                rowAColor: selectedLetters[0],  // Primary color
                rowBColor: selectedLetters[1]   // Contrasting color
            });
            setTimeout(() => {
                onContinue('brioche-config');
            }, 0);
        }
    };

    const canContinue = () => {
        if (!colorChoice) return false;
        if (colorChoice === 'single') return selectedLetters.length === 1;
        if (colorChoice === 'multi-strand') return selectedLetters.length >= 2;
        if (colorChoice === 'two-color-brioche') return selectedLetters.length === 2;
        return true;
    };

    // Only show yarns that actually exist in the project
    // const sortedYarns = getSortedYarnLetters(yarns).filter(yarn => yarn && yarn.id);
    const sortedYarns = yarns.sort((a, b) => a.letter.localeCompare(b.letter));

    // Check if previous step has a continuable color pattern
    const getPreviousStepPattern = () => {
        if (!component?.steps || component.steps.length === 0) return null;
        
        const prevStep = component.steps[component.steps.length - 1];
        const prevColorwork = prevStep?.colorwork || prevStep?.wizardConfig?.colorwork;
        
        if (!prevColorwork) return null;
        
        // Only allow continuation for complex patterns
        const continuableTypes = ['stripes', 'marled_stripes', 'two_color_brioche'];
        if (continuableTypes.includes(prevColorwork.type)) {
            return {
                type: prevColorwork.type,
                stepNumber: component.steps.length,
                data: prevColorwork
            };
        }
        
        return null;
    };
    
    const previousPattern = getPreviousStepPattern();



    return (
        <div className="stack-lg">
            <div>
                <h2 className="content-header-primary">Select Colors</h2>
                <p className="content-subheader">Choose how colors are used in this step</p>
            </div>

            {/* Color Pattern Cards */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => {
                        setColorChoice('single');
                        setSelectedLetters([]);
                    }}
                    className={`card-selectable ${colorChoice === 'single' ? 'card-selectable-selected' : ''}`}
                >
                    <div className="text-3xl mb-2">🎨</div>
                    <div className="font-semibold">Single Color</div>
                    <div className="text-xs text-wool-600 mt-1">One yarn for this step</div>
                </button>

                <button
                    onClick={() => {
                        setColorChoice('multi-strand');
                        setSelectedLetters([]);
                    }}
                    className={`card-selectable ${colorChoice === 'multi-strand' ? 'card-selectable-selected' : ''}`}
                >
                    <div className="text-3xl mb-2">🧵</div>
                    <div className="font-semibold">Marled</div>
                    <div className="text-xs text-wool-600 mt-1">Hold 2+ colors together</div>
                </button>

                <button
                    onClick={() => setColorChoice('stripes')}
                    className={`card-selectable ${colorChoice === 'stripes' ? 'card-selectable-selected' : ''}`}
                >
                    <div className="text-3xl mb-2">📊</div>
                    <div className="font-semibold">Stripes</div>
                    <div className="text-xs text-wool-600 mt-1">Alternating colors</div>
                </button>

                <button
                    onClick={() => setColorChoice('marled-stripes')}
                    className={`card-selectable ${colorChoice === 'marled-stripes' ? 'card-selectable-selected' : ''}`}
                >
                    <div className="text-3xl mb-2">🌈</div>
                    <div className="font-semibold">Marled Stripes</div>
                    <div className="text-xs text-wool-600 mt-1">Changing marled combos</div>
                </button>

                <button
                    onClick={() => {
                        setColorChoice('two-color-brioche');
                        setSelectedLetters([]);
                    }}
                    className={`card-selectable ${colorChoice === 'two-color-brioche' ? 'card-selectable-selected' : ''}`}
                >
                    <div className="text-3xl mb-2">🌊</div>
                    <div className="font-semibold">Two-Color Brioche</div>
                    <div className="text-xs text-wool-600 mt-1">Reversible brioche fabric</div>
                </button>

                <button
                    onClick={() => setColorChoice('fair-isle')}
                    className={`card-selectable ${colorChoice === 'fair-isle' ? 'card-selectable-selected' : ''}`}
                >
                    <div className="text-3xl mb-2">🎨
                {/* Continue Pattern - only show if previous step has pattern */}
                {previousPattern && (
                    <button
                        onClick={() => setColorChoice('continue-pattern')}
                        className={`card-selectable ${colorChoice === 'continue-pattern' ? 'card-selectable-selected' : ''}`}
                    >
                        <div className="text-3xl mb-2">↪️</div>
                        <div className="font-semibold">Continue Pattern</div>
                        <div className="text-xs text-wool-600 mt-1">
                            Continue {previousPattern.type === 'stripes' ? 'Stripes' : 
                                     previousPattern.type === 'marled_stripes' ? 'Marled Stripes' : 
                                     'Two-Color Brioche'} from Step {previousPattern.stepNumber}
                        </div>
                    </button>
                )}

            </div>
                    <div className="font-semibold">Fair Isle
                {/* Continue Pattern - only show if previous step has pattern */}
                {previousPattern && (
                    <button
                        onClick={() => setColorChoice('continue-pattern')}
                        className={`card-selectable ${colorChoice === 'continue-pattern' ? 'card-selectable-selected' : ''}`}
                    >
                        <div className="text-3xl mb-2">↪️</div>
                        <div className="font-semibold">Continue Pattern</div>
                        <div className="text-xs text-wool-600 mt-1">
                            Continue {previousPattern.type === 'stripes' ? 'Stripes' : 
                                     previousPattern.type === 'marled_stripes' ? 'Marled Stripes' : 
                                     'Two-Color Brioche'} from Step {previousPattern.stepNumber}
                        </div>
                    </button>
                )}

            </div>
                    <div className="text-xs text-wool-600 mt-1">Colorwork patterns
                {/* Continue Pattern - only show if previous step has pattern */}
                {previousPattern && (
                    <button
                        onClick={() => setColorChoice('continue-pattern')}
                        className={`card-selectable ${colorChoice === 'continue-pattern' ? 'card-selectable-selected' : ''}`}
                    >
                        <div className="text-3xl mb-2">↪️</div>
                        <div className="font-semibold">Continue Pattern</div>
                        <div className="text-xs text-wool-600 mt-1">
                            Continue {previousPattern.type === 'stripes' ? 'Stripes' : 
                                     previousPattern.type === 'marled_stripes' ? 'Marled Stripes' : 
                                     'Two-Color Brioche'} from Step {previousPattern.stepNumber}
                        </div>
                    </button>
                )}

            </div>
                </button>
            
                {/* Continue Pattern - only show if previous step has pattern */}
                {previousPattern && (
                    <button
                        onClick={() => setColorChoice('continue-pattern')}
                        className={`card-selectable ${colorChoice === 'continue-pattern' ? 'card-selectable-selected' : ''}`}
                    >
                        <div className="text-3xl mb-2">↪️</div>
                        <div className="font-semibold">Continue Pattern</div>
                        <div className="text-xs text-wool-600 mt-1">
                            Continue {previousPattern.type === 'stripes' ? 'Stripes' : 
                                     previousPattern.type === 'marled_stripes' ? 'Marled Stripes' : 
                                     'Two-Color Brioche'} from Step {previousPattern.stepNumber}
                        </div>
                    </button>
                )}

            </div>

            {/* Yarn Selection for Brioche - Ordered */}
            {colorChoice === 'two-color-brioche' && (
                <div>
                    <label className="form-label">Select Your Two Colors</label>

                    <div className="space-y-3">
                        {/* First Color */}
                        <div>
                            <div className="text-sm font-medium text-center text-wool-700 mb-2">First color worked:</div>
                            <div className="grid grid-cols-3 gap-3">
                                {sortedYarns.map(yarn => {
                                    const isSelected = selectedLetters[0] === yarn.letter;
                                    return (
                                        <button
                                            key={yarn.letter}
                                            onClick={() => {
                                                const newSelected = [...selectedLetters];
                                                newSelected[0] = yarn.letter;
                                                if (newSelected[1] === yarn.letter) newSelected[1] = undefined;
                                                setSelectedLetters(newSelected.filter(Boolean));
                                            }}
                                            className={`p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-sage-500 bg-sage-50' : 'border-wool-200 hover:border-wool-300'}`}
                                        >
                                            <div className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mb-1" style={{ backgroundColor: yarn.colorHex || yarn.hex }} />
                                            <div className="text-xs font-medium text-center">{yarn.letter}</div>
                                            <div className="text-xs text-center truncate">{yarn.color}</div>
                                            {isSelected && <div className="text-sage-600 text-center mt-1">✓</div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Second Color */}
                        <div>
                            <div className="text-sm font-medium text-center text-wool-700 mb-2">Second color worked:</div>
                            <div className="grid grid-cols-3 gap-3">
                                {sortedYarns.map(yarn => {
                                    const isSelected = selectedLetters[1] === yarn.letter;
                                    const isDisabled = selectedLetters[0] === yarn.letter;
                                    return (
                                        <button
                                            key={yarn.letter}
                                            onClick={() => {
                                                if (isDisabled) return;
                                                const newSelected = [...selectedLetters];
                                                newSelected[1] = yarn.letter;
                                                setSelectedLetters(newSelected.filter(Boolean));
                                            }}
                                            disabled={isDisabled}
                                            className={`p-3 rounded-lg border-2 transition-all ${isDisabled ? 'opacity-40 cursor-not-allowed border-wool-200' :
                                                isSelected ? 'border-sage-500 bg-sage-50' : 'border-wool-200 hover:border-wool-300'
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mb-1" style={{ backgroundColor: yarn.colorHex || yarn.hex }} />
                                            <div className="text-xs font-medium text-center">{yarn.letter}</div>
                                            <div className="text-xs text-center truncate">{yarn.color}</div>
                                            {isSelected && <div className="text-sage-600 text-center mt-1">✓</div>}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Yarn Selection for Single/Multi-strand */}
            {(colorChoice === 'single' || colorChoice === 'multi-strand') && (
                <div>
                    <label className="form-label">
                        Select {colorChoice === 'single' ? 'Yarn' : 'Yarns'}
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {sortedYarns.map(yarn => {
                            const isSelected = selectedLetters.includes(yarn.letter);
                            return (
                                <button
                                    key={yarn.letter}
                                    onClick={() => {
                                        const newSelected = colorChoice === 'single'
                                            ? [yarn.letter]
                                            : isSelected
                                                ? selectedLetters.filter(l => l !== yarn.letter)
                                                : [...selectedLetters, yarn.letter].sort();
                                        setSelectedLetters(newSelected);
                                    }}
                                    className={`p-3 rounded-lg border-2 transition-all ${isSelected ? 'border-sage-500 bg-sage-50' : 'border-wool-200 hover:border-wool-300'}`}
                                >
                                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 mx-auto mb-1" style={{ backgroundColor: yarn.colorHex || yarn.hex }} />
                                    <div className="text-xs font-medium text-center">{yarn.letter}</div>
                                    <div className="text-xs text-center truncate">{yarn.color}</div>
                                    {isSelected && <div className="text-sage-600 text-center mt-1">✓</div>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="pt-6 border-t border-wool-100">
                <div className="flex gap-3">
                    <button onClick={onBack} className="flex-1 btn-tertiary">
                        ← Back
                    </button>
                    <button onClick={handleContinue} disabled={!canContinue()} className="flex-2 btn-primary" style={{ flexGrow: 2 }}>
                        Continue →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ColorSelectionScreen;