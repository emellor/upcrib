// src/constants/colors.ts
export const Colors = {
  // Primary colors
  primary: '#7FB3D3',
  secondary: '#D4A574',
  
  // Background colors
  background: '#FFFFFF',
  backgroundLight: '#F5F5F5',
  backgroundGray: '#E8F4F8',
  
  // Text colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textLight: '#999999',
  textWhite: '#FFFFFF',
  
  // Border colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  // Accent colors
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  
  // Transparent colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadowColor: 'rgba(127, 179, 211, 0.3)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  xxl: 25,
  round: 50,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

// Export global styles and theme
export { default as GlobalStyles } from './globalStyles';
export { default as Theme } from './theme';
