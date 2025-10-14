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

type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Result'>;
type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

interface Props {
  navigation: ResultScreenNavigationProp;
  route: ResultScreenRouteProp;
}

const { width } = Dimensions.get('window');
const imageSize = width - 40; // Full width minus padding

const ResultScreen: React.FC<Props> = ({ navigation, route }) => {
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
  const [isDragging, setIsDragging] = useState(false);

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

  // Add polling for pending jobs using enhanced style renovation API
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;
    
    if (sessionData?.hasPendingJobs) {
      // Poll every 3 seconds while there are pending jobs using enhanced style renovation endpoint
      pollInterval = setInterval(async () => {
        try {
          const data = await apiClient.getEnhancedStyleRenovationStatus(sessionId);
          
          if (data.success) {
            // Update session data with enhanced style renovation status
            setSessionData(prevData => ({
              ...prevData!,
              status: data.data.status as any,
              hasPendingJobs: data.data.hasPendingJobs,
              generatedImage: data.data.generatedImage ? {
                path: data.data.generatedImage.url,
                filename: data.data.generatedImage.filename,
                extension: data.data.generatedImage.filename.split('.').pop() || 'jpg',
                generatedAt: new Date().toISOString(),
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

  // Prevent hardware back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Return true to prevent default back behavior
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSessionState(sessionId);
      setSessionData(data);
      
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
          const shareMessage = `Check out my AI-generated renovation design from upCrib! ${imageUrl}`;
          const smsUrl = `sms:?&body=${encodeURIComponent(shareMessage)}`;
          await Linking.openURL(smsUrl);
          break;
        case 'email':
          const subject = 'My upCrib Renovation Design';
          const body = `Check out my AI-generated renovation design!\n\nView the design here: ${imageUrl}\n\nGenerated with upCrib - AI-powered home renovation designs.`;
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
    // Navigate back to Home screen to start a new session
    navigation.navigate('Home');
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
    if (propImageUrl) return propImageUrl;
    if (sessionData?.generatedImage) {
      // For enhanced style renovation, the path already contains the full URL path
      if (sessionData.generatedImage.path && sessionData.generatedImage.path.startsWith('/')) {
        return `${apiClient.apiBaseURL}${sessionData.generatedImage.path}`;
      }
      // Fallback to generated folder for old format
      return `${apiClient.apiBaseURL}/generated/${sessionData.generatedImage.filename}`;
    }
    return null;
  };

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
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
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
              {originalImageUrl ? (
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
                          source={{ uri: getImageUrl()! }} 
                          style={styles.sliderImage}
                          resizeMode="cover"
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
                      <Image 
                        source={{ uri: `${apiClient.apiBaseURL}${originalImageUrl}` }} 
                        style={styles.sliderImage}
                        resizeMode="cover"
                      />
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
              
              <TouchableOpacity style={styles.actionButton} onPress={handleEditAnswers}>
                <Text style={styles.actionButtonText} numberOfLines={1}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} onPress={() => setShowInfoModal(true)}>
                <Text style={styles.actionButtonText} numberOfLines={1}>Info</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </ScrollView>

          {/* Floating New Design Button */}
          <View style={styles.floatingButton}>
            <TouchableOpacity style={styles.newDesignButton} onPress={handleStartNew}>
              <Text style={styles.newDesignIcon}>✨</Text>
              <Text style={styles.newDesignText}>Create New Design</Text>
            </TouchableOpacity>
          </View>

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
                    {originalImageUrl && (
                      <View style={styles.editImageColumn}>
                        <Text style={styles.editImageLabel}>Original</Text>
                        <Image 
                          source={{ uri: `${apiClient.apiBaseURL}${originalImageUrl}` }} 
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
                
                {sessionData && (
                  <View style={styles.infoContent}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status:</Text>
                      <Text style={styles.infoValue}>Completed ✅</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Questions Answered:</Text>
                      <Text style={styles.infoValue}>
                        {sessionData.questionsAnswered} of {sessionData.totalQuestions}
                      </Text>
                    </View>
                    
                    {sessionData.generatedImage && (
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Generated:</Text>
                        <Text style={styles.infoValue}>
                          {new Date(sessionData.generatedImage.generatedAt).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                  </View>
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
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  homeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Modern Hero Section
  modernHeroSection: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingHorizontal: 20,
    position: 'relative',
  },
  modernHeroContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  heroIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heroIcon: {
    fontSize: 24,
    textShadowColor: 'rgba(0, 122, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  modernHeroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modernHeroSubtitle: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: 0,
    fontWeight: '500',
    // lineHeight: 2,
  },
  modernHeroBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.4)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Legacy hero styles (keeping for compatibility)
  heroSection: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },

  // Image Card - Enhanced Modern Design
  imageCard: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  beforeAfterContainer: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sliderInstructions: {
    fontSize: 13,
    color: '#B0B0B0',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },
  sliderWrapper: {
    // Wrapper to isolate gesture handling
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
    borderRadius: 20,
  },
  sliderContainer: {
    position: 'relative',
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').width - 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#3a3a3a',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    // Inner shadow effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    borderRadius: 18, // Slightly smaller than container for border effect
  },
  sliderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: 18,
    // Add subtle gradient overlay at the division line
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
  },
  sliderHandle: {
    position: 'absolute',
    top: '50%',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    zIndex: 10,
    // Outer glow effect
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 15,
  },
  sliderHandleInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  sliderHandleIcon: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 122, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  imageLabel: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  imageLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    letterSpacing: 0.5,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  sliderPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  singleImageContainer: {
    alignItems: 'center',
  },
  mainImage: {
    width: Dimensions.get('window').width - 80,
    height: Dimensions.get('window').width - 80,
    borderRadius: 16,
    backgroundColor: '#3a3a3a',
  },
  placeholderImage: {
    width: (Dimensions.get('window').width - 72) / 2,
    height: (Dimensions.get('window').width - 72) / 2,
    borderRadius: 12,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a4a4a',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },

  // Actions Bar - Enhanced Modern Design
  actionsBar: {
    backgroundColor: '#2a2a2a',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 14,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
    height: 44,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#0066CC',
    // Add subtle gradient effect
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    letterSpacing: 0.3,
  },

  // Floating Button - Premium Design
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 15,
  },
  newDesignButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    // Premium gradient effect
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  newDesignIcon: {
    fontSize: 16,
    marginRight: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  newDesignText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.3,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Share Modal
  shareModal: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom:1,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  shareOption: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#3a3a3a',
    minWidth: 80,
  },
  shareIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  shareOptionText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: '#4a4a4a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Edit Modal
  editModal: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%', // Increased from 85%
    marginTop: '10%', // Reduced from 15%
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  modalCloseIcon: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  
  // Edit Modal Reference Images
  editImageReference: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 12, // Reduced from 16
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  editReferenceTitle: {
    fontSize: 12, // Reduced from 14
    fontWeight: '600',
    color: '#999',
    marginBottom: 8, // Reduced from 12
    textAlign: 'center',
  },
  editImageRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  editImageColumn: {
    flex: 1,
    alignItems: 'center',
  },
  editImageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 6,
    textAlign: 'center',
  },
  editReferenceImage: {
    width: (Dimensions.get('window').width - 84) / 2, // Responsive width
    height: 60, // Reduced from 80
    borderRadius: 8,
    backgroundColor: '#3a3a3a',
  },
  editPlaceholderImage: {
    width: (Dimensions.get('window').width - 84) / 2,
    height: 60, // Reduced from 80
    borderRadius: 8,
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4a4a4a',
    borderStyle: 'dashed',
  },
  editPlaceholderText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  
  // Question Navigation Container
  editQuestionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 200, // Ensure minimum space for questions
  },
  questionNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  navArrow: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    minWidth: 80,
    alignItems: 'center',
  },
  navArrowDisabled: {
    backgroundColor: '#4a4a4a',
    opacity: 0.5,
  },
  navArrowText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  navArrowTextDisabled: {
    color: '#999',
  },
  questionCounter: {
    backgroundColor: '#3a3a3a',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  questionInfo: {
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4a4a4a',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
    transform: [{ scale: 1.2 }],
  },
  progressDotAnswered: {
    backgroundColor: '#34C759',
  },
  questionCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currentQuestionCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    minHeight: 150, // Ensure space for content
    // Removed maxHeight to allow full expansion
  },
  currentQuestionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 24,
  },
  
  editContent: {
    padding: 20,
    // Removed maxHeight to allow full expansion to available space
  },
  editQuestionCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 12, // Reduced from 16
    marginBottom: 12, // Reduced from 16
  },
  editQuestionText: {
    fontSize: 14, // Reduced from 16
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8, // Reduced from 12
  },
  editOptionsContainer: {
    gap: 6, // Reduced from 8
  },
  editOptionButton: {
    backgroundColor: '#4a4a4a',
    paddingVertical: 10, // Reduced from 12
    paddingHorizontal: 14, // Reduced from 16
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5a5a5a',
  },
  editOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  editOptionText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  editOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  editTextInput: {
    backgroundColor: '#4a4a4a',
    borderWidth: 1,
    borderColor: '#5a5a5a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#FFFFFF',
    minHeight: 80,
    maxHeight: 120, // Prevent overflow
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
    gap: 12,
  },
  editCancelButton: {
    flex: 1,
    backgroundColor: '#4a4a4a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  editCancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editSaveButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  editSaveDisabled: {
    backgroundColor: '#666',
  },
  editSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noQuestionsCard: {
    backgroundColor: '#3a3a3a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noQuestionsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Info Modal
  infoModal: {
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
  },
  infoContent: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Spacing
  bottomSpacing: {
    height: 60, // Reduced space for floating button
  },
});

export default ResultScreen;
