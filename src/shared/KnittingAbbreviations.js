// src/shared/constants/knittingAbbreviations.js

/**
 * Comprehensive knitting abbreviation library
 * Used by KnittingAbbreviationBar for smart text entry
 * 
 * Categories: basic, increase, decrease, brioche, slip, cable, lace, mosaic, colorwork, marker, modifier, phrase
 */

export const KNITTING_ABBREVIATIONS = [
    // ===== BASIC STITCHES =====
    { abbr: 'k', full: 'knit', category: 'basic' },
    { abbr: 'p', full: 'purl', category: 'basic' },
    { abbr: 'st', full: 'stitch', category: 'basic' },
    { abbr: 'sts', full: 'stitches', category: 'basic' },

    // ===== INCREASES =====
    { abbr: 'inc', full: 'increase', category: 'increase' },
    { abbr: 'kfb', full: 'knit front and back', category: 'increase' },
    { abbr: 'pfb', full: 'purl front and back', category: 'increase' },
    { abbr: 'm1', full: 'make one', category: 'increase' },
    { abbr: 'm1l', full: 'make one left', category: 'increase' },
    { abbr: 'm1r', full: 'make one right', category: 'increase' },
    { abbr: 'm1p', full: 'make one purlwise', category: 'increase' },
    { abbr: 'yo', full: 'yarn over', category: 'increase' },
    { abbr: 'kll', full: 'knit left loop', category: 'increase' },
    { abbr: 'krl', full: 'knit right loop', category: 'increase' },

    // ===== DECREASES =====
    { abbr: 'dec', full: 'decrease', category: 'decrease' },
    { abbr: 'k2tog', full: 'knit two together', category: 'decrease' },
    { abbr: 'p2tog', full: 'purl two together', category: 'decrease' },
    { abbr: 'k3tog', full: 'knit three together', category: 'decrease' },
    { abbr: 'p3tog', full: 'purl three together', category: 'decrease' },
    { abbr: 'ssk', full: 'slip slip knit', category: 'decrease' },
    { abbr: 'ssp', full: 'slip slip purl', category: 'decrease' },
    { abbr: 'psso', full: 'pass slipped stitch over', category: 'decrease' },
    { abbr: 'p2sso', full: 'pass two slipped stitches over', category: 'decrease' },
    { abbr: 'sk2p', full: 'slip one, knit two together, pass slipped stitch over', category: 'decrease' },
    { abbr: 'sssk', full: 'slip slip slip knit', category: 'decrease' },
    { abbr: 'cdd', full: 'central double decrease', category: 'decrease' },

    // ===== THROUGH BACK LOOP =====
    { abbr: 'tbl', full: 'through back loop', category: 'modifier' },
    { abbr: 'ktbl', full: 'knit through back loop', category: 'modifier' },
    { abbr: 'ptbl', full: 'purl through back loop', category: 'modifier' },
    { abbr: 'k2tog tbl', full: 'knit two together through back loop', category: 'decrease' },
    { abbr: 'p2tog tbl', full: 'purl two together through back loop', category: 'decrease' },

    // ===== BRIOCHE =====
    { abbr: 'brk', full: 'brioche knit', category: 'brioche' },
    { abbr: 'brp', full: 'brioche purl', category: 'brioche' },
    { abbr: 'sl1yo', full: 'slip one yarn over', category: 'brioche' },
    { abbr: 'brk2tog', full: 'brioche knit two together', category: 'brioche' },
    { abbr: 'brp2tog', full: 'brioche purl two together', category: 'brioche' },
    { abbr: 'brkyobrk', full: 'brioche knit, yarn over, brioche knit', category: 'brioche' },
    { abbr: 'brpyobrp', full: 'brioche purl, yarn over, brioche purl', category: 'brioche' },
    { abbr: 'brRsl1yo', full: 'brioche right slip one yarn over', category: 'brioche' },
    { abbr: 'brLsl1yo', full: 'brioche left slip one yarn over', category: 'brioche' },
    { abbr: 'br4st dec', full: 'brioche four stitch decrease', category: 'brioche' },

    // ===== SLIP STITCHES =====
    { abbr: 'sl', full: 'slip', category: 'slip' },
    { abbr: 'sl1', full: 'slip one', category: 'slip' },
    { abbr: 'sl2', full: 'slip two', category: 'slip' },
    { abbr: 'sl1wyif', full: 'slip one with yarn in front', category: 'slip' },
    { abbr: 'sl1wyib', full: 'slip one with yarn in back', category: 'slip' },
    { abbr: 'sl1k', full: 'slip one knitwise', category: 'slip' },
    { abbr: 'sl1p', full: 'slip one purlwise', category: 'slip' },
    { abbr: 'sl2-k1-p2sso', full: 'slip two, knit one, pass two slipped stitches over', category: 'slip' },
    { abbr: 'wyif', full: 'with yarn in front', category: 'slip' },
    { abbr: 'wyib', full: 'with yarn in back', category: 'slip' },
    { abbr: 'sl2wyif', full: 'slip two with yarn in front', category: 'slip' },

    // ===== CABLES =====
    { abbr: 'cn', full: 'cable needle', category: 'cable' },
    { abbr: 'c4f', full: 'cable 4 front', category: 'cable' },
    { abbr: 'c4b', full: 'cable 4 back', category: 'cable' },
    { abbr: 'c6f', full: 'cable 6 front', category: 'cable' },
    { abbr: 'c6b', full: 'cable 6 back', category: 'cable' },
    { abbr: 'c8f', full: 'cable 8 front', category: 'cable' },
    { abbr: 'c8b', full: 'cable 8 back', category: 'cable' },
    { abbr: 't2f', full: 'twist 2 front', category: 'cable' },
    { abbr: 't2b', full: 'twist 2 back', category: 'cable' },
    { abbr: 't3f', full: 'twist 3 front', category: 'cable' },
    { abbr: 't3b', full: 'twist 3 back', category: 'cable' },
    { abbr: 't4f', full: 'twist 4 front', category: 'cable' },
    { abbr: 't4b', full: 'twist 4 back', category: 'cable' },

    // ===== LACE =====
    { abbr: 'yo2', full: 'yarn over twice', category: 'lace' },
    { abbr: 'yo3', full: 'yarn over three times', category: 'lace' },
    { abbr: 'nupp', full: 'nupp (make 5 from 1)', category: 'lace' },
    { abbr: 'sk2po', full: 'slip one, knit two together, pass slipped stitch over', category: 'lace' },

    // ===== MOSAIC =====
    { abbr: 'ms', full: 'mosaic stitch', category: 'mosaic' },
    { abbr: 'mc', full: 'main color', category: 'mosaic' },
    { abbr: 'cc', full: 'contrast color', category: 'mosaic' },

    // ===== COLORWORK =====
    { abbr: 'ca', full: 'color A', category: 'colorwork' },
    { abbr: 'cb', full: 'color B', category: 'colorwork' },
    { abbr: 'cc1', full: 'contrast color 1', category: 'colorwork' },
    { abbr: 'cc2', full: 'contrast color 2', category: 'colorwork' },

    // ===== MARKERS =====
    { abbr: 'pm', full: 'place marker', category: 'marker' },
    { abbr: 'sm', full: 'slip marker', category: 'marker' },
    { abbr: 'rm', full: 'remove marker', category: 'marker' },
    { abbr: 'bor', full: 'beginning of round', category: 'marker' },

    // ===== CONSTRUCTION =====
    { abbr: 'co', full: 'cast on', category: 'construction' },
    { abbr: 'bo', full: 'bind off', category: 'construction' },
    { abbr: 'rs', full: 'right side', category: 'construction' },
    { abbr: 'ws', full: 'wrong side', category: 'construction' },
    { abbr: 'rnd', full: 'round', category: 'construction' },
    { abbr: 'rnds', full: 'rounds', category: 'construction' },

    // ===== COMMON PHRASES =====
    { abbr: 'rep', full: 'repeat', category: 'phrase' },
    { abbr: 'rem', full: 'remaining', category: 'phrase' },
    { abbr: 'beg', full: 'beginning', category: 'phrase' },
    { abbr: 'end', full: 'end', category: 'phrase' },
    { abbr: 'inc', full: 'including', category: 'phrase' },
    { abbr: 'approx', full: 'approximately', category: 'phrase' },
    { abbr: 'cont', full: 'continue', category: 'phrase' },
    { abbr: 'foll', full: 'following', category: 'phrase' },
    { abbr: 'patt', full: 'pattern', category: 'phrase' },
    { abbr: 'prev', full: 'previous', category: 'phrase' },
    { abbr: 'tog', full: 'together', category: 'phrase' },
    { abbr: 'work even', full: 'work even', category: 'phrase' },
    { abbr: 'as est', full: 'as established', category: 'phrase' },
    { abbr: 'until end', full: 'until end', category: 'phrase' },
    { abbr: 'to end', full: 'to end', category: 'phrase' },
    { abbr: 'from *', full: 'from *', category: 'phrase' },
    { abbr: 'times', full: 'times', category: 'phrase' },
    { abbr: 'last', full: 'last', category: 'phrase' },
    { abbr: 'first', full: 'first', category: 'phrase' },
    { abbr: 'rep to last', full: 'repeat to last', category: 'phrase' },
    { abbr: 'knit to last', full: 'knit to last', category: 'phrase' },



    // ===== PUNCTUATION =====
    { abbr: '*', full: 'asterisk (repeat marker)', category: 'punctuation' },
];

/**
 * Get abbreviations that start with a given prefix
 * Case-insensitive matching
 */
export const filterAbbreviations = (prefix) => {
    if (!prefix || prefix.trim() === '') {
        return [];
    }

    const lowerPrefix = prefix.toLowerCase().trim();
    return KNITTING_ABBREVIATIONS.filter(item =>
        item.abbr.toLowerCase().startsWith(lowerPrefix)
    );
};

/**
 * Get recently used abbreviations for display
 * Falls back to common basics if no history
 */
export const getRecentlyUsedAbbreviations = (recentlyUsedArray = []) => {
    if (recentlyUsedArray.length === 0) {
        // Default to most common abbreviations
        const defaults = ['k', 'p', 'k2tog', 'ssk', 'yo', 'rep', 'sl1', 'pm'];
        return KNITTING_ABBREVIATIONS.filter(item => defaults.includes(item.abbr));
    }

    // Return abbreviations matching the recently used array
    return recentlyUsedArray
        .map(abbr => KNITTING_ABBREVIATIONS.find(item => item.abbr === abbr))
        .filter(Boolean)
        .slice(0, 20); // Max 8 recent items
};
