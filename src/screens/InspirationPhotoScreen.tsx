import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
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
    Alert.alert(
      'Add Inspiration Photo',
      'Choose how you\'d like to add your inspiration image:',
      [
        {
          text: 'Take Photo',
          onPress: () => {
            Alert.alert('Camera', 'Camera functionality will be available soon!');
            setHasInspirationPhoto(true);
          }
        },
        {
          text: 'Choose from Gallery',
          onPress: () => {
            Alert.alert('Gallery', 'Gallery selection will be available soon!');
            setHasInspirationPhoto(true);
          }
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
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
          <Text style={styles.stepIndicator}>Step 2 of 3</Text>
          <Text style={styles.title}>Inspiration Photo</Text>
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '67%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.descriptionContainer}>
            <Text style={styles.mainDescription}>
              Help our AI understand your vision
            </Text>
            <Text style={styles.subtitle}>
              Upload a photo that captures the style, colors, or architectural features you love. This will guide our AI to create designs that match your taste.
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.photoUpload, hasInspirationPhoto && styles.photoUploaded]}
            onPress={handleAddInspirationPhoto}
            activeOpacity={0.8}
          >
            {hasInspirationPhoto ? (
              <>
                <View style={styles.successIconContainer}>
                  <Text style={styles.uploadIconSuccess}>✓</Text>
                </View>
                <Text style={styles.uploadTextSuccess}>Inspiration Photo Added!</Text>
                <Text style={styles.uploadSubtextSuccess}>Your reference will guide the AI design</Text>
                <TouchableOpacity 
                  style={styles.changePhotoButton}
                  onPress={handleAddInspirationPhoto}
                >
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.uploadIconContainer}>
                  <Text style={styles.uploadIcon}>�</Text>
                </View>
                <Text style={styles.uploadText}>Add Your Inspiration Photo</Text>
                <Text style={styles.uploadSubtext}>Tap to take a photo or choose from gallery</Text>
                <View style={styles.uploadOptions}>
                  <View style={styles.optionBadge}>
                    <Text style={styles.optionText}>📸 Camera</Text>
                  </View>
                  <View style={styles.optionBadge}>
                    <Text style={styles.optionText}>🖼️ Gallery</Text>
                  </View>
                </View>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Why add an inspiration photo?</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎯</Text>
              <Text style={styles.benefitText}>Get more accurate design suggestions</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>🎨</Text>
              <Text style={styles.benefitText}>AI learns your style preferences</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>⚡</Text>
              <Text style={styles.benefitText}>Faster design iterations</Text>
            </View>
          </View>

          <View style={styles.tipContainer}>
            <Text style={styles.tipTitle}>💡 Pro Tips for Best Results</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Use high-quality, well-lit exterior photos</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Focus on architectural styles you admire</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Include color schemes that inspire you</Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Avoid busy backgrounds or poor lighting</Text>
              </View>
            </View>
          </View>

          {!hasInspirationPhoto && (
            <View style={styles.skipInfoContainer}>
              <Text style={styles.skipInfoTitle}>No photo? No problem!</Text>
              <Text style={styles.skipInfoText}>
                You can skip this step and our AI will use your selected colors and design preferences to create beautiful exterior designs.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {hasInspirationPhoto ? '🎯 Continue with Photo' : '⏭️ Continue Without Photo'}
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
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  descriptionContainer: {
    marginBottom: 32,
  },
  mainDescription: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  photoUpload: {
    minHeight: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  photoUploaded: {
    backgroundColor: '#F0F8FF',
    borderColor: '#007AFF',
    borderStyle: 'solid',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIcon: {
    fontSize: 32,
  },
  uploadIconSuccess: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  uploadText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadTextSuccess: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  uploadSubtextSuccess: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  optionBadge: {
    backgroundColor: '#F0F8FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E8F0',
  },
  optionText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  changePhotoButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  benefitsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  benefitText: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
    lineHeight: 20,
  },
  tipContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 16,
    color: '#007AFF',
    marginRight: 8,
    marginTop: 2,
    fontWeight: '700',
  },
  tipText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
    lineHeight: 20,
  },
  skipInfoContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  skipInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  skipInfoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
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
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default InspirationPhotoScreen;
