// src/shared/utils/markerColors.js

/**
 * Marker Color System for IntelliKnit
 * Provides consistent color coding for markers across the application
 */

// Marker category definitions with semantic meaning
export const MARKER_CATEGORIES = {
    'R': {
        label: 'Raglan',
        description: 'Raglan shaping markers',
        bgColor: 'bg-sage-100',
        borderColor: 'border-sage-400',
        textColor: 'text-sage-700',
        hex: '#4a8a4a'
    },
    'M': {
        label: 'Marker',
        description: 'General purpose markers',
        bgColor: 'bg-sky-100',
        borderColor: 'border-sky-400',
        textColor: 'text-sky-700',
        hex: '#3b82f6'
    },
    'S': {
        label: 'Side',
        description: 'Side seam markers',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-400',
        textColor: 'text-amber-700',
        hex: '#f59e0b'
    },
    'W': {
        label: 'Waist',
        description: 'Waist shaping markers',
        bgColor: 'bg-rose-100',
        borderColor: 'border-rose-400',
        textColor: 'text-rose-700',
        hex: '#f43f5e'
    },
    'U': {
        label: 'Underarm',
        description: 'Underarm markers',
        bgColor: 'bg-violet-100',
        borderColor: 'border-violet-400',
        textColor: 'text-violet-700',
        hex: '#8b5cf6'
    },
    'P': {
        label: 'Panel',
        description: 'Panel or section markers',
        bgColor: 'bg-emerald-100',
        borderColor: 'border-emerald-400',
        textColor: 'text-emerald-700',
        hex: '#10b981'
    },
    'C': {
        label: 'Center',
        description: 'Center front/back markers',
        bgColor: 'bg-indigo-100',
        borderColor: 'border-indigo-400',
        textColor: 'text-indigo-700',
        hex: '#6366f1'
    },
    'BOR': {
        label: 'Beginning',
        description: 'Beginning of round',
        bgColor: 'bg-sage-200',
        borderColor: 'border-sage-500',
        textColor: 'text-sage-700',
        hex: '#4a8a4a',
        special: true
    }
};

/**
 * Parse marker name into category and number
 * @param {string} name - Marker name (e.g., 'R1', 'M2', 'BOR')
 * @returns {object} { category, number }
 */
export const parseMarkerName = (name) => {
    if (!name) return { category: null, number: null };
    if (name === 'BOR') return { category: 'BOR', number: null };

    const match = name.match(/^([A-Z])(\d+)$/);
    if (match) {
        return {
            category: match[1],
            number: parseInt(match[2])
        };
    }

    // Handle single letters without numbers
    const singleLetter = name.match(/^([A-Z])$/);
    if (singleLetter) {
        return {
            category: singleLetter[1],
            number: null
        };
    }

    return { category: null, number: null };
};

/**
 * Get marker style configuration
 * @param {string} markerName - Marker name
 * @returns {object} Style configuration with colors and labels
 */
export const getMarkerStyle = (markerName) => {
    const { category } = parseMarkerName(markerName);

    if (category && MARKER_CATEGORIES[category]) {
        return MARKER_CATEGORIES[category];
    }

    // Fallback for unknown markers
    return {
        label: 'Custom',
        description: 'Custom marker',
        bgColor: 'bg-wool-200',
        borderColor: 'border-wool-400',
        textColor: 'text-wool-700',
        hex: '#6b7280'
    };
};

/**
 * Generate smart marker names based on pattern type
 * @param {number} count - Number of markers
 * @param {string} construction - 'flat' or 'round'
 * @returns {array} Array of marker names
 */
export const generateSmartMarkerNames = (count, construction) => {
    // Common knitting patterns
    if (construction === 'round') {
        if (count === 4) {
            // Raglan sweater
            return ['R1', 'R2', 'R3', 'R4'];
        } else if (count === 2) {
            // Waist shaping or simple decrease
            return ['W1', 'W2'];
        } else if (count === 6) {
            // Six-panel construction
            return ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
        }
    } else if (construction === 'flat') {
        if (count === 2) {
            // Side seams
            return ['S1', 'S2'];
        } else if (count === 4) {
            // Armhole shaping
            return ['U1', 'U2', 'U3', 'U4'];
        } else if (count === 1) {
            // Center marker
            return ['C1'];
        }
    }

    // Default: Generic markers
    return Array.from({ length: count }, (_, i) => `M${i + 1}`);
};

/**
 * Get suggested marker setup for common patterns
 */
export const COMMON_MARKER_PATTERNS = {
    raglan_round: {
        name: 'Raglan (Round)',
        count: 4,
        markers: ['R1', 'R2', 'R3', 'R4'],
        description: 'Classic raglan sweater construction'
    },
    waist_round: {
        name: 'Waist Shaping',
        count: 2,
        markers: ['W1', 'W2'],
        description: 'Waist increases or decreases'
    },
    sides_flat: {
        name: 'Side Seams',
        count: 2,
        markers: ['S1', 'S2'],
        description: 'Flat knitting with side shaping'
    },
    armholes_flat: {
        name: 'Armholes',
        count: 4,
        markers: ['U1', 'U2', 'U3', 'U4'],
        description: 'Front and back armhole shaping'
    },
    center_flat: {
        name: 'Center',
        count: 1,
        markers: ['C1'],
        description: 'Center front or back shaping'
    }
};