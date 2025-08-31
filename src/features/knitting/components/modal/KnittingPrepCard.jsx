// src/features/knitting/components/modal/KnittingPrepCard.jsx
import React from 'react';
import { FileText } from 'lucide-react';

const KnittingPrepCard = ({ prepNote, stepIndex, navigation }) => {
    return (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-lavender-50 via-lavender-25 to-white relative overflow-hidden">
            {/* Texture overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 text-center relative z-10"><div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender-400 to-lavender-500 text-white flex items-center justify-center mb-6 shadow-lg">
                <FileText size={28} />
            </div>
                <h2 className="text-2xl font-semibold text-lavender-800 mb-4">
                    Preparation
                </h2>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-lavender-200/50 max-w-sm">
                    <p className="text-lavender-700 text-lg leading-relaxed">
                        "{prepNote}"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default KnittingPrepCard;