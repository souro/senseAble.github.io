import { ColorPalette } from '../types';

export const defaultColorPalette: ColorPalette = {
  'not-familiar': '#FF6B6B',
  'somewhat-familiar': '#FFD93D',
  'familiar': '#6BCF7F'
};

// Okabe–Ito colorblind-safe palette with dot patterns
export const colorblindPalette: ColorPalette = {
  'not-familiar': '#0173B2',
  'somewhat-familiar': '#DE8F05',
  'familiar': '#029E73',
  patterns: {
    'not-familiar': 'dots',      // Dense dots for high importance
    'somewhat-familiar': 'diagonal',  // Diagonal lines for medium
    'familiar': 'grid'           // Light grid for familiar
  }
};

// High contrast with inverted text colors for readability
export const highContrastPalette: ColorPalette = {
  'not-familiar': '#000000',
  'somewhat-familiar': '#333333',  // Dark gray (7.5:1 contrast on white)
  'familiar': '#FFFFFF',           // White background
  textColors: {
    'not-familiar': '#FFFFFF',     // White text on black
    'somewhat-familiar': '#FFFFFF', // White text on dark gray
    'familiar': '#000000'          // Black text on white
  },
  patterns: {
    'not-familiar': 'solid',       // Solid fill
    'somewhat-familiar': 'horizontal', // Horizontal lines
    'familiar': 'none'             // No pattern for white
  }
};

export const dyslexiaPalette: ColorPalette = {
  'not-familiar': '#EAC7C7',           // Muted peach (low contrast red replacement)
  'somewhat-familiar': '#FFF3B0',      // Light yellow
  'familiar': '#B5EAD7'                // Pale mint green
};

export const getColorPalette = (accessibilityNeed: string): ColorPalette => {
  switch (accessibilityNeed) {
    case 'colorblind':
      return colorblindPalette;
    case 'dyslexia':
      return dyslexiaPalette;
    case 'low-vision':
      return highContrastPalette;
    default:
      return defaultColorPalette;
  }
};

export const colorPaletteOptions = [
  { label: 'Default', value: 'default', palette: defaultColorPalette },
  { label: 'Colorblind-Friendly', value: 'colorblind', palette: colorblindPalette },
  { label: 'High Contrast', value: 'highContrast', palette: highContrastPalette },
  { label: 'Dyslexia-Friendly', value: 'dyslexia', palette: dyslexiaPalette }
];
