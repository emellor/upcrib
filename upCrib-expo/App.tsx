import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    // Hide the splash screen immediately when app is ready
    SplashScreen.hideAsync();
  }, []);

  return <AppNavigator />;
}
