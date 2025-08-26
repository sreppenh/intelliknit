// src/features/knitting/components/modal/KnittingStepCounter.jsx
import React, { useState } from 'react';
import { Plus, Minus, RotateCcw, Target, Undo } from 'lucide-react';
import { useRowCounter } from '../../hooks/useRowCounter';
import { getFormattedStepDisplay } from '../../../../shared/utils/stepDescriptionUtils';
import IncrementInput from '../../../../shared/components/IncrementInput';

const KnittingStepCounter = ({
    step,
    component,
    project,
    theme,
    progress,
    navigation
}) => {
    const rowCounter = useRowCounter(project?.id, component?.id, navigation.currentStep, step);
    const { currentRow, stitchCount, incrementRow, decrementRow, updateStitchCount, resetCounter } = rowCounter;

    // Step data
    const totalRows = step.totalRows || 1;
    const targetStitches = step.endingStitches || step.startingStitches || 0;
    const isCompleted = progress.isStepCompleted(navigation.currentStep);

    // Progress calculations
    const rowProgress = Math.min((currentRow - 1) / totalRows * 100, 100);
    const isLastRow = currentRow > totalRows;

    const handleRowIncrement = incrementRow;
    const handleRowDecrement = decrementRow;

    const handleStepComplete = () => {
        progress.toggleStepCompletion(navigation.currentStep);
    };

    return (
        <div className={`flex-1 flex flex-col items-center justify-center ${theme.cardBg} relative overflow-hidden`}>
            {/* Texture overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='2' stroke-opacity='0.08'%3E%3Ccircle cx='40' cy='40' r='30'/%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '80px 80px'
                }} />
            </div>

            <div className="text-center px-6 relative z-10 w-full max-w-sm">
                {/* Step context */}
                {/*}            <div className={`text-lg font-semibold mb-4 ${theme.textPrimary}`}>
                    {step.description}
                </div>. */}

                {/* Current Progress Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-6">
                    <div className={`text-4xl font-bold ${theme.textPrimary} mb-2`}>
                        Row {currentRow}
                    </div>
                    <div className={`text-sm ${theme.textSecondary} mb-4`}>
                        of {totalRows} total rows
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${isLastRow ? 'bg-sage-500' : 'bg-yarn-400'
                                }`}
                            style={{ width: `${Math.min(rowProgress, 100)}%` }}
                        />
                    </div>

                    {/* Row controls */}
                    <IncrementInput
                        value={currentRow}
                        onChange={rowCounter.updateRow}
                        min={1}
                        max={totalRows + 1}
                        label="Current Row"
                    />
                </div>

                {/* Stitch Counter Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${theme.textSecondary}`}>
                            Current Stitches
                        </span>
                        <span className={`text-sm ${theme.textSecondary}`}>
                            Target: {targetStitches}
                        </span>
                    </div>
                    <div className={`text-2xl font-bold ${theme.textPrimary} text-center mb-3`}>
                        {stitchCount}
                    </div>

                    {/* Stitch adjustment controls */}
                    <div className="flex items-center justify-center gap-3">
                        <button
                            onClick={() => updateStitchCount(Math.max(0, stitchCount - 1))}
                            className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 transition-colors"
                        >
                            <Minus size={14} />
                        </button>
                        <span className={`text-xs ${theme.textSecondary} px-2`}>
                            Adjust
                        </span>
                        <button
                            onClick={() => updateStitchCount(stitchCount + 1)}
                            className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 transition-colors"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>

                {/* Undo Button (if available) */}
                {progress.canUndo && (
                    <button
                        onClick={progress.undoLastAction}
                        className="w-full mb-4 flex items-center justify-center gap-2 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-xl transition-colors font-medium shadow-sm"
                    >
                        <Undo size={16} />
                        Undo: {progress.lastAction?.description}
                    </button>
                )}

                {/* Complete Step Button */}
                {isLastRow && !isCompleted && (
                    <button
                        onClick={handleStepComplete}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-sage-500 hover:bg-sage-600 text-white rounded-xl transition-colors font-medium shadow-sm"
                    >
                        <Target size={18} />
                        Mark Step Complete
                    </button>
                )}

                {/* Step Already Complete */}
                {isCompleted && (
                    <button
                        onClick={handleStepComplete}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-wool-200 hover:bg-wool-300 text-wool-700 rounded-xl transition-colors font-medium shadow-sm"
                    >
                        <Target size={18} />
                        Mark Incomplete
                    </button>
                )}
            </div>
        </div>
    );
};

export default KnittingStepCounter;