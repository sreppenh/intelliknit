// src/features/steps/components/shaping-wizard/MarkerPhasesConfig.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '../../../../shared/hooks/useDebounce';
import ShapingHeader from './ShapingHeader';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import markerArrayUtils from '../../../../shared/utils/markerArrayUtils';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';

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
    const [screen, setScreen] = useState(1);
    const [markerSetup, setMarkerSetup] = useState({
        useExisting: false,
        placementType: 'semantic', // 'semantic' | 'manual'
        semanticType: '', // 'raglan' | 'waist' | 'shoulder'
        selectedMarkers: [],
        newMarkers: []
    });

    const [markerActions, setMarkerActions] = useState([]);
    const [phaseSequence, setPhaseSequence] = useState([
        {
            frequency: { type: 'every_other_round', times: 5 },
            markerActions: []
        }
    ]);

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

    // ===== CURRENT ARRAY STATE =====
    const currentArray = useMemo(() => {
        if (hasExistingMarkers && markerSetup.useExisting) {
            return component.stitchArray;
        }

        if (markerSetup.newMarkers.length > 0) {
            const baseArray = markerArrayUtils.createInitialArray(currentStitches, construction);
            return markerArrayUtils.placeMarkers(baseArray, markerSetup.newMarkers, construction);
        }

        return markerArrayUtils.createInitialArray(currentStitches, construction);
    }, [hasExistingMarkers, markerSetup, currentStitches, construction, component?.stitchArray]);

    // ===== REAL-TIME PREVIEW =====
    const previewArray = useDebounce(() => {
        if (markerActions.length === 0) return currentArray;

        try {
            return markerArrayUtils.applyMarkerActions(currentArray, markerActions);
        } catch (error) {
            IntelliKnitLogger.error('Preview calculation failed', error);
            return currentArray;
        }
    }, 300, [currentArray, markerActions]);

    // ===== INITIALIZATION =====
    useEffect(() => {
        // Auto-detect if we should use existing markers
        if (hasExistingMarkers) {
            setMarkerSetup(prev => ({
                ...prev,
                useExisting: true,
                selectedMarkers: existingMarkers
            }));
        }
    }, [hasExistingMarkers, existingMarkers]);

    // ===== SCREEN NAVIGATION =====
    const canProceedFromScreen1 = () => {
        if (markerSetup.useExisting) {
            return markerSetup.selectedMarkers.length > 0;
        }
        return markerSetup.markerCount > 0;
    };

    const canProceedFromScreen2 = () => {
        return markerActions.length > 0;
    };

    const canProceedFromScreen3 = () => {
        return phaseSequence.length > 0 && phaseSequence[0].markerActions.length > 0;
    };

    // ===== SEMANTIC MARKER HELPERS =====
    const getSemanticMarkerSetup = (type) => {
        const totalStitches = currentStitches;

        switch (type) {
            case 'raglan':
                const perSection = Math.floor(totalStitches / 4);
                return [
                    { name: 'R1', position: perSection },
                    { name: 'R2', position: perSection * 2 },
                    { name: 'R3', position: perSection * 3 },
                    { name: 'R4', position: perSection * 4 }
                ];

            case 'waist':
                const sidePosition = Math.floor(totalStitches / 2);
                return [
                    { name: 'L1', position: Math.floor(totalStitches * 0.25) },
                    { name: 'R1', position: Math.floor(totalStitches * 0.75) }
                ];

            case 'shoulder':
                return [
                    { name: 'L1', position: Math.floor(totalStitches * 0.2) },
                    { name: 'R1', position: Math.floor(totalStitches * 0.8) }
                ];

            default:
                return [];
        }
    };

    // ===== EVENT HANDLERS =====
    const handleSemanticSetup = (type) => {
        const newMarkers = getSemanticMarkerSetup(type);
        setMarkerSetup(prev => ({
            ...prev,
            semanticType: type,
            newMarkers
        }));
    };

    const handleCompleteSetup = () => {
        // Calculate final configuration
        const finalConfig = {
            markerSetup: markerSetup.useExisting ? 'existing' : 'new',
            markers: markerSetup.useExisting ? markerSetup.selectedMarkers : markerSetup.newMarkers.map(m => m.name),
            phases: phaseSequence,
            calculation: {
                startingStitches: currentStitches,
                endingStitches: markerArrayUtils.sumArrayStitches(previewArray),
                totalRows: phaseSequence.reduce((sum, phase) => sum + (phase.frequency.times || 0), 0),
                finalArray: previewArray,
                instruction: "Marker-based shaping" // TODO: Generate proper description
            }
        };

        IntelliKnitLogger.success('Marker Phases Config Complete', finalConfig);
        onComplete(finalConfig);
    };

    // ===== SCREEN COMPONENTS =====
    const renderScreen1 = () => (
        <div className="p-6 stack-lg">
            <div>
                <h2 className="content-header-primary">📍 Marker Setup</h2>
                <p className="content-subheader">How do you want to set up markers?</p>
            </div>

            {hasExistingMarkers && (
                <div className="card-info">
                    <h4 className="text-sm font-semibold text-sage-700 mb-3">✅ Existing Markers Detected</h4>
                    <MarkerArrayVisualization
                        stitchArray={component.stitchArray}
                        construction={construction}
                        showActions={false}
                    />
                    <div className="mt-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={markerSetup.useExisting}
                                onChange={(e) => setMarkerSetup(prev => ({
                                    ...prev,
                                    useExisting: e.target.checked,
                                    selectedMarkers: e.target.checked ? existingMarkers : []
                                }))}
                                className="rounded border-sage-300"
                            />
                            <span className="text-sm font-medium">Use existing markers</span>
                        </label>
                    </div>
                </div>
            )}

            {!markerSetup.useExisting && (
                <div className="stack-md">
                    <h4 className="text-sm font-semibold text-wool-700">🎯 Marker Placement</h4>

                    <div className="stack-sm">
                        {[
                            { id: 'raglan', name: 'Raglan Shaping', icon: '📈', desc: '4 markers for raglan lines' },
                            { id: 'waist', name: 'Waist Shaping', icon: '👗', desc: '2 markers for side shaping' },
                            { id: 'shoulder', name: 'Shoulder Shaping', icon: '🏔️', desc: '2 markers for shoulder lines' }
                        ].map(option => (
                            <button
                                key={option.id}
                                onClick={() => handleSemanticSetup(option.id)}
                                className={`p-4 border-2 rounded-xl text-left transition-all ${markerSetup.semanticType === option.id
                                        ? 'border-sage-500 bg-sage-50'
                                        : 'border-wool-200 hover:border-sage-300 hover:bg-sage-25'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{option.icon}</span>
                                    <div>
                                        <div className="font-medium">{option.name}</div>
                                        <div className="text-sm text-wool-600">{option.desc}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {(markerSetup.useExisting || markerSetup.newMarkers.length > 0) && (
                <div className="card-info">
                    <h4 className="text-sm font-semibold text-sage-700 mb-3">📐 Current Layout</h4>
                    <MarkerArrayVisualization
                        stitchArray={currentArray}
                        construction={construction}
                        showActions={false}
                    />
                </div>
            )}

            <div className="flex gap-3">
                <button onClick={onBack} className="btn-tertiary flex-1">
                    ← Back
                </button>
                <button
                    onClick={() => setScreen(2)}
                    disabled={!canProceedFromScreen1()}
                    className="btn-primary flex-1"
                >
                    Define Actions →
                </button>
            </div>
        </div>
    );

    const renderScreen2 = () => (
        <div className="p-6 stack-lg">
            <div>
                <h2 className="content-header-primary">🎯 Marker Actions</h2>
                <p className="content-subheader">What happens at each marker?</p>
            </div>

            <div className="card-info">
                <h4 className="text-sm font-semibold text-sage-700 mb-3">Current Markers</h4>
                <MarkerArrayVisualization
                    stitchArray={currentArray}
                    construction={construction}
                    showActions={false}
                />
            </div>

            <div className="stack-md">
                <h4 className="text-sm font-semibold text-wool-700">Action Definition</h4>

                <div className="p-4 border-2 border-wool-200 rounded-xl">
                    <div className="text-center py-4">
                        <div className="text-2xl mb-2">🚧</div>
                        <p className="text-sm text-wool-600">Action configuration UI coming next!</p>
                        <p className="text-xs text-wool-500 mt-2">
                            This will allow defining before/after actions for each marker
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={() => setScreen(1)} className="btn-tertiary flex-1">
                    ← Back
                </button>
                <button
                    onClick={() => setScreen(3)}
                    disabled={!canProceedFromScreen2()}
                    className="btn-primary flex-1"
                >
                    Set Frequency →
                </button>
            </div>
        </div>
    );

    const renderScreen3 = () => (
        <div className="p-6 stack-lg">
            <div>
                <h2 className="content-header-primary">📊 Phase Sequence</h2>
                <p className="content-subheader">How often should the shaping happen?</p>
            </div>

            <div className="text-center py-8">
                <div className="text-4xl mb-4">🚧</div>
                <p className="content-subheader">Phase sequence configuration coming soon!</p>
                <p className="text-sm text-wool-600">This will define frequency and multiple phases.</p>
            </div>

            <div className="flex gap-3">
                <button onClick={() => setScreen(2)} className="btn-tertiary flex-1">
                    ← Back
                </button>
                <button
                    onClick={() => setScreen(4)}
                    className="btn-primary flex-1"
                >
                    Preview →
                </button>
            </div>
        </div>
    );

    const renderScreen4 = () => (
        <div className="p-6 stack-lg">
            <div>
                <h2 className="content-header-primary">👁️ Preview</h2>
                <p className="content-subheader">Review your marker-based shaping</p>
            </div>

            <div className="stack-md">
                <div className="card-info">
                    <h4 className="text-sm font-semibold text-sage-700 mb-3">Before</h4>
                    <MarkerArrayVisualization
                        stitchArray={currentArray}
                        construction={construction}
                        showActions={false}
                    />
                </div>

                <div className="card-info">
                    <h4 className="text-sm font-semibold text-lavender-700 mb-3">After Shaping</h4>
                    <MarkerArrayVisualization
                        stitchArray={previewArray}
                        construction={construction}
                        showActions={true}
                    />
                    <div className="mt-3 text-sm text-lavender-600">
                        <div>Total: {markerArrayUtils.sumArrayStitches(currentArray)} → {markerArrayUtils.sumArrayStitches(previewArray)} stitches</div>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={() => setScreen(3)} className="btn-tertiary flex-1">
                    ← Back
                </button>
                <button
                    onClick={handleCompleteSetup}
                    className="btn-primary flex-1"
                >
                    Complete Setup
                </button>
            </div>
        </div>
    );

    // ===== MAIN RENDER =====
    return (
        <div>
            <ShapingHeader
                onBack={onBack}
                onGoToLanding={onGoToLanding}
                wizard={wizard}
                onCancel={onCancel}
            />

            {screen === 1 && renderScreen1()}
            {screen === 2 && renderScreen2()}
            {screen === 3 && renderScreen3()}
            {screen === 4 && renderScreen4()}
        </div>
    );
};

export default MarkerPhasesConfig;