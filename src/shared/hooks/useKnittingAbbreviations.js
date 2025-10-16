// src/shared/hooks/useKnittingAbbreviations.js

import { useState, useEffect, useCallback } from 'react';
import {
    filterAbbreviations,
    getRecentlyUsedAbbreviations,
} from '../KnittingAbbreviations';

/**
 * Custom hook for managing knitting abbreviations
 * Handles filtering, insertion, and recently used tracking
 * 
 * @param {Object} textareaRef - React ref to the textarea element
 * @param {string} value - Current textarea value
 * @param {Function} onChange - Callback to update textarea value
 * @param {Array} recentlyUsed - Array of recently used abbreviations from project
 * @param {Function} onUpdateRecentlyUsed - Callback to update project's recently used list
 */
export const useKnittingAbbreviations = ({
    textareaRef,
    value,
    onChange,
    recentlyUsed = [],
    onUpdateRecentlyUsed
}) => {
    const [currentWord, setCurrentWord] = useState('');
    const [filteredAbbreviations, setFilteredAbbreviations] = useState([]);
    const [displayAbbreviations, setDisplayAbbreviations] = useState([]);

    /**
     * Get the current word being typed (from last delimiter to cursor)
     */
    const getCurrentWord = useCallback(() => {
        if (!textareaRef.current) return '';

        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = value.slice(0, cursorPos);

        // Find last delimiter (space, comma, semicolon, asterisk, newline)
        // ✅ FIXED: Removed ( and ) from delimiters so "[k2tog" still detects "k2tog"
        const delimiters = [' ', ',', ';', '*', '\n'];
        let lastDelimiterIndex = -1;

        for (const delimiter of delimiters) {
            const index = textBeforeCursor.lastIndexOf(delimiter);
            if (index > lastDelimiterIndex) {
                lastDelimiterIndex = index;
            }
        }

        // Get the word after the last delimiter
        const word = textBeforeCursor.slice(lastDelimiterIndex + 1).trim();

        // ✅ NEW: Strip any leading brackets/parens from the word
        // So "[k2tog" becomes "k2tog", "(ssk" becomes "ssk"
        return word.replace(/^[\[\(]+/, '').toLowerCase();
    }, [value, textareaRef]);

    /**
     * Check if there are any unclosed brackets/parens before cursor
     */
    const getUnclosedBrackets = useCallback(() => {
        if (!textareaRef.current) return { hasOpenBracket: false, hasOpenParen: false };

        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = value.slice(0, cursorPos);

        let openBrackets = 0;
        let openParens = 0;

        for (const char of textBeforeCursor) {
            if (char === '[') openBrackets++;
            if (char === ']') openBrackets--;
            if (char === '(') openParens++;
            if (char === ')') openParens--;
        }

        return {
            hasOpenBracket: openBrackets > 0,
            hasOpenParen: openParens > 0
        };
    }, [value, textareaRef]);

    /**
     * Update current word and filtered results
     */
    useEffect(() => {
        const word = getCurrentWord();
        setCurrentWord(word);

        if (word) {
            // User is typing - show filtered results
            const filtered = filterAbbreviations(word);
            setFilteredAbbreviations(filtered);
            setDisplayAbbreviations(filtered.slice(0, 8)); // Max 8 results
        } else {
            // Not typing - show most recently used
            const recent = getRecentlyUsedAbbreviations(recentlyUsed);
            setFilteredAbbreviations([]);
            setDisplayAbbreviations(recent);
        }
    }, [value, getCurrentWord, recentlyUsed]);

    /**
     * Handle abbreviation insertion with smart auto-comma logic
     */
    const handleInsert = useCallback((abbr) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        let textBeforeCursor = value.slice(0, cursorPos);
        const textAfterCursor = value.slice(cursorPos);

        // ✨ SMART PUNCTUATION HANDLING
        const isOpeningPunctuation = ['(', '['].includes(abbr);
        const isClosingPunctuation = [')', ']'].includes(abbr);
        const isPunctuation = isOpeningPunctuation || isClosingPunctuation;

        // Remove trailing comma-space before opening punctuation
        if (isOpeningPunctuation && textBeforeCursor.endsWith(', ')) {
            textBeforeCursor = textBeforeCursor.slice(0, -2) + ' ';
        }

        // ✅ FIX: Remove trailing comma AND space before closing punctuation
        if (isClosingPunctuation) {
            if (textBeforeCursor.endsWith(', ')) {
                textBeforeCursor = textBeforeCursor.slice(0, -2);
            } else if (textBeforeCursor.endsWith(',')) {
                textBeforeCursor = textBeforeCursor.slice(0, -1);
            } else if (textBeforeCursor.endsWith(' ')) {
                textBeforeCursor = textBeforeCursor.slice(0, -1);
            }
        }

        // Find the start of the current word to replace (only for non-punctuation)
        let beforeWord = textBeforeCursor;

        if (!isPunctuation) {
            const delimiters = [' ', ',', ';', '*', '\n', '(', ')', '[', ']'];
            let wordStartIndex = -1;

            for (const delimiter of delimiters) {
                const index = textBeforeCursor.lastIndexOf(delimiter);
                if (index > wordStartIndex) {
                    wordStartIndex = index;
                }
            }

            beforeWord = textBeforeCursor.slice(0, wordStartIndex + 1);
        }

        // Determine suffix
        let suffix;
        const noCommaAfter = ['*', ':', ';', '-', '–', '—', 'rep', 'rem'];

        if (isOpeningPunctuation) {
            suffix = ''; // No space after opening brackets/parens
        } else if (isClosingPunctuation) {
            // ✅ FIX: Check what comes after cursor - don't add comma if there's already one
            if (textAfterCursor.startsWith(',') || textAfterCursor.startsWith(', ')) {
                suffix = '';
            } else if (textAfterCursor.trim() === '' || textAfterCursor.startsWith(' ')) {
                suffix = ''; // End of line or already space
            } else {
                suffix = ', '; // Need comma-space
            }
        } else if (noCommaAfter.includes(abbr)) {
            suffix = ' '; // Just space, no comma
        } else {
            suffix = ', '; // Default: comma-space after abbreviations
        }

        // Build new text
        const newText = beforeWord + abbr + suffix + textAfterCursor;
        const newCursorPos = (beforeWord + abbr + suffix).length;

        // Update recently used FIRST
        if (onUpdateRecentlyUsed) {
            const updatedRecent = [abbr, ...recentlyUsed.filter(a => a !== abbr)].slice(0, 8);
            onUpdateRecentlyUsed(updatedRecent);
        }

        // Update value
        onChange(newText);

        // ✨ Use requestAnimationFrame for better mobile reliability
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        });
    }, [value, onChange, recentlyUsed, onUpdateRecentlyUsed, textareaRef]);



    return {
        displayAbbreviations,
        currentWord,
        handleInsert,
        isFiltering: currentWord.length > 0,
        getUnclosedBrackets
    };
};

// ✨ ADD THIS AFTER THE HOOK CLOSING BRACE
/**
 * Handle keyboard input with smart punctuation cleanup
 * Call this from textarea's onKeyDown
 */
export const handleSmartKeyDown = (e, value, onChange, textareaRef) => {
    const key = e.key;

    // Only intercept specific punctuation
    const smartPunctuation = ['[', ']', '(', ')'];
    if (!smartPunctuation.includes(key)) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    let textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);

    let modified = false;

    // Remove trailing comma-space before opening punctuation
    if (['[', '('].includes(key) && textBeforeCursor.endsWith(', ')) {
        textBeforeCursor = textBeforeCursor.slice(0, -2) + ' ';
        modified = true;
    }

    // Remove trailing space before closing punctuation
    if ([']', ')'].includes(key) && textBeforeCursor.endsWith(' ')) {
        textBeforeCursor = textBeforeCursor.slice(0, -1);
        modified = true;
    }

    if (modified) {
        e.preventDefault(); // Stop the default key behavior

        // Build new text with the typed character
        const newText = textBeforeCursor + key + textAfterCursor;
        const newCursorPos = textBeforeCursor.length + 1;

        onChange(newText);

        // Restore cursor position
        requestAnimationFrame(() => {
            if (textareaRef.current) {
                textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }
        });
    }
};