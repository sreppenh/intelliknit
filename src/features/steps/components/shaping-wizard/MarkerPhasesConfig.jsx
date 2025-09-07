// src/features/steps/components/shaping-wizard/MarkerPhasesConfig.jsx
import React, { useState, useEffect, useMemo } from 'react';
import ShapingHeader from './ShapingHeader';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import markerArrayUtils from '../../../../shared/utils/markerArrayUtils';
import IncrementInput from '../../../../shared/components/IncrementInput';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { MarkerSequenceCalculator } from '../../../../shared/utils/MarkerSequenceCalculator';

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
    // ===== STATE MANAGEMENT =====
    const [markerCount, setMarkerCount] = useState(2);
    const [segments, setSegments] = useState([]);
    const [showSegments, setShowSegments] = useState(false);

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
            const markerCount = loadedSegments.filter(s => s.type === 'marker' && s.name !== 'BOR').length;
            setMarkerCount(markerCount);
            setShowSegments(true);
        }
    }, [hasExistingMarkers, component?.stitchArray]);

    // ===== CREATE SEGMENTS FROM MARKER COUNT =====
    const createSegments = (count) => {
        const isRound = construction === 'round';
        const segments = [];

        if (isRound) {
            // Round: BOR + segments
            segments.push({
                type: 'marker',
                name: 'BOR',
                id: 'marker_bor',
                readonly: true
            });

            // Add stitch segments and markers
            for (let i = 1; i <= count; i++) {
                segments.push({
                    type: 'stitches',
                    count: '', // Leave blank for user to fill
                    id: `stitches_${i}`
                });

                if (i < count) {
                    segments.push({
                        type: 'marker',
                        name: `M${i}`,
                        id: `marker_${i}`
                    });
                }
            }

            // Final marker
            segments.push({
                type: 'marker',
                name: `M${count}`,
                id: `marker_${count}`
            });

        } else {
            // Flat: starts with stitches
            for (let i = 1; i <= count + 1; i++) {
                segments.push({
                    type: 'stitches',
                    count: '', // Leave blank
                    id: `stitches_${i}`
                });

                if (i <= count) {
                    segments.push({
                        type: 'marker',
                        name: `M${i}`,
                        id: `marker_${i}`
                    });
                }
            }
        }

        return segments;
    };

    // ===== HANDLE UPDATE BUTTON =====
    const handleUpdate = () => {
        const newSegments = createSegments(markerCount);
        setSegments(newSegments);
        setShowSegments(true);
    };

    // ===== UPDATE INDIVIDUAL SEGMENTS =====
    const updateSegment = (segmentId, field, value) => {
        setSegments(prev => prev.map(segment =>
            segment.id === segmentId
                ? { ...segment, [field]: value }
                : segment
        ));
    };

    // ===== CALCULATE CURRENT ARRAY =====
    const currentArray = useMemo(() => {
        if (!showSegments || segments.length === 0) return [];

        const array = [];
        segments.forEach(segment => {
            if (segment.type === 'marker') {
                array.push(segment.name);
            } else if (segment.count !== '' && segment.count > 0) {
                array.push(parseInt(segment.count)); // Convert to number
            }
        });
        return array;
    }, [segments, showSegments]);

    // ===== VALIDATION =====
    const totalStitches = useMemo(() => {
        return segments
            .filter(s => s.type === 'stitches')
            .reduce((sum, s) => sum + (parseInt(s.count) || 0), 0);
    }, [segments]);

    const hasAllStitches = segments
        .filter(s => s.type === 'stitches')
        .every(s => s.count !== '' && parseInt(s.count) > 0);

    const isValid = hasAllStitches && totalStitches === currentStitches;
    const stitchDifference = totalStitches - currentStitches;

    // ===== COMPLETE SETUP =====
    const handleComplete = () => {
        if (!isValid) return;

        console.log("MarkerPhasesConfig.handleComplete called");

        const basicSequence = {
            id: 'marker_setup',
            name: 'Marker Setup',
            startCondition: { type: 'immediate' },
            phases: [{
                type: 'setup',
                config: { rows: 1 }
            }],
            actions: []
        };

        const calculation = MarkerSequenceCalculator.calculateMarkerPhases(
            [basicSequence],
            currentArray,
            construction
        );

        // Format to match what Sequential Phases provides
        const shapingConfigData = {
            markerSetup: hasExistingMarkers ? 'existing' : 'new',
            stitchArray: currentArray,
            markerCount: markerCount,
            sequences: [basicSequence],
            calculation: calculation
        };

        console.log("Calling onComplete with shaping config:", shapingConfigData);
        IntelliKnitLogger.success('Marker Setup Complete', shapingConfigData);

        // Call onComplete with just the config data, not wrapped in type/config
        onComplete(shapingConfigData);
    };

    // ===== RENDER =====
    return (
        <div>
            <ShapingHeader
                onBack={onBack}
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
                    <div className="card-info">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold text-sage-700">
                                How many markers do you need?
                            </label>
                            <div className="flex items-center gap-3">
                                <IncrementInput
                                    value={markerCount}
                                    onChange={setMarkerCount}
                                    min={1}
                                    max={12}
                                    step={1}
                                />
                                <button
                                    onClick={handleUpdate}
                                    className="btn-primary btn-sm"
                                >
                                    Update
                                </button>
                            </div>
                        </div>

                        {construction === 'round' && (
                            <div className="text-xs text-sage-600">
                                BOR marker will be included automatically for round construction
                            </div>
                        )}
                    </div>
                )}

                {/* Segment Configuration */}
                {showSegments && (
                    <div className="stack-md">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-wool-700">Position & Name Markers</h4>
                            <div className={`text-xs px-2 py-1 rounded ${isValid
                                ? 'bg-sage-100 text-sage-700'
                                : hasAllStitches
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-wool-100 text-wool-600'
                                }`}>
                                {!hasAllStitches
                                    ? 'Fill in all stitch counts'
                                    : isValid
                                        ? `${totalStitches} stitches ✓`
                                        : `${totalStitches} stitches (${stitchDifference > 0 ? '+' : ''}${stitchDifference})`
                                }
                            </div>
                        </div>

                        <div className="stack-sm">
                            {segments.map((segment, index) => (
                                <div key={segment.id} className="flex items-center gap-3 p-3 border border-wool-200 rounded-lg">
                                    {segment.type === 'marker' ? (
                                        // Marker row
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-8 bg-sage-200 border border-sage-400 rounded-full flex items-center justify-center text-xs font-bold text-sage-700">
                                                {segment.name}
                                            </div>
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-sm text-wool-600">Marker:</span>
                                                <input
                                                    type="text"
                                                    value={segment.name}
                                                    onChange={(e) => updateSegment(segment.id, 'name', e.target.value)}
                                                    disabled={segment.readonly}
                                                    className="flex-1 border border-wool-300 rounded px-2 py-1 text-sm disabled:bg-wool-50 disabled:text-wool-500"
                                                    placeholder="Marker name"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        // Stitches row  
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-12 h-8 bg-wool-100 border border-wool-300 rounded flex items-center justify-center text-xs font-medium">
                                                {segment.count || '?'}
                                            </div>
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="text-sm text-wool-600">Stitches:</span>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={segment.count}
                                                    onChange={(e) => updateSegment(segment.id, 'count', e.target.value)}
                                                    className="w-20 border border-wool-300 rounded px-2 py-1 text-sm text-center"
                                                    placeholder="0"
                                                />
                                                <span className="text-xs text-wool-500">
                                                    {index === segments.length - 1
                                                        ? (construction === 'round' ? 'back to BOR' : 'to end')
                                                        : 'to next marker'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowSegments(false)}
                            className="btn-tertiary btn-sm self-start"
                        >
                            ← Change Marker Count
                        </button>
                    </div>
                )}

                {/* Live Preview */}
                {showSegments && currentArray.length > 0 && (
                    <div className="card-info">
                        <h4 className="text-sm font-semibold text-sage-700 mb-3">Live Preview</h4>
                        <MarkerArrayVisualization
                            stitchArray={currentArray}
                            construction={construction}
                            showActions={false}
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button onClick={onBack} className="btn-tertiary flex-1">
                        ← Back
                    </button>
                    <button
                        onClick={handleComplete}
                        disabled={!showSegments || !isValid}
                        className="btn-primary flex-1"
                    >
                        Complete Setup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarkerPhasesConfig;