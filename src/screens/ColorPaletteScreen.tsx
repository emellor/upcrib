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
import Theme from '../constants/theme';
import GlobalStyles from '../constants/globalStyles';

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
    <SafeAreaView style={GlobalStyles.screenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={GlobalStyles.header}>
        <TouchableOpacity 
          style={GlobalStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={GlobalStyles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={GlobalStyles.headerContent}>
          <Text style={GlobalStyles.stepIndicator}>Step 1 of 3</Text>
          <Text style={GlobalStyles.headerTitle}>Exterior Colors</Text>
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={GlobalStyles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={GlobalStyles.progressContainer}>
        <View style={GlobalStyles.progressBar}>
          <View style={[GlobalStyles.progressFill, { width: '33%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={GlobalStyles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={GlobalStyles.content}>
          <Text style={GlobalStyles.subtitle}>
            Choose a color palette that best represents your exterior design vision
          </Text>
        </View>
        
        {loading ? (
          <View style={GlobalStyles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={GlobalStyles.loadingText}>Loading color palettes...</Text>
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
          <View style={GlobalStyles.infoContainer}>
            <Text style={GlobalStyles.infoTitle}>
              {colorPalettes.find(p => p.id === selectedPaletteId)?.name} selected
            </Text>
            <Text style={GlobalStyles.infoText}>
              {colorPalettes.find(p => p.id === selectedPaletteId)?.description}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={GlobalStyles.bottomContainer}>
        <TouchableOpacity
          style={[GlobalStyles.nextButton, !selectedPaletteId && GlobalStyles.nextButtonDisabled]}
          onPress={handleNext}
        >
          <Text style={[GlobalStyles.nextButtonText, !selectedPaletteId && GlobalStyles.nextButtonTextDisabled]}>
            {selectedPaletteId ? 'Continue with Palette' : 'Skip for now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Screen-specific styles only - common styles are in GlobalStyles
const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
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
});

export default ColorPaletteScreen;
