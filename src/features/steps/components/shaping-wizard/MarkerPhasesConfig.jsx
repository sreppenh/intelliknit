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


// ===== SIMPLIFIED MARKER TYPE SYSTEM =====
const MARKER_TYPES = [
    { letter: 'M', label: 'General', bgColor: 'bg-sage-100', borderColor: 'border-sage-400', textColor: 'text-sage-700' },
    { letter: 'R', label: 'Raglan', bgColor: 'bg-yarn-100', borderColor: 'border-yarn-400', textColor: 'text-yarn-700' },
    { letter: 'S', label: 'Side', bgColor: 'bg-wool-200', borderColor: 'border-wool-400', textColor: 'text-wool-700' },
    { letter: 'W', label: 'Waist', bgColor: 'bg-sage-200', borderColor: 'border-sage-500', textColor: 'text-sage-800' }
];

const getMarkerTypeByLetter = (letter) => {
    return MARKER_TYPES.find(type => type.letter === letter) || MARKER_TYPES[0]; // Default to 'M'
};

const getMarkerPrefix = (markerName) => {
    if (markerName === 'BOR') return 'BOR';

    // Extract letters before the number: "R2" → "R", "ABC" → "ABC"
    const match = markerName.match(/^([A-Z]+)(\d*)$/);
    return match ? match[1] : markerName;
};

const getMarkerColorFromPrefix = (prefix) => {
    if (prefix === 'BOR') {
        return { bgColor: 'bg-sage-200', borderColor: 'border-sage-500', textColor: 'text-sage-700' };
    }

    const markerType = getMarkerTypeByLetter(prefix);
    return {
        bgColor: markerType.bgColor,
        borderColor: markerType.borderColor,
        textColor: markerType.textColor
    };
};

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
    mode
}) => {
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
    const [showSegments, setShowSegments] = useState(false);

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

    // ===== CREATE MARKER SEGMENTS =====
    const handleCreateMarkerSegments = () => {
        // Use simple M1, M2, M3... naming instead of smart names
        const defaultNames = Array.from({ length: markerCount }, (_, i) => `M${i + 1}`);
        const newSegments = [];

        // Calculate even distribution
        const baseStitches = Math.floor(currentStitches / (markerCount + 1));
        const remainder = currentStitches % (markerCount + 1);

        // For round construction, add BOR marker first
        if (construction === 'round') {
            newSegments.push({
                type: 'marker',
                name: 'BOR',
                id: 'marker_BOR',
                readonly: true
            });
        }

        // Add alternating stitches and markers
        for (let i = 0; i < markerCount; i++) {
            // Add stitches segment with even distribution
            const stitchCount = baseStitches + (i < remainder ? 1 : 0);
            newSegments.push({
                type: 'stitches',
                count: stitchCount,
                id: `stitches_${i}`
            });

            // Add marker
            newSegments.push({
                type: 'marker',
                name: defaultNames[i],
                id: `marker_${defaultNames[i]}_${i}`,
                readonly: false
            });
        }

        // Add final stitches segment
        const finalStitchCount = baseStitches + (markerCount < remainder ? 1 : 0);
        newSegments.push({
            type: 'stitches',
            count: finalStitchCount,
            id: `stitches_final`
        });

        setSegments(newSegments);
        setShowSegments(true);

        IntelliKnitLogger.info('Created marker segments', {
            markerCount,
            segments: newSegments,
            totalStitches: currentStitches
        });
    };

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

    // ===== AUTO-RENUMBER MARKERS =====
    const changeMarkerType = (segmentId, newLetter) => {
        setSegments(prev => {
            const newSegments = [...prev];

            // Find the marker being changed
            const markerIndex = newSegments.findIndex(s => s.id === segmentId);
            if (markerIndex === -1) return prev;

            // Update the marker with new letter
            const oldMarker = newSegments[markerIndex];
            newSegments[markerIndex] = {
                ...oldMarker,
                name: newLetter // Will get numbered below
            };

            // Renumber ALL markers of this letter type by their position
            const markersOfThisType = [];
            newSegments.forEach((segment, index) => {
                if (segment.type === 'marker' && !segment.readonly) {
                    const prefix = getMarkerPrefix(segment.name);
                    if (prefix === newLetter) {
                        markersOfThisType.push({ segment, index, position: index });
                    }
                }
            });

            // Sort by position and renumber
            markersOfThisType.sort((a, b) => a.position - b.position);
            markersOfThisType.forEach((item, idx) => {
                newSegments[item.index] = {
                    ...item.segment,
                    name: `${newLetter}${idx + 1}`,
                    id: `marker_${newLetter}${idx + 1}_${item.index}`
                };
            });

            return newSegments;
        });
    };

    // ===== RENDER MARKER TYPE CHIPS =====
    const renderMarkerTypeChips = (currentMarker, segmentId) => {
        const currentPrefix = getMarkerPrefix(currentMarker.name);

        return (
            <div className="flex flex-wrap gap-1">
                {MARKER_TYPES.map((type) => {
                    const isSelected = currentPrefix === type.letter;
                    return (
                        <button
                            key={type.letter}
                            type="button"
                            onClick={() => changeMarkerType(segmentId, type.letter)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-200 ${isSelected
                                ? `${type.borderColor} ${type.bgColor} ${type.textColor} shadow-sm ring-2 ring-sage-500 ring-opacity-30`
                                : `${type.borderColor} ${type.bgColor} ${type.textColor} hover:shadow-sm hover:ring-2 hover:ring-sage-300 hover:ring-opacity-50`
                                }`}
                            title={type.label}
                        >
                            {type.letter}
                        </button>
                    );
                })}
            </div>
        );
    };

    // ===== RENDER MARKER BUBBLE =====
    const renderMarkerBubble = (segment, index) => {
        const prefix = getMarkerPrefix(segment.name);
        const style = getMarkerColorFromPrefix(prefix);

        return (
            <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full ${style.bgColor} ${style.borderColor} border-2 flex items-center justify-center ${style.textColor} font-bold text-sm`}>
                    {segment.name}
                </div>
            </div>
        );
    };

    // ===== RENDER COLOR GROUPS PREVIEW =====
    const renderColorGroupsPreview = () => {
        if (!showSegments || segments.length === 0) return null;

        const markerSegments = segments.filter(s => s.type === 'marker');
        const groups = {};

        markerSegments.forEach(segment => {
            const prefix = getMarkerPrefix(segment.name);
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push(segment.name);
        });

        return (
            <div className="mt-3 p-3 bg-wool-50 rounded-lg">
                <p className="text-xs font-medium text-wool-600 mb-2">Color Groups:</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(groups).map(([prefix, markers]) => {
                        const style = getMarkerColorFromPrefix(prefix);
                        return (
                            <div key={prefix} className="flex items-center gap-1">
                                <div className={`w-4 h-4 rounded-full ${style.bgColor} ${style.borderColor} border`}></div>
                                <span className="text-xs text-wool-600">{markers.join(', ')}</span>
                            </div>
                        );
                    })}
                </div>
                <p className="text-xs text-wool-500 mt-1">
                    Markers with same letters get same color (M1, M2 = blue; R1, R2 = green)
                </p>
            </div>
        );
    };

    // ===== NAVIGATION =====
    const handleBackNavigation = () => {
        if (currentScreen === 'marker-setup') {
            onBack();
        } else if (currentScreen === 'sequence-management') {
            setCurrentScreen('marker-setup');
        } else if (currentScreen === 'instruction-builder') {
            setCurrentScreen('sequence-management');
        } else if (currentScreen === 'sequence-wizard') {
            setCurrentScreen('sequence-management');
        }
    };

    const handleCompleteMarkerSetup = () => {
        setMarkerArray(currentArray);
        setCurrentScreen('sequence-management');
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
            markerCount: markerCount,
            sequences: sequences.length > 0 ? sequences : [{
                id: 'marker_setup',
                name: 'Marker Setup',
                phases: [{ type: 'setup', config: { rows: 1 } }]
            }],
            calculation: calculation
        };

        console.log("Final onComplete with shaping config:", shapingConfigData);
        IntelliKnitLogger.success('Marker Phases Complete', shapingConfigData);
        onComplete(shapingConfigData);
    };

    // ===== RENDER SCREEN 1: MARKER SETUP =====
    // ===== RENDER MARKER SETUP SCREEN =====
    if (currentScreen === 'marker-setup') {
        return (
            <div>
                <ShapingHeader
                    onBack={handleBackNavigation}
                    onGoToLanding={onGoToLanding}
                    wizard={wizard}
                    onCancel={onCancel}
                />

                <div className="p-6 space-y-6">

                    {/* Clean header without redundant info */}
                    <div>
                        <h2 className="section-header-primary">Marker Setup</h2>
                    </div>

                    {/* Existing markers detection - if applicable */}
                    {hasExistingMarkers && !showSegments && (
                        <div className="card-info">
                            <h4 className="section-header-secondary">Existing Markers Detected</h4>
                            <p className="text-sm text-lavender-600 mb-3">
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

                    {/* Main marker configuration - always visible */}
                    <div className="card">
                        <div className="space-y-6">

                            {/* Marker count at top - drives everything below */}
                            <div>
                                <h4 className="section-header-secondary">How many markers do you need?</h4>
                                <div className="flex items-center gap-4">
                                    <IncrementInput
                                        value={markerCount}
                                        onChange={(value) => {
                                            setMarkerCount(value);
                                            if (showSegments) {
                                                // Auto-regenerate segments when count changes
                                                handleCreateMarkerSegments();
                                            }
                                        }}
                                        min={1}
                                        max={8}
                                        label="markers"
                                        unit="markers"
                                        size="default"
                                    />
                                    {!showSegments && (
                                        <button
                                            onClick={handleCreateMarkerSegments}
                                            className="btn-primary"
                                        >
                                            Configure Markers
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Marker configuration - appears when user clicks configure */}
                            {showSegments && segments.length > 0 && (
                                <>
                                    <div>
                                        <h4 className="section-header-secondary">Configure Marker Positions</h4>
                                        <div className="space-y-4">
                                            {segments.map((segment, index) => (
                                                <div key={segment.id}>
                                                    {segment.type === 'marker' ? (
                                                        <div className="flex items-center gap-4">
                                                            {/* Marker display */}
                                                            <div className="flex items-center gap-2 min-w-[80px]">
                                                                {renderMarkerBubble(segment, index)}
                                                            </div>

                                                            {/* Type selection - simplified */}
                                                            {!segment.readonly && (
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-wool-600 font-medium">Type:</span>
                                                                    <div className="flex gap-2">
                                                                        {MARKER_TYPES.map((type) => {
                                                                            const currentPrefix = getMarkerPrefix(segment.name);
                                                                            const isSelected = currentPrefix === type.letter;
                                                                            return (
                                                                                <button
                                                                                    key={type.letter}
                                                                                    type="button"
                                                                                    onClick={() => changeMarkerType(segment.id, type.letter)}
                                                                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSelected
                                                                                        ? `${type.bgColor} ${type.borderColor} ${type.textColor} border-2 shadow-sm`
                                                                                        : `bg-white border border-wool-300 text-wool-600 hover:border-sage-300`
                                                                                        }`}
                                                                                    title={type.label}
                                                                                >
                                                                                    {type.letter}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-4 pl-4">
                                                            <span className="text-sm text-wool-600 font-medium min-w-[80px]">
                                                                Stitches:
                                                            </span>
                                                            <IncrementInput
                                                                value={segment.count}
                                                                onChange={(value) => updateSegment(segment.id, 'count', value)}
                                                                min={0}
                                                                max={currentStitches}
                                                                label="stitches"
                                                                size="sm"
                                                            />
                                                            <span className="text-sm text-wool-500">
                                                                {index === segments.length - 1
                                                                    ? (construction === 'round' ? 'back to BOR' : 'to end')
                                                                    : 'to next marker'
                                                                }
                                                            </span>

                                                            {/* Auto-fill suggestion for last segment */}
                                                            {index === segments.length - 1 && (
                                                                <button
                                                                    onClick={() => {
                                                                        const totalUsed = markerArrayUtils.sumArrayStitches(currentArray) - segment.count;
                                                                        const remaining = currentStitches - totalUsed;
                                                                        updateSegment(segment.id, 'count', remaining);
                                                                    }}
                                                                    className="btn-secondary btn-sm text-xs"
                                                                >
                                                                    Auto-fill ({currentStitches - (markerArrayUtils.sumArrayStitches(currentArray) - segment.count)})
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Simplified color groups preview */}
                                    <div>
                                        <h4 className="section-header-secondary">Color Groups</h4>
                                        {renderColorGroupsPreview()}
                                    </div>

                                    {/* Stitch validation - more prominent */}
                                    <div className={`p-4 rounded-xl border-2 text-sm font-medium ${markerArrayUtils.sumArrayStitches(currentArray) === currentStitches
                                        ? 'bg-sage-50 text-sage-700 border-sage-200'
                                        : 'bg-red-50 text-red-700 border-red-200'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <span>Total: {markerArrayUtils.sumArrayStitches(currentArray)} / {currentStitches} stitches</span>
                                            {markerArrayUtils.sumArrayStitches(currentArray) !== currentStitches && (
                                                <span className="font-bold">
                                                    ({Math.abs(currentStitches - markerArrayUtils.sumArrayStitches(currentArray))}
                                                    {markerArrayUtils.sumArrayStitches(currentArray) < currentStitches ? ' short' : ' over'})
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons - cleaner layout */}
                                    <div className="flex gap-3 pt-4 border-t border-wool-200">
                                        <button
                                            onClick={() => setShowSegments(false)}
                                            className="btn-tertiary"
                                        >
                                            ← Change Count
                                        </button>
                                        <button
                                            onClick={handleCreateMarkerSegments}
                                            className="btn-secondary"
                                            title="Redistribute stitches evenly among current markers"
                                        >
                                            Reset Distribution
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Live Preview - integrated, not separate */}
                    {showSegments && currentArray.length > 0 && (
                        <div className="card bg-sage-50 border-sage-200">
                            <h4 className="section-header-secondary">Preview</h4>
                            <MarkerArrayVisualization
                                stitchArray={currentArray}
                                construction={construction}
                                showActions={false}
                            />
                            <p className="text-sm text-sage-600 mt-3">
                                This shows how your markers will appear in the pattern
                            </p>
                        </div>
                    )}

                    {/* Main navigation */}
                    <div className="flex gap-3">
                        <button onClick={handleBackNavigation} className="btn-tertiary flex-1">
                            ← Back
                        </button>
                        <button
                            onClick={handleCompleteMarkerSetup}
                            disabled={!showSegments || !isValid}
                            className="btn-primary flex-1"
                        >
                            Continue to Sequences →
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
                        <h2 className="content-header-primary">Build Row Instruction</h2>
                        <p className="content-subheader">
                            Define what happens in each shaping row
                        </p>
                    </div>

                    <MarkerInstructionBuilder
                        markerArray={markerArray}
                        construction={construction}
                        onComplete={handleInstructionComplete}
                        onCancel={handleInstructionCancel}
                    />
                </div>
            </div>
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

    return null;
};

export default MarkerPhasesConfig;