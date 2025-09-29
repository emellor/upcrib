import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import StyleScreen from '../screens/StyleScreen';
import DesignScreen from '../screens/DesignScreen';
import ResultScreen from '../screens/ResultScreen';

export type RootStackParamList = {
  Home: undefined;
  Upload: { sessionId: string };
  Style: { sessionId: string; imageUrl?: string };
  Design: { sessionId: string; answers?: { [questionId: string]: string }; imageUrl?: string };
  Result: { sessionId: string; imageUrl?: string; answers?: { [questionId: string]: string }; originalImageUrl?: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="Style" component={StyleScreen} />
        <Stack.Screen name="Design" component={DesignScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
