import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import StyleScreen from '../screens/StyleScreen';
import DesignScreen from '../screens/DesignScreen';
import DesignStyleScreen from '../screens/DesignStyleScreen';
import ColorPaletteScreen from '../screens/ColorPaletteScreen';
import EnvironmentThemesScreen from '../screens/EnvironmentThemesScreen';
import ExteriorOptionsScreen from '../screens/ExteriorOptionsScreen';
import InspirationPhotoScreen from '../screens/InspirationPhotoScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import MoodBoardScreen from '../screens/MoodBoardScreen';
import MoodDetailScreen from '../screens/MoodDetailScreen';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Upload: { sessionId?: string };
  Style: { sessionId: string; imageUrl?: string };
  Design: { sessionId: string; answers?: { [questionId: string]: string }; imageUrl?: string };
  DesignStyle: { sessionId: string; imageUrl?: string };
  ColorPalette: { sessionId: string; imageUrl?: string };
  EnvironmentThemes: { sessionId: string; imageUrl?: string };
  ExteriorOptions: { sessionId: string; imageUrl?: string };
  InspirationPhoto: { sessionId: string };
  Result: { sessionId: string; imageUrl?: string; answers?: { [questionId: string]: string }; originalImageUrl?: string };
  History: undefined;
  MoodBoard: undefined;
  MoodDetail: { moodId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="Style" component={StyleScreen} />
        <Stack.Screen name="Design" component={DesignScreen} />
        <Stack.Screen name="DesignStyle" component={DesignStyleScreen} />
        <Stack.Screen name="ColorPalette" component={ColorPaletteScreen} />
        <Stack.Screen name="EnvironmentThemes" component={EnvironmentThemesScreen} />
        <Stack.Screen name="ExteriorOptions" component={ExteriorOptionsScreen} />
        <Stack.Screen name="InspirationPhoto" component={InspirationPhotoScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="MoodBoard" component={MoodBoardScreen} />
        <Stack.Screen name="MoodDetail" component={MoodDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

