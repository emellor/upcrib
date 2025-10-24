/**
 * HomeStyle AI - Interior Design App
 */

import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import backgroundPollingService from './src/services/backgroundPollingService';

function App(): React.JSX.Element {
  useEffect(() => {
    backgroundPollingService.initialize().catch(error => {
      console.error('Failed to initialize background polling:', error);
    });

    return () => {
      backgroundPollingService.stopAll();
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <AppNavigator />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default App;
