// src/shared/utils/PatternCategories.js
/**
 * Centralized Pattern Category System
 * 
 * This replaces the hardcoded pattern lists scattered throughout the codebase
 * with a single source of truth that's maintainable and extensible.
 */

export const PATTERN_CATEGORIES = {
    // Quick Selection Categories - Simple patterns that don't need configuration
    basic: {
        name: 'Basic Stitches',
        icon: '📐',
        type: 'quick',
        patterns: [
            { name: 'Stockinette', icon: '⬜', desc: 'Classic smooth fabric' },
            { name: 'Garter', icon: '〰️', desc: 'Bumpy, stretchy texture' },
            { name: 'Reverse Stockinette', icon: '⬛', desc: 'Purl side showing' }
        ]
    },
    rib: {
        name: 'Ribbing',
        icon: '〰️',
        type: 'quick',
        patterns: [
            { name: '1x1 Rib', icon: '|||', desc: 'K1, P1 alternating' },
            { name: '2x2 Rib', icon: '||||', desc: 'K2, P2 alternating' },
            { name: '3x3 Rib', icon: '||||||', desc: 'K3, P3 alternating' },
            { name: '2x1 Rib', icon: '||', desc: 'K2, P1 alternating' },
            { name: '1x1 Twisted Rib', icon: '🌀', desc: 'Twisted knit stitches' },
            { name: '2x2 Twisted Rib', icon: '🌀🌀', desc: 'Twisted knit stitches' }
        ]
    },
    textured: {
        name: 'Textured',
        icon: '🔹',
        type: 'quick',
        patterns: [
            { name: 'Seed Stitch', icon: '🌱', desc: 'Bumpy alternating texture' },
            { name: 'Moss Stitch', icon: '🍃', desc: 'British seed stitch' },
            { name: 'Double Seed', icon: '🌿', desc: '2x2 seed variation' },
            { name: 'Basketweave', icon: '🧺', desc: 'Alternating knit/purl blocks' },
            { name: 'Linen Stitch', icon: '🪢', desc: 'Slip stitch texture' },
            { name: 'Rice Stitch', icon: '🌾', desc: 'Seed stitch variation' },
            { name: 'Trinity Stitch', icon: '🔮', desc: 'Bobble-like clusters' },
            { name: 'Broken Rib', icon: '💔', desc: 'Interrupted ribbing pattern' }
        ]
    },

    // Advanced Categories - Complex patterns that need configuration
    lace: {
        name: 'Lace',
        icon: '🕸️',
        type: 'advanced',
        patterns: [
            { name: 'Lace Pattern', icon: '🕸️', desc: 'Define your lace pattern' }
        ]
    },
    cable: {
        name: 'Cables',
        icon: '🔗',
        type: 'advanced',
        patterns: [
            { name: 'Cable Pattern', icon: '🔗', desc: 'Define your cable pattern' }
        ]
    },
    colorwork: {
        name: 'Colorwork',
        icon: '🌈',
        type: 'advanced',
        patterns: [
            { name: 'Fair Isle', icon: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', desc: 'Define your colorwork pattern' },
            { name: 'Intarsia', icon: '🎨', desc: 'Large color blocks' },
            { name: 'Stripes', icon: '🌈', desc: 'Define your stripe sequence' }
        ]
    },

    // Custom Category
    custom: {
        name: 'Custom Pattern',
        icon: '✨',
        type: 'advanced',
        patterns: [
            { name: 'Custom pattern', icon: '📝', desc: 'Define your own pattern' }
        ]
    }
};

/**
 * Pattern Category Utilities
 * These functions replace hardcoded logic throughout the codebase
 */

// Get all categories of a specific type
export const getCategoriesByType = (type) => {
    return Object.keys(PATTERN_CATEGORIES).filter(
        key => PATTERN_CATEGORIES[key].type === type
    );
};

// Get all quick categories (basic, rib, textured)
export const getQuickCategories = () => getCategoriesByType('quick');

// Get all advanced categories (lace, cable, colorwork, custom)
export const getAdvancedCategories = () => getCategoriesByType('advanced');

// Check if a category is of a specific type
export const isCategoryType = (categoryKey, type) => {
    return PATTERN_CATEGORIES[categoryKey]?.type === type;
};

// Check if a category needs configuration
export const categoryNeedsConfiguration = (categoryKey) => {
    return isCategoryType(categoryKey, 'advanced');
};

// Check if a pattern should skip configuration
export const shouldSkipConfiguration = (wizardData) => {
    const { category } = wizardData.stitchPattern || {};

    // Quick categories don't need configuration
    return isCategoryType(category, 'quick');
};

// Get all patterns from all categories (for pattern name lookup)
export const getAllPatterns = () => {
    const allPatterns = [];
    Object.values(PATTERN_CATEGORIES).forEach(category => {
        category.patterns.forEach(pattern => {
            allPatterns.push({
                ...pattern,
                categoryKey: Object.keys(PATTERN_CATEGORIES).find(
                    key => PATTERN_CATEGORIES[key] === category
                ),
                categoryType: category.type
            });
        });
    });
    return allPatterns;
};

// Get all patterns from quick categories only
export const getQuickPatterns = () => {
    return getAllPatterns().filter(pattern => pattern.categoryType === 'quick');
};

// Get all pattern names (for backwards compatibility with existing code)
export const getQuickPatternNames = () => {
    return getQuickPatterns().map(pattern => pattern.name);
};

// Find category by pattern name
export const findCategoryByPattern = (patternName) => {
    for (const [categoryKey, category] of Object.entries(PATTERN_CATEGORIES)) {
        const pattern = category.patterns.find(p => p.name === patternName);
        if (pattern) {
            return {
                categoryKey,
                category: category,
                pattern: pattern
            };
        }
    }
    return null;
};

// Validate pattern exists in categories
export const isValidPattern = (patternName) => {
    return findCategoryByPattern(patternName) !== null;
};

/**
 * Legacy Support Functions
 * These help transition existing code that relies on hardcoded pattern lists
 */

// Replace hardcoded pattern counts in WizardHeader.jsx
export const getCategoryPatternCount = (categoryKey) => {
    return PATTERN_CATEGORIES[categoryKey]?.patterns?.length || 0;
};

// Replace hardcoded category pattern counts
export const getAllCategoryPatternCounts = () => {
    const counts = {};
    Object.keys(PATTERN_CATEGORIES).forEach(key => {
        counts[key] = getCategoryPatternCount(key);
    });
    return counts;
};

export default PATTERN_CATEGORIES;