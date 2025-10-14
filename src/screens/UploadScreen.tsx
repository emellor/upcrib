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
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, PhotoQuality } from 'react-native-image-picker';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useImageUpload } from '../hooks/useImageUpload';

type UploadScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Upload'>;
type UploadScreenRouteProp = RouteProp<RootStackParamList, 'Upload'>;

interface UploadScreenProps {
  navigation: UploadScreenNavigationProp;
  route: UploadScreenRouteProp;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ navigation, route }) => {
  const { sessionId } = route.params;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  const { 
    uploading, 
    uploadProgress, 
    error, 
    uploadResult, 
    uploadImage, 
    triggerAnalysis 
  } = useImageUpload();

  const handleCameraPress = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as PhotoQuality,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedImage(asset.uri);
        }
      }
    });
  };

  const handlePhotoLibraryPress = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8 as PhotoQuality,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          setSelectedImage(asset.uri);
        }
      }
    });
  };

  const handleContinue = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    try {
      // For the Enhanced Style Renovation workflow, we don't need to upload to session
      // We'll pass the image URI directly through the navigation flow
      console.log('Selected image URI for Enhanced Style Renovation:', selectedImage);
      
      // Navigate to color palette screen with the image URI
      navigation.navigate('ColorPalette', { 
        sessionId, 
        imageUri: selectedImage 
      });
    } catch (err: any) {
      Alert.alert(
        'Navigation Failed', 
        err.message || 'Failed to proceed. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isProcessing = uploading || analyzing;
  const canContinue = selectedImage && !isProcessing;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} disabled={isProcessing}>
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
            
            {/* Upload Progress Overlay */}
            {uploading && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.uploadProgressText}>
                  Uploading... {uploadProgress}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Screen Info */}
        <Text style={styles.screenLabel}>Upload Your Exterior</Text>
        <Text style={styles.screenDescription}>
          Take a clear photo of the exterior space you want to transform. Our AI will analyze your space
          and help you choose the perfect color palette and design style.
        </Text>

        {/* Status Messages */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {analyzing && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#D4A574" />
            <Text style={styles.statusText}>AI is analyzing your image...</Text>
          </View>
        )}

        {uploadResult && !analyzing && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✓ Image uploaded successfully!</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, isProcessing && styles.actionButtonDisabled]} 
            onPress={handleCameraPress}
            disabled={isProcessing}
          >
            <Text style={styles.actionButtonText}>TAKE PHOTO</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, isProcessing && styles.actionButtonDisabled]} 
            onPress={handlePhotoLibraryPress}
            disabled={isProcessing}
          >
            <Text style={styles.actionButtonText}>CHOOSE FROM GALLERY</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          {isProcessing ? (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.continueButtonText}>
                {uploading ? 'Uploading...' : 'Analyzing...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.continueButtonText}>Continue to Color Palette</Text>
          )}
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
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 13,
  },
  uploadProgressText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 20,
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f3e5f5',
    borderRadius: 10,
    marginBottom: 20,
  },
  statusText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#7b1fa2',
    fontWeight: '500',
  },
  successContainer: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionButtonDisabled: {
    backgroundColor: '#E8E8E8',
  },
  actionButtonText: {
    fontSize: 12,
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
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default UploadScreen;
