import React, { useState } from 'react';
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
import { RootStackParamList } from '../navigation/AppNavigator';

type UploadScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Upload'>;

interface UploadScreenProps {
  navigation: UploadScreenNavigationProp;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleCameraPress = () => {
    // Placeholder for camera functionality
    Alert.alert(
      'Camera',
      'Camera functionality will be implemented here',
      [{ text: 'OK' }]
    );
  };

  const handlePhotoLibraryPress = () => {
    // Placeholder for photo library functionality
    Alert.alert(
      'Photo Library',
      'Photo library functionality will be implemented here',
      [{ text: 'OK' }]
    );
  };

  const handleContinue = () => {
    navigation.navigate('Style');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
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
        {/* Upload Area */}
        <View style={styles.uploadContainer}>
          <View style={styles.uploadArea}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.placeholderContent}>
                <View style={styles.cameraIcon}>
                  <Text style={styles.cameraIconText}>📷</Text>
                </View>
                <Text style={styles.uploadText}>Upload a photo of your space</Text>
                <Text style={styles.uploadSubtext}>Take a photo or choose from your gallery</Text>
              </View>
            )}
          </View>
        </View>

        {/* Style Upload screen label */}
        <Text style={styles.screenLabel}>Style Upload screen</Text>
        <Text style={styles.screenDescription}>
          Please take a photo or select a photo from your phone so we can
          help you visualize your space with our different design styles.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCameraPress}>
            <Text style={styles.actionButtonText}>COMPOSIO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handlePhotoLibraryPress}>
            <Text style={styles.actionButtonText}>PHONE MEMO</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !selectedImage && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedImage}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
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
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  uploadContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  uploadArea: {
    width: 300,
    height: 200,
    borderRadius: 15,
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B8E6F0',
    borderStyle: 'dashed',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  placeholderContent: {
    alignItems: 'center',
  },
  cameraIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  cameraIconText: {
    fontSize: 24,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 5,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  screenLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 10,
  },
  screenDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30,
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default UploadScreen;
