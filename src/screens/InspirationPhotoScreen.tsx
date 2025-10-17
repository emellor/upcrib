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
import Theme from '../constants/theme';
import GlobalStyles from '../constants/globalStyles';

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
  const { sessionId, selectedColors, selectedThemes, imageUri } = route.params;
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
      hasInspirationPhoto,
      imageUri
    });
  };

  const handleSkip = () => {
    navigation.navigate('DesignStyle', { 
      sessionId,
      selectedColors,
      selectedThemes,
      hasInspirationPhoto: false,
      imageUri
    });
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
          <Text style={GlobalStyles.stepIndicator}>Step 2 of 3</Text>
          <Text style={GlobalStyles.headerTitle}>Inspiration Photo</Text>
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={GlobalStyles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={GlobalStyles.progressContainer}>
        <View style={GlobalStyles.progressBar}>
          <View style={[GlobalStyles.progressFill, { width: '67%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={GlobalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={GlobalStyles.content}>
          <View style={GlobalStyles.descriptionContainer}>
            <Text style={GlobalStyles.mainTitle}>
              Help our AI understand your vision
            </Text>
            <Text style={GlobalStyles.subtitle}>
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

          <View style={GlobalStyles.card}>
            <Text style={GlobalStyles.sectionTitle}>Why add an inspiration photo?</Text>
            <View style={GlobalStyles.listItem}>
              <Text style={GlobalStyles.listItemIcon}>🎯</Text>
              <Text style={GlobalStyles.listItemText}>Get more accurate design suggestions</Text>
            </View>
            <View style={GlobalStyles.listItem}>
              <Text style={GlobalStyles.listItemIcon}>🎨</Text>
              <Text style={GlobalStyles.listItemText}>AI learns your style preferences</Text>
            </View>
            <View style={GlobalStyles.listItem}>
              <Text style={GlobalStyles.listItemIcon}>⚡</Text>
              <Text style={GlobalStyles.listItemText}>Faster design iterations</Text>
            </View>
          </View>

          <View style={GlobalStyles.card}>
            <Text style={GlobalStyles.sectionTitle}>💡 Pro Tips for Best Results</Text>
            <View style={GlobalStyles.tipsList}>
              <View style={GlobalStyles.tipItem}>
                <Text style={GlobalStyles.tipBullet}>•</Text>
                <Text style={GlobalStyles.tipText}>Use high-quality, well-lit exterior photos</Text>
              </View>
              <View style={GlobalStyles.tipItem}>
                <Text style={GlobalStyles.tipBullet}>•</Text>
                <Text style={GlobalStyles.tipText}>Focus on architectural styles you admire</Text>
              </View>
              <View style={GlobalStyles.tipItem}>
                <Text style={GlobalStyles.tipBullet}>•</Text>
                <Text style={GlobalStyles.tipText}>Include color schemes that inspire you</Text>
              </View>
              <View style={GlobalStyles.tipItem}>
                <Text style={GlobalStyles.tipBullet}>•</Text>
                <Text style={GlobalStyles.tipText}>Avoid busy backgrounds or poor lighting</Text>
              </View>
            </View>
          </View>

          {!hasInspirationPhoto && (
            <View style={GlobalStyles.infoContainer}>
              <Text style={GlobalStyles.infoTitle}>No photo? No problem!</Text>
              <Text style={GlobalStyles.infoText}>
                You can skip this step and our AI will use your selected colors and design preferences to create beautiful exterior designs.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={GlobalStyles.bottomContainer}>
        <TouchableOpacity
          style={GlobalStyles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={GlobalStyles.nextButtonText}>
            {hasInspirationPhoto ? 'Continue with Photo' : 'Continue Without Photo'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Screen-specific styles only - common styles are in GlobalStyles
const styles = StyleSheet.create({
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
    backgroundColor: Theme.colors.accentLight,
    borderColor: Theme.colors.primary,
    borderStyle: 'solid',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary,
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
    color: Theme.colors.text,
    fontWeight: '600' as any,
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadTextSuccess: {
    fontSize: 20,
    color: Theme.colors.primary,
    fontWeight: '700' as any,
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: 14,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  uploadSubtextSuccess: {
    fontSize: 14,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  optionBadge: {
    backgroundColor: Theme.colors.accentLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Theme.colors.borderSecondary,
  },
  optionText: {
    fontSize: 12,
    color: Theme.colors.primary,
    fontWeight: '500' as any,
  },
  changePhotoButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  changePhotoText: {
    color: Theme.colors.textInverse,
    fontSize: 14,
    fontWeight: '600' as any,
  },
});

export default InspirationPhotoScreen;
