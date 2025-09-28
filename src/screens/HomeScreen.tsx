import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/api';
import { useSession } from '../hooks/useSession';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { loading, error, createSession } = useSession();

  const handleStartDesigning = async () => {
    try {
      const session = await createSession();
      navigation.navigate('Upload', { sessionId: session.sessionId });
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.message || 'Failed to start renovation session. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Image 
              source={require('../images/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>
              AI-powered interior renovation assistant
            </Text>
            <Text style={styles.tagline}>
              Transform your space with personalized designs
            </Text>
          </View>
          <View style={styles.aiTag}>
            <Text style={styles.aiTagText}>AI POWERED</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.title}>Visualize your renovation</Text>
          <Text style={styles.subtitle}>
            Upload your house photo, answer AI questions,
          </Text>
          <Text style={styles.subtitle}>
            and see your space transformed instantly
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.startButton, loading && styles.startButtonDisabled]}
            onPress={handleStartDesigning}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.startButtonText}>
              {loading ? 'STARTING SESSION...' : 'GET STARTED'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>What to expect:</Text>
            <Text style={styles.featureItem}>• Upload your house image</Text>
            <Text style={styles.featureItem}>• AI analyzes your space</Text>
            <Text style={styles.featureItem}>• Answer personalized questions</Text>
            <Text style={styles.featureItem}>• Get instant renovation visualization</Text>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  aiTag: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  aiTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  descriptionContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 5,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  startButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 25,
  },
  startButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  featuresContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  featureItem: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 5,
  },
});

export default HomeScreen;
