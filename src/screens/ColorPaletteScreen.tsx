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

const colorSwatches = [
  { id: 1, name: 'Classic White', color: '#FFFFFF', borderColor: '#E0E0E0' },
  { id: 2, name: 'Charcoal Gray', color: '#4A4A4A' },
  { id: 3, name: 'Navy Blue', color: '#1B365D' },
  { id: 4, name: 'Forest Green', color: '#2E5D31' },
  { id: 5, name: 'Warm Beige', color: '#D4B896' },
  { id: 6, name: 'Brick Red', color: '#A0522D' },
  { id: 7, name: 'Sage Green', color: '#9CAF88' },
  { id: 8, name: 'Cream', color: '#F5F5DC' },
];

const ColorPaletteScreen: React.FC<ColorPaletteScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionId } = route.params;
  const [selectedColors, setSelectedColors] = useState<number[]>([]);

  const toggleColorSelection = (colorId: number) => {
    setSelectedColors(prev =>
      prev.includes(colorId)
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    );
  };

  const handleNext = () => {
    navigation.navigate('EnvironmentThemes', { 
      sessionId,
      selectedColors 
    });
  };

  const handleSkip = () => {
    navigation.navigate('EnvironmentThemes', { 
      sessionId,
      selectedColors: [] 
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
          <Text style={styles.stepIndicator}>Step 1 of 4</Text>
          <Text style={styles.title}>Color Palette</Text>
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '25%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Choose colors that inspire your exterior design vision
        </Text>
        
        <View style={styles.colorGrid}>
          {colorSwatches.map(swatch => (
            <View key={swatch.id} style={styles.colorItem}>
              <TouchableOpacity
                style={[
                  styles.colorSwatch,
                  { backgroundColor: swatch.color },
                  swatch.borderColor ? { borderColor: swatch.borderColor } : null,
                  selectedColors.includes(swatch.id) && styles.selectedSwatch,
                ]}
                onPress={() => toggleColorSelection(swatch.id)}
              >
                {selectedColors.includes(swatch.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.colorLabel}>
                {swatch.name}
              </Text>
            </View>
          ))}
        </View>

        {selectedColors.length > 0 && (
          <View style={styles.selectionSummary}>
            <Text style={styles.selectionText}>
              {selectedColors.length} color{selectedColors.length !== 1 ? 's' : ''} selected
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.nextButton, selectedColors.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
        >
          <Text style={[styles.nextButtonText, selectedColors.length === 0 && styles.nextButtonTextDisabled]}>
            {selectedColors.length > 0 ? 'Continue' : 'Skip for now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
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
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorItem: {
    width: '22%',
    alignItems: 'center',
    marginBottom: 32,
  },
  colorSwatch: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
  },
  selectedSwatch: {
    borderColor: '#007AFF',
    transform: [{ scale: 1.1 }],
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  colorLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666666',
    fontWeight: '500',
    lineHeight: 16,
  },
  selectionSummary: {
    marginTop: 40,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
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
});

export default ColorPaletteScreen;
