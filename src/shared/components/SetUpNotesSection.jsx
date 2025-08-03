// src/shared/components/SetupNotesSection.jsx
import React, { useState } from 'react';

const SetupNotesSection = ({
    value = '',
    onChange,
    title = "Setup Notes",
    subtitle = "Preparation before this step (optional)",
    placeholder = "e.g., Switch to US 6 circular needles, place stitch markers, check measurements",
    className = ""
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`bg-white rounded-2xl border-2 border-wool-200 shadow-sm p-4 ${className}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-left"
            >
                <div>
                    <h3 className="text-sm font-semibold text-wool-700">{title}</h3>
                    <p className="text-xs text-wool-500">{subtitle}</p>
                </div>
                <span className="text-wool-400 text-xl">
                    {isExpanded ? '−' : '+'}
                </span>
            </button>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-wool-200">
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-sm focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white resize-none"
                    />
                </div>
            )}
        </div>
    );
};

export default SetupNotesSection;