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
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { enhancedStyleRenovationApi } from '../services/enhancedStyleRenovationApi';
import { apiClient } from '../services/apiClient';
import Theme from '../constants/theme';
import GlobalStyles from '../constants/globalStyles';
import { HistoryStorageService, DesignHistoryItem } from '../services/historyStorage';
import RNFS from 'react-native-fs';
import backgroundPollingService from '../services/backgroundPollingService';

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
      
      // Copy the temp file to a permanent location BEFORE creating history
      // This prevents the "file doesn't exist" error when the temp file is deleted
      let permanentImageUri = imageUri;
      if (imageUri.startsWith('file://')) {
        try {
          const fileName = `upload_${sessionId}_${Date.now()}.jpg`;
          const permanentPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
          
          console.log('Copying temp file to permanent location:', permanentPath);
          await RNFS.copyFile(imageUri.replace('file://', ''), permanentPath);
          permanentImageUri = `file://${permanentPath}`;
          console.log('File copied successfully to:', permanentImageUri);
        } catch (copyError) {
          console.warn('Failed to copy temp file, using original URI:', copyError);
          // Continue with original URI if copy fails
        }
      }
      
      // Get the style name for display
      const selectedStyleName = architecturalStyles.find(s => s.id === selectedStyle)?.name || selectedStyle;
      
      // Create a history item with "generating" status
      const historyItem: DesignHistoryItem = {
        id: `${sessionId}-${Date.now()}`,
        sessionId: sessionId,
        createdAt: new Date().toISOString(),
        thumbnail: permanentImageUri, // Use permanent path
        originalImage: permanentImageUri, // Use permanent path
        status: 'generating',
        title: `${selectedStyleName} Design`,
      };
      
      // Save to history with generating status
      await HistoryStorageService.saveDesignToHistory(historyItem);
      
      // Navigate to History screen to show the generating design
      navigation.navigate('History' as any);
      
      // 🔔 Start background polling and show notification
      console.log('🔔 Starting background polling for session:', sessionId);
      await backgroundPollingService.addSession(sessionId);
      
      // Start the generation process in the background
      enhancedStyleRenovationApi.createAndWaitForCompletion(
        {
          houseImageUri: permanentImageUri, // Use permanent path for API call
          architecturalStyle: selectedStyle,
          colorPalette: selectedColorPalette
        },
        (status) => {
          console.log('Generation status:', status);
        }
      ).then(async (result) => {
        console.log('Enhanced style renovation completed:', result);
        
        // 🔔 Stop polling and show completion notification
        console.log('🔔 Generation complete, stopping polling and showing notification');
        await backgroundPollingService.removeSession(sessionId);
        
        // Import notificationService at the top of the file
        const notificationService = require('../services/notificationService').default;
        await notificationService.notifyGenerationComplete(sessionId);
        
        // Update the history item with completed status and generated image
        const updatedItem: DesignHistoryItem = {
          ...historyItem,
          status: 'completed',
          thumbnail: result.imageUrl, // Use generated image as thumbnail
        };
        
        await HistoryStorageService.saveDesignToHistory(updatedItem);
      }).catch(async (error) => {
        console.error('Generate renovation error:', error);
        
        // 🔔 Stop polling and show failure notification
        console.log('🔔 Generation failed, stopping polling and showing notification');
        await backgroundPollingService.removeSession(sessionId);
        
        const notificationService = require('../services/notificationService').default;
        await notificationService.notifyGenerationFailed(sessionId);
        
        // Update the history item with failed status
        const failedItem: DesignHistoryItem = {
          ...historyItem,
          status: 'failed',
        };
        
        await HistoryStorageService.saveDesignToHistory(failedItem);
      });
      
    } catch (error: any) {
      console.error('Failed to start generation:', error);
      Alert.alert(
        'Generation Failed',
        error.message || 'Failed to start design generation. Please try again.',
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
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Choose Your Architectural Style</Text>
            <Text style={GlobalStyles.subtitle}>
              Select the style that best matches your vision for your home's exterior
            </Text>
          </View>
        
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
            
            {/* Style Grid */}
            <View style={styles.styleGrid}>
              {architecturalStyles.map(style => (
                <TouchableOpacity
                  key={style.id}
                  style={[
                    styles.styleCard,
                    selectedStyle === style.id && styles.selectedStyle,
                  ]}
                  onPress={() => setSelectedStyle(style.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.iconContainer,
                    selectedStyle === style.id && styles.selectedIconContainer,
                  ]}>
                    {style.iconUri ? (
                      <Image 
                        source={{ uri: style.iconUri }}
                        style={styles.styleIcon}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.styleEmoji}>🏠</Text>
                    )}
                  </View>
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
                  {selectedStyle === style.id && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={GlobalStyles.bottomContainer}>
{/*         {selectedStyle && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryIcon}>✨</Text>
              <Text style={styles.summaryTitle}>Your Design Preferences</Text>
            </View>
            <View style={styles.summaryContent}>
              {selectedColors && selectedColors.length > 0 && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemIcon}>🎨</Text>
                  <Text style={styles.summaryItemText}>
                    {selectedColors.length} color {selectedColors.length === 1 ? 'palette' : 'palettes'}
                  </Text>
                </View>
              )}
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemIcon}>🏛️</Text>
                <Text style={styles.summaryItemText}>
                  {architecturalStyles.find(s => s.id === selectedStyle)?.name || selectedStyle}
                </Text>
              </View>
              {hasInspirationPhoto && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryItemIcon}>📸</Text>
                  <Text style={styles.summaryItemText}>Inspiration photo included</Text>
                </View>
              )}
            </View>
          </View>
        )} */}
        <TouchableOpacity
          style={[
            GlobalStyles.nextButton,
            !selectedStyle && GlobalStyles.nextButtonDisabled
          ]}
          onPress={handleGenerate}
          disabled={!selectedStyle}
        >
          <Text style={[
            GlobalStyles.nextButtonText,
            !selectedStyle && GlobalStyles.nextButtonTextDisabled
          ]}>
            {selectedStyle ? 'Generate Design' : 'Select a Style to Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Screen-specific styles only - common styles are in GlobalStyles
const styles = StyleSheet.create({
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  styleCard: {
    width: '48%',
    backgroundColor: Theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2.5,
    borderColor: Theme.colors.border,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
    alignItems: 'center',
    minHeight: 160,
    marginBottom: 16,
    position: 'relative',
  },
  selectedStyle: {
    backgroundColor: Theme.colors.accentLight,
    borderColor: Theme.colors.primary,
    borderWidth: 2.5,
    shadowColor: Theme.colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
    transform: [{ scale: 1.02 }],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedIconContainer: {
    backgroundColor: Theme.colors.primaryLight,
  },
  styleEmoji: {
    fontSize: 32,
  },
  styleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
  },
  styleText: {
    fontSize: 15,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  selectedStyleText: {
    color: Theme.colors.primary,
  },
  styleDescription: {
    fontSize: 11,
    color: Theme.colors.textSecondary,
    lineHeight: 15,
    textAlign: 'center',
  },
  selectedStyleDescription: {
    color: Theme.colors.textSecondary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedBadgeText: {
    color: Theme.colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryContainer: {
    backgroundColor: Theme.colors.accentLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Theme.colors.primaryLight,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Theme.colors.text,
    letterSpacing: -0.3,
  },
  summaryContent: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItemIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 24,
    textAlign: 'center',
  },
  summaryItemText: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
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
