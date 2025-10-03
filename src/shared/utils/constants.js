// src/shared/utils/constants.js

export const CONSTRUCTION_TYPES = {
  FLAT: 'flat',
  ROUND: 'round'
};

// ===== COLOR SYSTEM =====
// Reusable color palette for yarn and markers
export const COLOR_PALETTE = {
  // Reds
  cherry: { name: 'Cherry', hex: '#dc2626' },
  burgundy: { name: 'Burgundy', hex: '#7f1d1d' },
  dustyRose: { name: 'Dusty Rose', hex: '#be185d' },

  // Oranges  
  coral: { name: 'Coral', hex: '#f97316' },
  rust: { name: 'Rust', hex: '#c2410c' },
  peach: { name: 'Peach', hex: '#fed7aa' },
  copper: { name: 'Copper', hex: '#b45309' },        // NEW
  terracotta: { name: 'Terracotta', hex: '#ea580c' }, // NEW

  // Yellows
  sunshine: { name: 'Sunshine', hex: '#eab308' },
  mustard: { name: 'Mustard', hex: '#a16207' },
  cream: { name: 'Cream', hex: '#fef3c7' },
  amber: { name: 'Amber', hex: '#f59e0b' },          // NEW

  // Greens
  sage: { name: 'Sage', hex: '#4a8a4a' },
  forest: { name: 'Forest', hex: '#166534' },
  mint: { name: 'Mint', hex: '#6ee7b7' },
  emerald: { name: 'Emerald', hex: '#059669' },      // NEW

  // Blues
  sky: { name: 'Sky', hex: '#3b82f6' },
  navy: { name: 'Navy', hex: '#1e3a8a' },
  teal: { name: 'Teal', hex: '#0891b2' },
  turquoise: { name: 'Turquoise', hex: '#06b6d4' },  // NEW
  aqua: { name: 'Aqua', hex: '#14b8a6' },           // NEW

  // Purples
  lavender: { name: 'Lavender', hex: '#9b7cb6' },
  plum: { name: 'Plum', hex: '#7c3aed' },
  violet: { name: 'Violet', hex: '#a855f7' },
  periwinkle: { name: 'Periwinkle', hex: '#a78bfa' }, // NEW
  indigo: { name: 'Indigo', hex: '#4338ca' },        // NEW

  // Pinks
  blush: { name: 'Blush', hex: '#fda4af' },
  magenta: { name: 'Magenta', hex: '#ec4899' },
  rose: { name: 'Rose', hex: '#f472b6' },

  // Neutrals
  charcoal: { name: 'Charcoal', hex: '#374151' },
  stone: { name: 'Stone', hex: '#78716c' },
  silver: { name: 'Silver', hex: '#d1d5db' },
  ivory: { name: 'Ivory', hex: '#fffbeb' },
  white: { name: 'White', hex: '#ffffff' },
  black: { name: 'Black', hex: '#000000' },
  slate: { name: 'Slate', hex: '#475569' },          // NEW
  taupe: { name: 'Taupe', hex: '#92857a' },          // NEW
};
// Convert to array for easy iteration in color pickers
export const COLOR_PALETTE_ARRAY = Object.values(COLOR_PALETTE);

// ===== MARKER DEFAULTS =====
export const MARKER_DEFAULTS = {
  MAX_MARKERS: 10,
  MIN_MARKERS: 1,
  DEFAULT_COUNT: 2,
  MAX_MARKER_NAME_LENGTH: 6
};

// ===== SHAPING CONSTANTS =====
export const SHAPING_TYPES = {
  EVEN_DISTRIBUTION: 'even_distribution',
  SEQUENTIAL_PHASES: 'phases',
  MARKER_PHASES: 'marker_phases'
};

export const SHAPING_ACTIONS = {
  INCREASE: 'increase',
  DECREASE: 'decrease',
  BIND_OFF: 'bind_off'
};

// ===== KNITTING METHODS =====

export const CAST_ON_METHODS = {
  LONG_TAIL: { id: 'long_tail', name: 'Long Tail', displayName: 'Long Tail Cast On', icon: '🪢' },
  CABLE: { id: 'cable', name: 'Cable', displayName: 'Cable Cast On', icon: '🔗' },
  GARTER_TAB: { id: 'garter_tab', name: 'Garter Tab', displayName: 'Garter Tab Cast On', icon: '🔺' },
  PROVISIONAL: { id: 'provisional', name: 'Provisional', displayName: 'Provisional Cast On', icon: '📎' },
  GERMAN_TWISTED: { id: 'german_twisted', name: 'German Twisted', displayName: 'German Twisted Cast On', icon: '🌀' },
  JUDY: { id: 'judy', name: "Judy's Magic", displayName: "Judy's Magic Cast On", icon: '✨' },
  TUBULAR: { id: 'tubular', name: 'Tubular', displayName: 'Tubular Cast On', icon: '⭕' },
  KNITTED: { id: 'knitted', name: 'Knitted', displayName: 'Knitted Cast On', icon: '🧵' },
  BACKWARD_LOOP: { id: 'backward_loop', name: 'Backward Loop', displayName: 'Backward Loop Cast On', icon: '↪️' },
  OTHER: { id: 'other', name: 'Other Method', displayName: 'Other Cast On', icon: '📝' }
};

export const BIND_OFF_METHODS = {
  STANDARD: { id: 'standard', name: 'Standard', displayName: 'Standard Bind Off', icon: '✂️' },
  STRETCHY: { id: 'stretchy', name: 'Stretchy', displayName: "Jeny's Surprisingly Stretchy Bind Off", icon: '🌊' },
  SEWN: { id: 'sewn', name: 'Sewn', displayName: 'Sewn Bind Off', icon: '🪡' },
  PICOT: { id: 'picot', name: 'Picot', displayName: 'Picot Bind Off', icon: '🌸' },
  THREE_NEEDLE: { id: 'three_needle', name: 'Three Needle', displayName: 'Three Needle Bind Off', icon: '🔗' },
  OTHER: { id: 'other', name: 'Other Method', displayName: 'Other Bind Off', icon: '📝' }
};

export const PICK_UP_METHODS = {
  PICK_UP_KNIT: { id: 'pick_up_knit', name: 'Pick Up & Knit', displayName: 'Pick Up & Knit', icon: '🧶' }
};

export const ATTACH_METHODS = {
  MATTRESS_STITCH: { id: 'mattress_stitch', name: 'Mattress Stitch', displayName: 'Mattress Stitch', icon: '🪡' },
  BACKSTITCH: { id: 'backstitch', name: 'Backstitch', displayName: 'Backstitch', icon: '⬆️' },
  KITCHENER_STITCH: { id: 'kitchener_stitch', name: 'Kitchener Stitch', displayName: 'Kitchener Stitch', icon: '🔄' },
  THREE_NEEDLE: { id: 'three_needle', name: 'Three Needle', displayName: 'Three Needle Bind Off', icon: '🔗' }
};

export const CONTINUE_METHODS = {
  FROM_STITCHES: { id: 'from_stitches', name: 'From Live Stitches', displayName: 'From Live Stitches', icon: '📎' }
};

export const CUSTOM_INITIALIZATION_METHODS = {
  CUSTOM: { id: 'custom', name: 'Custom Setup', displayName: 'Custom Setup', icon: '📝' }
};

// Helper functions to get method arrays
export const getCastOnMethodsArray = () => Object.values(CAST_ON_METHODS);
export const getBindOffMethodsArray = () => Object.values(BIND_OFF_METHODS);
export const getPickUpMethodsArray = () => Object.values(PICK_UP_METHODS);
export const getAttachMethodsArray = () => Object.values(ATTACH_METHODS);
export const getContinueMethodsArray = () => Object.values(CONTINUE_METHODS);
export const getCustomInitMethodsArray = () => Object.values(CUSTOM_INITIALIZATION_METHODS);

// Helper functions to get display names by ID
export const getCastOnDisplayName = (id) => {
  const method = Object.values(CAST_ON_METHODS).find(m => m.id === id);
  return method?.displayName || id;
};

export const getBindOffDisplayName = (id) => {
  const method = Object.values(BIND_OFF_METHODS).find(m => m.id === id);
  return method?.displayName || id;
};

// Helper function to get pick up method display name
export const getPickUpDisplayName = (id) => {
  const method = Object.values(PICK_UP_METHODS).find(m => m.id === id);
  return method?.displayName || id;
};

// Helper function to get attach method display name
export const getAttachDisplayName = (id) => {
  const method = Object.values(ATTACH_METHODS).find(m => m.id === id);
  return method?.displayName || id;
};

// Helper function to get continue method display name
export const getContinueDisplayName = (id) => {
  const method = Object.values(CONTINUE_METHODS).find(m => m.id === id);
  return method?.displayName || id;
};

// Helper function to get custom initialization method display name
export const getCustomInitDisplayName = (id) => {
  const method = Object.values(CUSTOM_INITIALIZATION_METHODS).find(m => m.id === id);
  return method?.displayName || id;
};

// ===== PATTERN CATEGORIES =====

export const PATTERN_CATEGORIES = {
  CONSTRUCTION: ['Cast On', 'Pick Up & Knit', 'Continue from Stitches', 'Custom Initialization', 'Bind Off', 'Put on Holder', 'Other Ending'],
  TEXTURE: ['Stockinette', 'Garter', 'Reverse Stockinette', '1x1 Rib', '2x2 Rib', '3x3 Rib', '2x1 Rib', '1x1 Twisted Rib', '2x2 Twisted Rib', 'Seed Stitch', 'Moss Stitch', 'Double Seed', 'Basketweave'],
  COLORWORK: ['Stranded Colorwork', 'Intarsia', 'Fair Isle', 'Mosaic'],
  STRUCTURE: ['Lace', 'Cable', 'Brioche']
};