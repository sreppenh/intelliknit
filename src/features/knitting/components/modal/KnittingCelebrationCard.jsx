// src/features/knitting/components/modal/KnittingCelebrationCard.jsx
import React from 'react';
import { Trophy, Star, X, RotateCcw, Check } from 'lucide-react';

const KnittingCelebrationCard = ({
    component,
    project,
    celebrationData,
    onClose,
    onReset,
    onDone,
    navigation,
    isNotepadMode = false
}) => {
    // Determine if we're in notepad mode
    const isNotepad = isNotepadMode || project?.isNotepadMode;

    // Get the appropriate theme colors
    const themeColors = isNotepad ? {
        from: 'from-lavender-50',
        via: 'via-lavender-25',
        bg: 'bg-lavender-400',
        bgHover: 'bg-lavender-500',
        text: 'text-lavender-800',
        textSecondary: 'text-lavender-700',
        border: 'border-lavender-200',
        accent: 'text-lavender-400',
        accentSecondary: 'text-lavender-300'
    } : {
        from: 'from-yarn-50',
        via: 'via-yarn-25',
        bg: 'bg-yarn-400',
        bgHover: 'bg-yarn-500',
        text: 'text-yarn-800',
        textSecondary: 'text-yarn-700',
        border: 'border-yarn-200',
        accent: 'text-yarn-400',
        accentSecondary: 'text-yarn-300'
    };

    return (
        <div className={`flex-1 flex flex-col bg-gradient-to-br ${themeColors.from} ${themeColors.via} to-white relative overflow-hidden`}>
            {/* Sparkle texture overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='0.3'%3E%3Cpath d='M30 15l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z'/%3E%3Cpath d='M15 30l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z'/%3E%3Cpath d='M45 30l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }} />
            </div>

            {/* Close button - only show for project mode */}
            {!isNotepad && (
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-yarn-600 hover:bg-white hover:text-yarn-700 transition-all duration-200 flex items-center justify-center shadow-lg border border-yarn-200/50"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 text-center relative z-10">
                {/* Trophy icon with stars */}
                <div className="relative mb-6">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${themeColors.bg} ${themeColors.bgHover} text-white flex items-center justify-center shadow-lg`}>
                        <Trophy size={36} />
                    </div>
                    {/* Floating stars */}
                    <Star className={`absolute -top-2 -right-2 ${themeColors.accent} animate-pulse`} size={16} />
                    <Star className={`absolute -bottom-1 -left-3 ${themeColors.accentSecondary} animate-pulse`} size={12} style={{ animationDelay: '0.5s' }} />
                    <Star className={`absolute top-2 -left-4 ${themeColors.accent} animate-pulse`} size={14} style={{ animationDelay: '1s' }} />
                </div>

                <h2 className={`text-3xl font-bold ${themeColors.text} mb-2`}>
                    {isNotepad ? 'Swatch Complete!' : 'Congratulations!'}
                </h2>

                <h3 className={`text-xl font-semibold ${themeColors.textSecondary} mb-6`}>
                    {isNotepad
                        ? `You finished your ${component?.name || 'swatch'}`
                        : `You completed your ${component?.name}`
                    }
                </h3>

                <div className={`bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border ${themeColors.border}/50 max-w-sm`}>
                    <div className="space-y-3">
                        {isNotepad ? (
                            // Notepad mode content
                            <>
                                <div className={`flex items-center justify-between ${themeColors.textSecondary}`}>
                                    <span className="font-medium">Rows completed:</span>
                                    <span className="font-bold">{celebrationData?.rowsCompleted || 0}</span>
                                </div>

                                <div className={`flex items-center justify-between ${themeColors.textSecondary}`}>
                                    <span className="font-medium">Target length:</span>
                                    <span className="font-bold">{celebrationData?.targetLength} {celebrationData?.units}</span>
                                </div>

                                {celebrationData?.calculatedGauge && (
                                    <div className={`flex items-center justify-between ${themeColors.textSecondary}`}>
                                        <span className="font-medium">Calculated gauge:</span>
                                        <span className="font-bold text-right">
                                            {celebrationData.calculatedGauge.rowGauge.rows} rows<br />
                                            per {celebrationData.calculatedGauge.rowGauge.measurement} {celebrationData.calculatedGauge.rowGauge.units}
                                        </span>
                                    </div>
                                )}

                                <div className={`pt-3 border-t ${themeColors.border}`}>
                                    <p className={`${themeColors.textSecondary} text-sm italic`}>
                                        Perfect for testing patterns and techniques!
                                    </p>
                                </div>
                            </>
                        ) : (
                            // Project mode content (existing)
                            <>
                                <div className={`flex items-center justify-between ${themeColors.textSecondary}`}>
                                    <span className="font-medium">Steps completed:</span>
                                    <span className="font-bold">{component?.steps?.length || 0}</span>
                                </div>

                                <div className={`flex items-center justify-between ${themeColors.textSecondary}`}>
                                    <span className="font-medium">Construction:</span>
                                    <span className="font-bold capitalize">{component?.construction}</span>
                                </div>

                                {component?.startingStitches && (
                                    <div className={`flex items-center justify-between ${themeColors.textSecondary}`}>
                                        <span className="font-medium">Starting stitches:</span>
                                        <span className="font-bold">{component.startingStitches}</span>
                                    </div>
                                )}

                                <div className={`pt-3 border-t ${themeColors.border}`}>
                                    <p className={`${themeColors.textSecondary} text-sm italic`}>
                                        Ready for the next part of your project!
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                {isNotepad ? (
                    // Notepad mode buttons
                    <div className="flex gap-3 mt-6 w-full max-w-sm">
                        <button
                            onClick={onReset}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 bg-white/80 hover:bg-white ${themeColors.textSecondary} border-2 ${themeColors.border} hover:border-opacity-75`}
                        >
                            <RotateCcw size={18} />
                            Knit Again
                        </button>

                        <button
                            onClick={onDone}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${themeColors.bg} hover:${themeColors.bgHover} text-white shadow-lg`}
                        >
                            <Check size={18} />
                            Done
                        </button>
                    </div>
                ) : (
                    // Project mode emoji (existing)
                    <div className="mt-6 text-2xl">
                        🧶✨
                    </div>
                )}
            </div>
        </div>
    );
};

export default KnittingCelebrationCard;