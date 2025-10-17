import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type ColorPaletteScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ColorPalette'
>;

type ColorPaletteScreenRouteProp = RouteProp<
  RootStackParamList,
  'ColorPalette'
>;

interface ColorPaletteScreenProps {
  navigation: ColorPaletteScreenNavigationProp;
  route: ColorPaletteScreenRouteProp;
}

// Premium color palette options for house design
const colorPalettes = [
  { 
    id: 'surprise', 
    name: 'Surprise Me',
    subtitle: 'AI Curated',
    icon: '✨',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
    description: 'Let our AI choose the perfect color combination based on design trends'
  },
  { 
    id: 'neutral', 
    name: 'Modern Neutrals',
    subtitle: 'Timeless Elegance',
    icon: '🎨',
    colors: ['#F5F5F5', '#D4B896', '#8B7D6B', '#2C2C2C'],
    description: 'Sophisticated neutral tones with contemporary contrast'
  },
  { 
    id: 'forest', 
    name: 'Natural Heritage',
    subtitle: 'Earth Inspired',
    icon: '�',
    colors: ['#8FBC8F', '#654321', '#556B2F', '#2F4F4F'],
    description: 'Organic earth tones inspired by natural landscapes'
  },
  { 
    id: 'romance', 
    name: 'Soft Romance',
    subtitle: 'Gentle Pastels',
    icon: '🌸',
    colors: ['#F8E8E8', '#E6D7C9', '#D4B896', '#A67C52'],
    description: 'Warm, inviting pastels for a welcoming exterior'
  },
  { 
    id: 'coastal', 
    name: 'Coastal Breeze',
    subtitle: 'Ocean Inspired',
    icon: '🌊',
    colors: ['#F0F8FF', '#B0C4DE', '#4682B4', '#2F4F4F'],
    description: 'Fresh, airy colors reminiscent of seaside living'
  },
  { 
    id: 'urban', 
    name: 'Urban Chic',
    subtitle: 'Metropolitan',
    icon: '🏙️',
    colors: ['#DCDCDC', '#A9A9A9', '#696969', '#1C1C1C'],
    description: 'Bold, contemporary colors for modern city living'
  },
];

const ColorPaletteScreen: React.FC<ColorPaletteScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionId } = route.params;
  const [selectedPalette, setSelectedPalette] = useState<string | null>(null);

  const handleNext = () => {
    navigation.navigate('InspirationPhoto', { 
      sessionId,
      selectedColors: selectedPalette ? [1] : [], // Pass 1 to indicate palette selected
      selectedThemes: []
    });
  };

  const handleSkip = () => {
    navigation.navigate('InspirationPhoto', { 
      sessionId,
      selectedColors: [],
      selectedThemes: []
    });
  };

  // Helper function to get selected palette for AI generation
  const getSelectedPalette = () => {
    return selectedPalette ? colorPalettes.find(p => p.id === selectedPalette) : null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.stepIndicator}>Step 1 of 3</Text>
          <Text style={styles.title}>Exterior Colors</Text>
          <Text style={styles.headerSubtitle}>Choose your home's personality</Text>
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButtonContainer}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>


      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '33%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.introSection}>
          <Text style={styles.mainTitle}>
            Select Your Color Palette
          </Text>
          <Text style={styles.subtitle}>
            Choose a curated color scheme that reflects your style and enhances your home's architecture
          </Text>
        </View>

        <View style={styles.paletteGrid}>
          {colorPalettes.map(palette => (
            <TouchableOpacity
              key={palette.id}
              style={[
                styles.paletteCard,
                selectedPalette === palette.id && styles.selectedPalette,
              ]}
              onPress={() => setSelectedPalette(selectedPalette === palette.id ? null : palette.id)}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <Text style={styles.paletteIcon}>{palette.icon}</Text>
                </View>
                {selectedPalette === palette.id && (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedCheck}>✓</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.colorDisplay}>
                {palette.colors.map((color, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paletteSwatch,
                      { backgroundColor: color },
                      index === 0 && styles.firstSwatch,
                      index === palette.colors.length - 1 && styles.lastSwatch,
                    ]}
                  />
                ))}
              </View>
              
              <View style={styles.cardContent}>
                <Text style={[
                  styles.paletteName,
                  selectedPalette === palette.id && styles.selectedPaletteName
                ]}>
                  {palette.name}
                </Text>
                <Text style={styles.paletteSubtitle}>
                  {palette.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {selectedPalette && (
          <View style={styles.selectionDetails}>
            <Text style={styles.selectionLabel}>Selected Palette</Text>
            <Text style={styles.selectionName}>
              {colorPalettes.find(p => p.id === selectedPalette)?.name}
            </Text>
            <Text style={styles.selectionDescription}>
              {colorPalettes.find(p => p.id === selectedPalette)?.description}
            </Text>
          </View>
        )}

        {!selectedPalette && (
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>Need help choosing?</Text>
            <Text style={styles.helpText}>
              Each palette is carefully curated by our design experts. Select "Surprise Me" to let our AI choose based on current design trends.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.bottomContent}>
          {selectedPalette && (
            <View style={styles.selectedInfo}>
              <Text style={styles.selectedLabel}>Selected:</Text>
              <Text style={styles.selectedPaletteName}>
                {colorPalettes.find(p => p.id === selectedPalette)?.name}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.continueButton,
              selectedPalette ? styles.continueButtonActive : null
            ]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.continueButtonText,
              selectedPalette ? styles.continueButtonTextActive : null
            ]}>
              {selectedPalette ? 'Continue with Palette' : 'Skip & Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    position: 'absolute',
    left: 24,
    top: 12,
    zIndex: 10,
  },
  backIcon: {
    fontSize: 20,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 40,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '400',
  },
  skipButtonContainer: {
    position: 'absolute',
    right: 24,
    top: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipButton: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  introSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paletteIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  selectedBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  selectedCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  colorDisplay: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paletteSwatch: {
    flex: 1,
    height: 40,
  },
  firstSwatch: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  lastSwatch: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  cardContent: {
    paddingHorizontal: 4,
  },
  paletteSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  selectionDetails: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginVertical: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectionLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectionName: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '700',
  },
  helpSection: {
    backgroundColor: '#FEFEFE',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  bottomContent: {
    paddingHorizontal: 20,
    paddingBottom: 34,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  continueButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  continueButtonActive: {
    backgroundColor: '#3B82F6',
    transform: [{ scale: 1.02 }],
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  continueButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 50,
  },
  subtitle: {
    fontSize: 20,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    fontWeight: '400',
  },
  instructionContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  instructionText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionList: {
    alignItems: 'center',
    gap: 6,
  },
  instructionItem: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  instructionFooter: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 24,
  },
  colorSwatch: {
    width: 100,
    height: 120,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  selectedSwatch: {
    borderColor: '#007AFF',
    transform: [{ scale: 1.05 }],
  },
  colorSchemeContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
    overflow: 'hidden',
  },
  wallColorArea: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
    position: 'relative',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  windowColorArea: {
    width: '80%',
    height: 20,
    borderRadius: 4,
    marginTop: 4,
  },
  doorColorArea: {
    width: 30,
    height: 40,
    borderRadius: 6,
    marginBottom: 4,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 13,
  },
  colorLabel: {
    fontSize: 14,
    textAlign: 'center',
    color: '#000000',
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 8,
  },
  selectedLabel: {
    color: '#007AFF',
    fontWeight: '700',
  },
  colorLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
  },
  legendItem: {
    alignItems: 'center',
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
    borderWidth: 0.5,
    borderColor: '#CCCCCC',
  },
  legendText: {
    fontSize: 9,
    color: '#666666',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nextButtonTextDisabled: {
    color: '#A0A0A0',
  },
  // New styles for simple color picker
  previewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  housePreview: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
  },
  wallPreview: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  windowPreview: {
    width: '80%',
    height: 20,
    borderRadius: 4,
  },
  doorPreview: {
    width: 32,
    height: 48,
    borderRadius: 6,
  },
  colorSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
    justifyContent: 'flex-start',
  },
  colorButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  selectedColor: {
    borderColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOpacity: 0.4,
    transform: [{ scale: 1.05 }],
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  selectedText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'left',
  },
  completionMessage: {
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    marginTop: 20,
  },
  completionText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  completionSubtext: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  // New palette styles
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  paletteCard: {
    width: '47%',
    aspectRatio: 1.2,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  selectedPalette: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
    transform: [{ scale: 1.02 }],
  },
  surpriseIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  surpriseEmoji: {
    fontSize: 24,
  },
  colorDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paletteName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedPaletteName: {
    color: '#000000',
    fontWeight: '700',
  },
  checkmarkOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionSummary: {
    marginTop: 32,
    backgroundColor: '#FFFBF0',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  selectionText: {
    fontSize: 16,
    color: '#B8860B',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectionDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default ColorPaletteScreen;
