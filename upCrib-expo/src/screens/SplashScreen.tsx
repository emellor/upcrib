import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  
  const player = useVideoPlayer(require('../../assets/video/Create_a_3_5_second_mobile_app_intro_animation_tha.mp4'), (player) => {
    player.loop = false;
    player.muted = true;
    console.log('📱 [SplashScreen] Player initialized, starting playback');
    player.play();
  });

  useEffect(() => {
    console.log('📱 [SplashScreen] Component mounted');
    
    // Log player status changes
    const statusSubscription = player.addListener?.('statusChange', (payload) => {
      console.log(`📱 [SplashScreen] Status changed:`, payload);
    });

    // Log playback position every 500ms
    const positionInterval = setInterval(() => {
      console.log(`📱 [SplashScreen] Playback position: ${player.currentTime?.toFixed(2)}s / duration: ${player.duration?.toFixed(2)}s`);
    }, 500);

    // Listen for video end — navigate ONLY when we see this event
    const playToEndSubscription = player.addListener?.('playToEnd', () => {
      try {
        console.log('📱 [SplashScreen] ✅ playToEnd event received, navigating to Home');
        clearInterval(positionInterval);
        navigation.replace('Home');
      } catch (err) {
        console.error('❌ [SplashScreen] Error navigating after video end', err);
      }
    });

    return () => {
      console.log('📱 [SplashScreen] Component unmounting, cleaning up');
      clearInterval(positionInterval);
      statusSubscription?.remove?.();
      playToEndSubscription?.remove?.();
    };
  }, [navigation, player]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
      
      {/* Overlay text to ensure branding is visible */}
      <View style={styles.overlayContainer}>
        <Text style={styles.overlayText}>HomeStyle AI</Text>
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
