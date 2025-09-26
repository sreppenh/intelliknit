// src/features/knitting/components/modal/KnittingGaugeCard.jsx
import React from 'react';
import { Ruler, TrendingUp, Check, X } from 'lucide-react';

const KnittingGaugeCard = ({
    gaugeData,
    onAccept,
    onDecline,
    navigation,
    isNotepadMode = false
}) => {
    const hasExistingGauge = gaugeData?.hasExistingGauge;
    const units = gaugeData?.units || 'inches';

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