import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type InspirationPhotoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'InspirationPhoto'
>;

type InspirationPhotoScreenRouteProp = RouteProp<
  RootStackParamList,
  'InspirationPhoto'
>;

interface InspirationPhotoScreenProps {
  navigation: InspirationPhotoScreenNavigationProp;
  route: InspirationPhotoScreenRouteProp;
}

const InspirationPhotoScreen: React.FC<InspirationPhotoScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionId, selectedColors, selectedThemes } = route.params;
  const [hasInspirationPhoto, setHasInspirationPhoto] = useState(false);

  const handleAddInspirationPhoto = () => {
    Alert.alert('Feature Coming Soon', 'Photo upload functionality will be added soon.');
    setHasInspirationPhoto(true);
  };

  const handleNext = () => {
    navigation.navigate('DesignStyle', { 
      sessionId,
      selectedColors,
      selectedThemes,
      hasInspirationPhoto
    });
  };

  const handleSkip = () => {
    navigation.navigate('DesignStyle', { 
      sessionId,
      selectedColors,
      selectedThemes,
      hasInspirationPhoto: false
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.stepIndicator}>Step 3 of 4</Text>
          <Text style={styles.title}>Inspiration Photo</Text>
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '75%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Upload a reference image to guide your design direction
        </Text>
        
        <TouchableOpacity
          style={[styles.photoUpload, hasInspirationPhoto && styles.photoUploaded]}
          onPress={handleAddInspirationPhoto}
        >
          {hasInspirationPhoto ? (
            <>
              <Text style={styles.uploadIcon}>✅</Text>
              <Text style={styles.uploadTextSuccess}>Inspiration Photo Added</Text>
              <Text style={styles.uploadSubtext}>Your reference image will guide the AI</Text>
            </>
          ) : (
            <>
              <Text style={styles.uploadIcon}>📸</Text>
              <Text style={styles.uploadText}>Add Inspiration Photo</Text>
              <Text style={styles.uploadSubtext}>Upload an image that captures your vision</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>💡 Tips for great results:</Text>
          <Text style={styles.tipText}>• Choose high-quality, well-lit images</Text>
          <Text style={styles.tipText}>• Focus on exterior design elements</Text>
          <Text style={styles.tipText}>• Show the style or mood you want</Text>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {hasInspirationPhoto ? 'Continue' : 'Skip for now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#F8F8F8',
  },
  backIcon: {
    fontSize: 20,
    color: '#000000',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  skipButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  photoUpload: {
    height: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  photoUploaded: {
    backgroundColor: '#E8F4FD',
    borderColor: '#007AFF',
    borderStyle: 'solid',
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '600',
    marginBottom: 8,
  },
  uploadTextSuccess: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  tipContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 4,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default InspirationPhotoScreen;
