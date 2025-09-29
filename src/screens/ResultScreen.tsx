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

  useEffect(() => {
    loadSessionData();
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

  const handleDownload = () => {
    // TODO: Implement actual download functionality
    Alert.alert('Download', 'Download functionality will be implemented here.');
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
    // Ensure questions section is expanded when entering edit mode
    setShowQuestions(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setUpdatedAnswers({ ...answers });
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
      // Construct full URL for generated image using the correct endpoint
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

  const imageUrl = getImageUrl();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Design is Ready!</Text>
          <Text style={styles.subtitle}>
            Here's your AI-generated renovation design
          </Text>
        </View>

        {/* Before & After Comparison */}
        {originalImageUrl ? (
          <View style={styles.comparisonSection}>
            <Text style={styles.comparisonTitle}>Before & After</Text>
            
            {/* Original Image */}
            <View style={[styles.imageContainer, styles.comparisonImageContainer]}>
              <Text style={styles.imageLabel}>Original</Text>
              <Image 
                source={{ uri: `${apiClient.apiBaseURL}${originalImageUrl}` }} 
                style={styles.image}
                resizeMode="cover"
                onLoad={() => console.log('Original image loaded successfully from:', `${apiClient.apiBaseURL}${originalImageUrl}`)}
                onError={(error) => console.log('Original image failed to load:', error.nativeEvent.error)}
              />
            </View>

            {/* Generated Image */}
            <View style={[styles.imageContainer, styles.comparisonImageContainer]}>
              <Text style={styles.imageLabel}>AI-Generated Design</Text>
              {imageUrl ? (
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>No generated image available</Text>
                </View>
              )}
            </View>
          </View>
        ) : (
          // Show only generated image when original is not available
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>Generated Design</Text>
            {imageUrl ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>No image available</Text>
              </View>
            )}
          </View>
        )}

        {/* Image Info */}
        {sessionData?.generatedImage && (
          <View style={styles.imageInfo}>
            <Text style={styles.imageInfoText}>
              Generated on {new Date(sessionData.generatedImage.generatedAt).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.downloadButton}
            onPress={handleDownload}
          >
            <Text style={styles.downloadButtonText}>Download Image</Text>
          </TouchableOpacity>


          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}
          >
            <Text style={styles.shareButtonText}>Share Design</Text>
          </TouchableOpacity>
        </View>

        {/* Session Summary */}
        {sessionData && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Design Session Summary</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Questions Answered:</Text>
              <Text style={styles.summaryValue}>{sessionData.questionsAnswered} of {sessionData.totalQuestions}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <Text style={[styles.summaryValue, styles.statusCompleted]}>Completed</Text>
            </View>
{/*             <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Created:</Text>
              <Text style={styles.summaryValue}>{new Date(sessionData.createdAt).toLocaleDateString()}</Text>
            </View> */}
          </View>
        )}

        {/* Questions and Answers Section */}
        <View style={styles.questionsContainer}>
          <TouchableOpacity 
            style={styles.questionsToggle}
            onPress={toggleQuestions}
          >
            <Text style={styles.questionsToggleTitle}>
              Design Questions & Preferences
            </Text>
            <Text style={styles.questionsToggleText}>
              {showQuestions ? 'Hide' : 'Show'} questions
            </Text>
            <Text style={styles.questionsToggleIcon}>
              {showQuestions ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {showQuestions && (
            <View style={styles.questionsContent}>
              {questions.length > 0 ? (
                <>
{/*                   <Text style={styles.questionsDescription}>
                    These are the design preference questions you answered to generate your renovation:
                  </Text> */}

                  {/* Edit Mode Controls */}
                  {!editMode ? (
                    <View style={styles.editControlsContainer}>
                      <TouchableOpacity 
                        style={styles.downloadButton}
                        onPress={handleEditAnswers}
                      >
                        <Text style={styles.downloadButtonText}>✏️ Edit Answers & Regenerate</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.editControlsContainer}>
                      <Text style={styles.editModeTitle}>✏️ Edit Mode Active</Text>
                      <Text style={styles.editModeInstructions}>
                        Change preferences and regenerate
                      </Text>
                      <View style={styles.editActionsRow}>
                        <TouchableOpacity 
                          style={styles.cancelButton}
                          onPress={handleCancelEdit}
                          disabled={regenerating}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.saveButton, regenerating && styles.saveButtonDisabled]}
                          onPress={handleSaveAndRegenerate}
                          disabled={regenerating}
                        >
                          {regenerating ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <Text style={styles.saveButtonText}>Save & Regenerate</Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.noQuestionsContainer}>
                  <Text style={styles.noQuestionsText}>
                    No design questions available yet. Questions will appear here once the design process is complete.
                  </Text>
                  {/* Still allow edit mode for testing */}
                  {!editMode ? (
                    <TouchableOpacity 
                      style={styles.downloadButton}
                      onPress={handleEditAnswers}
                    >
                      <Text style={styles.downloadButtonText}>✏️ Test Edit Mode</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.editControlsContainer}>
                      <Text style={styles.editModeTitle}>✏️ Edit Mode Active (Test)</Text>
                      <View style={styles.editActionsRow}>
                        <TouchableOpacity 
                          style={styles.cancelButton}
                          onPress={handleCancelEdit}
                        >
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.saveButton}
                          onPress={handleSaveAndRegenerate}
                        >
                          <Text style={styles.saveButtonText}>Save & Regenerate</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Show questions if available */}
              {questions.length > 0 && (
                <>
                  <Text style={styles.questionsDescription}>
                    These are the design preference questions you answered to generate your renovation:
                  </Text>
                  
                  {questions.map((question, index) => (
                    <View key={question.id} style={styles.questionItem}>
                      <Text style={styles.questionText}>
                        {index + 1}. {question.prompt}
                      </Text>
                      
                      {/* Edit mode - show input fields */}
                      {editMode ? (
                        <View style={styles.editAnswerContainer}>
                          {question.type === 'multiple_choice' ? (
                            <View style={styles.editOptionsContainer}>
                              <Text style={styles.editLabel}>Select your answer:</Text>
                              {question.options?.map((option: string, optionIndex: number) => (
                                <TouchableOpacity
                                  key={optionIndex}
                                  style={[
                                    styles.editOptionButton,
                                    updatedAnswers[question.id] === option && styles.editOptionButtonSelected
                                  ]}
                                  onPress={() => handleAnswerChange(question.id, option)}
                                >
                                  <Text style={[
                                    styles.editOptionText,
                                    updatedAnswers[question.id] === option && styles.editOptionTextSelected
                                  ]}>
                                    {option}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          ) : (
                            <View style={styles.editTextContainer}>
                              <Text style={styles.editLabel}>Your answer:</Text>
                              <TextInput
                                style={styles.editTextInput}
                                value={updatedAnswers[question.id] || ''}
                                onChangeText={(text) => handleAnswerChange(question.id, text)}
                                placeholder="Type your answer here..."
                                multiline={true}
                                textAlignVertical="top"
                              />
                            </View>
                          )}
                        </View>
                      ) : (
                        // View mode - show current answers
                        <>
                          {/* Show the user's selected answer if available */}
                          {answers[question.id] && (
                            <View style={styles.selectedAnswerContainer}>
                              <Text style={styles.selectedAnswerLabel}>Your answer:</Text>
                              <Text style={styles.selectedAnswerText}>
                                {answers[question.id]}
                              </Text>
                            </View>
                          )}
                          
                          {/* Show options for multiple choice questions */}
                          {question.type === 'multiple_choice' && question.options && question.options.length > 0 && (
                            <View style={styles.optionsContainer}>
                              <Text style={styles.optionsLabel}>
                                {answers[question.id] ? 'All options were:' : 'Available options were:'}
                              </Text>
                              {question.options.map((option: string, optionIndex: number) => (
                                <Text 
                                  key={optionIndex} 
                                  style={[
                                    styles.optionText,
                                    answers[question.id] === option && styles.optionTextSelected
                                  ]}
                                >
                                  {answers[question.id] === option ? '✓ ' : '• '}{option}
                                </Text>
                              ))}
                            </View>
                          )}

                          {/* Show note if no answer data available */}
                          {!answers[question.id] && Object.keys(answers).length === 0 && (
                            <View style={styles.noAnswerNote}>
                              <Text style={styles.noAnswerText}>
                                You provided an answer to this question during the design process.
                              </Text>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.newDesignButton}
          onPress={handleStartNew}
        >
          <Text style={styles.newDesignButtonText}>Create New Design</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  homeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    padding: 20,
  },
  imageLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  image: {
    width: imageSize,
    height: imageSize,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
  },
  placeholderImage: {
    width: imageSize,
    height: imageSize,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  imageInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageInfoText: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  summaryContainer: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  statusCompleted: {
    color: '#34C759',
  },
  bottomActions: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  newDesignButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newDesignButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  questionsContainer: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  questionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  questionsToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
  },
  questionsToggleText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 8,
  },
  questionsToggleIcon: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  questionsContent: {
    padding: 20,
    paddingTop: 0,
  },
  questionItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
    lineHeight: 22,
  },
  answerText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
    paddingLeft: 16,
  },
  questionsDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  optionsContainer: {
    marginTop: 8,
    paddingLeft: 16,
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  optionText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 18,
    marginBottom: 2,
  },
  selectedAnswerContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  selectedAnswerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  selectedAnswerText: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
    lineHeight: 20,
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  noAnswerNote: {
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E5EA',
  },
  noAnswerText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  comparisonSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 10,
  },
  comparisonImageContainer: {
    paddingBottom: 15,
    paddingTop: 10,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  debugContainer: {
    backgroundColor: '#FFF3CD',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  // Edit mode styles
  editControlsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  editCancelButton: {
    backgroundColor: '#8E8E93',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  editSaveButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  editAnswerContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editOptionsContainer: {
    marginTop: 4,
  },
  editTextContainer: {
    marginTop: 4,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  editOptionButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  editOptionButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  editOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  editOptionTextSelected: {
    color: 'white',
    fontWeight: '600',
  },
  editTextInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editModeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  editModeInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  editActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonDisabled: {
    backgroundColor: '#A3A3A3',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  editDesignButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editDesignButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  noQuestionsContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 12,
  },
  noQuestionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  debugSaveButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 4,
    alignSelf: 'center',
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  debugSaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  debugStatusContainer: {
    backgroundColor: '#FFEB3B',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  debugStatusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
});

export default ResultScreen;
