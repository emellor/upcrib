import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
  Linking,
  Platform,
  PermissionsAndroid,
  Modal,
  Animated,
  StatusBar,
  PanResponder,
  BackHandler,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { apiClient } from '../services/apiClient';
import { SessionData } from '../types/api';
import Theme from '../constants/theme';
import { HistoryStorageService, DesignHistoryItem } from '../services/historyStorage';
import backgroundPollingService from '../services/backgroundPollingService';

type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Result'>;
type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface Props {
  navigation: ResultScreenNavigationProp;
  route: ResultScreenRouteProp;
  onClose?: () => void; // Optional close handler for modal mode
}

const { width } = Dimensions.get('window');
const imageSize = width - 40; // Full width minus padding

const ResultScreen: React.FC<Props> = ({ navigation, route, onClose }) => {
  const { sessionId, imageUrl: propImageUrl, answers: routeAnswers, originalImageUrl } = route.params;
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>(routeAnswers || {});
  const [editMode, setEditMode] = useState(false);
  const [updatedAnswers, setUpdatedAnswers] = useState<{ [questionId: string]: string }>(routeAnswers || {});
  const [regenerating, setRegenerating] = useState(false);
  
  // Modal states for overlay UX
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [slideAnimation] = useState(new Animated.Value(0));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Before/After slider state
  const [sliderPosition] = useState(new Animated.Value(0.5)); // Start at 50% (middle)
  const [originalImageError, setOriginalImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [enhancedStyleRenovationStatus, setEnhancedStyleRenovationStatus] = useState<{
    sessionId: string;
    status: string;
    hasPendingJobs: boolean;
    styleData?: any;
    originalImage?: {
      path: string;
      filename: string;
      mimetype?: string;
      size?: number;
      uploadedAt?: string;
      url: string;
    };
    generatedImage?: {
      path: string;
      filename: string;
      extension?: string;
      generatedAt?: string;
      url: string;
    };
  } | null>(null);
  const [designSavedToHistory, setDesignSavedToHistory] = useState(false);

  // Pan responder for the before/after slider
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => {
      return true;
    },
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only start moving if horizontal movement is greater than vertical
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 5;
    },
    onPanResponderGrant: (evt, gestureState) => {
      setIsDragging(true);
    },
    onPanResponderMove: (evt, gestureState) => {
      const imageWidth = width - 40; // Account for padding
      const touchX = evt.nativeEvent.locationX;
      
      // Calculate position based on touch location within the slider
      const newPosition = Math.max(0, Math.min(1, touchX / imageWidth));
      sliderPosition.setValue(newPosition);
    },
    onPanResponderRelease: (evt, gestureState) => {
      setIsDragging(false);
      
      // Get final position and determine snap direction
      const imageWidth = width - 40;
      const touchX = evt.nativeEvent.locationX;
      const currentPosition = Math.max(0, Math.min(1, touchX / imageWidth));
      const velocity = gestureState.vx;
      
      // Snap to 0 or 1 based on position and velocity
      let targetValue = currentPosition < 0.5 ? 0 : 1;
      
      // If velocity is significant, use velocity to determine direction
      if (Math.abs(velocity) > 0.3) {
        targetValue = velocity > 0 ? 1 : 0;
      }
      
      // Animate to the target position
      Animated.spring(sliderPosition, {
        toValue: targetValue,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    },
    onPanResponderTerminationRequest: () => false,
  });

  useEffect(() => {
    loadSessionData();
  }, []);

  // Note: All history saving is now handled by EnhancedStyleRenovationApi.saveCompletedRenovation()
  // when status polling detects completion - no fallback saving needed here

  // Add polling for pending jobs using enhanced style renovation API
  useEffect(() => {
    let pollInterval: any = null;
    
    if (sessionData?.hasPendingJobs) {
      // Poll every 3 seconds while there are pending jobs using enhanced style renovation endpoint
      pollInterval = setInterval(async () => {
        try {
          const data = await apiClient.getEnhancedStyleRenovationStatus(sessionId);
          
          console.log('🔄 POLLING: Enhanced Style Renovation Status');
          console.log('═'.repeat(60));
          console.log('📍 Session ID:', sessionId);
          console.log('📊 Status:', data.data?.status);
          console.log('⏳ Has Pending Jobs:', data.data?.hasPendingJobs);
          console.log('🎨 Style Data Available:', !!data.data?.styleData);
          
          // Log original image details
          if (data.data?.originalImage) {
            console.log('🖼️  ORIGINAL IMAGE (BEFORE):');
            console.log('   URL:', data.data.originalImage.url);
            console.log('   Filename:', data.data.originalImage.filename);
            console.log('   Full URL:', `${apiClient.apiBaseURL}${data.data.originalImage.url}`);
            if (data.data.originalImage.size) {
              console.log('   Size:', (data.data.originalImage.size / 1024 / 1024).toFixed(2) + ' MB');
            }
          } else {
            console.log('❌ ORIGINAL IMAGE: Not available (null/undefined)');
          }
          
          // Log generated image details  
          if (data.data?.generatedImage) {
            console.log('🎨 GENERATED IMAGE (AFTER):');
            console.log('   URL:', data.data.generatedImage.url);
            console.log('   Filename:', data.data.generatedImage.filename);
            console.log('   Full URL:', `${apiClient.apiBaseURL}${data.data.generatedImage.url}`);
          } else {
            console.log('❌ GENERATED IMAGE: Not available (null/undefined)');
          }
          
          // Log full response payload for debugging
          console.log('📋 FULL API RESPONSE PAYLOAD:');
          console.log(JSON.stringify(data, null, 2));
          console.log('═'.repeat(60));
          
          if (data.success) {
            // Store the Enhanced Style Renovation status
            setEnhancedStyleRenovationStatus(data.data);
            
            // Update session data with enhanced style renovation status
            setSessionData(prevData => ({
              ...prevData!,
              status: data.data.status as any,
              hasPendingJobs: data.data.hasPendingJobs,
              // Store the original image URL from enhanced style renovation response
              imageUrl: data.data.originalImage?.url || prevData?.imageUrl,
              generatedImage: data.data.generatedImage ? {
                path: data.data.generatedImage.url,
                filename: data.data.generatedImage.filename,
                extension: data.data.generatedImage.filename.split('.').pop() || 'jpg',
                generatedAt: new Date().toISOString(),
                url: data.data.generatedImage.url,
              } : undefined,
            }));
            
            // Stop polling when no more pending jobs
            if (!data.data.hasPendingJobs) {
              if (pollInterval) {
                clearInterval(pollInterval);
              }
            }
          }
        } catch (err) {
          console.error('Enhanced style renovation polling error:', err);
          // Fallback to regular session state polling
          try {
            const data = await apiClient.getSessionState(sessionId);
            setSessionData(data);
            
            if (!data.hasPendingJobs) {
              if (pollInterval) {
                clearInterval(pollInterval);
              }
              
              // Reload questions if they're now available
              if (data.hasQuestions && (!questions || questions.length === 0)) {
                try {
                  const questionsResponse = await apiClient.getQuestions(sessionId);
                  setQuestions(questionsResponse.questions || []);
                } catch (err) {
                  console.error('Failed to load questions:', err);
                }
              }
            }
          } catch (fallbackErr) {
            console.error('Fallback polling error:', fallbackErr);
            if (pollInterval) {
              clearInterval(pollInterval);
            }
          }
        }
      }, 3000);
    }
    
    // Cleanup interval on component unmount or when polling stops
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [sessionData?.hasPendingJobs, sessionId, questions]);

  // Handle hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (onClose) {
        onClose();
        return true; // Prevent default back behavior
      }
      return false; // Allow default behavior when not in modal mode
    });

    return () => backHandler.remove();
  }, [onClose]);

  // Debug effect to log image URLs
  useEffect(() => {
    if (sessionData) {
      const originalUrl = getOriginalImageUrl();
      const generatedUrl = getImageUrl();
      console.log('=== IMAGE URL DEBUG ===');
      console.log('Original (Before) URL:', originalUrl);
      console.log('Generated (After) URL:', generatedUrl);
      console.log('URLs are different:', originalUrl !== generatedUrl);
      console.log('=====================');
    }
  }, [sessionData]);

  const loadSessionData = async () => {
    console.log('🚀 LOADING SESSION DATA - Renovation Ready Screen');
    console.log('═'.repeat(60));
    console.log('📍 Session ID:', sessionId);
    console.log('📋 Route Params:');
    console.log('   propImageUrl:', propImageUrl);
    console.log('   originalImageUrl:', originalImageUrl);
    console.log('   answers:', routeAnswers);
    console.log('─'.repeat(60));
    
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSessionState(sessionId);
      console.log('📊 Basic Session Data Loaded:', {
        status: data.status,
        hasPendingJobs: data.hasPendingJobs,
        hasQuestions: data.hasQuestions
      });
      setSessionData(data);
      
      // Always try to get enhanced style renovation status to get proper image URLs
      try {
        console.log('Attempting to get Enhanced Style Renovation status...');
        const enhancedData = await apiClient.getEnhancedStyleRenovationStatus(sessionId);
        console.log('Enhanced Style Renovation status response:', enhancedData);
        
        if (enhancedData.success) {
          // Store the Enhanced Style Renovation status
          setEnhancedStyleRenovationStatus(enhancedData.data);
          
          // If status is 'generating', start background polling for notifications
          if (enhancedData.data.status === 'generating' && !enhancedData.data.generatedImage) {
            console.log('Image is still generating, starting background polling');
            await backgroundPollingService.addSession(sessionId);
          }
          
          console.log('Enhanced data originalImage:', enhancedData.data.originalImage);
          // Update session data with the correct original image URL
          setSessionData(prevData => ({
            ...prevData!,
            imageUrl: enhancedData.data.originalImage?.url,
            generatedImage: enhancedData.data.generatedImage ? {
              path: enhancedData.data.generatedImage.url,
              filename: enhancedData.data.generatedImage.filename,
              extension: enhancedData.data.generatedImage.filename.split('.').pop() || 'jpg',
              generatedAt: new Date().toISOString(),
              url: enhancedData.data.generatedImage.url,
            } : prevData?.generatedImage,
          }));
        }
      } catch (enhancedErr) {
        console.log('Enhanced style renovation status error:', enhancedErr);
        console.log('Enhanced style renovation status not available, using regular session data');
      }
      
      // Load questions if available
      if (data.hasQuestions) {
        try {
          const questionsResponse = await apiClient.getQuestions(sessionId);
          setQuestions(questionsResponse.questions || []);
        } catch (err) {
          console.error('Failed to load questions:', err);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const imageUrl = getImageUrl();
      if (!imageUrl) {
        Alert.alert('Error', 'No image available to share');
        return;
      }
      setShowShareModal(true);
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Error', 'Failed to share design. Please try again.');
    }
  };

  const shareVia = async (method: 'sms' | 'email' | 'copy') => {
    const imageUrl = getImageUrl();
    if (!imageUrl) return;

    try {
      switch (method) {
        case 'sms':
          const shareMessage = `Check out my AI-generated renovation design from HomeStyle AI! ${imageUrl}`;
          const smsUrl = `sms:?&body=${encodeURIComponent(shareMessage)}`;
          await Linking.openURL(smsUrl);
          break;
        case 'email':
          const subject = 'My HomeStyle AI Renovation Design';
          const body = `Check out my AI-generated renovation design!\n\nView the design here: ${imageUrl}\n\nGenerated with HomeStyle AI - AI-powered home renovation designs.`;
          const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          await Linking.openURL(emailUrl);
          break;
        case 'copy':
          Alert.alert(
            'Design Link', 
            'Copy this link to share your design:\n\n' + imageUrl,
            [{ text: 'OK', style: 'default' }]
          );
          break;
      }
      setShowShareModal(false);
    } catch (error) {
      Alert.alert('Error', 'Could not open the selected app');
    }
  };

  const handleStartNew = () => {
    if (onClose) {
      // In modal mode, close the modal and return to history
      onClose();
    } else {
      // Legacy: Navigate back to Home screen to start a new session
      navigation.navigate('Home');
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const toggleQuestions = () => {
    setShowQuestions(!showQuestions);
  };

  const handleEditAnswers = () => {
    setEditMode(true);
    setUpdatedAnswers({ ...answers });
    setCurrentQuestionIndex(0); // Reset to first question
    setShowEditModal(true);
    // Animate modal in
    Animated.spring(slideAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setUpdatedAnswers({ ...answers });
    setCurrentQuestionIndex(0); // Reset question index
    setShowEditModal(false);
    // Animate modal out
    Animated.spring(slideAnimation, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setUpdatedAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSaveAndRegenerate = async () => {
    try {
      setRegenerating(true);
      
      // Convert updatedAnswers to the API format
      const answersArray = Object.entries(updatedAnswers).map(([questionId, value]) => ({
        questionId,
        value
      }));

      // Submit updated answers
      await apiClient.submitAnswers(sessionId, answersArray);
      
      // Trigger new generation
      await apiClient.generateRenovatedImage(sessionId);
      
      // Update local state
      setAnswers({ ...updatedAnswers });
      setEditMode(false);
      setShowEditModal(false);
      
      // Animate modal out
      Animated.spring(slideAnimation, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
      
      // Reload session data to get new generated image
      await loadSessionData();
      
      Alert.alert('Success', 'Your design has been regenerated with the updated preferences!');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to regenerate design. Please try again.');
      console.error('Regeneration error:', err);
    } finally {
      setRegenerating(false);
    }
  };

  const getImageUrl = () => {
    console.log('🔍 GETTING GENERATED IMAGE URL (After Image)');
    console.log('─'.repeat(40));
    console.log('PropImageUrl from route:', propImageUrl);
    console.log('SessionData available:', !!sessionData);
    console.log('Enhanced Status available:', !!enhancedStyleRenovationStatus);
    
    if (propImageUrl) {
      console.log('✅ Using propImageUrl from route params');
      console.log('   URL:', propImageUrl);
      return propImageUrl;
    }
    
    // 1. Try Enhanced Style Renovation status response first (BEST SOURCE)
    if (enhancedStyleRenovationStatus?.generatedImage?.url) {
      const url = `${apiClient.apiBaseURL}${enhancedStyleRenovationStatus.generatedImage.url}`;
      console.log('✅ Using generatedImage URL from Enhanced Style Renovation status');
      console.log('   Relative URL:', enhancedStyleRenovationStatus.generatedImage.url);
      console.log('   Full URL:', url);
      console.log('   Filename:', enhancedStyleRenovationStatus.generatedImage.filename);
      return url;
    }
    
    // 2. Fallback to sessionData
    if (sessionData?.generatedImage) {
      // For enhanced style renovation, use the url field for HTTP requests
      if (sessionData.generatedImage.url) {
        const url = `${apiClient.apiBaseURL}${sessionData.generatedImage.url}`;
        console.log('Using generated image URL from session data:', url);
        return url;
      }
      // Fallback to path field (for compatibility)
      if (sessionData.generatedImage.path && sessionData.generatedImage.path.startsWith('/')) {
        const url = `${apiClient.apiBaseURL}${sessionData.generatedImage.path}`;
        console.log('Using generated image URL (fallback path):', url);
        return url;
      }
      // Fallback to generated folder for old format
      const url = `${apiClient.apiBaseURL}/generated/${sessionData.generatedImage.filename}`;
      console.log('⚠️  Using generated image URL (old format fallback)');
      console.log('   URL:', url);
      return url;
    }
    console.log('❌ No generated image URL available - all methods failed');
    console.log('─'.repeat(40));
    return null;
  };

  const getOriginalImageUrl = () => {
    console.log('🔍 GETTING ORIGINAL IMAGE URL (Before Image)');
    console.log('─'.repeat(40));
    console.log('SessionData available:', !!sessionData);
    console.log('Enhanced Status available:', !!enhancedStyleRenovationStatus);
    
    // Try multiple approaches to find the correct original image URL
    
    // 1. Use the originalImage from Enhanced Style Renovation status (BEST SOURCE)
    if (enhancedStyleRenovationStatus?.originalImage?.url) {
      const url = `${apiClient.apiBaseURL}${enhancedStyleRenovationStatus.originalImage.url}`;
      console.log('✅ Using originalImage URL from Enhanced Style Renovation status');
      console.log('   Relative URL:', enhancedStyleRenovationStatus.originalImage.url);
      console.log('   Full URL:', url);
      console.log('   Filename:', enhancedStyleRenovationStatus.originalImage.filename);
      return url;
    }
    
    // 2. Use the imageUrl field from session data which should contain the correct uploaded image URL
    if (sessionData?.imageUrl) {
      const url = `${apiClient.apiBaseURL}${sessionData.imageUrl}`;
      console.log('⚠️  Using imageUrl from session data (fallback)');
      console.log('   Relative URL:', sessionData.imageUrl);
      console.log('   Full URL:', url);
      return url;
    }
    
    // 3. Try to construct URL from the original route parameter if it contains useful info
    if (originalImageUrl && !originalImageUrl.startsWith('file://')) {
      console.log('⚠️  Using originalImageUrl from route (fallback)');
      console.log('   URL:', originalImageUrl);
      return originalImageUrl;
    }
    
    console.log('❌ No original image URL available - all methods failed');
    console.log('─'.repeat(40));
    return null;
  };

  // Reset image error when we get new Enhanced Style Renovation status with originalImage
  useEffect(() => {
    if (enhancedStyleRenovationStatus?.originalImage?.url && originalImageError) {
      console.log('Enhanced Style Renovation status now has originalImage, resetting error state');
      setOriginalImageError(false);
    }
  }, [enhancedStyleRenovationStatus?.originalImage?.url, originalImageError]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your results...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSessionData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={handleStartNew}>
          <Text style={styles.homeButtonText}>Start New Design</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show analysis in progress when there are pending jobs
  if (sessionData?.hasPendingJobs) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Analyzing your design...</Text>
        <Text style={styles.loadingSubtext}>
          Our AI is processing your image and creating personalized renovation suggestions.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.surface} />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your results...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSessionData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={handleStartNew}>
            <Text style={styles.homeButtonText}>Start New Design</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Close Button Header (only in modal mode) */}
          {onClose && (
            <View style={styles.closeHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Main Content */}
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isDragging}
            keyboardShouldPersistTaps="handled"
          >
            {/* Modern Hero Section */}
            <View style={styles.modernHeroSection}>
              <View style={styles.modernHeroContent}>
                <Text style={styles.modernHeroSubtitle}>Your AI-powered renovation is ready</Text>
              </View>
            </View>

            {/* Image Display Card */}
            <View style={styles.imageCard}>
              {getOriginalImageUrl() ? (
                // Interactive Before & After Slider
                <View style={styles.beforeAfterContainer}>
                  <Text style={styles.comparisonLabel}>Before & After</Text>
                  <Text style={styles.sliderInstructions}>Drag to compare</Text>
                  
                  <View style={styles.sliderWrapper}>
                    <View style={styles.sliderContainer} {...panResponder.panHandlers}>
                    {/* After Image (AI Design) - Full Background */}
                    <View style={styles.sliderImageContainer}>
                      {getImageUrl() ? (
                        <Image 
                          key={`after-${getImageUrl()}`}
                          source={{ 
                            uri: getImageUrl()!,
                            cache: 'reload' as any
                          }} 
                          style={styles.sliderImage}
                          resizeMode="cover"
                          onLoad={() => {
                            console.log('🎨 AFTER IMAGE LOADED SUCCESSFULLY');
                            console.log('   URL:', getImageUrl());
                            console.log('   Source: Enhanced Style Renovation Generated Image');
                          }}
                          onError={(error) => {
                            console.log('❌ AFTER IMAGE LOAD ERROR');
                            console.log('   URL:', getImageUrl());
                            console.log('   Error:', error.nativeEvent.error);
                          }}
                        />
                      ) : (
                        <View style={styles.sliderPlaceholder}>
                          <Text style={styles.placeholderText}>No AI design</Text>
                        </View>
                      )}
                      <View style={styles.imageLabel}>
                        <Text style={styles.imageLabelText}>After</Text>
                      </View>
                    </View>
                    
                    {/* Before Image (Original) - Masked Overlay */}
                    <Animated.View style={[
                      styles.sliderOverlay,
                      {
                        width: sliderPosition.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      }
                    ]}>
                      {getOriginalImageUrl() && !originalImageError ? (
                        <Image 
                          key={`before-${getOriginalImageUrl()}-${originalImageError}`}
                          source={{ 
                            uri: getOriginalImageUrl()!,
                            cache: 'reload' as any
                          }} 
                          style={styles.sliderImage}
                          resizeMode="cover"
                          onLoad={() => {
                            console.log('🖼️  BEFORE IMAGE LOADED SUCCESSFULLY');
                            console.log('   URL:', getOriginalImageUrl());
                            console.log('   Source: Enhanced Style Renovation Original Image');
                            setOriginalImageError(false);
                          }}
                          onError={(error) => {
                            console.log('❌ BEFORE IMAGE LOAD ERROR');
                            console.log('   URL:', getOriginalImageUrl());
                            console.log('   Error:', error.nativeEvent.error);
                            console.log('   Setting originalImageError to true - will show placeholder');
                            setOriginalImageError(true);
                          }}
                        />
                      ) : (
                        <View style={styles.sliderPlaceholder}>
                          <Text style={styles.placeholderText}>
                            {originalImageError ? 'Original image not found' : 'Original image not available'}
                          </Text>
                          <Text style={styles.placeholderSubtext}>
                            Showing generated result
                          </Text>
                        </View>
                      )}
                      <View style={styles.imageLabel}>
                        <Text style={styles.imageLabelText}>Before</Text>
                      </View>
                    </Animated.View>
                    
                    {/* Slider Handle */}
                    <Animated.View style={[
                      styles.sliderHandle,
                      {
                        left: sliderPosition.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        transform: [{
                          scale: isDragging ? 1.2 : 1.0
                        }]
                      }
                    ]}>
                      <View style={styles.sliderHandleInner}>
                        <Text style={styles.sliderHandleIcon}>⟷</Text>
                      </View>
                    </Animated.View>
                  </View>
                  </View>
                </View>
              ) : (
                // Single Image Layout
                <View style={styles.singleImageContainer}>
                  <Text style={styles.imageTitle}>Your Generated Design</Text>
                  {getImageUrl() ? (
                    <Image 
                      source={{ uri: getImageUrl()! }} 
                      style={styles.mainImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>No image available</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Quick Actions Bar - Compact Horizontal */}
            <View style={styles.actionsBar}>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Text style={styles.actionButtonText} numberOfLines={1}>Share</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={() => setShowInfoModal(true)}>
                <Text style={styles.actionButtonText} numberOfLines={1}>Info</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Floating New Design Button - Hidden in modal mode */}
          {!onClose && (
            <View style={styles.floatingButton}>
              <TouchableOpacity style={styles.newDesignButton} onPress={handleStartNew}>
                <Text style={styles.newDesignIcon}>✨</Text>
                <Text style={styles.newDesignText}>Create New Design</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Share Modal */}
          <Modal
            visible={showShareModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowShareModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.shareModal}>
                <Text style={styles.modalTitle}>Share Your Design</Text>
                <Text style={styles.modalSubtitle}>Choose how to share your renovation</Text>
                
                <View style={styles.shareOptions}>
                  <TouchableOpacity style={styles.shareOption} onPress={() => shareVia('sms')}>
                    <Text style={styles.shareIcon}>💬</Text>
                    <Text style={styles.shareOptionText}>Message</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.shareOption} onPress={() => shareVia('email')}>
                    <Text style={styles.shareIcon}>📧</Text>
                    <Text style={styles.shareOptionText}>Email</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.shareOption} onPress={() => shareVia('copy')}>
                    <Text style={styles.shareIcon}>🔗</Text>
                    <Text style={styles.shareOptionText}>Copy Link</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.modalCloseButton} 
                  onPress={() => setShowShareModal(false)}
                >
                  <Text style={styles.modalCloseText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Edit Modal */}
          <Modal
            visible={showEditModal}
            transparent={true}
            animationType="slide"
            onRequestClose={handleCancelEdit}
          >
            <View style={styles.modalOverlay}>
              <Animated.View 
                style={[
                  styles.editModal,
                  {
                    transform: [{
                      translateY: slideAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [600, 0],
                      })
                    }]
                  }
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Edit Preferences</Text>
                  <TouchableOpacity onPress={handleCancelEdit}>
                    <Text style={styles.modalCloseIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Before & After Reference Images */}
                <View style={styles.editImageReference}>
                  <View style={styles.editImageRow}>
                    {getOriginalImageUrl() && (
                      <View style={styles.editImageColumn}>
                        <Text style={styles.editImageLabel}>Original</Text>
                        <Image 
                          source={{ uri: getOriginalImageUrl()! }} 
                          style={styles.editReferenceImage}
                          resizeMode="cover"
                        />
                      </View>
                    )}
                    <View style={styles.editImageColumn}>
                      <Text style={styles.editImageLabel}>Current Design</Text>
                      {getImageUrl() ? (
                        <Image 
                          source={{ uri: getImageUrl()! }} 
                          style={styles.editReferenceImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.editPlaceholderImage}>
                          <Text style={styles.editPlaceholderText}>No image</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                
                {/* Question Navigation - Single Question Display */}
                <View style={styles.editQuestionContainer}>
                  {questions.length > 0 ? (
                    <>
                      {/* Question Counter and Navigation */}
                      <View style={styles.questionNavigation}>
                        <TouchableOpacity 
                          style={[styles.navArrow, currentQuestionIndex === 0 && styles.navArrowDisabled]}
                          onPress={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                        >
                          <Text style={[styles.navArrowText, currentQuestionIndex === 0 && styles.navArrowTextDisabled]}>
                            ← Previous
                          </Text>
                        </TouchableOpacity>
                        
                        <View style={styles.questionInfo}>
                          <Text style={styles.questionCounterText}>
                            {currentQuestionIndex + 1} of {questions.length}
                          </Text>
                          {/* Progress Dots */}
                          <View style={styles.progressDots}>
                            {questions.map((question, index) => (
                              <View
                                key={question.id}
                                style={[
                                  styles.progressDot,
                                  index === currentQuestionIndex && styles.progressDotActive,
                                  updatedAnswers[question.id] ? styles.progressDotAnswered : null
                                ]}
                              />
                            ))}
                          </View>
                        </View>
                        
                        <TouchableOpacity 
                          style={[styles.navArrow, currentQuestionIndex === questions.length - 1 && styles.navArrowDisabled]}
                          onPress={handleNextQuestion}
                          disabled={currentQuestionIndex === questions.length - 1}
                        >
                          <Text style={[styles.navArrowText, currentQuestionIndex === questions.length - 1 && styles.navArrowTextDisabled]}>
                            Next →
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Current Question */}
                      {questions[currentQuestionIndex] && (
                        <ScrollView style={styles.currentQuestionCard} showsVerticalScrollIndicator={false}>
                          <Text style={styles.currentQuestionText}>
                            {questions[currentQuestionIndex].prompt}
                          </Text>
                          
                          {questions[currentQuestionIndex].type === 'multiple_choice' ? (
                            <View style={styles.editOptionsContainer}>
                              {questions[currentQuestionIndex].options?.map((option: string, optionIndex: number) => (
                                <TouchableOpacity
                                  key={optionIndex}
                                  style={[
                                    styles.editOptionButton,
                                    updatedAnswers[questions[currentQuestionIndex].id] === option && styles.editOptionSelected
                                  ]}
                                  onPress={() => handleAnswerChange(questions[currentQuestionIndex].id, option)}
                                >
                                  <Text style={[
                                    styles.editOptionText,
                                    updatedAnswers[questions[currentQuestionIndex].id] === option && styles.editOptionTextSelected
                                  ]}>
                                    {option}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          ) : (
                            <TextInput
                              style={styles.editTextInput}
                              value={updatedAnswers[questions[currentQuestionIndex].id] || ''}
                              onChangeText={(text) => handleAnswerChange(questions[currentQuestionIndex].id, text)}
                              placeholder="Enter your preference..."
                              multiline={true}
                              textAlignVertical="top"
                            />
                          )}
                        </ScrollView>
                      )}
                    </>
                  ) : (
                    <View style={styles.noQuestionsCard}>
                      <Text style={styles.noQuestionsText}>
                        No questions available yet. This feature will be available once design questions are loaded.
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.editActions}>
                  <TouchableOpacity 
                    style={styles.editCancelButton} 
                    onPress={handleCancelEdit}
                    disabled={regenerating}
                  >
                    <Text style={styles.editCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.editSaveButton, regenerating && styles.editSaveDisabled]} 
                    onPress={handleSaveAndRegenerate}
                    disabled={regenerating}
                  >
                    {regenerating ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.editSaveText}>Save & Regenerate</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Modal>

          {/* Info Modal */}
          <Modal
            visible={showInfoModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowInfoModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.infoModal}>
                <Text style={styles.modalTitle}>Design Details</Text>
                
                {(sessionData || enhancedStyleRenovationStatus) && (
                  <ScrollView style={styles.infoContent} showsVerticalScrollIndicator={false}>
                    {/* Session Info */}
                    <View style={styles.infoSection}>
                      <Text style={styles.infoSectionTitle}>Session Information</Text>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Session ID:</Text>
                        <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                          {sessionId.slice(-8)}
                        </Text>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Status:</Text>
                        <Text style={styles.infoValue}>Completed ✅</Text>
                      </View>
                      
                      {sessionData?.createdAt && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Created:</Text>
                          <Text style={styles.infoValue}>
                            {new Date(
                              typeof sessionData.createdAt === 'number' 
                                ? sessionData.createdAt * 1000 // Convert Unix timestamp (seconds) to milliseconds
                                : sessionData.createdAt
                            ).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Generation Info */}
                    {(sessionData?.generatedImage || enhancedStyleRenovationStatus?.generatedImage) && (
                      <View style={styles.infoSection}>
                        <Text style={styles.infoSectionTitle}>Generation Details</Text>
                        
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Generated:</Text>
                          <Text style={styles.infoValue}>
                            {(() => {
                              const timestamp = enhancedStyleRenovationStatus?.generatedImage?.generatedAt || 
                                               sessionData?.generatedImage?.generatedAt || 
                                               Date.now();
                              const dateValue = typeof timestamp === 'number' 
                                ? timestamp * 1000 // Convert Unix timestamp (seconds) to milliseconds
                                : timestamp;
                              return new Date(dateValue).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              });
                            })()}
                          </Text>
                        </View>
                        
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Format:</Text>
                          <Text style={styles.infoValue}>
                            {(enhancedStyleRenovationStatus?.generatedImage?.extension || 
                              sessionData?.generatedImage?.extension || 
                              'jpg').toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Original Image Info */}
                    {(sessionData?.image || enhancedStyleRenovationStatus?.originalImage) && (
                      <View style={styles.infoSection}>
                        <Text style={styles.infoSectionTitle}>Original Image</Text>
                        
                        {sessionData?.image?.uploadedAt && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Uploaded:</Text>
                            <Text style={styles.infoValue}>
                              {new Date(
                                typeof sessionData.image.uploadedAt === 'number'
                                  ? sessionData.image.uploadedAt * 1000 // Convert Unix timestamp (seconds) to milliseconds
                                  : sessionData.image.uploadedAt
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Text>
                          </View>
                        )}
                        
                        {sessionData?.image?.size && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>File Size:</Text>
                            <Text style={styles.infoValue}>
                              {(sessionData.image.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                          </View>
                        )}
                        
                        {sessionData?.image?.width && sessionData?.image?.height && (
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Dimensions:</Text>
                            <Text style={styles.infoValue}>
                              {sessionData.image.width} × {sessionData.image.height}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Design Preferences */}
                    {questions.length > 0 && Object.keys(answers).length > 0 && (
                      <View style={styles.infoSection}>
                        <Text style={styles.infoSectionTitle}>Design Preferences</Text>
                        
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Questions Answered:</Text>
                          <Text style={styles.infoValue}>
                            {Object.keys(answers).length} of {questions.length}
                          </Text>
                        </View>
                        
                        {questions.slice(0, 3).map((question, index) => {
                          const answer = answers[question.id];
                          if (!answer) return null;
                          
                          return (
                            <View key={question.id} style={styles.infoPreferenceRow}>
                              <Text style={styles.infoPreferenceLabel} numberOfLines={1}>
                                {question.prompt}
                              </Text>
                              <Text style={styles.infoPreferenceValue} numberOfLines={1}>
                                {answer}
                              </Text>
                            </View>
                          );
                        })}
                        
                        {questions.length > 3 && (
                          <Text style={styles.infoMorePreferences}>
                            +{questions.length - 3} more preferences
                          </Text>
                        )}
                      </View>
                    )}
                  </ScrollView>
                )}
                
                <TouchableOpacity 
                  style={styles.modalCloseButton} 
                  onPress={() => setShowInfoModal(false)}
                >
                  <Text style={styles.modalCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  closeHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: Theme.colors.background,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Theme.colors.textSecondary,
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Theme.colors.background,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    ...Theme.buttons.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    ...Theme.buttons.primaryText,
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    ...Theme.buttons.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  homeButtonText: {
    ...Theme.buttons.secondaryText,
    fontSize: 16,
    fontWeight: '600',
  },

  // Elegant Hero Section
  modernHeroSection: {
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: Theme.colors.background,
  },
  modernHeroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Theme.colors.accentLight,
    borderWidth: 1,
    borderColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroIcon: {
    fontSize: 24,
  },
  modernHeroTitle: {
    fontSize: Theme.typography.fontSizes['2xl'],
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  modernHeroSubtitle: {
    fontSize: Theme.typography.fontSizes.base,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: Theme.typography.fontWeights.normal as any,
    lineHeight: Theme.typography.lineHeights.relaxed,
  },
  modernHeroBadge: {
    backgroundColor: Theme.colors.accentLight,
    borderWidth: 1,
    borderColor: Theme.colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
  },
  badgeText: {
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    color: Theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Legacy hero styles (removed - using modernHeroSection above)

  // Elegant Image Card Design
  imageCard: {
    ...Theme.cards.elevated,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.xl,
  },
  beforeAfterContainer: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  sliderInstructions: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
    fontWeight: Theme.typography.fontWeights.medium as any,
  },
  sliderWrapper: {
    alignSelf: 'center',
    ...Theme.shadows.md,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
  },
  sliderContainer: {
    position: 'relative',
    width: Dimensions.get('window').width - 88,
    height: Dimensions.get('window').width - 88,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  sliderImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius.lg,
  },
  sliderPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Theme.borderRadius.lg,
  },
  placeholderText: {
    color: Theme.colors.textSecondary,
    fontSize: Theme.typography.fontSizes.base,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  placeholderSubtext: {
    color: Theme.colors.textTertiary,
    fontSize: Theme.typography.fontSizes.sm,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  sliderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: Theme.borderRadius.lg,
    borderRightWidth: 2,
    borderRightColor: Theme.colors.primary,
  },
  sliderHandle: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    zIndex: 10,
  },
  sliderHandleInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.xl,
    borderWidth: 3,
    borderColor: Theme.colors.primary,
  },
  sliderHandleIcon: {
    fontSize: 18,
    color: Theme.colors.primary,
    fontWeight: 'bold',
  },
  imageLabel: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(212, 165, 116, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.sm,
    ...Theme.shadows.sm,
  },
  imageLabelText: {
    color: Theme.colors.textInverse,
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: Theme.typography.fontWeights.bold as any,
    letterSpacing: 0.5,
  },
  imageTitle: {
    fontSize: Theme.typography.fontSizes.base,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.base,
    textAlign: 'center',
  },
  singleImageContainer: {
    alignItems: 'center',
  },
  mainImage: {
    width: Dimensions.get('window').width - 88,
    height: Dimensions.get('window').width - 88,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.backgroundSecondary,
  },
  placeholderImage: {
    width: (Dimensions.get('window').width - 88) / 2,
    height: (Dimensions.get('window').width - 88) / 2,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
  },

  // Elegant Actions Bar
  actionsBar: {
    ...Theme.cards.default,
    marginHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    ...Theme.buttons.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    flex: 1,
    marginHorizontal: 6,
    justifyContent: 'center',
    minHeight: 48,
  },
  actionButtonText: {
    ...Theme.buttons.primaryText,
    fontSize: Theme.typography.fontSizes.sm,
    textAlign: 'center',
  },

  // Elegant Floating Button
  floatingButton: {
    position: 'absolute',
    bottom: Theme.spacing.lg,
    left: Theme.spacing.lg,
    right: Theme.spacing.lg,
  },
  newDesignButton: {
    ...Theme.buttons.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.xl,
  },
  newDesignIcon: {
    fontSize: Theme.typography.fontSizes.base,
    marginRight: Theme.spacing.sm,
  },
  newDesignText: {
    ...Theme.buttons.primaryText,
    fontSize: Theme.typography.fontSizes.base,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },

  // Share Modal
  shareModal: {
    ...Theme.cards.elevated,
    padding: Theme.spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: Theme.typography.fontSizes.xl,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Theme.spacing.xl,
  },
  shareOption: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.base,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.backgroundSecondary,
    minWidth: 80,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  shareIcon: {
    fontSize: 24,
    marginBottom: Theme.spacing.sm,
  },
  shareOptionText: {
    fontSize: Theme.typography.fontSizes.xs,
    color: Theme.colors.text,
    fontWeight: Theme.typography.fontWeights.semibold as any,
  },
  modalCloseButton: {
    ...Theme.buttons.secondary,
    paddingVertical: Theme.spacing.md,
  },
  modalCloseText: {
    ...Theme.buttons.secondaryText,
  },

  // Edit Modal
  editModal: {
    ...Theme.cards.elevated,
    width: '100%',
    maxHeight: '90%',
    marginTop: '10%',
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalCloseIcon: {
    fontSize: Theme.typography.fontSizes.lg,
    color: Theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  
  // Edit Modal Reference Images
  editImageReference: {
    backgroundColor: Theme.colors.backgroundSecondary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  editReferenceTitle: {
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  editImageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Theme.spacing.md,
  },
  editImageColumn: {
    flex: 1,
    alignItems: 'center',
  },
  editImageLabel: {
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    color: Theme.colors.textSecondary,
    marginBottom: 6,
    textAlign: 'center',
  },
  editReferenceImage: {
    width: (Dimensions.get('window').width - 84) / 2,
    height: 60,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.backgroundSecondary,
  },
  editPlaceholderImage: {
    width: (Dimensions.get('window').width - 84) / 2,
    height: 60,
    borderRadius: Theme.borderRadius.sm,
    backgroundColor: Theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderStyle: 'dashed',
  },
  editPlaceholderText: {
    fontSize: 10,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  // Question Navigation Container
  editQuestionContainer: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.base,
    minHeight: 200,
  },
  questionNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.sm,
  },
  navArrow: {
    ...Theme.buttons.primary,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  navArrowDisabled: {
    ...Theme.buttons.disabled,
    opacity: 0.5,
  },
  navArrowText: {
    ...Theme.buttons.primaryText,
    fontSize: Theme.typography.fontSizes.sm,
  },
  navArrowTextDisabled: {
    ...Theme.buttons.disabledText,
  },
  questionCounter: {
    backgroundColor: Theme.colors.backgroundSecondary,
    paddingVertical: 6,
    paddingHorizontal: Theme.spacing.base,
    borderRadius: Theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  questionInfo: {
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.sm,
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.border,
  },
  progressDotActive: {
    backgroundColor: Theme.colors.primary,
    transform: [{ scale: 1.2 }],
  },
  progressDotAnswered: {
    backgroundColor: Theme.colors.success,
  },
  questionCounterText: {
    fontSize: Theme.typography.fontSizes.xs,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    color: Theme.colors.text,
  },
  currentQuestionCard: {
    ...Theme.cards.default,
    padding: Theme.spacing.lg,
    flex: 1,
    minHeight: 150,
  },
  currentQuestionText: {
    fontSize: Theme.typography.fontSizes.lg,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
    lineHeight: Theme.typography.lineHeights.relaxed,
  },
  
  editContent: {
    padding: Theme.spacing.lg,
  },
  editQuestionCard: {
    ...Theme.cards.default,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  editQuestionText: {
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  editOptionsContainer: {
    gap: 6,
  },
  editOptionButton: {
    backgroundColor: Theme.colors.backgroundSecondary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  editOptionSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  editOptionText: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.text,
  },
  editOptionTextSelected: {
    color: Theme.colors.textInverse,
    fontWeight: Theme.typography.fontWeights.semibold as any,
  },
  editTextInput: {
    backgroundColor: Theme.colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.base,
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.text,
    minHeight: 80,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    gap: Theme.spacing.md,
  },
  editCancelButton: {
    ...Theme.buttons.secondary,
    flex: 1,
    paddingVertical: Theme.spacing.md,
  },
  editCancelText: {
    ...Theme.buttons.secondaryText,
  },
  editSaveButton: {
    ...Theme.buttons.primary,
    flex: 2,
    paddingVertical: Theme.spacing.md,
  },
  editSaveDisabled: {
    ...Theme.buttons.disabled,
  },
  editSaveText: {
    ...Theme.buttons.primaryText,
  },
  noQuestionsCard: {
    ...Theme.cards.default,
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: Theme.typography.lineHeights.normal,
  },

  // Info Modal
  infoModal: {
    ...Theme.cards.elevated,
    padding: Theme.spacing.xl,
    width: '100%',
    maxWidth: 380,
    maxHeight: '80%',
  },
  infoContent: {
    marginBottom: Theme.spacing.xl,
    maxHeight: 450,
  },
  infoSection: {
    marginBottom: Theme.spacing.lg,
    paddingBottom: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  infoSectionTitle: {
    fontSize: Theme.typography.fontSizes.base,
    fontWeight: Theme.typography.fontWeights.bold as any,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Theme.spacing.sm,
  },
  infoLabel: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.text,
    fontWeight: Theme.typography.fontWeights.semibold as any,
    flex: 1,
    textAlign: 'right',
  },
  infoPreferenceRow: {
    paddingVertical: Theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  infoPreferenceLabel: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.xs,
  },
  infoPreferenceValue: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.primary,
    fontWeight: Theme.typography.fontWeights.medium as any,
  },
  infoMorePreferences: {
    fontSize: Theme.typography.fontSizes.sm,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: Theme.spacing.sm,
  },

  // Spacing
  bottomSpacing: {
    height: 60, // Reduced space for floating button
  },
});

export default ResultScreen;
