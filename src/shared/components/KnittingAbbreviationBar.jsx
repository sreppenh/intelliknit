import React from 'react';
import { useKnittingAbbreviations } from '../hooks/useKnittingAbbreviations';

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
        isFiltering,
        getUnclosedBrackets
    } = useKnittingAbbreviations({
        textareaRef,
        value,
        onChange,
        recentlyUsed,
        onUpdateRecentlyUsed
    });

    // Get current bracket/paren state
    const { hasOpenBracket, hasOpenParen } = getUnclosedBrackets();

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

            {/* Scrolling bubble container with two rows */}
            <div className="flex flex-col gap-2">
                {/* First row: Regular abbreviation bubbles */}
                <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                    {displayAbbreviations.map((item) => (
                        <button
                            key={item.abbr}
                            onMouseDown={(e) => {
                                e.preventDefault();
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

                {/* Second row: Always-visible punctuation helpers */}
                <div className="flex gap-2 px-1">
                    {/* Smart bracket toggle */}
                    <button
                        onMouseDown={(e) => {
                            e.preventDefault();
                            handleInsert(hasOpenBracket ? ']' : '[');
                        }}
                        className={`suggestion-bubble-punctuation flex-shrink-0 ${hasOpenBracket ? 'suggestion-bubble-punctuation-active' : ''
                            }`}
                        type="button"
                        title={hasOpenBracket ? 'Close bracket ]' : 'Open bracket ['}
                    >
                        {hasOpenBracket ? ']' : '['}
                    </button>

                    {/* Smart paren toggle */}
                    <button
                        onMouseDown={(e) => {
                            e.preventDefault();
                            handleInsert(hasOpenParen ? ')' : '(');
                        }}
                        className={`suggestion-bubble-punctuation flex-shrink-0 ${hasOpenParen ? 'suggestion-bubble-punctuation-active' : ''
                            }`}
                        type="button"
                        title={hasOpenParen ? 'Close paren )' : 'Open paren ('}
                    >
                        {hasOpenParen ? ')' : '('}
                    </button>

                    {/* Comma button */}
                    <button
                        onMouseDown={(e) => {
                            e.preventDefault();
                            handleInsert(',');
                        }}
                        className="suggestion-bubble-punctuation flex-shrink-0"
                        type="button"
                        title="Insert comma"
                    >
                        ,
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KnittingAbbreviationBar;