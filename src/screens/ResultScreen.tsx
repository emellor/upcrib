import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type ResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Result'>;

interface ResultScreenProps {
  navigation: ResultScreenNavigationProp;
}

const ResultScreen: React.FC<ResultScreenProps> = ({ navigation }) => {
  const handleBack = () => {
    navigation.goBack();
  };

  const handleTryAnother = () => {
    navigation.navigate('Style');
  };

  const handleDownload = () => {
    // Placeholder for download functionality
    console.log('Download functionality');
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
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>↗</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Control Sliders */}
        <View style={styles.controlContainer}>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>ПОГИБЕ</Text>
            <View style={styles.slider}>
              <View style={styles.sliderTrack} />
              <View style={styles.sliderThumb} />
            </View>
          </View>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>SECOND SLIDER</Text>
            <View style={styles.slider}>
              <View style={styles.sliderTrack} />
              <View style={styles.sliderThumb} />
            </View>
          </View>
        </View>

        {/* Result Image */}
        <View style={styles.imageContainer}>
          <View style={styles.resultImage}>
            <Image
              source={{ uri: 'https://via.placeholder.com/300x400/E8F4F8/333333?text=Generated+Result' }}
              style={styles.image}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
            <Text style={styles.downloadButtonText}>Download</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tryAnotherButton} onPress={handleTryAnother}>
            <Text style={styles.tryAnotherButtonText}>Try Another Style</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 20,
    color: '#333333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  controlContainer: {
    paddingVertical: 20,
  },
  sliderContainer: {
    marginBottom: 20,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  slider: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    position: 'relative',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#D4A574',
    borderRadius: 3,
    width: '60%',
  },
  sliderThumb: {
    position: 'absolute',
    right: '40%',
    top: -4,
    width: 14,
    height: 14,
    backgroundColor: '#D4A574',
    borderRadius: 7,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultImage: {
    width: 300,
    height: 400,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  downloadButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tryAnotherButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  tryAnotherButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4A574',
  },
  bottomSpacing: {
    height: 30,
  },
});

export default ResultScreen;
