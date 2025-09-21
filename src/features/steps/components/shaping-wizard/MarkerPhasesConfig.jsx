// src/features/steps/components/shaping-wizard/MarkerPhasesConfig.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ShapingHeader from './ShapingHeader';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import MarkerSequenceSummary from './MarkerSequenceSummary';
import MarkerInstructionBuilder from './MarkerInstructionBuilder';
import markerArrayUtils from '../../../../shared/utils/markerArrayUtils';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { MarkerSequenceCalculator } from '../../../../shared/utils/MarkerSequenceCalculator';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import MarkerTimingConfig from './MarkerTimingConfig';
import useStepSaveHelper, { StepSaveErrorModal } from '../../../../shared/utils/StepSaveHelper';
import { useActiveContext } from '../../../../shared/hooks/useActiveContext';

// ===== SIMPLIFIED MARKER TYPES - 4 colors max =====
const MARKER_COLOR_OPTIONS = [
    { bg: 'bg-sage-100', border: 'border-sage-400', text: 'text-sage-700' },
    { bg: 'bg-yarn-600', border: 'border-yarn-700', text: 'text-yarn-50' },
    { bg: 'bg-yarn-100', border: 'border-yarn-400', text: 'text-yarn-700' },
    { bg: 'bg-orange-200', border: 'border-orange-500', text: 'text-orange-800' }
];

const MarkerPhasesConfig = ({
    shapingData,
    setShapingData,
    currentStitches,
    construction,
    component,
    componentIndex,
    editingStepIndex,
    onExitToComponentSteps,
    onComplete,
    onBack,
    wizardData,
    onGoToLanding,
    wizard,
    onCancel,
    mode,
    project
}) => {

    // ===== NAVIGATION HOOKS =====
    const { dispatch } = useActiveContext(mode);
    const { saveStepAndNavigate, isLoading, error, clearError } = useStepSaveHelper();

    // ===== MULTI-SCREEN STATE MANAGEMENT =====
    const [currentScreen, setCurrentScreen] = useState('marker-setup');
    const [markerArray, setMarkerArray] = useState([]);
    const [sequences, setSequences] = useState([]);
    const [editingSequence, setEditingSequence] = useState(null);
    const [sequenceCalculation, setSequenceCalculation] = useState(null);

    // ===== NEW: INSTRUCTION BUILDER STATE =====
    const [currentSequenceData, setCurrentSequenceData] = useState(null);

    // ===== SCREEN 1: MARKER SETUP STATE =====
    const [markerCount, setMarkerCount] = useState(2);
    const [segments, setSegments] = useState([]);

    // ===== MARKER COLOR STATE =====
    const [markerColors, setMarkerColors] = useState({}); // markerName -> colorIndex
    const [showSegments, setShowSegments] = useState(false);

    // ===== MARKER COLOR FUNCTIONS =====
    const getMarkerColor = (markerName) => {
        if (markerName === 'BOR') {
            return { bgColor: 'bg-lavender-200', borderColor: 'border-lavender-500', textColor: 'text-lavender-700' };
        }

        const colorIndex = markerColors[markerName] || 0;
        const option = MARKER_COLOR_OPTIONS[colorIndex];
        return { bgColor: option.bg, borderColor: option.border, textColor: option.text };
    };

    const cycleMarkerColor = (markerName) => {
        setMarkerColors(prev => {
            const currentIndex = prev[markerName] || 0;
            const nextIndex = (currentIndex + 1) % MARKER_COLOR_OPTIONS.length;
            return { ...prev, [markerName]: nextIndex };
        });
    };

    // ===== GET TERMINOLOGY =====
    const terms = getConstructionTerms(construction);

    // ===== EXISTING MARKER DETECTION =====
    const hasExistingMarkers = useMemo(() => {
        return component?.stitchArray &&
            component.stitchArray.length > 0 &&
            markerArrayUtils.getArrayMarkers(component.stitchArray).length > 0;
    }, [component?.stitchArray]);

    const existingMarkers = useMemo(() => {
        if (!hasExistingMarkers) return [];
        return markerArrayUtils.getArrayMarkers(component.stitchArray);
    }, [hasExistingMarkers, component?.stitchArray]);

    // ===== LOAD EXISTING MARKERS =====
    useEffect(() => {
        if (hasExistingMarkers) {
            // Load from existing array
            const existing = component.stitchArray;
            const loadedSegments = [];

            existing.forEach((item, index) => {
                if (typeof item === 'string') {
                    loadedSegments.push({
                        type: 'marker',
                        name: item,
                        id: `marker_${item}_${index}`,
                        readonly: item === 'BOR'
                    });
                } else {
                    loadedSegments.push({
                        type: 'stitches',
                        count: item,
                        id: `stitches_${index}`
                    });
                }
            });

            setSegments(loadedSegments);
            setShowSegments(true);
            setMarkerArray(existing);
        }
    }, [hasExistingMarkers, component?.stitchArray]);

    // ===== COMPUTE CURRENT ARRAY FROM SEGMENTS =====
    const currentArray = useMemo(() => {
        if (!showSegments || segments.length === 0) return [];

        const array = [];
        segments.forEach(segment => {
            if (segment.type === 'marker') {
                array.push(segment.name);
            } else {
                array.push(parseInt(segment.count) || 0);
            }
        });
        return array;
    }, [segments, showSegments]);

    // ===== VALIDATION =====
    const isValid = useMemo(() => {
        if (!showSegments) return false;
        if (segments.length === 0) return false;

        // Check that all stitch segments have valid counts
        const hasInvalidStitches = segments
            .filter(s => s.type === 'stitches')
            .some(s => !s.count || parseInt(s.count) <= 0);

        if (hasInvalidStitches) return false;

        // Check that all markers have valid names
        const hasInvalidMarkers = segments
            .filter(s => s.type === 'marker' && !s.readonly)
            .some(s => !s.name || s.name.trim() === '');

        if (hasInvalidMarkers) return false;

        // Validate array structure
        const errors = markerArrayUtils.validateArray(currentArray);
        return errors.length === 0;
    }, [segments, showSegments, currentArray]);

    // ===== UPDATE SEGMENT (STITCH COUNTS ONLY) =====
    const updateSegment = (segmentId, field, value) => {
        setSegments(prev => prev.map(segment => {
            if (segment.id === segmentId && field === 'count') {
                // For stitch count, ensure it's a valid number
                const numValue = parseInt(value) || 0;
                return { ...segment, count: Math.max(0, numValue) };
            }
            return segment;
        }));
    };

    // ===== NAVIGATION =====
    const handleBackNavigation = () => {
        if (currentScreen === 'marker-setup') {
            onBack();
        } else if (currentScreen === 'instruction-builder') {
            // Clear instruction builder state when going back to marker setup
            setCurrentSequenceData(null);
            setCurrentScreen('marker-setup');
        } else if (currentScreen === 'timing') {
            setCurrentScreen('instruction-builder');
        } else if (currentScreen === 'sequence-management') {
            setCurrentScreen('timing');
        } else if (currentScreen === 'sequence-wizard') {
            setCurrentScreen('sequence-management');
        }
    };

    const handleCompleteMarkerSetup = () => {
        setMarkerArray(currentArray);
        setCurrentScreen('instruction-builder'); // ✅ Go straight to instruction building
        IntelliKnitLogger.success('Marker setup complete', currentArray);
    };

    const handleAddSequence = () => {
        setEditingSequence(null);
        setCurrentSequenceData(null);
        setCurrentScreen('instruction-builder');
    };

    const handleEditSequence = (sequenceId) => {
        const sequence = sequences.find(s => s.id === sequenceId);
        setEditingSequence(sequence);
        setCurrentSequenceData(sequence);
        setCurrentScreen('instruction-builder');
    };

    const handleDeleteSequence = (sequenceId) => {
        setSequences(prev => prev.filter(s => s.id !== sequenceId));
        IntelliKnitLogger.info('Sequence deleted', sequenceId);
    };


    // ===== HELPER FUNCTION - CREATE SEGMENTS ON DEMAND =====
    const createSegmentsForCount = (count) => {
        // Just return the array directly, no complex segment state
        const baseStitches = Math.floor(currentStitches / (count + 1));
        const remainder = currentStitches % (count + 1);

        const array = [];
        if (construction === 'round') array.push('BOR');

        for (let i = 0; i < count; i++) {
            array.push(baseStitches + (i < remainder ? 1 : 0));
            array.push(`M${i + 1}`);
        }

        array.push(baseStitches + (count < remainder ? 1 : 0));
        return array;
    };

    // ===== NEW: INSTRUCTION BUILDER HANDLERS =====
    const handleInstructionComplete = (instructionData) => {
        // Store the instruction data for the next step
        setCurrentSequenceData({
            id: editingSequence?.id || Date.now().toString(),
            name: editingSequence?.name || 'Custom Sequence',
            instructionData: instructionData,
            // Add any other sequence properties needed
        });

        // For now, go back to sequence management with the instruction
        // In the future, this could go to timing/frequency configuration
        handleSimpleSequenceComplete({
            id: editingSequence?.id || Date.now().toString(),
            name: editingSequence?.name || 'Marker Sequence',
            instructionData: instructionData,
            phases: [{
                type: 'marker_instruction',
                instructionData: instructionData,
                frequency: 2, // Default frequency
                times: 10     // Default times
            }]
        });

        setCurrentScreen('timing');
    };

    const handleTimingComplete = async (finalInstructionData) => {
        // Create the final marker config
        const markerConfig = {
            type: 'marker_phases',
            config: {
                markerSetup: {
                    type: hasExistingMarkers ? 'existing' : 'new',
                    stitchArray: markerArray
                },
                phases: [{
                    id: 'phase_1',
                    type: 'marker_instruction',
                    instructionData: finalInstructionData,
                    frequency: finalInstructionData.timing.frequency,
                    times: finalInstructionData.timing.times
                }],
                calculation: {
                    instruction: finalInstructionData.preview || 'Marker-based shaping',
                    startingStitches: currentStitches,
                    endingStitches: currentStitches, // Will be calculated properly later
                    totalRows: 1, // Will be calculated properly later
                    finalArray: markerArray
                }
            }
        };

        // Save step and navigate to ManageSteps (same pattern as PhaseConfigSummary)
        const saveResult = await saveStepAndNavigate({
            instruction: markerConfig.config.calculation.instruction,
            effect: {
                success: true,
                endingStitches: currentStitches,
                startingStitches: currentStitches,
                totalRows: 1,
                hasShaping: true
            },
            wizardData: {
                hasShaping: true,
                shapingConfig: markerConfig
            },
            componentIndex,
            dispatch,
            skipNavigation: true
        });

        if (saveResult.success) {
            onExitToComponentSteps();
        }
    };

    const handleInstructionCancel = () => {
        setCurrentScreen('sequence-management');
        setCurrentSequenceData(null);
    };

    // ===== SIMPLIFIED SEQUENCE COMPLETION =====
    const handleSimpleSequenceComplete = (sequenceData) => {
        if (editingSequence) {
            setSequences(prev => prev.map(s =>
                s.id === editingSequence.id ? sequenceData : s
            ));
        } else {
            setSequences(prev => [...prev, sequenceData]);
        }
        setCurrentScreen('sequence-management');

        // Recalculate after sequence change
        const updatedSequences = editingSequence
            ? sequences.map(s => s.id === editingSequence.id ? sequenceData : s)
            : [...sequences, sequenceData];

        const calculation = MarkerSequenceCalculator.calculateMarkerPhases(
            updatedSequences,
            markerArray,
            construction
        );
        setSequenceCalculation(calculation);
    };

    const handleFinalComplete = () => {
        const calculation = MarkerSequenceCalculator.calculateMarkerPhases(
            sequences.length > 0 ? sequences : [{
                id: 'marker_setup',
                name: 'Marker Setup',
                startCondition: { type: 'immediate' },
                phases: [{ type: 'setup', config: { rows: 1 } }],
                actions: []
            }],
            markerArray,
            construction
        );

        const shapingConfigData = {
            markerSetup: hasExistingMarkers ? 'existing' : 'new',
            stitchArray: markerArray,
            markerColors: markerColors, // Add this line
            markerCount: markerCount,
            sequences: sequences.length > 0 ? sequences : [{
                id: 'marker_setup',
                name: 'Marker Setup',
                phases: [{ type: 'setup', config: { rows: 1 } }]
            }],
            calculation: calculation
        };
        IntelliKnitLogger.success('Marker Phases Complete', shapingConfigData);
        onComplete(shapingConfigData);
    };

    // ===== RENDER SCREEN 1: MARKER SETUP =====
    // ===== RENDER MARKER SETUP =====
    if (currentScreen === 'marker-setup') {
        const handleUpdateMarkers = () => {
            const newSegments = [];
            const newArray = [];

            // Calculate even distribution
            const baseStitches = Math.floor(currentStitches / (markerCount + 1));
            const remainder = currentStitches % (markerCount + 1);

            if (construction === 'round') {
                newArray.push('BOR');
                newSegments.push({
                    type: 'marker',
                    name: 'BOR',
                    id: 'marker_BOR',
                    readonly: true
                });
            }

            for (let i = 0; i < markerCount; i++) {
                const stitches = baseStitches + (i < remainder ? 1 : 0);
                newArray.push(stitches);
                newArray.push(`M${i + 1}`);

                newSegments.push({
                    type: 'stitches',
                    count: stitches,
                    id: `stitches_${i}`
                });
                newSegments.push({
                    type: 'marker',
                    name: `M${i + 1}`,
                    id: `marker_M${i + 1}_${i}`,
                    readonly: false
                });
            }

            // Final stitches
            const finalStitches = baseStitches + (markerCount < remainder ? 1 : 0);
            newArray.push(finalStitches);
            newSegments.push({
                type: 'stitches',
                count: finalStitches,
                id: 'stitches_final'
            });

            setSegments(newSegments);
            setMarkerArray(newArray);
            setShowSegments(true);
        };

        return (
            <div>
                <ShapingHeader
                    onBack={handleBackNavigation}
                    onGoToLanding={onGoToLanding}
                    wizard={wizard}
                    onCancel={onCancel}
                />

                <div className="p-6 stack-lg">

                    {/* Use proper header format */}
                    <div>
                        <h2 className="content-header-primary">Marker Setup</h2>
                        <p className="content-subheader">
                            {/*}  {currentStitches} stitches • {construction} construction. */}
                            <p className="content-subheader">Specify marker placement and spacing</p>

                        </p>
                    </div>

                    {/* Existing markers detection */}
                    {hasExistingMarkers && !showSegments && (
                        <div className="card-info">
                            <h4 className="text-sm font-semibold text-sage-700 mb-3">Existing Markers Detected</h4>
                            <p className="text-sm text-sage-600 mb-3">
                                This component already has {existingMarkers.length} markers placed.
                            </p>
                            <button
                                onClick={() => setShowSegments(true)}
                                className="btn-secondary btn-sm"
                            >
                                Edit Existing Markers
                            </button>
                        </div>
                    )}

                    {/* Marker Count Section */}
                    <div className="card">
                        <div className="stack-md">
                            <h4 className="text-sm font-semibold text-wool-700 mb-3">How many markers do you need?</h4>


                            <div className="flex items-center gap-3">
                                <IncrementInput
                                    value={markerCount}
                                    onChange={setMarkerCount}
                                    min={0}
                                    max={20}
                                    size="sm"
                                />
                                <button
                                    onClick={handleUpdateMarkers}
                                    className="btn-secondary btn-sm"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Marker Configuration Section */}
                    {showSegments && segments.length > 0 && (
                        <div className="card">
                            <h4 className="text-sm font-semibold text-wool-700 mb-3">Configure Your Markers</h4>
                            <p className="text-xs text-wool-500 mb-4">Tap marker to change color</p>

                            <div className="space-y-4">
                                {segments.map((segment, index) => {
                                    if (segment.type === 'stitches') {
                                        // Calculate remaining stitches for this specific field
                                        const otherStitchesUsed = segments
                                            .filter((s, i) => s.type === 'stitches' && i !== index)
                                            .reduce((sum, s) => sum + (parseInt(s.count) || 0), 0);
                                        const maxForThisField = currentStitches - otherStitchesUsed;

                                        return (
                                            <div key={segment.id} className="flex items-center gap-3">
                                                <IncrementInput
                                                    value={segment.count}
                                                    onChange={(value) => updateSegment(segment.id, 'count', value)}
                                                    min={0}
                                                    max={maxForThisField}
                                                    size="sm"
                                                />
                                                <span className="text-sm text-wool-600">stitches</span>
                                            </div>
                                        );
                                    } else {
                                        // Marker row
                                        const currentStyle = getMarkerColor(segment.name);

                                        return (
                                            <div key={segment.id} className="flex items-center justify-between">
                                                {/* Marker bubble */}
                                                {/* Marker bubble - clickable to change color */}
                                                <button
                                                    type="button"
                                                    onClick={() => !segment.readonly && cycleMarkerColor(segment.name)}
                                                    disabled={segment.readonly}
                                                    className={`w-10 h-10 rounded-full ${currentStyle.bgColor} ${currentStyle.borderColor} border-2 flex items-center justify-center ${currentStyle.textColor} font-bold ${segment.name === 'BOR' ? 'text-xs' : 'text-sm'} ${!segment.readonly ? 'hover:scale-105 transition-transform cursor-pointer' : ''}`}
                                                >
                                                    {segment.name}
                                                </button>

                                            </div>
                                        );
                                    }
                                })}
                            </div>

                            {/* Simple stitch counter - neutral display */}
                            <div className="mt-4 p-3 bg-wool-50 rounded-lg text-sm text-center text-wool-600">
                                {markerArrayUtils.sumArrayStitches(currentArray) === currentStitches ? (
                                    <span>Total: {currentStitches} stitches placed</span>
                                ) : (
                                    <span>
                                        Remaining: {Math.abs(currentStitches - markerArrayUtils.sumArrayStitches(currentArray))} stitches
                                        {markerArrayUtils.sumArrayStitches(currentArray) > currentStitches ? ' over' : ' to place'}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Live Preview */}
                    {showSegments && currentArray.length > 0 && (
                        <div className="card">
                            <h4 className="text-sm font-semibold text-wool-700 mb-3">Live Preview</h4>
                            <MarkerArrayVisualization
                                stitchArray={currentArray}
                                construction={construction}
                                showActions={false}
                                markerColors={markerColors}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button onClick={handleBackNavigation} className="btn-tertiary flex-1">
                            ← Back
                        </button>
                        <button
                            onClick={handleCompleteMarkerSetup}
                            disabled={!showSegments || !isValid}
                            className="btn-primary flex-1"
                        >
                            Continue →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ===== RENDER SCREEN 2: SEQUENCE MANAGEMENT =====
    if (currentScreen === 'sequence-management') {
        return (
            <MarkerSequenceSummary
                markerArray={markerArray}
                markerColors={markerColors}
                sequences={sequences}
                construction={construction}
                onAddSequence={handleAddSequence}
                onEditSequence={handleEditSequence}
                onDeleteSequence={handleDeleteSequence}
                onComplete={handleFinalComplete}
                onBack={handleBackNavigation}
                wizard={wizard}
                onGoToLanding={onGoToLanding}
                onCancel={onCancel}
                calculation={sequenceCalculation}
            />
        );
    }

    // ===== NEW: RENDER SCREEN 3: INSTRUCTION BUILDER =====
    if (currentScreen === 'instruction-builder') {
        return (
            <div>
                <ShapingHeader
                    onBack={handleBackNavigation}
                    onGoToLanding={onGoToLanding}
                    wizard={wizard}
                    onCancel={onCancel}
                />

                <div className="p-6">
                    <div className="mb-6">
                        <h2 className="content-header-primary">Build {construction === 'round' ? 'Round' : 'Row'} Instruction</h2>
                        <p className="content-subheader">
                            Define what happens in each shaping {construction === 'round' ? 'round' : 'row'}
                        </p>
                    </div>

                    <MarkerInstructionBuilder
                        markerArray={markerArray}
                        markerColors={markerColors}
                        construction={construction}
                        onComplete={handleInstructionComplete}
                        onCancel={handleInstructionCancel}
                        onBack={handleBackNavigation}
                        wizard={wizard}
                        existingInstructionData={currentSequenceData?.instructionData}

                    />
                </div>
            </div>
        );
    }

    // ===== RENDER SCREEN: TIMING CONFIGURATION =====
    if (currentScreen === 'timing') {
        return (
            <MarkerTimingConfig
                instructionData={currentSequenceData?.instructionData || currentSequenceData}
                markerArray={markerArray}
                markerColors={markerColors}
                construction={construction}
                onComplete={handleTimingComplete}
                onBack={handleBackNavigation}
                wizard={wizard}
                onGoToLanding={onGoToLanding}
                onCancel={onCancel}
                currentStitches={currentStitches}
                project={project}
                componentIndex={componentIndex}
                mode={mode}
                onExitToComponentSteps={onExitToComponentSteps}
            />
        );
    }

    // ===== FALLBACK: KEEP EXISTING SEQUENCE WIZARD FOR COMPATIBILITY =====
    if (currentScreen === 'sequence-wizard') {
        // This can be removed once instruction builder is fully integrated
        return (
            <div>
                <ShapingHeader
                    onBack={handleBackNavigation}
                    onGoToLanding={onGoToLanding}
                    wizard={wizard}
                    onCancel={onCancel}
                />
                <div className="p-6">
                    <div className="text-center text-wool-600">
                        <p>Old sequence wizard - this should not be reached</p>
                        <button onClick={() => setCurrentScreen('sequence-management')} className="btn-primary mt-4">
                            Back to Sequences
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <StepSaveErrorModal
            isOpen={!!error}
            error={error}
            onClose={clearError}
            onRetry={() => handleTimingComplete(currentSequenceData?.instructionData)}
        />
    );
};

export default MarkerPhasesConfig;