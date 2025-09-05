// ✅ NEW FILE: src/features/knitting/components/modal/KnittingAssemblyCard.jsx

import React from 'react';
import { Wrench } from 'lucide-react';

const KnittingAssemblyCard = ({ afterNote, stepIndex, navigation, totalSteps, onComponentComplete }) => {
    return (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-sage-50 via-sage-25 to-white relative overflow-hidden">
            {/* Texture overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='1' stroke-opacity='0.03'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3Cpath d='M15 15l30 30M45 15L15 45'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }} />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 text-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sage-400 to-sage-500 text-white flex items-center justify-center mb-6 shadow-lg">
                    <Wrench size={28} />
                </div>

                <h2 className="text-2xl font-semibold text-sage-800 mb-4">
                    Assembly Notes
                </h2>

                {/* Add forward navigation for final step */}
                {/*     {stepIndex === totalSteps - 1 && (
                         <button
                        onClick={() => {
                            // Trigger celebration for final step
                            if (navigation.onComponentComplete) {
                                navigation.onComponentComplete();
                            }
                        }}
                        className="mt-6 px-6 py-3 bg-sage-500 hover:bg-sage-600 text-white rounded-xl font-medium transition-colors"
                    >
                        Complete Component →
                    </button> 
                )} */}

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sage-200/50 max-w-sm">
                    <p className="text-sage-700 text-lg leading-relaxed">
                        "{afterNote}"
                    </p>
                </div>

                <p className="text-sage-600 text-sm mt-6 opacity-75">
                    Complete this step, then follow these assembly instructions
                </p>
            </div>
        </div>
    );
};

export default KnittingAssemblyCard;