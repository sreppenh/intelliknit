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