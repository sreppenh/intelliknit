// src/shared/hooks/useLocalStorage.js
import { useState } from 'react';

/**
 * useLocalStorage - Persist state to localStorage with JSON serialization
 * 
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if nothing in localStorage
 * @returns {[value, setValue]} - State and setter function
 */
export const useLocalStorage = (key, initialValue) => {
    // Initialize state with value from localStorage or initialValue
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update localStorage when state changes
    const setValue = (value) => {
        try {
            // Allow value to be a function for functional updates
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);

            // Save to localStorage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};