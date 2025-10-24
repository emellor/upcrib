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
  
  // Polling state for renovation status
  const [isPolling, setIsPolling] = useState(false);
  const [renovationStatus, setRenovationStatus] = useState<string>('');
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isRenovationComplete, setIsRenovationComplete] = useState(false);
  const [pollInterval, setPollInterval] = useState<any>(null);

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

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Start polling after generation begins
  const startPollingRenovationStatus = () => {
    if (isPolling) return;
    
    console.log('🔄 Starting renovation status polling for session:', sessionId);
    setIsPolling(true);
    
    const interval = setInterval(async () => {
      try {
        const statusUrl = `http://localhost:3001/api/enhanced-style-renovation/${sessionId}/status`;
        console.log('� [DesignStyleScreen] Polling status from:', statusUrl);
        
        const response = await fetch(statusUrl);
        console.log('📡 [DesignStyleScreen] Polling response:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('📋 [DesignStyleScreen] Polling full response:', JSON.stringify(data, null, 2));
        
        console.log('🔄 POLLING RESPONSE:');
        console.log('═'.repeat(60));
        console.log('📍 Session ID:', sessionId);
        console.log('📊 Status:', data.data?.status);
        console.log('⏳ Has Pending Jobs:', data.data?.hasPendingJobs);
        
        if (data.data?.originalImage?.url) {
          console.log('🖼️  Original Image URL:', data.data.originalImage.url);
          console.log('   Full URL:', `http://localhost:3001${data.data.originalImage.url}`);
        }
        
        if (data.data?.generatedImage?.url) {
          console.log('🎨 Generated Image URL:', data.data.generatedImage.url);
          console.log('   Full URL:', `http://localhost:3001${data.data.generatedImage.url}`);
        }
        
        console.log('📋 FULL API RESPONSE:');
        console.log(JSON.stringify(data, null, 2));
        console.log('═'.repeat(60));
        
        if (data.success && data.data) {
          setRenovationStatus(data.data.status);
          
          // Set image URLs if available
          if (data.data.originalImage?.url) {
            setOriginalImageUrl(`http://localhost:3001${data.data.originalImage.url}`);
          }
          
          if (data.data.generatedImage?.url) {
            setGeneratedImageUrl(`http://localhost:3001${data.data.generatedImage.url}`);
          }
          
          // Stop polling when completed
          if (data.data.status === 'completed') {
            console.log('🎉 Renovation completed! Stopping polling...');
            setIsRenovationComplete(true);
            setIsPolling(false);
            clearInterval(interval);
            setPollInterval(null);
            
            // Stop background polling service as well
            await backgroundPollingService.removeSession(sessionId);
          } else if (data.data.status === 'failed') {
            console.log('❌ Renovation failed! Stopping polling...');
            setIsPolling(false);
            clearInterval(interval);
            setPollInterval(null);
            await backgroundPollingService.removeSession(sessionId);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds
    
    setPollInterval(interval);
  };

  const loadArchitecturalStyles = async () => {
    setLoading(true);
    setLoadingError(null);
    
    try {
      const stylesUrl = 'http://localhost:3001/api/enhanced-style-renovation/styles';
      console.log('🎨 [DesignStyleScreen] Fetching architectural styles from:', stylesUrl);
      
      const response = await fetch(stylesUrl);
      console.log('📡 [DesignStyleScreen] Styles response:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('📋 [DesignStyleScreen] Styles full response:', JSON.stringify(data, null, 2));
      
      if (data.success && Array.isArray(data.data.styles) && data.data.styles.length > 0) {
        console.log('Successfully loaded styles from API:', data.data.styles);
        setArchitecturalStyles(data.data.styles);
        // Set default selection to first available style
        if (!selectedStyle && data.data.styles[0]) {
          setSelectedStyle(data.data.styles[0].id);
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
      
      // Use selectedColors directly as palette IDs from the new API
      let selectedColorPalette = 'heritage-red'; // Default fallback
      
      if (selectedColors && selectedColors.length > 0) {
        // selectedColors now contains the actual palette IDs from the API
        selectedColorPalette = selectedColors[0];
      }
      
      console.log('Creating enhanced style renovation with:', {
        imageUri,
        selectedStyle,
        selectedColorPalette,
        hasInspirationPhoto
      });
      
      // Copy the temp file to a permanent location BEFORE creating history
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
        }
      }
      
      // Get the style name for display
      const selectedStyleName = architecturalStyles.find(s => s.id === selectedStyle)?.name || selectedStyle;
      
      // Create a history item with "generating" status
      const historyItem: DesignHistoryItem = {
        id: `${sessionId}-${Date.now()}`,
        sessionId: sessionId,
        createdAt: new Date().toISOString(),
        thumbnail: permanentImageUri,
        originalImage: permanentImageUri,
        status: 'generating',
        title: `${selectedStyleName} Design`,
      };
      
      // Save initial generating status to history (will be updated when completed)
      console.log('💾 [DesignStyleScreen] Saving initial generating design to history');
      await HistoryStorageService.saveDesignToHistory(historyItem);
      
      // Navigate to History screen to show the generating design
      navigation.navigate('History' as any);
      
      // 🔔 Start background polling and show notification
      console.log('🔔 Starting background polling for session:', sessionId);
      await backgroundPollingService.addSession(sessionId);
      
      // Start local polling as well for this screen
      startPollingRenovationStatus();
      
      // Create the renovation request object
      const renovationRequest = {
        houseImageUri: permanentImageUri,
        architecturalStyle: selectedStyle,
        colorPalette: selectedColorPalette,
        // Include reference image if hasInspirationPhoto is true
        ...(hasInspirationPhoto && { referenceImageUri: permanentImageUri })
      };
      
      console.log('Enhanced Style Renovation Request:', renovationRequest);
      
      // Start the generation process using the new API structure
      console.log('🚀 [DesignStyleScreen] Starting Enhanced Style Renovation API call...');
      console.log('📋 Request details:', JSON.stringify(renovationRequest, null, 2));
      
      try {
        const result = await enhancedStyleRenovationApi.createAndWaitForCompletion(
          renovationRequest,
          (status) => {
            console.log('📊 Generation status update:', status);
          }
        );
        
        console.log('✅ Enhanced style renovation completed successfully:', result);
        
        // 🔔 Stop polling and show completion notification
        console.log('🔔 Generation complete, stopping polling and showing notification');
        await backgroundPollingService.removeSession(sessionId);
        
        const notificationService = require('../services/notificationService').default;
        await notificationService.notifyGenerationComplete(sessionId);
        
        // Note: History update is now handled by EnhancedStyleRenovationApi.saveCompletedRenovation()
        // when status polling detects completion - no need to duplicate here
        
      } catch (error) {
        console.error('❌ Enhanced Style Renovation API call failed!');
        console.error('Error details:', error);
        
        // 🔔 Stop polling and show failure notification
        console.log('🔔 Generation failed, stopping polling and showing notification');
        await backgroundPollingService.removeSession(sessionId);
        
        const notificationService = require('../services/notificationService').default;
        await notificationService.notifyGenerationFailed(sessionId);
        
        // Update the history item to failed status
        try {
          const failedItem: DesignHistoryItem = {
            ...historyItem,
            status: 'failed',
            title: `${selectedStyleName} Design (Failed)`
          };
          await HistoryStorageService.saveDesignToHistory(failedItem);
          console.log('💾 Updated history item to failed status');
        } catch (historyError) {
          console.error('Failed to update history with error status:', historyError);
        }
      }
      
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
            
            {/* Renovation Status and Results */}
            {isPolling && (
              <View style={styles.renovationStatusContainer}>
                <View style={styles.statusHeader}>
                  <ActivityIndicator size="small" color={Theme.colors.primary} />
                  <Text style={styles.statusTitle}>
                    {renovationStatus === 'generating' ? 'Generating Your Renovation...' : 'Processing...'}
                  </Text>
                </View>
                <Text style={styles.statusSubtitle}>
                  Status: {renovationStatus || 'checking...'}
                </Text>
              </View>
            )}
            
            {/* Before & After Images */}
            {isRenovationComplete && originalImageUrl && generatedImageUrl && (
              <View style={styles.renovationResultsContainer}>
                <Text style={styles.resultsTitle}>🎉 Your Renovation is Ready!</Text>
                <Text style={styles.resultsSubtitle}>Drag the slider to compare before and after</Text>
                
                <View style={styles.beforeAfterContainer}>
                  <Text style={styles.comparisonLabel}>Before & After</Text>
                  
                  <View style={styles.imageContainer}>
                    <View style={styles.imageRow}>
                      <View style={styles.imageSection}>
                        <Text style={styles.imageLabel}>Before</Text>
                        <Image
                          source={{ uri: originalImageUrl }}
                          style={styles.comparisonImage}
                          resizeMode="cover"
                          onLoad={() => console.log('🖼️  Original image loaded successfully')}
                          onError={(error) => console.log('❌ Original image load error:', error.nativeEvent.error)}
                        />
                      </View>
                      
                      <View style={styles.imageSection}>
                        <Text style={styles.imageLabel}>After</Text>
                        <Image
                          source={{ uri: generatedImageUrl }}
                          style={styles.comparisonImage}
                          resizeMode="cover"
                          onLoad={() => console.log('🎨 Generated image loaded successfully')}
                          onError={(error) => console.log('❌ Generated image load error:', error.nativeEvent.error)}
                        />
                      </View>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.viewFullResultButton}
                  onPress={() => navigation.navigate('Result', {
                    sessionId,
                    imageUrl: generatedImageUrl,
                    originalImageUrl: originalImageUrl,
                    answers: {}
                  })}
                >
                  <Text style={styles.viewFullResultText}>View Full Result</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* Style Grid - only show if renovation not complete */}
            {!isRenovationComplete && (
              <View style={styles.styleGrid}>
                {architecturalStyles.map(style => (
                  <TouchableOpacity
                    key={style.id}
                    style={[
                      styles.styleCard,
                      selectedStyle === style.id && styles.selectedStyle,
                      isPolling && styles.disabledStyle,
                    ]}
                    onPress={() => !isPolling && setSelectedStyle(style.id)}
                    activeOpacity={isPolling ? 1 : 0.7}
                    disabled={isPolling}
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
            )}
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
            (!selectedStyle || isPolling) && GlobalStyles.nextButtonDisabled
          ]}
          onPress={handleGenerate}
          disabled={!selectedStyle || isPolling}
        >
          <Text style={[
            GlobalStyles.nextButtonText,
            (!selectedStyle || isPolling) && GlobalStyles.nextButtonTextDisabled
          ]}>
            {isPolling 
              ? 'Generating...' 
              : selectedStyle 
                ? 'Generate Design' 
                : 'Select a Style to Continue'
            }
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
  // Renovation status styles
  renovationStatusContainer: {
    backgroundColor: Theme.colors.accentLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Theme.colors.primaryLight,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    marginLeft: 10,
  },
  statusSubtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
  },
  // Renovation results styles
  renovationResultsContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  beforeAfterContainer: {
    marginBottom: 20,
  },
  comparisonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Theme.colors.surface,
  },
  imageRow: {
    flexDirection: 'row',
  },
  imageSection: {
    flex: 1,
    position: 'relative',
  },
  imageLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 1,
  },
  comparisonImage: {
    width: '100%',
    height: 200,
    backgroundColor: Theme.colors.backgroundSecondary,
  },
  viewFullResultButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  viewFullResultText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledStyle: {
    opacity: 0.6,
  },
});

export default DesignStyleScreen;
