import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Dimensions,
  Text,
} from 'react-native';
import Video from 'react-native-video'; // Re-enabling video
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Set status bar to hidden for full-screen effect
    StatusBar.setHidden(true);
    
    // Fallback timer in case video doesn't work
    const fallbackTimer = setTimeout(() => {
      console.log('📱 [SplashScreen] Fallback timer - showing text splash');
      setShowFallback(true);
    }, 1000); // Show fallback after 1 second if video hasn't started
    
    // Navigation timer
    const navTimer = setTimeout(() => {
      console.log('📱 [SplashScreen] Navigating to Home');
      navigation.replace('Home');
    }, 3500);
    
    return () => {
      clearTimeout(fallbackTimer);
      clearTimeout(navTimer);
      StatusBar.setHidden(false);
    };
  }, [navigation]);

  const handleVideoError = (error: any) => {
    console.error('❌ [SplashScreen] Video error:', error);
    setShowFallback(true);
  };

  const handleVideoLoad = () => {
    console.log('📱 [SplashScreen] Video loaded successfully');
  };

  if (showFallback) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        <View style={styles.fallbackContainer}>
          <Text style={styles.brandText}>HomeStyle AI</Text>
          <Text style={styles.taglineText}>Transform Your Space</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <Video
        source={require('../assets/video/Create_a_3_5_second_mobile_app_intro_animation_tha.mp4')}
        style={styles.video}
        resizeMode="cover"
        repeat={false}
        paused={false}
        onEnd={() => navigation.replace('Home')}
        onError={handleVideoError}
        onLoad={handleVideoLoad}
        muted={true}
        playInBackground={false}
        playWhenInactive={false}
      />
      
      {/* Fallback text overlay in case video is transparent or not visible */}
      <View style={styles.overlayContainer}>
        <Text style={styles.overlayText}>UpCrib</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  fallbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  taglineText: {
    fontSize: 18,
    color: '#CCCCCC',
    textAlign: 'center',
    fontWeight: '300',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  overlayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    opacity: 0.8,
  },
});

export default SplashScreen;