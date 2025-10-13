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
        const delimiters = [' ', ',', ';', '*', '\n', '(', ')'];
        let lastDelimiterIndex = -1;

        for (const delimiter of delimiters) {
            const index = textBeforeCursor.lastIndexOf(delimiter);
            if (index > lastDelimiterIndex) {
                lastDelimiterIndex = index;
            }
        }

        return textBeforeCursor.slice(lastDelimiterIndex + 1).trim().toLowerCase();
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
     * Handle abbreviation insertion with smart comma cleanup
     */
    /**
   * Handle abbreviation insertion - simple append logic
   */
    const handleInsert = useCallback((abbr) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textBeforeCursor = value.slice(0, cursorPos);
        const textAfterCursor = value.slice(cursorPos);

        // Find the start of the current word to replace
        const delimiters = [' ', ',', ';', '*', '\n', '(', ')', '[', ']'];
        let wordStartIndex = -1;

        for (const delimiter of delimiters) {
            const index = textBeforeCursor.lastIndexOf(delimiter);
            if (index > wordStartIndex) {
                wordStartIndex = index;
            }
        }

        const beforeWord = textBeforeCursor.slice(0, wordStartIndex + 1);

        // Simple: just add a space after each insertion
        const suffix = ' ';

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
        isFiltering: currentWord.length > 0
    };
};