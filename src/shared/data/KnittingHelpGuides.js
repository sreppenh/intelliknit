// src/shared/data/KnittingHelpGuides.js

/**
 * Knitting Help Guides
 * Direct, actionable instructions for techniques that need extra guidance
 */

export const HELP_GUIDES = {
    provisional_cast_on: {
        title: 'Provisional Cast On',

        steps: [
            'Use waste yarn in a contrasting color',
            'Crochet a chain with waste yarn (make extra stitches)',
            'Pick up stitches in the back bumps of the chain',
            'Later: unzip chain to reveal live stitches'
        ],

        tips: [
            'Leave a long tail for easier unzipping',
            'Count carefully - chain length should equal stitches needed'
        ]
    },

    magic_cast_on: {
        title: "Judy's Magic Cast On",

        steps: [
            'Hold two needles parallel',
            'Wrap yarn figure-8 style around both needles',
            'Work stitches off first needle',
            'Flip work and work stitches off second needle',
            'Join for working in the round'
        ],

        tips: [
            'Keep tension even between needles',
            'Mark beginning of round immediately'
        ]
    },

    three_needle_bindoff: {
        title: 'Three Needle Bind Off',

        preparation: [
            'Place stitches on two needles',
            'Hold needles parallel (right sides together for hidden seam)'
        ],

        steps: [
            'Insert 3rd needle through first stitch on both needles',
            'Knit these two stitches together',
            'Repeat for second stitch',
            'Pass first stitch over second to bind off',
            'Continue across all stitches'
        ],

        tips: [
            'Stitch counts on both needles must match',
            'Right sides together creates hidden seam'
        ]
    },

    sloped_bindoff: {
        title: 'Sloped Bind Off',

        steps: [
            'Bind off specified stitches at beginning of row',
            'On next row, work to last bound-off stitch',
            'Work 2 together (SSK or K2tog) at boundary',
            'Continue in pattern',
            'Repeat for each bind-off row'
        ],

        tips: [
            'Creates smoother edge than standard bind off',
            'Common for shoulder shaping and necklines',
            'The decrease at the boundary eliminates the "stair step" look'
        ]
    },

    sewn_bindoff: {
        title: 'Sewn Bind Off',

        preparation: [
            'Thread tapestry needle with yarn (3x width of work)',
            'Leave stitches on knitting needle'
        ],

        steps: [
            'Insert tapestry needle purlwise through first 2 stitches',
            'Pull yarn through (don\'t remove stitches)',
            'Insert tapestry needle knitwise through first stitch only',
            'Slip this stitch off knitting needle',
            'Repeat until all stitches bound off'
        ],

        tips: [
            'Very stretchy - ideal for lace edges',
            'Keep tension loose for maximum stretch'
        ]
    },

    pick_up_knit: {
        title: 'Pick Up & Knit',

        whereToPickUp: [
            'Bind-off edge: 1 stitch per bound-off stitch',
            'Side edge (rows): pick up ~3 stitches for every 4 rows',
            'Cast-on edge: 1 stitch per cast-on stitch'
        ],

        steps: [
            'Insert needle through edge from front to back',
            'Wrap yarn around needle',
            'Pull loop through to front',
            'One stitch created on needle',
            'Continue along edge, spacing evenly'
        ],

        tips: [
            'Use markers to divide edge into sections',
            'Pick up 1 stitch width in from edge (not at very edge)'
        ]
    },

    kitchener_stitch: {
        title: 'Kitchener Stitch (Grafting)',

        preparation: [
            'Equal stitches on two needles',
            'Thread tapestry needle with yarn (4x width of work)',
            'Hold needles parallel with wrong sides together'
        ],

        setup: [
            'Front needle: Insert purlwise, leave stitch on',
            'Back needle: Insert knitwise, leave stitch on'
        ],

        repeat: [
            'Front needle: Insert knitwise, slip stitch off',
            'Front needle: Insert purlwise, leave stitch on',
            'Back needle: Insert purlwise, slip stitch off',
            'Back needle: Insert knitwise, leave stitch on'
        ],

        mantra: 'Knit off, purl on; purl off, knit on',

        tips: [
            'Keep tension matching knit fabric',
            'Work slowly - easy to lose place'
        ]
    },

    colorwork_help: {
        title: 'Colorwork Pattern',

        steps: [
            'Follow the colorwork chart or written instructions',
            'Carry unused color loosely across back of work',
            'Catch floats longer than 1 inch',
            'Maintain even tension on both colors'
        ],

        tips: [
            'Twist yarns every 3-4 stitches to avoid long floats',
            'Check gauge in colorwork - it often differs from stockinette'
        ]
    },

    brioche_help: {
        title: 'Brioche Knitting',

        basics: [
            'Brioche creates a thick, squishy, reversible fabric',
            'Each stitch is worked together with its yarn over from previous row',
            'Pattern is worked over multiple rows that build on each other'
        ],

        keyStitches: [
            'brk1 (brioche knit): Knit stitch together with its yarn over - consumes 2, makes 1',
            'brp1 (brioche purl): Purl stitch together with its yarn over - consumes 2, makes 1',
            'sl1yo (slip 1 with yarn over): Slip stitch and wrap yarn over needle - consumes 1, makes 2'
        ],

        steps: [
            'Setup row establishes the pattern (usually all sl1yo)',
            'Row 1: Work brk1 and sl1yo according to pattern',
            'Row 2: Work brp1 and sl1yo (opposite of Row 1)',
            'Repeat Rows 1-2 for pattern'
        ],

        tips: [
            'Keep track of which row you\'re on - brioche rows look similar',
            'Use a row counter or place a marker to identify right side',
            'Tension should be slightly looser than stockinette',
            'The fabric will "scrunch up" on needles - this is normal'
        ],

        troubleshooting: [
            'If stitch count is off: Check that every sl1yo has been worked with its partner on next row',
            'If fabric looks uneven: Check tension - brioche needs consistent, slightly loose tension',
            'Lost your place? Look at the stitches - a "brk1" stitch sits on top of a yarn over'
        ]
    },

    stripe_setup_help: {
        title: 'Stripe Pattern Setup',

        steps: [
            'Work specified number of rows with first color',
            'Join new color at beginning of row/round',
            'Carry unused colors up the side',
            'Follow stripe sequence as written'
        ],

        tips: [
            'Twist carried yarns every 4-6 rows to avoid long floats',
            'Cut yarn if changing colors less frequently than every 6 rows'
        ]
    }
};

export const getHelpGuide = (helpTopic) => {
    return HELP_GUIDES[helpTopic] || null;
};

export const hasHelpGuide = (helpTopic) => {
    return helpTopic && HELP_GUIDES[helpTopic] !== undefined;
};