import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/api';
import { UpCribAPIClient } from '../services/apiClient';

type DesignScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Design'>;
type DesignScreenRouteProp = RouteProp<RootStackParamList, 'Design'>;

interface DesignScreenProps {
  navigation: DesignScreenNavigationProp;
  route: DesignScreenRouteProp;
}

type GenerationStatus = 'starting' | 'processing' | 'completed' | 'failed';

const DesignScreen: React.FC<DesignScreenProps> = ({ navigation, route }) => {
  const { sessionId } = route.params;
  const [status, setStatus] = useState<GenerationStatus>('starting');
  const [progress, setProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(120); // 2 minutes default
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  const apiClient = new UpCribAPIClient();

  // Start generation job
  const startGeneration = useCallback(async () => {
    try {
      setStatus('starting');
      setError(null);
      
      // First check if session is ready for generation
      const sessionState = await apiClient.getSessionState(sessionId);
      console.log('Pre-generation session check:', sessionState);
      
      if (!sessionState.hasImage) {
        setError('No image uploaded. Please go back and upload an image.');
        setStatus('failed');
        return;
      }
      
      if (sessionState.questionsAnswered === 0) {
        setError('Please answer the design questions before generating.');
        setStatus('failed');
        return;
      }
      
      // Start the generation process using the correct API endpoint
      console.log('Starting generation for session:', sessionId);
      const response = await apiClient.generateRenovatedImage(sessionId);
      console.log('Generation response:', response);
      setJobId(response.jobId);
      setStatus('processing');
      
      // Start polling session state instead of generation status
      startPolling();
    } catch (err: any) {
      console.error('Generation start error:', err);
      setError(err.message || 'Failed to start design generation');
      setStatus('failed');
    }
  }, [sessionId]);

  // Poll session state for generation completion
  const startPolling = () => {
    let pollCount = 0;
    const maxPolls = 200; // 10 minutes at 3 second intervals
    
    const pollInterval = setInterval(async () => {
      try {
        pollCount++;
        const sessionState = await apiClient.getSessionState(sessionId);
        console.log(`Design polling ${pollCount}/${maxPolls} - session status:`, sessionState.status);
        
        // Calculate progress based on poll count (fake progress)
        const fakeProgress = Math.min(95, Math.floor((pollCount / maxPolls) * 100));
        setProgress(fakeProgress);
        setEstimatedTime(Math.max(10, 120 - (pollCount * 3))); // Countdown from 2 minutes
        
        switch (sessionState.status) {
          case 'generating':
            // Still generating, continue polling
            break;
          case 'completed':
            setProgress(100);
            setStatus('completed');
            clearInterval(pollInterval);
            // Small delay before navigating to show completion
            setTimeout(() => {
              navigation.navigate('Result', { sessionId });
            }, 1500);
            break;
          case 'failed':
            setStatus('failed');
            setError('Design generation failed');
            clearInterval(pollInterval);
            break;
          default:
            console.log('Unexpected session status during generation:', sessionState.status);
        }
        
        if (pollCount >= maxPolls) {
          setStatus('failed');
          setError('Generation timeout - please try again');
          clearInterval(pollInterval);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        // Don't stop polling for minor errors, but log them
      }
    }, 3000); // Poll every 3 seconds
  };

  useEffect(() => {
    startGeneration();
  }, [startGeneration]);

  const handleCancel = () => {
    Alert.alert(
      'Cancel Generation',
      'Are you sure you want to cancel the design generation?',
      [
        { text: 'Continue Generating', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleRetry = () => {
    setError(null);
    startGeneration();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStatusMessage = (): string => {
    switch (status) {
      case 'starting':
        return 'Initializing AI design generation...';
      case 'processing':
        return 'Generating your personalized designs...';
      case 'completed':
        return 'Your designs are ready!';
      case 'failed':
        return 'Something went wrong';
      default:
        return 'Processing...';
    }
  };

  const getProgressMessage = (): string => {
    if (progress < 20) return 'Analyzing your space and preferences...';
    if (progress < 40) return 'Generating design concepts...';
    if (progress < 60) return 'Creating detailed visualizations...';
    if (progress < 80) return 'Applying finishing touches...';
    if (progress < 100) return 'Finalizing your designs...';
    return 'Complete!';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <View style={styles.headerLogoContainer}>
          <Image 
            source={require('../images/logo.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Status Icon */}
        <View style={styles.statusContainer}>
          {status === 'failed' ? (
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>⚠️</Text>
            </View>
          ) : status === 'completed' ? (
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✅</Text>
            </View>
          ) : (
            <View style={styles.loadingIconContainer}>
              <ActivityIndicator size="large" color="#D4A574" />
              <View style={styles.progressRing}>
                <Text style={styles.progressText}>{progress}%</Text>
              </View>
            </View>
          )}
        </View>

        {/* Status Message */}
        <Text style={styles.statusTitle}>{getStatusMessage()}</Text>
        
        {status === 'processing' && (
          <>
            <Text style={styles.progressMessage}>{getProgressMessage()}</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressBarFill, { width: `${progress}%` }]} 
                />
              </View>
            </View>

            {/* Time Estimate */}
            <Text style={styles.timeEstimate}>
              Estimated time remaining: {formatTime(estimatedTime)}
            </Text>
          </>
        )}

        {status === 'completed' && (
          <Text style={styles.completedMessage}>
            Redirecting to your beautiful new designs...
          </Text>
        )}

        {/* Error State */}
        {status === 'failed' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>
              {error || 'An unexpected error occurred'}
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Info Text */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>What's happening?</Text>
          <Text style={styles.infoText}>
            Our AI is analyzing your space, understanding your style preferences, 
            and creating multiple design variations tailored specifically for you. 
            This process typically takes 1-3 minutes.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  headerLogoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerLogo: {
    width: 80,
    height: 30,
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  statusContainer: {
    marginBottom: 30,
  },
  loadingIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D4A574',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconText: {
    fontSize: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconText: {
    fontSize: 40,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  progressMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4A574',
    borderRadius: 3,
  },
  timeEstimate: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 40,
  },
  completedMessage: {
    fontSize: 14,
    color: '#4CAF50',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorMessage: {
    fontSize: 14,
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    marginTop: 'auto',
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default DesignScreen;
