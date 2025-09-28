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
  const { sessionId, imageUrl: propImageUrl } = route.params;
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadSessionData();
  }, []);

  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSessionState(sessionId);
      setSessionData(data);
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

        {/* Generated Image */}
        <View style={styles.imageContainer}>
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
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Created:</Text>
              <Text style={styles.summaryValue}>{new Date(sessionData.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        )}
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
});

export default ResultScreen;
