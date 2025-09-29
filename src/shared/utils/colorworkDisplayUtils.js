// src/shared/utils/colorworkDisplayUtils.js

/**
 * Get yarn by letter from yarns array, with fallback for unmapped colors
 */
export const getYarnByLetter = (yarns, letter) => {
    return yarns.find(y => y.letter === letter) || {
        id: `color-${letter}`,
        letter: letter,
        color: `Color ${letter}`,
        colorHex: '#cccccc'
    };
};

/**
 * Get yarn display name in standard format: "Name (Color X)"
 */
export const getYarnDisplayName = (yarn) => {
    if (!yarn) return 'Unknown Color';
    const name = yarn.color || `Color ${yarn.letter}`;
    return `${name} (Color ${yarn.letter})`;
};

/**
 * Format list of yarn IDs into readable text
 */
export const formatYarnIds = (yarnIds, yarns) => {
    return yarnIds.map(id => {
        const yarn = yarns.find(y => y.id === id);
        return getYarnDisplayName(yarn);
    }).join(' & ');
};

/**
 * Formats colorwork configuration into human-readable text
 * @param {Object} colorwork - The colorwork object from defaultColorwork or step.colorwork
 * @param {Array} yarns - Array of yarn objects with letter, color, colorHex
 * @returns {string} - Human-readable description
 */
export const formatColorworkDisplay = (colorwork, yarns) => {
    if (!colorwork || !colorwork.type) return '';

    switch (colorwork.type) {
        case 'single': {
            const yarn = getYarnByLetter(yarns, colorwork.colorLetter);
            return getYarnDisplayName(yarn);
        }

        case 'multi_strand': {
            const yarnNames = colorwork.colorLetters?.map(letter => {
                const yarn = getYarnByLetter(yarns, letter);
                return getYarnDisplayName(yarn);
            }).join(' & ');
            return `Hold ${yarnNames} together`;
        }

        case 'advanced': {
            if (colorwork.advancedType === 'stripes') return 'Stripes';
            if (colorwork.advancedType === 'fair_isle') return 'Fair Isle';
            if (colorwork.advancedType === 'intarsia') return 'Intarsia';
            return 'Colorwork';
        }

        default:
            return 'Multiple Colors';
    }
};