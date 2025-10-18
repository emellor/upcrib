/**
 * upCrib - Interior Design App
 * https://github.com/facebook/react-native
 *
 * @format
 */

console.log('🔥🔥🔥 APP.TSX IS LOADING - NEW CODE DETECTED 🔥🔥🔥');

import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import backgroundPollingService from './src/services/backgroundPollingService';

function App(): React.JSX.Element {
  console.log('🔥 App component rendering...');
  
  useEffect(() => {
    console.log('🚀 [App] Starting upCrib app...');
    
    // Initialize background polling service on app start
    backgroundPollingService.initialize().catch(error => {
      console.error('❌ [App] Failed to initialize background polling:', error);
    });

    // Cleanup on unmount
    return () => {
      console.log('🛑 [App] Cleaning up background polling...');
      backgroundPollingService.stopAll();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />
      <AppNavigator />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default App;
