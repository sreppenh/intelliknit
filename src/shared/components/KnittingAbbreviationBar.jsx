// src/shared/components/KnittingAbbreviationBar.jsx

import React from 'react';
import { useKnittingAbbreviations } from '../hooks/useKnittingAbbreviations';

/**
 * Knitting Abbreviation Bar
 * 
 * Displays smart abbreviation suggestions above textareas for simplified knitting pattern entry.
 * Shows recently used terms by default, filters as user types.
 */
const KnittingAbbreviationBar = ({
    textareaRef,
    value,
    onChange,
    recentlyUsed = [],
    onUpdateRecentlyUsed
}) => {
    const {
        displayAbbreviations,
        currentWord,
        handleInsert,
        isFiltering
    } = useKnittingAbbreviations({
        textareaRef,
        value,
        onChange,
        recentlyUsed,
        onUpdateRecentlyUsed
    });

    // Don't render if no abbreviations to show
    if (displayAbbreviations.length === 0) {
        return null;
    }

    return (
        <div className="knitting-abbreviation-bar">
            {/* Optional label to show state */}
            {isFiltering && currentWord && (
                <div className="text-xs text-wool-500 mb-2 text-center">
                    Filtering: "{currentWord}"
                </div>
            )}

            {/* Horizontal scrolling bubble container */}
            <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                {displayAbbreviations.map((item) => (
                    <button
                        key={item.abbr}
                        onMouseDown={(e) => {
                            e.preventDefault(); // ✨ Prevents focus loss on mobile
                            handleInsert(item.abbr);
                        }}
                        className="suggestion-bubble flex-shrink-0"
                        type="button"
                        title={item.full}
                    >
                        {item.abbr}
                    </button>
                ))}
            </div>
        </div>
    ); // hi
};

export default KnittingAbbreviationBar;