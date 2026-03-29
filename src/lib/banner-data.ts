// Minecraft Banner Colors with hex values
export const BANNER_COLORS: Record<string, { hex: string; name: string }> = {
  white: { hex: '#F9FFFE', name: 'White' },
  orange: { hex: '#F9801D', name: 'Orange' },
  magenta: { hex: '#C74EBD', name: 'Magenta' },
  light_blue: { hex: '#9ABED9', name: 'Light Blue' },
  yellow: { hex: '#FED83D', name: 'Yellow' },
  lime: { hex: '#80C71F', name: 'Lime' },
  pink: { hex: '#F38BAA', name: 'Pink' },
  gray: { hex: '#474F52', name: 'Gray' },
  light_gray: { hex: '#9D9D97', name: 'Light Gray' },
  cyan: { hex: '#169C9C', name: 'Cyan' },
  purple: { hex: '#8932B8', name: 'Purple' },
  blue: { hex: '#3AB3DA', name: 'Blue' },
  brown: { hex: '#835432', name: 'Brown' },
  green: { hex: '#5E7C16', name: 'Green' },
  red: { hex: '#B02E26', name: 'Red' },
  black: { hex: '#1D1D21', name: 'Black' },
};


export const BANNER_PATTERNS: Record<string, { name: string; assetName: string }> = {
  // Base color is handled separately, these are overlay patterns
  
  // Border patterns
  border: {
    name: 'Border',
    assetName: 'border',
  },
  
  curly_border: {
    name: 'Curly Border',
    assetName: 'curly_border',
  },
  
  // Stripe patterns
  stripe_bottom: {
    name: 'Stripe Bottom',
    assetName: 'stripe_bottom',
  },
  
  stripe_top: {
    name: 'Stripe Top',
    assetName: 'stripe_top',
  },
  
  stripe_left: {
    name: 'Stripe Left',
    assetName: 'stripe_left',
  },
  
  stripe_right: {
    name: 'Stripe Right',
    assetName: 'stripe_right',
  },
  
  stripe_center: {
    name: 'Stripe Center',
    assetName: 'stripe_center',
  },
  
  stripe_middle: {
    name: 'Stripe Middle',
    assetName: 'stripe_middle',
  },
  
  stripe_downright: {
    name: 'Stripe Downright',
    assetName: 'stripe_downright',
  },
  
  stripe_downleft: {
    name: 'Stripe Downleft',
    assetName: 'stripe_downleft',
  },
  
  small_stripes: {
    name: 'Small Stripes',
    assetName: 'small_stripes',
  },
  
  // Cross patterns
  cross: {
    name: 'Cross',
    assetName: 'cross',
  },
  
  straight_cross: {
    name: 'Straight Cross',
    assetName: 'straight_cross',
  },
  
  // Diagonal patterns
  diagonal_left: {
    name: 'Diagonal Left',
    assetName: 'diagonal_left',
  },
  
  diagonal_right: {
    name: 'Diagonal Right',
    assetName: 'diagonal_right',
  },
  
  diagonal_up_left: {
    name: 'Diagonal Up Left',
    assetName: 'diagonal_up_left',
  },
  
  diagonal_up_right: {
    name: 'Diagonal Up Right',
    assetName: 'diagonal_up_right',
  },
  
  // Half patterns
  half_horizontal: {
    name: 'Half Horizontal',
    assetName: 'half_horizontal',
  },
  
  half_horizontal_bottom: {
    name: 'Half Horizontal Bottom',
    assetName: 'half_horizontal_bottom',
  },
  
  half_vertical: {
    name: 'Half Vertical',
    assetName: 'half_vertical',
  },
  
  half_vertical_right: {
    name: 'Half Vertical Right',
    assetName: 'half_vertical_right',
  },
  
  // Triangle patterns
  triangle_bottom: {
    name: 'Triangle Bottom',
    assetName: 'triangle_bottom',
  },
  
  triangle_top: {
    name: 'Triangle Top',
    assetName: 'triangle_top',
  },
  
  triangles_bottom: {
    name: 'Triangles Bottom',
    assetName: 'triangles_bottom',
  },
  
  triangles_top: {
    name: 'Triangles Top',
    assetName: 'triangles_top',
  },
  
  // Shape patterns
  rhombus: {
    name: 'Rhombus',
    assetName: 'rhombus',
  },
  
  circle: {
    name: 'Circle',
    assetName: 'circle',
  },
  
  // Square patterns
  square_bottom_left: {
    name: 'Square Bottom Left',
    assetName: 'square_bottom_left',
  },
  
  square_bottom_right: {
    name: 'Square Bottom Right',
    assetName: 'square_bottom_right',
  },
  
  square_top_left: {
    name: 'Square Top Left',
    assetName: 'square_top_left',
  },
  
  square_top_right: {
    name: 'Square Top Right',
    assetName: 'square_top_right',
  },
  
  // Gradient patterns
  gradient: {
    name: 'Gradient',
    assetName: 'gradient',
  },
  
  gradient_up: {
    name: 'Gradient Up',
    assetName: 'gradient_up',
  },
  
  // Special patterns
  creeper: {
    name: 'Creeper',
    assetName: 'creeper',
  },
  
  skull: {
    name: 'Skull',
    assetName: 'skull',
  },
  
  flower: {
    name: 'Flower',
    assetName: 'flower',
  },
  
  globe: {
    name: 'Globe',
    assetName: 'globe',
  },
  
  mojang: {
    name: 'Mojang',
    assetName: 'mojang',
  },
  
  piglin: {
    name: 'Piglin Snout',
    assetName: 'piglin',
  },
  
  field_masoned: {
    name: 'Field Masoned',
    assetName: 'bricks',
  },

  bricks: {
    name: 'Bricks',
    assetName: 'bricks',
  },

  flow: {
    name: 'Flow',
    assetName: 'flow',
  },

  guster: {
    name: 'Guster',
    assetName: 'guster',
  },
};

export function getPatternNames(): string[] {
  return Object.keys(BANNER_PATTERNS);
}

export function getColorNames(): string[] {
  return Object.keys(BANNER_COLORS);
}
