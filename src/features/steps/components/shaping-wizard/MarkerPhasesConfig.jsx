// src/features/steps/components/shaping-wizard/MarkerPhasesConfig.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ShapingHeader from './ShapingHeader';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import MarkerSequenceSummary from './MarkerSequenceSummary';
import MarkerSequenceWizard from './MarkerSequenceWizard';
import markerArrayUtils from '../../../../shared/utils/markerArrayUtils';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { MarkerSequenceCalculator } from '../../../../shared/utils/MarkerSequenceCalculator';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import { getMarkerStyle, generateSmartMarkerNames } from '../../../../shared/utils/markerColors';

// ===== MARKER CONFIGURATION CONSTANTS =====
const MARKER_CATEGORIES = {
    'R': { label: 'Raglan', color: 'sage', textColor: 'text-sage-700', bgColor: 'bg-sage-100', borderColor: 'border-sage-400' },
    'M': { label: 'Marker', color: 'sky', textColor: 'text-sky-700', bgColor: 'bg-sky-100', borderColor: 'border-sky-400' },
    'S': { label: 'Side', color: 'amber', textColor: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-400' },
    'W': { label: 'Waist', color: 'rose', textColor: 'text-rose-700', bgColor: 'bg-rose-100', borderColor: 'border-rose-400' },
    'U': { label: 'Underarm', color: 'violet', textColor: 'text-violet-700', bgColor: 'bg-violet-100', borderColor: 'border-violet-400' },
    'P': { label: 'Panel', color: 'emerald', textColor: 'text-emerald-700', bgColor: 'bg-emerald-100', borderColor: 'border-emerald-400' },
    'BOR': { label: 'Beginning', color: 'sage', special: true, textColor: 'text-sage-700', bgColor: 'bg-sage-200', borderColor: 'border-sage-500' }
};

// Helper to get marker category and number
const parseMarkerName = (name) => {
    if (name === 'BOR') return { category: 'BOR', number: null };
    const match = name.match(/^([A-Z])(\d+)$/);
    if (match) {
        return { category: match[1], number: parseInt(match[2]) };
    }
    return { category: null, number: null };
};

// Helper to get marker color styling
{/* const getMarkerStyle = (markerName) => {
    const { category } = parseMarkerName(markerName);
    return MARKER_CATEGORIES[category] || {
        color: 'wool',
        textColor: 'text-wool-700',
        bgColor: 'bg-wool-100',
        borderColor: 'border-wool-400'
    };
};  

// Smart marker name generator
const generateSmartMarkerNames = (count, construction) => {
    // Common patterns
    if (construction === 'round' && count === 4) {
        return ['R1', 'R2', 'R3', 'R4']; // Raglan
    } else if (construction === 'flat' && count === 2) {
        return ['S1', 'S2']; // Sides
    } else if (construction === 'flat' && count === 4) {
        return ['M1', 'M2', 'M3', 'M4']; // Generic markers
    } else {
        // Default: M1, M2, M3...
        return Array.from({ length: count }, (_, i) => `M${i + 1}`);
    }
};  */}

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
    const [markerCategory, setMarkerCategory] = useState('M'); // New: category selector

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

        // Validate array structure
        const errors = markerArrayUtils.validateArray(currentArray);
        return errors.length === 0;
    }, [segments, showSegments, currentArray]);

    // ===== CREATE MARKER SEGMENTS =====
    const handleCreateMarkerSegments = () => {
        const smartNames = generateSmartMarkerNames(markerCount, construction);
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
                name: smartNames[i],
                id: `marker_${smartNames[i]}_${i}`,
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

    // ===== UPDATE SEGMENT =====
    const updateSegment = (segmentId, field, value) => {
        setSegments(prev => prev.map(segment => {
            if (segment.id === segmentId) {
                if (field === 'count') {
                    // For stitch count, ensure it's a valid number
                    const numValue = parseInt(value) || 0;
                    return { ...segment, count: Math.max(0, numValue) };
                } else if (field === 'name') {
                    // For marker name
                    return { ...segment, name: value };
                }
            }
            return segment;
        }));
    };

    // ===== RENDER MARKER BUBBLE =====
    const renderMarkerBubble = (segment, index) => {
        const style = getMarkerStyle(segment.name);
        const { category, number } = parseMarkerName(segment.name);

        return (
            <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full ${style.bgColor} ${style.borderColor} border-2 flex items-center justify-center ${style.textColor} font-bold text-sm`}>
                    {segment.name}
                </div>
                <div className="text-xs text-wool-500">
                    {style.label || 'Marker'}
                </div>
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

                                {/* Smart suggestions based on marker count */}
                                <div className="mt-4">
                                    <p className="text-xs text-wool-500 mb-2">Common patterns:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {construction === 'round' && (
                                            <>
                                                <button
                                                    onClick={() => setMarkerCount(4)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${markerCount === 4
                                                        ? 'bg-sage-500 text-white'
                                                        : 'bg-wool-100 text-wool-600 hover:bg-wool-200'
                                                        }`}
                                                >
                                                    4 - Raglan
                                                </button>
                                                <button
                                                    onClick={() => setMarkerCount(2)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${markerCount === 2
                                                        ? 'bg-sage-500 text-white'
                                                        : 'bg-wool-100 text-wool-600 hover:bg-wool-200'
                                                        }`}
                                                >
                                                    2 - Waist
                                                </button>
                                            </>
                                        )}
                                        {construction === 'flat' && (
                                            <>
                                                <button
                                                    onClick={() => setMarkerCount(2)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${markerCount === 2
                                                        ? 'bg-sage-500 text-white'
                                                        : 'bg-wool-100 text-wool-600 hover:bg-wool-200'
                                                        }`}
                                                >
                                                    2 - Sides
                                                </button>
                                                <button
                                                    onClick={() => setMarkerCount(4)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${markerCount === 4
                                                        ? 'bg-sage-500 text-white'
                                                        : 'bg-wool-100 text-wool-600 hover:bg-wool-200'
                                                        }`}
                                                >
                                                    4 - Armholes
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

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
                            <div className="space-y-3">
                                {segments.map((segment, index) => (
                                    <div key={segment.id} className="flex items-center gap-3">
                                        {segment.type === 'marker' ? (
                                            <>
                                                {renderMarkerBubble(segment, index)}
                                                {!segment.readonly && (
                                                    <input
                                                        type="text"
                                                        value={segment.name}
                                                        onChange={(e) => updateSegment(segment.id, 'name', e.target.value)}
                                                        className="w-16 text-center border-2 border-wool-200 rounded-lg px-2 py-1 text-sm focus:border-sage-500"
                                                        placeholder="M1"
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <div className="flex items-center gap-2 flex-1">
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
                                                <span className="text-xs text-wool-500 ml-2">
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

                            <button
                                onClick={() => setShowSegments(false)}
                                className="btn-tertiary btn-sm mt-4"
                            >
                                ← Change Marker Count
                            </button>
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
            <MarkerSequenceWizard
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