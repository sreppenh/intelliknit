// src/shared/hooks/useDebounce.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Debounce hook for expensive calculations
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @param {Array} deps - Dependencies to watch
 * @returns {any} - Result of the callback
 */
export const useDebounce = (callback, delay, deps) => {
    const [debouncedValue, setDebouncedValue] = useState(() => {
        // Initialize with immediate calculation
        try {
            return callback();
        } catch (error) {
            console.error('useDebounce initial calculation failed:', error);
            return null;
        }
    });

    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        setIsCalculating(true);

        const handler = setTimeout(() => {
            try {
                const result = callback();
                setDebouncedValue(result);
            } catch (error) {
                console.error('useDebounce calculation failed:', error);
            } finally {
                setIsCalculating(false);
            }
        }, delay);

        return () => {
            clearTimeout(handler);
            setIsCalculating(false);
        };
    }, deps);

    return debouncedValue;
};

/**
 * Simple debounced value hook
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {any} - Debounced value
 */
export const useDebouncedValue = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;