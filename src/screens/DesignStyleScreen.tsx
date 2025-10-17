import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { enhancedStyleRenovationApi } from '../services/enhancedStyleRenovationApi';
import { apiClient } from '../services/apiClient';
import Theme from '../constants/theme';
import GlobalStyles from '../constants/globalStyles';

type DesignStyleScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DesignStyle'
>;

type DesignStyleScreenRouteProp = RouteProp<
  RootStackParamList,
  'DesignStyle'
>;

interface DesignStyleScreenProps {
  navigation: DesignStyleScreenNavigationProp;
  route: DesignStyleScreenRouteProp;
}

const designStyles = [
  { name: 'Modern', description: 'Clean lines and minimal design', emoji: '🏢' },
  { name: 'Traditional', description: 'Classic and timeless appeal', emoji: '🏛️' },
  { name: 'Contemporary', description: 'Current trends and sleek style', emoji: '✨' },
  { name: 'Minimalist', description: 'Simple and uncluttered', emoji: '⚪' },
  { name: 'Industrial', description: 'Raw materials and urban edge', emoji: '🏭' },
  { name: 'Scandinavian', description: 'Light woods and cozy comfort', emoji: '🌲' },
  { name: 'Rustic', description: 'Natural textures and warm materials', emoji: '🏚️' },
  { name: 'Art Deco', description: 'Geometric patterns and luxury', emoji: '💎' },
  { name: 'Colonial', description: 'Historical charm and symmetry', emoji: '🏘️' },
  { name: 'Mediterranean', description: 'Warm colors and natural stone', emoji: '🌊' },
  { name: 'Craftsman', description: 'Handcrafted details and quality', emoji: '🔨' },
  { name: 'Prairie', description: 'Horizontal lines and natural integration', emoji: '🌾' },
];

const DesignStyleScreen: React.FC<DesignStyleScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionId, selectedColors, selectedThemes, hasInspirationPhoto, imageUri } = route.params;
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [architecturalStyles, setArchitecturalStyles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Fallback styles in case API is unavailable
  const fallbackStyles = [
    { id: 'georgian', name: 'Georgian', description: 'Elegant symmetrical design with classical proportions' },
    { id: 'victorian', name: 'Victorian', description: 'Ornate details and decorative elements' },
    { id: 'tudor', name: 'Tudor', description: 'Half-timbered construction with medieval charm' },
    { id: 'cotswold-cottage', name: 'Cotswold Cottage', description: 'Honey-colored stone with thatched roofs' },
    { id: 'country-farmhouse', name: 'Country Farmhouse', description: 'Rustic charm with practical design' },
    { id: 'contemporary-minimal', name: 'Contemporary Minimal', description: 'Clean lines and modern simplicity' },
    { id: 'provencal', name: 'Provençal', description: 'French countryside style with warm colors' },
    { id: 'alpine-chalet', name: 'Alpine Chalet', description: 'Mountain retreat with natural materials' },
    { id: 'mediterranean-villa', name: 'Mediterranean Villa', description: 'Warm stucco with terracotta roofs' },
  ];

  useEffect(() => {
    loadArchitecturalStyles();
  }, []);

  const loadArchitecturalStyles = async () => {
    setLoading(true);
    setLoadingError(null);
    
    try {
      console.log('Fetching architectural styles from API...');
      const styles = await enhancedStyleRenovationApi.getArchitecturalStyles();
      
      if (Array.isArray(styles) && styles.length > 0) {
        console.log('Successfully loaded styles from API:', styles);
        setArchitecturalStyles(styles);
        // Set default selection to first available style
        if (!selectedStyle && styles[0]) {
          setSelectedStyle(styles[0].id);
        }
      } else {
        console.log('API returned empty styles array, using fallback');
        setArchitecturalStyles(fallbackStyles);
        setSelectedStyle(fallbackStyles[0].id);
      }
    } catch (error) {
      console.error('Failed to load styles from API, using fallback:', error);
      setLoadingError('Failed to load styles from server');
      setArchitecturalStyles(fallbackStyles);
      setSelectedStyle(fallbackStyles[0].id);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedStyle) {
      Alert.alert('Please select a style', 'Choose an architectural style before generating your renovation.');
      return;
    }

    try {
      // The Enhanced Style Renovation API requires the original image file
      if (!imageUri) {
        Alert.alert('No image found', 'Please go back and upload an image first.');
        return;
      }
      
      // Map selected colors number back to palette ID
      let selectedColorPalette = 'classic-neutral'; // Default fallback
      
      if (selectedColors && selectedColors.length > 0) {
        const numberToPaletteId: { [key: number]: string } = {
          0: 'classic-neutral', // surprise-me falls back to classic-neutral
          1: 'classic-neutral',
          2: 'coastal-blue',
          3: 'heritage-red',
          4: 'forest-green',
          5: 'modern-monochrome',
          6: 'warm-terracotta',
          7: 'cottage-pastels',
          8: 'alpine-naturals'
        };
        selectedColorPalette = numberToPaletteId[selectedColors[0]] || 'classic-neutral';
      }
      
      console.log('Creating enhanced style renovation with:', {
        imageUri,
        selectedStyle,
        selectedColorPalette
      });
      
      // Use the Enhanced Style Renovation API directly
      const result = await enhancedStyleRenovationApi.createAndWaitForCompletion(
        {
          houseImageUri: imageUri,
          architecturalStyle: selectedStyle,
          colorPalette: selectedColorPalette
        },
        (status) => {
          console.log('Generation status:', status);
          // Could update UI here with status updates
        }
      );
      
      console.log('Enhanced style renovation completed:', result);
      
      // Navigate to ResultScreen with the result
      navigation.navigate('Result', {
        sessionId: result.sessionId,
        imageUrl: result.imageUrl,
        originalImageUrl: imageUri,
      });
      
    } catch (error: any) {
      console.error('Generate renovation error:', error);
      Alert.alert(
        'Generation Failed',
        error.message || 'Failed to generate renovation. Please try again.',
        [{ text: 'OK' }]
      );
    }
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
          <Text style={GlobalStyles.stepIndicator}>Step 3 of 3</Text>
          <Text style={GlobalStyles.headerTitle}>Design Style</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress Bar */}
      <View style={GlobalStyles.progressContainer}>
        <View style={GlobalStyles.progressBar}>
          <View style={[GlobalStyles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={GlobalStyles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={GlobalStyles.content}>
        <Text style={GlobalStyles.subtitle}>
          Select your preferred architectural style
        </Text>
        
        {loading ? (
          <View style={GlobalStyles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={GlobalStyles.loadingText}>Loading available styles...</Text>
          </View>
        ) : (
          <>
            {loadingError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {loadingError}</Text>
                <Text style={styles.errorSubtext}>Using cached styles</Text>
              </View>
            )}
            
            <View style={styles.styleGrid}>
              {architecturalStyles.map(style => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleCard,
                    selectedStyle === style.id && styles.selectedStyle,
                  ]}
                  onPress={() => setSelectedStyle(style.id)}
                >
                  <Text style={styles.styleEmoji}>🏠</Text>
                  <Text style={[
                    styles.styleText,
                    selectedStyle === style.id && styles.selectedStyleText,
                  ]}>
                    {style.name}
                  </Text>
                  <Text style={[
                    styles.styleDescription,
                    selectedStyle === style.id && styles.selectedStyleDescription,
                  ]}>
                    {style.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={GlobalStyles.bottomContainer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Design Preferences:</Text>
          <Text style={styles.summaryText}>
            • {selectedColors?.length || 0} color palettes • {selectedStyle} style
            {hasInspirationPhoto ? ' • Inspiration photo' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={GlobalStyles.nextButton}
          onPress={handleGenerate}
        >
          <Text style={GlobalStyles.nextButtonText}>
            Generate Design
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Screen-specific styles only - common styles are in GlobalStyles
const styles = StyleSheet.create({
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
    minHeight: 140,
    marginBottom: 16,
  },
  selectedStyle: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  styleEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  styleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  selectedStyleText: {
    color: '#FFFFFF',
  },
  styleDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
    textAlign: 'center',
  },
  selectedStyleDescription: {
    color: '#CCCCCC',
  },
  summaryContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default DesignStyleScreen;
