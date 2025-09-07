// src/features/steps/components/shaping-wizard/MarkerPhasesConfig.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ShapingHeader from './ShapingHeader';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import MarkerSequenceSummary from './MarkerSequenceSummary';
import markerArrayUtils from '../../../../shared/utils/markerArrayUtils';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { MarkerSequenceCalculator } from '../../../../shared/utils/MarkerSequenceCalculator';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import SimplifiedPhaseCreator from './SimplifiedPhaseCreator';


// ===== NEW: MARKER TYPE SYSTEM =====
const MARKER_TYPES = [
    { letter: 'M', label: 'Marker', bgColor: 'bg-sky-100', borderColor: 'border-sky-400', textColor: 'text-sky-700' },
    { letter: 'L', label: 'Left', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-400', textColor: 'text-emerald-700' },
    { letter: 'R', label: 'Right/Raglan', bgColor: 'bg-amber-100', borderColor: 'border-amber-400', textColor: 'text-amber-700' },
    { letter: 'S', label: 'Side/Shoulder', bgColor: 'bg-rose-100', borderColor: 'border-rose-400', textColor: 'text-rose-700' },
    { letter: 'V', label: 'V-neck', bgColor: 'bg-violet-100', borderColor: 'border-violet-400', textColor: 'text-violet-700' },
    { letter: 'W', label: 'Waist', bgColor: 'bg-indigo-100', borderColor: 'border-indigo-400', textColor: 'text-indigo-700' },
    { letter: 'A', label: 'Armhole', bgColor: 'bg-purple-100', borderColor: 'border-purple-400', textColor: 'text-purple-700' },
    { letter: 'B', label: 'Back', bgColor: 'bg-teal-100', borderColor: 'border-teal-400', textColor: 'text-teal-700' }
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
        setCurrentScreen('sequence-wizard');
    };

    const handleEditSequence = (sequenceId) => {
        const sequence = sequences.find(s => s.id === sequenceId);
        setEditingSequence(sequence);
        setCurrentScreen('sequence-wizard');
    };

    const handleDeleteSequence = (sequenceId) => {
        setSequences(prev => prev.filter(s => s.id !== sequenceId));
        IntelliKnitLogger.info('Sequence deleted', sequenceId);
    };

    const handleSequenceComplete = (sequenceData) => {
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
    if (currentScreen === 'marker-setup') {
        return (
            <div>
                <ShapingHeader
                    onBack={handleBackNavigation}
                    onGoToLanding={onGoToLanding}
                    wizard={wizard}
                    onCancel={onCancel}
                />

                <div className="p-6 stack-lg">
                    <div>
                        <h2 className="content-header-primary">Marker Setup</h2>
                        <p className="content-subheader">
                            {currentStitches} stitches • {construction} construction
                        </p>
                    </div>

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

                    {/* Marker Count Input */}
                    {!showSegments && (
                        <div className="card">
                            <div className="stack-md">
                                <label className="text-sm font-semibold text-sage-700">
                                    How many markers do you need?
                                </label>

                                <IncrementInput
                                    value={markerCount}
                                    onChange={setMarkerCount}
                                    min={1}
                                    max={10}
                                    label="markers"
                                    unit="markers"
                                    size="default"
                                />

                                <button
                                    onClick={handleCreateMarkerSegments}
                                    className="btn-primary mt-4"
                                >
                                    Place Markers →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Segment Configuration */}
                    {showSegments && segments.length > 0 && (
                        <div className="card">
                            <h4 className="text-sm font-semibold text-sage-700 mb-4">Configure Your Markers</h4>

                            {/* Visual builder with live preview */}
                            <div className="space-y-4">
                                {segments.map((segment, index) => (
                                    <div key={segment.id} className="space-y-2">
                                        {segment.type === 'marker' ? (
                                            <div className="flex items-center justify-between">
                                                {/* Marker Display */}
                                                <div className="flex items-center gap-2">
                                                    {renderMarkerBubble(segment, index)}
                                                </div>

                                                {/* Type Selection Chips */}
                                                {!segment.readonly && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-wool-500 mr-1">Type:</span>
                                                        {renderMarkerTypeChips(segment, segment.id)}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 pl-4">
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
                                                <span className="text-xs text-wool-500">
                                                    {index === segments.length - 1
                                                        ? (construction === 'round' ? 'back to BOR' : 'to end')
                                                        : 'to next marker'
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Color Groups Preview */}
                            {renderColorGroupsPreview()}

                            {/* Total stitch validation */}
                            <div className={`mt-4 p-3 rounded-lg text-sm ${markerArrayUtils.sumArrayStitches(currentArray) === currentStitches
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                Total: {markerArrayUtils.sumArrayStitches(currentArray)} / {currentStitches} stitches
                                {markerArrayUtils.sumArrayStitches(currentArray) !== currentStitches && (
                                    <span className="ml-2 font-medium">
                                        ({Math.abs(currentStitches - markerArrayUtils.sumArrayStitches(currentArray))}
                                        {markerArrayUtils.sumArrayStitches(currentArray) < currentStitches ? ' short' : ' over'})
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowSegments(false)}
                                    className="btn-tertiary btn-sm"
                                >
                                    ← Change Marker Count
                                </button>
                                <button
                                    onClick={handleCreateMarkerSegments}
                                    className="btn-secondary btn-sm"
                                >
                                    Update Distribution
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Live Preview */}
                    {showSegments && currentArray.length > 0 && (
                        <div className="card">
                            <h4 className="text-sm font-semibold text-sage-700 mb-3">Live Preview</h4>
                            <MarkerArrayVisualization
                                stitchArray={currentArray}
                                construction={construction}
                                showActions={false}
                            />
                            <p className="text-xs text-wool-500 text-center mt-3">
                                This shows how your markers will appear in the pattern
                            </p>
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

    // ===== RENDER SCREEN 3: SEQUENCE WIZARD =====
    if (currentScreen === 'sequence-wizard') {
        return (
            <SimplifiedPhaseCreator
                markerArray={markerArray}
                construction={construction}
                onComplete={handleSequenceComplete}
                onCancel={() => setCurrentScreen('sequence-management')}
                onBack={() => setCurrentScreen('sequence-management')}
                wizard={wizard}
                onGoToLanding={onGoToLanding}
                editingSequence={editingSequence}
            />
        );
    }

    return null;
};

export default MarkerPhasesConfig;