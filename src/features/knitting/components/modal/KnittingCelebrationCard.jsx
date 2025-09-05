// src/features/knitting/components/modal/KnittingCelebrationCard.jsx
import React from 'react';
import { Trophy, Star, X } from 'lucide-react';

const KnittingCelebrationCard = ({ component, onClose, navigation }) => {
    return (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-yarn-50 via-yarn-25 to-white relative overflow-hidden">
            {/* Sparkle texture overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='0.3'%3E%3Cpath d='M30 15l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z'/%3E%3Cpath d='M15 30l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z'/%3E%3Cpath d='M45 30l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }} />
            </div>

            {/* Close button */}
            <div className="absolute top-4 right-4 z-20">
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-yarn-600 hover:bg-white hover:text-yarn-700 transition-all duration-200 flex items-center justify-center shadow-lg border border-yarn-200/50"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 text-center relative z-10">
                {/* Trophy icon with stars */}
                <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yarn-400 to-yarn-500 text-white flex items-center justify-center shadow-lg">
                        <Trophy size={36} />
                    </div>
                    {/* Floating stars */}
                    <Star className="absolute -top-2 -right-2 text-yarn-400 animate-pulse" size={16} />
                    <Star className="absolute -bottom-1 -left-3 text-yarn-300 animate-pulse" size={12} style={{ animationDelay: '0.5s' }} />
                    <Star className="absolute top-2 -left-4 text-yarn-400 animate-pulse" size={14} style={{ animationDelay: '1s' }} />
                </div>

                <h2 className="text-3xl font-bold text-yarn-800 mb-2">
                    Congratulations!
                </h2>

                <h3 className="text-xl font-semibold text-yarn-700 mb-6">
                    You completed your {component.name}
                </h3>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-yarn-200/50 max-w-sm">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-yarn-700">
                            <span className="font-medium">Steps completed:</span>
                            <span className="font-bold">{component.steps.length}</span>
                        </div>

                        <div className="flex items-center justify-between text-yarn-700">
                            <span className="font-medium">Construction:</span>
                            <span className="font-bold capitalize">{component.construction}</span>
                        </div>

                        {component.startingStitches && (
                            <div className="flex items-center justify-between text-yarn-700">
                                <span className="font-medium">Starting stitches:</span>
                                <span className="font-bold">{component.startingStitches}</span>
                            </div>
                        )}

                        <div className="pt-3 border-t border-yarn-200">
                            <p className="text-yarn-600 text-sm italic">
                                Ready for the next part of your project!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-2xl">
                    🧶✨
                </div>
            </div>
        </div>
    );
};

export default KnittingCelebrationCard;