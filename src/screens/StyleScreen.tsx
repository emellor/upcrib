import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useQuestions } from '../hooks/useQuestions';
import { Question } from '../types/api';
import { apiClient } from '../services/apiClient';

type StyleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Style'>;
type StyleScreenRouteProp = RouteProp<RootStackParamList, 'Style'>;

interface Props {
  navigation: StyleScreenNavigationProp;
  route: StyleScreenRouteProp;
}

const StyleScreen: React.FC<Props> = ({ navigation, route }) => {
  const { sessionId, imageUrl } = route.params;
  const { 
    questions, 
    loading, 
    error, 
    answers,
    allAnswered,
    getQuestions, 
    setAnswer,
    submitAnswers 
  } = useQuestions();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);
  const [showReadyMessage, setShowReadyMessage] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);
  const maxPollAttempts = 40; // 3+ minutes at 5 second intervals

  useEffect(() => {
    checkStatusAndLoadQuestions();
  }, []);

  const checkStatusAndLoadQuestions = async () => {
    try {
      const sessionState = await apiClient.getSessionState(sessionId);
      console.log('Session state:', sessionState);
      setSessionStatus(sessionState.status);
      setSessionData(sessionState); // Store the full session data

      if (sessionState.hasQuestions && sessionState.status === 'questions_ready') {
        // Questions are ready, load them
        console.log('Questions are ready, loading...');
        await loadQuestions();
        setIsPolling(false);
      } else if (sessionState.status === 'analyzing') {
        // Still analyzing, start polling
        console.log('Still analyzing, starting poll...');
        if (!isPolling) {
          startPolling();
        }
      } else if (sessionState.status === 'failed') {
        console.log('Analysis failed');
        setIsPolling(false);
      } else if (sessionState.status === 'uploaded') {
        // Image uploaded but analysis not started, try to start analysis
        console.log('Image uploaded, checking if analysis started...');
        setIsPolling(false);
      } else {
        console.log('Unexpected status:', sessionState.status);
      }
    } catch (err) {
      console.error('Failed to check session status:', err);
    }
  };

  const startPolling = () => {
    if (isPolling) return;
    
    console.log('Starting polling...');
    setIsPolling(true);
    setPollAttempts(0);
    pollSessionState();
  };

  const pollSessionState = async () => {
    try {
      const sessionState = await apiClient.getSessionState(sessionId);
      console.log(`Poll attempt ${pollAttempts + 1}:`, sessionState.status, 'hasQuestions:', sessionState.hasQuestions);
      
      setSessionStatus(sessionState.status);
      setPollAttempts(prev => prev + 1);

      if (sessionState.hasQuestions && sessionState.status === 'questions_ready') {
        // Questions are now ready
        console.log('Questions ready after polling, loading...');
        setIsPolling(false);
        await loadQuestions();
        return;
      } else if (sessionState.status === 'failed') {
        // Analysis failed
        console.log('Analysis failed during polling');
        setIsPolling(false);
        return;
      } else if (pollAttempts >= maxPollAttempts) {
        // Timeout
        console.log('Polling timeout reached');
        setIsPolling(false);
        setSessionStatus('timeout');
        return;
      }

      // Continue polling if still analyzing
      if (sessionState.status === 'analyzing') {
        setTimeout(pollSessionState, 5000); // Poll every 5 seconds
      } else {
        setIsPolling(false);
      }
    } catch (err) {
      console.error('Polling error:', err);
      setTimeout(pollSessionState, 10000); // Retry after 10 seconds on error
    }
  };

  const loadQuestions = async () => {
    try {
      await getQuestions(sessionId);
    } catch (err) {
      console.error('Failed to load questions:', err);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    }
  };

  const handleRetry = () => {
    if (sessionStatus === 'failed' || sessionStatus === 'timeout') {
      Alert.alert(
        sessionStatus === 'timeout' ? 'Analysis Timeout' : 'Analysis Failed', 
        'The image analysis ' + (sessionStatus === 'timeout' ? 'took too long' : 'failed') + '. Would you like to try uploading a new image?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Upload New Image', 
            onPress: () => navigation.navigate('Upload', { sessionId })
          }
        ]
      );
    } else {
      checkStatusAndLoadQuestions();
    }
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswer(questionId, value);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitAnswers();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitAnswers = async () => {
    setIsSubmitting(true);
    try {
      await submitAnswers(sessionId);
      setShowReadyMessage(true);
      // Show the "Your design is ready" message for 3 seconds before navigating
      setTimeout(() => {
        navigation.navigate('Design', { sessionId, answers, imageUrl });
      }, 3000);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit answers. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getCurrentAnswer = () => {
    if (questions.length === 0) return '';
    const currentQuestion = questions[currentQuestionIndex];
    return answers[currentQuestion.id] || '';
  };

  const isCurrentAnswerValid = () => {
    const answer = getCurrentAnswer();
    return answer.trim() !== '';
  };

  // Loading state
  if (loading && questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    );
  }

  // No questions available - show status based message
  if (questions.length === 0) {
    let message = 'No questions available';
    let showSpinner = false;
    let buttonText = 'Retry';
    
    if (isPolling) {
      message = `Analyzing your image... (${pollAttempts}/${maxPollAttempts})`;
      showSpinner = true;
      buttonText = 'Check Status';
    } else if (sessionStatus === 'analyzing') {
      message = 'AI is analyzing your house...';
      buttonText = 'Start Polling';
      showSpinner = false;
    } else if (sessionStatus === 'failed') {
      message = 'Image analysis failed';
      buttonText = 'Upload New Image';
    } else if (sessionStatus === 'timeout') {
      message = 'Analysis is taking longer than expected';
      buttonText = 'Upload New Image';
    } else if (sessionStatus === 'uploaded') {
      message = 'Image uploaded, analysis may not have started';
      buttonText = 'Check Status';
    }

    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{message}</Text>
        {showSpinner && (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.analyzingText}>
              Please wait while we process your image
            </Text>
          </View>
        )}
        {!showSpinner && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>{buttonText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Questions available - show question interface
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={false}
      >
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.prompt}</Text>
          
          {currentQuestion.type === 'multiple_choice' ? (
            <View style={styles.optionsContainer}>
              {currentQuestion.options?.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    answers[currentQuestion.id] === option && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleAnswer(currentQuestion.id, option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      answers[currentQuestion.id] === option && styles.optionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.textInputContainer}>
              <Text style={styles.inputLabel}>Your answer:</Text>
              <TextInput
                style={styles.textInput}
                value={getCurrentAnswer()}
                onChangeText={(text: string) => handleAnswer(currentQuestion.id, text)}
                placeholder="Type your answer here..."
                multiline
                textAlignVertical="top"
              />
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {currentQuestionIndex > 0 && (
            <TouchableOpacity style={styles.secondaryButton} onPress={handlePrevious}>
              <Text style={styles.secondaryButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.primaryButton,
              !isCurrentAnswerValid() && styles.primaryButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!isCurrentAnswerValid() || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {currentQuestionIndex === questions.length - 1 ? 'Generate Design' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Your Design Is Ready Message */}
        {showReadyMessage && (
          <View style={styles.readyMessageContainer}>
            <View style={styles.readyMessageContent}>
              <Text style={styles.readyMessageTitle}>🎉 Your Design Is Ready!</Text>
              <Text style={styles.readyMessageSubtitle}>
                Here's a summary of your renovation preferences
              </Text>

              {/* Original Image */}
              {sessionData?.uploadedImage && (
                <View style={styles.originalImageSection}>
                  <Text style={styles.sectionTitle}>Original Image</Text>
                  <Image
                    source={{ uri: `${apiClient.apiBaseURL}/uploads/${sessionData.uploadedImage.filename}` }}
                    style={styles.originalImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Questions and Answers Summary */}
              <View style={styles.summarySection}>
                <Text style={styles.sectionTitle}>Your Renovation Preferences</Text>
                {questions.map((question, index) => (
                  <View key={question.id} style={styles.qaItem}>
                    <Text style={styles.questionSummary}>
                      {index + 1}. {question.prompt}
                    </Text>
                    <Text style={styles.answerSummary}>
                      {answers[question.id] || 'No answer provided'}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.readyMessageLoader}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.readyMessageProgress}>Generating your personalized designs...</Text>
              </View>
            </View>
          </View>
        )}

        {/* Add extra space to ensure scroll beyond screen */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  analyzingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  analyzingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 28,
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  textInputContainer: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
    paddingTop: 20,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  readyMessageContainer: {
    marginTop: 60,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 600, // Increased height to accommodate the additional content
  },
  readyMessageContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    maxWidth: '100%',
  },
  readyMessageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 16,
  },
  readyMessageSubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  readyMessageLoader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyMessageProgress: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 200, // Extra space to ensure scrolling beyond the screen
  },
  originalImageSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  originalImage: {
    width: 280,
    height: 200,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  summarySection: {
    width: '100%',
    marginBottom: 24,
  },
  qaItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  questionSummary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
    lineHeight: 18,
  },
  answerSummary: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 16,
  },
});

export default StyleScreen;
