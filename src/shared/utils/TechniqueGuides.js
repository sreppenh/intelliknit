// src/shared/utils/TechniqueGuides.js
/**
 * Technique Guide Library for IntelliKnit
 * 
 * Step-by-step instructions for cast-ons, bind-offs, seaming techniques,
 * and other knitting procedures that need detailed guidance.
 */

/**
 * CAST-ON TECHNIQUE GUIDES
 * Detailed instructions for various cast-on methods
 */
export const CAST_ON_GUIDES = {
    'long_tail': {
        name: 'Long Tail Cast On',
        difficulty: 'beginner',
        estimatedYarn: 'About 1 inch per stitch for tail',
        bestFor: 'Most projects - creates stretchy, neat edge',
        tools: ['Knitting needles'],
        setup: [
            'Make slip knot, leaving long tail (estimate 1" per stitch)',
            'Place slip knot on needle - this counts as your first stitch',
            'Hold needle in right hand, both yarn ends in left hand',
            'Wrap working yarn around index finger, tail around thumb'
        ],
        steps: [
            'Insert needle up through thumb loop from bottom',
            'Catch working yarn from index finger with needle tip',
            'Pull working yarn back through thumb loop',
            'Drop thumb loop and tighten new stitch on needle',
            'Reform thumb loop with tail yarn',
            'Repeat until you have required number of stitches'
        ],
        tips: [
            'Keep even tension for uniform edge',
            'Count slip knot as first stitch',
            'Leave 6" tail minimum for weaving in',
            'Practice the motion before starting your project'
        ],
        troubleshooting: {
            'Too tight': 'Use larger needle for cast on, then switch to project size',
            'Running out of tail': 'Estimate was too short, restart with longer tail',
            'Uneven edge': 'Practice consistent tension on thumb loop',
            'Loops falling off': 'Don\'t pull too tight, allow some give'
        }
    },

    'cable': {
        name: 'Cable Cast On',
        difficulty: 'intermediate',
        estimatedYarn: 'Minimal - uses working yarn only',
        bestFor: 'Mid-project increases, button bands',
        tools: ['Two knitting needles'],
        setup: [
            'Make slip knot and place on left needle',
            'This slip knot counts as your first stitch',
            'Hold working yarn in normal knitting position'
        ],
        steps: [
            'Insert right needle between first two stitches on left needle',
            'Wrap yarn around right needle as if to knit',
            'Draw yarn through to create new loop',
            'Place new loop on left needle (don\'t twist)',
            'Insert right needle between the two newest stitches',
            'Repeat until you have required stitches'
        ],
        tips: [
            'Insert needle between stitches, not through them',
            'Keep new stitches loose enough to work into',
            'Creates a neat, firm edge',
            'Good for adding stitches mid-project'
        ],
        troubleshooting: {
            'Too tight': 'Don\'t pull new loops too snug when placing on needle',
            'Twisted stitches': 'Place new loop on needle without twisting',
            'Can\'t insert needle': 'Previous stitches may be too tight'
        }
    },

    'provisional': {
        name: 'Provisional Cast On',
        difficulty: 'advanced',
        estimatedYarn: 'Working yarn plus waste yarn in different color',
        bestFor: 'When you need to work in opposite direction later',
        tools: ['Knitting needles', 'Crochet hook', 'Waste yarn'],
        setup: [
            'Cut waste yarn in contrasting color, about 6" longer than cast on width',
            'Tie working yarn and waste yarn together with loose knot',
            'Hold crochet hook in right hand, both yarns in left'
        ],
        steps: [
            'Hold working yarn above crochet hook, waste yarn below',
            'Bring waste yarn forward over hook, catch working yarn',
            'Pull working yarn through waste yarn loop',
            'Move working yarn below hook, waste yarn above',
            'Repeat, alternating yarn positions',
            'Continue until you have required stitches',
            'Transfer loops to knitting needle'
        ],
        tips: [
            'Waste yarn should be smooth and different color',
            'Keep tension loose - you\'ll remove waste yarn later',
            'Count stitches carefully as some may be hard to see',
            'Leave long tails for easier removal later'
        ],
        troubleshooting: {
            'Stitches too tight': 'Use larger crochet hook',
            'Can\'t see stitches': 'Use higher contrast waste yarn',
            'Waste yarn breaking': 'Choose stronger waste yarn'
        }
    },

    'backwards_loop': {
        name: 'Backwards Loop Cast On',
        difficulty: 'beginner',
        estimatedYarn: 'Minimal - working yarn only',
        bestFor: 'Quick increases, temporary stitches',
        tools: ['One knitting needle'],
        setup: [
            'Leave 6" tail for weaving in',
            'Hold needle in right hand, yarn in left',
            'Make first loop by wrapping yarn around thumb'
        ],
        steps: [
            'Wrap working yarn clockwise around left thumb',
            'Insert needle through thumb loop from bottom to top',
            'Slip loop off thumb onto needle',
            'Gently tighten (don\'t over-tighten)',
            'Repeat for each additional stitch needed'
        ],
        tips: [
            'Creates loose edge - good for temporary stitches',
            'Very quick method for small numbers of stitches',
            'Not suitable for main cast on of projects',
            'Keep loops loose for easier knitting'
        ],
        troubleshooting: {
            'Loops too loose': 'Tighten slightly but don\'t over-do it',
            'Edge looks messy': 'This method creates an informal edge by design',
            'Hard to knit first row': 'Loops may be too tight'
        }
    },

    'judy': {
        name: 'Judy\'s Magic Cast On',
        difficulty: 'advanced',
        estimatedYarn: 'Long tail - estimate 1" per stitch',
        bestFor: 'Toe-up socks, circular projects starting from center',
        tools: ['Two circular or double-pointed needles'],
        setup: [
            'Leave long tail (about 1" per stitch to be cast on)',
            'Hold two needles parallel, points facing right',
            'Drape working yarn over top needle, tail under bottom needle'
        ],
        steps: [
            'Bring tail up and over top needle, down between needles',
            'Bring working yarn under bottom needle, up between needles',
            'Bring tail over top needle again (you now have 1 st on top)',
            'Bring working yarn under bottom needle again (1 st on bottom)',
            'Continue alternating until you have half your stitches on each needle',
            'Turn work and begin knitting from top needle'
        ],
        tips: [
            'Creates invisible join perfect for toe-up construction',
            'Take time to keep tension even',
            'Count carefully - easy to lose track',
            'Practice with waste yarn first'
        ],
        troubleshooting: {
            'Stitches sliding off': 'Keep firm grip on needle tips',
            'Uneven tension': 'Practice motion until it becomes smooth',
            'Lost count': 'Mark every 10 stitches with stitch marker'
        }
    }
};

/**
 * BIND-OFF TECHNIQUE GUIDES
 * Detailed instructions for finishing techniques
 */
export const BIND_OFF_GUIDES = {
    'standard': {
        name: 'Standard Bind Off',
        difficulty: 'beginner',
        bestFor: 'General finishing, shoulders, necklines',
        tools: ['Knitting needles', 'Scissors'],
        setup: [
            'Work until ready to bind off',
            'Work in established pattern unless otherwise specified',
            'Keep working yarn attached'
        ],
        steps: [
            'Knit first 2 stitches normally',
            'Insert left needle into first stitch on right needle',
            'Lift first stitch over second stitch and off needle',
            'Knit 1 more stitch (now you have 2 stitches again)',
            'Lift first stitch over second stitch',
            'Repeat until 1 stitch remains',
            'Cut yarn leaving 6" tail, pull through final stitch'
        ],
        tips: [
            'Don\'t bind off too tightly',
            'Maintain same gauge as rest of project',
            'Work bind off in pattern if specified',
            'Test stretch of bound-off edge'
        ],
        troubleshooting: {
            'Too tight': 'Use larger needle for bind off only',
            'Edge curling': 'This is normal for stockinette',
            'Stitches dropping': 'Keep control of stitches on needles'
        }
    },

    'stretchy': {
        name: 'Stretchy Bind Off',
        difficulty: 'intermediate',
        bestFor: 'Ribbing, sock cuffs, hat brims, necklines',
        tools: ['Knitting needles'],
        setup: [
            'Work in ribbing pattern until ready to bind off',
            'This method works in pattern (knit the knits, purl the purls)',
            'Consider using needle one size larger'
        ],
        steps: [
            'Work first 2 stitches in pattern (K if knit st, P if purl st)',
            'Insert left needle into first stitch on right needle from left to right',
            'Lift first stitch over second and off needle',
            'Work next stitch in pattern',
            'Repeat lifting first over second',
            'Continue until 1 stitch remains',
            'Fasten off final stitch'
        ],
        tips: [
            'Work bind off very loosely',
            'Test stretch frequently as you work',
            'Use larger needle if edge is too tight',
            'Work each stitch in its established pattern'
        ],
        troubleshooting: {
            'Still too tight': 'Try using needle 2 sizes larger',
            'Looks messy': 'Maintain pattern consistency',
            'Edge won\'t lie flat': 'May need to adjust stitch count'
        }
    },

    'three_needle': {
        name: 'Three Needle Bind Off',
        difficulty: 'intermediate',
        bestFor: 'Shoulder seams, joining two pieces',
        tools: ['Three knitting needles of same size'],
        setup: [
            'Place equal number of stitches on two needles',
            'Hold needles parallel with right sides together',
            'Use third needle to work bind off',
            'Seam will be on wrong side of work'
        ],
        steps: [
            'Insert third needle through first stitch on each needle',
            'Knit these 2 stitches together (creates 1 stitch on right needle)',
            'Knit next 2 stitches together the same way (2 stitches on right needle)',
            'Lift first stitch over second and off needle',
            'Continue knitting stitches together and binding off',
            'Fasten off final stitch'
        ],
        tips: [
            'Keep right sides together for seam on inside',
            'Work with wrong sides together for decorative seam',
            'Maintain even tension throughout',
            'Creates strong, neat seam'
        ],
        troubleshooting: {
            'Stitches slipping': 'Keep firm grip on all needles',
            'Seam puckering': 'Check that both pieces have same row gauge',
            'Uneven edge': 'Maintain consistent tension'
        }
    },

    'picot': {
        name: 'Picot Bind Off',
        difficulty: 'advanced',
        bestFor: 'Decorative edges, baby clothes, shawls',
        tools: ['Knitting needles', 'Small crochet hook (optional)'],
        setup: [
            'Work until ready for bind off',
            'This creates small loops along the edge',
            'Best worked on right side of fabric'
        ],
        steps: [
            'Bind off 2 stitches using standard bind off method',
            'Slip remaining stitch back to left needle',
            'Cast on 2 stitches using backwards loop method',
            'Bind off 4 stitches (the 2 cast on + 2 original)',
            'Slip remaining stitch back to left needle',
            'Repeat casting on 2, binding off 4',
            'Continue until all stitches are bound off'
        ],
        tips: [
            'Keep cast on stitches loose for better picot formation',
            'Work slowly to maintain pattern consistency',
            'Block finished edge to show picots clearly',
            'Count carefully to maintain rhythm'
        ],
        troubleshooting: {
            'Picots too tight': 'Loosen cast on stitches',
            'Uneven picots': 'Keep consistent stitch count',
            'Edge curling': 'Block edge to set picots'
        }
    }
};

/**
 * SEAMING AND FINISHING GUIDES
 * Instructions for joining pieces and finishing techniques
 */
export const FINISHING_GUIDES = {
    'kitchener_stitch': {
        name: 'Kitchener Stitch (Grafting)',
        difficulty: 'advanced',
        bestFor: 'Toe of socks, shoulder seams, invisible joining',
        tools: ['Yarn needle', 'Scissors'],
        yarnNeeded: 'Tail about 3 times the width being grafted',
        setup: [
            'Arrange stitches on two needles with right sides facing out',
            'Check that you have equal numbers of stitches',
            'Thread yarn needle with long tail',
            'Position needles parallel, tips pointing right'
        ],
        setupSteps: [
            'Insert needle purlwise through first stitch on front needle, leave stitch on needle',
            'Insert needle knitwise through first stitch on back needle, leave stitch on needle'
        ],
        repeatSteps: [
            'Front needle: Insert needle knitwise through first stitch, slip stitch off needle',
            'Front needle: Insert needle purlwise through next stitch, leave stitch on needle',
            'Back needle: Insert needle purlwise through first stitch, slip stitch off needle',
            'Back needle: Insert needle knitwise through next stitch, leave stitch on needle'
        ],
        memoryAid: 'Front: knit off, purl on. Back: purl off, knit on.',
        tips: [
            'Work setup steps only once at very beginning',
            'Keep stitches loose initially, adjust tension later',
            'Go slowly and check your work frequently',
            'Practice on swatches before important projects'
        ],
        troubleshooting: {
            'Stitches too tight': 'Leave loops loose, tighten afterwards',
            'Lost track': 'Remember the setup vs repeat steps difference',
            'Looks wrong': 'Check you\'re following knit off/purl on pattern',
            'Yarn breaking': 'Use slightly longer tail than estimated'
        }
    },

    'mattress_stitch': {
        name: 'Mattress Stitch Seaming',
        difficulty: 'intermediate',
        bestFor: 'Side seams, sleeve seams, vertical seaming',
        tools: ['Yarn needle', 'Scissors'],
        yarnNeeded: 'About 3 times the length of seam',
        setup: [
            'Lay pieces side by side with right sides facing up',
            'Align edges carefully, matching rows',
            'Thread needle with matching yarn'
        ],
        steps: [
            'Insert needle under horizontal bar between first and second stitches',
            'Move to other piece, insert under corresponding bar',
            'Continue alternating sides, working up the seam',
            'After every few stitches, gently pull yarn to close seam',
            'Work under bars consistently (always same depth from edge)',
            'Adjust tension so seam lies flat'
        ],
        tips: [
            'Work with right sides facing up (seam creates on wrong side)',
            'Use yarn from project, not sewing thread',
            'Match row-to-row for best results',
            'Pull gently to close seam without puckering'
        ],
        troubleshooting: {
            'Seam puckering': 'Check row gauge match, ease tension',
            'Visible seam line': 'Work deeper into fabric, under correct bars',
            'Uneven seam': 'Keep consistent depth from edge',
            'Pieces don\'t align': 'Pin or baste before seaming'
        }
    },

    'backstitch': {
        name: 'Backstitch Seaming',
        difficulty: 'beginner',
        bestFor: 'Curved seams, set-in sleeves, reinforced seams',
        tools: ['Yarn needle', 'Scissors', 'Pins (optional)'],
        yarnNeeded: 'About 2 times the length of seam',
        setup: [
            'Pin pieces with right sides together',
            'Align edges carefully',
            'Thread needle with matching yarn'
        ],
        steps: [
            'Insert needle through both layers from back to front',
            'Move forward about 1/4", bring needle up through both layers',
            'Insert needle back down at the end of previous stitch',
            'Bring needle up 1/4" forward of current position',
            'Continue, always going back to meet previous stitch',
            'Work from right to left (reverse for left-handed knitters)'
        ],
        tips: [
            'Keep stitches small and even',
            'Work close to edge but catch full stitch',
            'Creates strong, permanent seam',
            'Good for areas that need reinforcement'
        ],
        troubleshooting: {
            'Seam pulling apart': 'Work closer to edge, smaller stitches',
            'Fabric puckering': 'Ease tension, don\'t pull too tight',
            'Uneven stitches': 'Mark stitch length with pins initially'
        }
    }
};

/**
 * SPECIAL TECHNIQUE GUIDES
 * Instructions for specialized knitting techniques
 */
export const SPECIAL_TECHNIQUES = {
    'short_rows': {
        name: 'Short Rows (Wrap and Turn)',
        difficulty: 'advanced',
        bestFor: 'Shaping bust darts, sock heels, shoulders',
        tools: ['Knitting needles'],
        setup: [
            'Work to the point where you need to turn',
            'This technique prevents holes when turning mid-row',
            'Can be worked on knit or purl rows'
        ],
        steps: [
            'Work to turning point, stop before next stitch',
            'Slip next stitch purlwise to right needle',
            'Bring yarn to front (between needles)',
            'Slip stitch back to left needle',
            'Bring yarn to back',
            'Turn work to other side',
            'Begin working in other direction'
        ],
        pickingUpWraps: [
            'When working across wrapped stitches later:',
            'Insert needle under wrap and through stitch',
            'Work wrap and stitch together as one',
            'This eliminates the wrap and prevents holes'
        ],
        tips: [
            'Keep wraps loose enough to work with later',
            'Mark short row sections with removable markers',
            'Practice on swatches before using in projects',
            'Different methods exist - this is wrap & turn'
        ],
        troubleshooting: {
            'Holes at turns': 'Make sure wraps are snug but not too tight',
            'Can\'t find wraps': 'Use contrasting yarn for practice',
            'Uneven shaping': 'Plan short row placement carefully'
        }
    },

    'picking_up_stitches': {
        name: 'Picking Up Stitches',
        difficulty: 'intermediate',
        bestFor: 'Neckbands, button bands, sleeve cuffs',
        tools: ['Knitting needles', 'Stitch markers (optional)'],
        setup: [
            'Identify edge where stitches will be picked up',
            'Calculate pickup rate (usually 3 stitches for every 4 rows)',
            'Mark pickup points with pins or markers if helpful'
        ],
        steps: [
            'Insert needle through fabric from front to back',
            'Catch working yarn and pull through to create loop on needle',
            'Continue along edge, spacing stitches evenly',
            'For row edges: pick up in spaces between stitches, not through stitches',
            'For cast-on/bound-off edges: pick up through stitches',
            'Check pickup rate frequently'
        ],
        tips: [
            'Use same size needle as main project',
            'Pick up slightly fewer stitches than rows for good drape',
            'Keep consistent depth from edge',
            'Distribute any adjustments evenly across edge'
        ],
        troubleshooting: {
            'Too many stitches': 'Edge will ruffle - decrease evenly across first row',
            'Too few stitches': 'Edge will pucker - increase evenly across first row',
            'Uneven spacing': 'Mark pickup points before starting',
            'Loose edge': 'Pick up deeper into fabric'
        }
    }
};

/**
 * UTILITY FUNCTIONS FOR TECHNIQUE GUIDES
 */

/**
 * Get technique guide by name and type
 */
export const getTechniqueGuide = (technique, type = null) => {
    // Try to find in specific type first if provided
    if (type === 'cast_on' && CAST_ON_GUIDES[technique]) {
        return CAST_ON_GUIDES[technique];
    }
    if (type === 'bind_off' && BIND_OFF_GUIDES[technique]) {
        return BIND_OFF_GUIDES[technique];
    }
    if (type === 'finishing' && FINISHING_GUIDES[technique]) {
        return FINISHING_GUIDES[technique];
    }
    if (type === 'special' && SPECIAL_TECHNIQUES[technique]) {
        return SPECIAL_TECHNIQUES[technique];
    }

    // Search all categories if no type specified
    return CAST_ON_GUIDES[technique] ||
        BIND_OFF_GUIDES[technique] ||
        FINISHING_GUIDES[technique] ||
        SPECIAL_TECHNIQUES[technique] ||
        null;
};

/**
 * Get all available techniques by category
 */
export const getAllTechniques = () => {
    return {
        cast_on: Object.keys(CAST_ON_GUIDES),
        bind_off: Object.keys(BIND_OFF_GUIDES),
        finishing: Object.keys(FINISHING_GUIDES),
        special: Object.keys(SPECIAL_TECHNIQUES)
    };
};

/**
 * Search techniques by difficulty level
 */
export const getTechniquesByDifficulty = (difficulty) => {
    const techniques = [];

    Object.entries(CAST_ON_GUIDES).forEach(([key, guide]) => {
        if (guide.difficulty === difficulty) {
            techniques.push({ name: key, type: 'cast_on', ...guide });
        }
    });

    Object.entries(BIND_OFF_GUIDES).forEach(([key, guide]) => {
        if (guide.difficulty === difficulty) {
            techniques.push({ name: key, type: 'bind_off', ...guide });
        }
    });

    Object.entries(FINISHING_GUIDES).forEach(([key, guide]) => {
        if (guide.difficulty === difficulty) {
            techniques.push({ name: key, type: 'finishing', ...guide });
        }
    });

    Object.entries(SPECIAL_TECHNIQUES).forEach(([key, guide]) => {
        if (guide.difficulty === difficulty) {
            techniques.push({ name: key, type: 'special', ...guide });
        }
    });

    return techniques;
};

/**
 * Find techniques suitable for specific use cases
 */
export const getTechniquesForUseCase = (useCase) => {
    const techniques = [];
    const searchTerm = useCase.toLowerCase();

    const searchInGuides = (guides, type) => {
        Object.entries(guides).forEach(([key, guide]) => {
            if (guide.bestFor && guide.bestFor.toLowerCase().includes(searchTerm)) {
                techniques.push({ name: key, type: type, ...guide });
            }
        });
    };

    searchInGuides(CAST_ON_GUIDES, 'cast_on');
    searchInGuides(BIND_OFF_GUIDES, 'bind_off');
    searchInGuides(FINISHING_GUIDES, 'finishing');
    searchInGuides(SPECIAL_TECHNIQUES, 'special');

    return techniques;
};

export default {
    getTechniqueGuide,
    getAllTechniques,
    getTechniquesByDifficulty,
    getTechniquesForUseCase,
    CAST_ON_GUIDES,
    BIND_OFF_GUIDES,
    FINISHING_GUIDES,
    SPECIAL_TECHNIQUES
};