import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { enhancedStyleRenovationApi, ColorPalette } from '../services/enhancedStyleRenovationApi';

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

const ColorPaletteScreen: React.FC<ColorPaletteScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionId, imageUri } = route.params;
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(null);
  const [colorPalettes, setColorPalettes] = useState<ColorPalette[]>([]);
  const [loading, setLoading] = useState(true);

  const selectPalette = (paletteId: string) => {
    setSelectedPaletteId(selectedPaletteId === paletteId ? null : paletteId);
  };

  // Load color palettes from API
  useEffect(() => {
    const loadColorPalettes = async () => {
      try {
        setLoading(true);
        const palettes = await enhancedStyleRenovationApi.getColorPalettes();
        
        // Add a "Surprise Me" option at the beginning
        const surpriseMeOption: ColorPalette = {
          id: 'surprise-me',
          name: 'Surprise Me',
          colors: ['#FFB6C1', '#DDA0DD', '#87CEEB', '#98FB98'],
          description: 'Let AI choose the perfect combination'
        };
        
        // Ensure palettes is an array before spreading
        const paletteArray = Array.isArray(palettes) ? palettes : [];
        setColorPalettes([surpriseMeOption, ...paletteArray]);
      } catch (error) {
        console.error('Failed to load color palettes:', error);
        
        // Fallback to hardcoded palettes that match backend API
        const fallbackPalettes: ColorPalette[] = [
          {
            id: 'surprise-me',
            name: 'Surprise Me',
            colors: ['#FFB6C1', '#DDA0DD', '#87CEEB', '#98FB98'],
            description: 'Let AI choose the perfect combination'
          },
          {
            id: 'classic-neutral',
            name: 'Classic Neutral',
            colors: ['#F5F5DC', '#D2B48C', '#8B4513', '#2F4F4F'],
            description: 'Timeless beige, tan, brown, and charcoal'
          },
          {
            id: 'coastal-blue',
            name: 'Coastal Blue',
            colors: ['#F0F8FF', '#4682B4', '#2E5984', '#1C3A56'],
            description: 'Soft whites and blues inspired by seaside living'
          },
          {
            id: 'heritage-red',
            name: 'Heritage Red',
            colors: ['#FFFAF0', '#DC143C', '#8B0000', '#2F2F2F'],
            description: 'Classic red brick with cream and charcoal accents'
          },
          {
            id: 'forest-green',
            name: 'Forest Green',
            colors: ['#F5F5DC', '#228B22', '#006400', '#8B4513'],
            description: 'Natural greens with cream and earth tones'
          },
          {
            id: 'modern-monochrome',
            name: 'Modern Monochrome',
            colors: ['#FFFFFF', '#C0C0C0', '#808080', '#000000'],
            description: 'Sophisticated whites, grays, and black'
          },
          {
            id: 'warm-terracotta',
            name: 'Warm Terracotta',
            colors: ['#FFF8DC', '#CD853F', '#A0522D', '#8B4513'],
            description: 'Mediterranean-inspired warm earth tones'
          },
          {
            id: 'cottage-pastels',
            name: 'Cottage Pastels',
            colors: ['#FFFAF0', '#DDA0DD', '#98FB98', '#F0E68C'],
            description: 'Soft pastels perfect for cottage styles'
          },
          {
            id: 'alpine-naturals',
            name: 'Alpine Naturals',
            colors: ['#F5F5DC', '#8B4513', '#228B22', '#2F4F4F'],
            description: 'Natural wood, stone, and forest colors'
          }
        ];
        
        setColorPalettes(fallbackPalettes);
      } finally {
        setLoading(false);
      }
    };

    loadColorPalettes();
  }, []);

  const handleNext = () => {
    const selectedPalette = selectedPaletteId ? colorPalettes.find(p => p.id === selectedPaletteId) : null;
    
    // Map palette IDs to numbers for navigation
    const paletteIdToNumber: { [key: string]: number } = {
      'surprise-me': 0,
      'classic-neutral': 1,
      'coastal-blue': 2,
      'heritage-red': 3,
      'forest-green': 4,
      'modern-monochrome': 5,
      'warm-terracotta': 6,
      'cottage-pastels': 7,
      'alpine-naturals': 8
    };
    
    navigation.navigate('InspirationPhoto', { 
      sessionId,
      selectedColors: selectedPalette ? [paletteIdToNumber[selectedPalette.id] || 1] : [],
      selectedThemes: [],
      imageUri
    });
  };

  const handleSkip = () => {
    navigation.navigate('InspirationPhoto', { 
      sessionId,
      selectedColors: [],
      selectedThemes: [],
      imageUri
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
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Choose a color palette that best represents your exterior design vision
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading color palettes...</Text>
          </View>
        ) : (
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
              {palette.id === 'surprise-me' ? (
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
        )}

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
      </ScrollView>

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
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default ColorPaletteScreen;
