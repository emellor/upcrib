import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
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

const colorPalettes = [
  { 
    id: 1, 
    name: 'Surprise Me', 
    icon: '🎨',
    colors: ['#FFB6C1', '#DDA0DD', '#87CEEB', '#98FB98'],
    description: 'Let AI choose the perfect combination'
  },
  { 
    id: 2, 
    name: 'High-Contrast Neutrals', 
    colors: ['#E5E5E5', '#D2B48C', '#2F2F2F'],
    description: 'Bold contrast with sophisticated neutrals'
  },
  { 
    id: 3, 
    name: 'Forest-Inspired', 
    colors: ['#D2B48C', '#A0522D', '#556B2F', '#2F2F2F'],
    description: 'Earth tones inspired by nature'
  },
  { 
    id: 4, 
    name: 'Romance', 
    colors: ['#F8BBD9', '#E6E6FA', '#D2B48C', '#8B4513'],
    description: 'Soft and romantic color harmony'
  },
];

const ColorPaletteScreen: React.FC<ColorPaletteScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionId } = route.params;
  const [selectedPaletteId, setSelectedPaletteId] = useState<number | null>(null);

  const selectPalette = (paletteId: number) => {
    setSelectedPaletteId(selectedPaletteId === paletteId ? null : paletteId);
  };

  const handleNext = () => {
    const selectedPalette = selectedPaletteId ? colorPalettes.find(p => p.id === selectedPaletteId) : null;
    navigation.navigate('InspirationPhoto', { 
      sessionId,
      selectedColors: selectedPalette ? selectedPalette.colors.map((_, index) => index + 1) : [],
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
        </View>
        <TouchableOpacity onPress={handleSkip}>
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
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Choose a color palette that best represents your exterior design vision
        </Text>
        
        <View style={styles.paletteGrid}>
          {colorPalettes.map(palette => (
            <TouchableOpacity
              key={palette.id}
              style={[
                styles.paletteCard,
                selectedPaletteId === palette.id && styles.selectedPalette,
              ]}
              onPress={() => selectPalette(palette.id)}
              activeOpacity={0.8}
            >
              {palette.id === 1 ? (
                <View style={styles.surpriseIcon}>
                  <Text style={styles.paletteIcon}>🎨</Text>
                </View>
              ) : (
                <View style={styles.colorDisplay}>
                  {palette.colors.map((color, index) => (
                    <View
                      key={index}
                      style={[
                        styles.colorSwatch,
                        { backgroundColor: color },
                        index === 0 && { marginLeft: 0 },
                      ]}
                    />
                  ))}
                </View>
              )}
              
              <Text style={[
                styles.paletteName,
                selectedPaletteId === palette.id && styles.selectedPaletteName
              ]}>
                {palette.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedPaletteId && (
          <View style={styles.selectionSummary}>
            <Text style={styles.selectionText}>
              {colorPalettes.find(p => p.id === selectedPaletteId)?.name} selected
            </Text>
            <Text style={styles.selectionDescription}>
              {colorPalettes.find(p => p.id === selectedPaletteId)?.description}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.nextButton, !selectedPaletteId && styles.nextButtonDisabled]}
          onPress={handleNext}
        >
          <Text style={[styles.nextButtonText, !selectedPaletteId && styles.nextButtonTextDisabled]}>
            {selectedPaletteId ? 'Continue with Palette' : 'Skip for now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#F8F8F8',
  },
  backIcon: {
    fontSize: 20,
    color: '#000000',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  skipButton: {
    fontSize: 16,
    color: '#007AFF',
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
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  paletteCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    aspectRatio: 1,
    justifyContent: 'center',
  },
  selectedPalette: {
    borderColor: '#FFD700',
    backgroundColor: '#FFFBF0',
    transform: [{ scale: 1.02 }],
  },
  paletteIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  surpriseIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorDisplay: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  paletteName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 8,
  },
  selectedPaletteName: {
    color: '#B45309',
  },
  selectionSummary: {
    marginTop: 40,
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  selectionText: {
    fontSize: 16,
    color: '#1E40AF',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectionDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nextButtonTextDisabled: {
    color: '#94A3B8',
  },
});

export default ColorPaletteScreen;
