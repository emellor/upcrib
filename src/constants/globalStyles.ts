import { StyleSheet } from 'react-native';
import Theme from './theme';

/**
 * Global styles for consistent screen layouts across the app
 * These styles are based on the design pattern from InspirationPhotoScreen
 */
export const GlobalStyles = StyleSheet.create({
  // Screen Container
  screenContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  // Header Components
  header: {
    ...Theme.header.default,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  backButton: {
    ...Theme.header.backButton,
  },
  
  backIcon: {
    fontSize: 20,
    color: Theme.colors.text,
  },
  
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  
  stepIndicator: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.text,
    textAlign: 'center',
  },
  
  skipButton: {
    color: Theme.colors.primary,
    fontSize: Theme.typography.fontSizes.base,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  // Progress Bar
  progressContainer: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.base,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  
  progressBar: {
    height: 4,
    backgroundColor: Theme.colors.borderSecondary,
    borderRadius: 2,
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
    borderRadius: 2,
  },

  // Content Area
  scrollContainer: {
    flex: 1,
  },
  
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  
  // Text Styles
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  
  // Cards and Containers
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  
  cardLarge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  
  infoContainer: {
    backgroundColor: Theme.colors.surfaceSecondary,
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  
  infoText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    lineHeight: 20,
  },

  // Bottom Navigation
  bottomContainer: {
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  
  nextButton: {
    ...Theme.buttons.primary,
  },
  
  nextButtonText: {
    ...Theme.buttons.primaryText,
  },
  
  nextButtonDisabled: {
    ...Theme.buttons.disabled,
  },
  
  nextButtonTextDisabled: {
    ...Theme.buttons.disabledText,
  },

  // List Items
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  listItemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  
  listItemText: {
    fontSize: 15,
    color: Theme.colors.text,
    flex: 1,
    lineHeight: 20,
  },

  // Tips and Bullets
  tipsList: {
    gap: 8,
  },
  
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  tipBullet: {
    fontSize: 16,
    color: Theme.colors.primary,
    marginRight: 8,
    marginTop: 2,
    fontWeight: '700',
  },
  
  tipText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Theme.colors.textSecondary,
  },

  // Description Container
  descriptionContainer: {
    marginBottom: 32,
  },
});

export default GlobalStyles;
