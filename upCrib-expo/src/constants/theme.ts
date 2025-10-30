// Consistent theme constants for the entire app

export const Theme = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: '#D4A574',
    primaryLight: '#E6C39A',
    primaryDark: '#B8935D',
    
    // Background Colors
    background: '#FAFAFA',
    backgroundSecondary: '#F8FAFC', 
    surface: '#FFFFFF',
    surfaceSecondary: '#F8F9FA',
    
    // Text Colors
    text: '#000000',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textLight: '#B0B0B0',
    textInverse: '#FFFFFF',
    
    // Border Colors
    border: '#F0F0F0',
    borderSecondary: '#E0E0E0',
    borderActive: '#D4A574',
    
    // Status Colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    
    // Accent Colors
    accent: '#FFD700',
    accentLight: '#FFFBF0',
    
    // Shadow Colors
    shadow: '#000000',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    shadowMedium: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.3)',
  },
  
  // Typography
  typography: {
    // Font Weights
    fontWeights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Font Sizes
    fontSizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
    },
    
    // Line Heights
    lineHeights: {
      tight: 16,
      normal: 20,
      relaxed: 24,
      loose: 28,
      extraLoose: 34,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
  },
  
  // Border Radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 999,
  },
  
  // Shadows
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 4,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 5,
    },
  },
  
  // Button Styles
  buttons: {
    primary: {
      backgroundColor: '#D4A574',
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      shadowColor: '#D4A574',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700' as const,
    },
    
    secondary: {
      backgroundColor: '#F8F9FA',
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 1,
      borderColor: '#E0E0E0',
    },
    secondaryText: {
      color: '#000000',
      fontSize: 18,
      fontWeight: '600' as const,
    },
    
    disabled: {
      backgroundColor: '#E0E0E0',
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    disabledText: {
      color: '#999999',
      fontSize: 18,
      fontWeight: '600' as const,
    },
  },
  
  // Bottom Navigation Styles
  bottomNavigation: {
    container: {
      flexDirection: 'row' as const,
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      paddingBottom: 20,
      paddingTop: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 8,
    },
    item: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: 8,
    },
    itemActive: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: 8,
    },
    icon: {
      fontSize: 24,
      marginBottom: 4,
      opacity: 0.6,
    },
    iconActive: {
      fontSize: 24,
      marginBottom: 4,
      opacity: 1,
    },
    label: {
      fontSize: 12,
      color: '#666666',
      fontWeight: '500' as const,
    },
    labelActive: {
      fontSize: 12,
      color: '#D4A574',
      fontWeight: '600' as const,
    },
  },
};

export default Theme;
