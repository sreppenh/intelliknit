// src/features/knitting/components/modal/KnittingGaugeCard.jsx
import React, { useEffect } from 'react';
import { Ruler, TrendingUp, Check, X, Target } from 'lucide-react';

const KnittingGaugeCard = ({
    gaugeData,
    onAccept,
    onDecline,
    navigation,
    isNotepadMode = false
}) => {
    const hasExistingGauge = gaugeData?.hasExistingGauge;
    const units = gaugeData?.units || 'inches';
    const isMatch = gaugeData?.isMatch || false; // ✅ NEW: Check if gauge matches
    const percentDiff = gaugeData?.percentDifference || 0;

    // ✅ NEW: Auto-advance after 2.5 seconds if gauge is a perfect match
    useEffect(() => {
        if (isMatch && onAccept) {
            const timer = setTimeout(() => {
                onAccept();
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [isMatch, onAccept]);

    // ✅ NEW: Perfect match celebration view
    if (isMatch) {
        return (
            <div className="flex-1 flex flex-col bg-gradient-to-br from-sage-50 via-sage-25 to-white relative overflow-hidden">
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center relative z-10">
                    {/* Celebration Icon */}
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sage-400 to-sage-500 text-white flex items-center justify-center mb-6 shadow-lg animate-bounce-subtle">
                        <Target size={40} />
                    </div>

                    <h2 className="text-3xl font-bold text-sage-800 mb-2">
                        🎯 Perfect Gauge!
                    </h2>

                    <p className="text-sage-600 text-base mb-4 max-w-sm">
                        Your knitting perfectly matches the project gauge
                    </p>

                    {/* Gauge data card */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border-2 border-sage-300 shadow-sm w-full max-w-sm mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sage-700 font-medium text-sm">Your Gauge</span>
                            <div className="flex items-center gap-1">
                                <Check size={16} className="text-sage-500" />
                                <span className="text-xs text-sage-600">±{percentDiff.toFixed(1)}%</span>
                            </div>
                        </div>
                        <div className="text-sage-800 font-bold text-xl">
                            {gaugeData?.newRowsForMeasurement} rows per {gaugeData?.measurement} {gaugeData?.units}
                        </div>
                        <div className="text-xs text-sage-500 mt-2">
                            Based on: {gaugeData?.actualRows} rows = {gaugeData?.actualDistance} {units}
                        </div>
                    </div>

                    {/* Manual continue button (in case they want to continue before timer) */}
                    <button
                        onClick={onAccept}
                        className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all duration-200 bg-sage-500 hover:bg-sage-600 text-white shadow-lg"
                    >
                        <Check size={18} />
                        Continue
                    </button>

                    <p className="text-sage-500 text-xs mt-4 max-w-xs leading-relaxed">
                        Continuing automatically in 2 seconds...
                    </p>
                </div>
            </div>
        );
    }

    // ✅ ORIGINAL: Gauge update needed view
    return (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-yarn-50 via-yarn-25 to-white relative overflow-hidden">
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center relative z-10">
                {/* Icon with measuring theme */}
                <div className="w-18 h-18 rounded-full bg-gradient-to-br from-yarn-400 to-yarn-500 text-white flex items-center justify-center mb-6 shadow-lg">
                    <Ruler size={32} />
                </div>

                <h2 className="text-2xl font-bold text-yarn-800 mb-2">
                    Update Your Gauge?
                </h2>

                <p className="text-yarn-600 text-base mb-6 max-w-sm">
                    Based on this step: <span className="font-semibold">{gaugeData?.actualRows} rows = {gaugeData?.actualDistance} {units}</span>
                </p>

                {/* Gauge comparison cards */}
                <div className="space-y-4 w-full max-w-sm mb-8">
                    {/* Current gauge (if exists) */}
                    {hasExistingGauge && (
                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-yarn-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-yarn-700 font-medium text-sm">Current Gauge</span>
                                <div className="w-2 h-2 bg-yarn-300 rounded-full"></div>
                            </div>
                            <div className="text-yarn-800 font-bold text-lg">
                                {gaugeData.oldRowsForMeasurement} rows per {gaugeData.measurement} {gaugeData.units}
                            </div>
                        </div>
                    )}

                    {/* Proposed gauge */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-2 border-yarn-300 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-yarn-700 font-medium text-sm">
                                {hasExistingGauge ? 'Proposed Gauge' : 'New Gauge'}
                            </span>
                            <TrendingUp size={16} className="text-yarn-500" />
                        </div>
                        <div className="text-yarn-800 font-bold text-lg">
                            {gaugeData?.newRowsForMeasurement} rows per {gaugeData?.measurement} {gaugeData?.units}
                        </div>
                        {hasExistingGauge && percentDiff > 0 && (
                            <div className="text-xs text-yarn-600 mt-2">
                                {percentDiff.toFixed(1)}% difference
                            </div>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 w-full max-w-sm">
                    <button
                        onClick={onDecline}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 bg-white/80 hover:bg-white text-yarn-600 border-2 border-yarn-200 hover:border-yarn-300"
                    >
                        <X size={18} />
                        Keep Current
                    </button>

                    <button
                        onClick={onAccept}
                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 bg-yarn-500 hover:bg-yarn-600 text-white shadow-lg"
                    >
                        <Check size={18} />
                        Update Gauge
                    </button>
                </div>

                {/* Helper text */}
                <p className="text-yarn-500 text-xs mt-4 max-w-xs leading-relaxed">
                    {hasExistingGauge
                        ? "Updating your gauge helps improve future length calculations"
                        : "Setting your row gauge will enable intelligent length tracking"
                    }
                </p>
            </div>
        </div>
    );
};

export default KnittingGaugeCard;
