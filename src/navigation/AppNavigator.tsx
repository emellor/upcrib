import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import UploadScreen from '../screens/UploadScreen';
import ColorPaletteScreen from '../screens/ColorPaletteScreen';
import EnvironmentThemesScreen from '../screens/EnvironmentThemesScreen';
import InspirationPhotoScreen from '../screens/InspirationPhotoScreen';
import DesignStyleScreen from '../screens/DesignStyleScreen';
import ExteriorOptionsScreen from '../screens/ExteriorOptionsScreen';
import StyleScreen from '../screens/StyleScreen';
import DesignScreen from '../screens/DesignScreen';
import ResultScreen from '../screens/ResultScreen';
import MoodBoardScreen from '../screens/MoodBoardScreen';
import MoodDetailScreen from '../screens/MoodDetailScreen';

export type RootStackParamList = {
  Home: undefined;
  Upload: { sessionId: string };
  ColorPalette: { sessionId: string };
  EnvironmentThemes: { sessionId: string; selectedColors: number[] };
  InspirationPhoto: { sessionId: string; selectedColors: number[]; selectedThemes: number[] };
  DesignStyle: { sessionId: string; selectedColors: number[]; selectedThemes: number[]; hasInspirationPhoto: boolean };
  ExteriorOptions: { sessionId: string };
  Style: { sessionId: string; imageUrl?: string };
  Design: { sessionId: string; answers?: { [questionId: string]: string }; imageUrl?: string };
  Result: { sessionId: string; imageUrl?: string; answers?: { [questionId: string]: string }; originalImageUrl?: string; results?: any[] };
  MoodBoard: undefined;
  MoodDetail: { moodBoard: any };
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
        <Stack.Screen name="ColorPalette" component={ColorPaletteScreen} />
        <Stack.Screen name="EnvironmentThemes" component={EnvironmentThemesScreen} />
        <Stack.Screen name="InspirationPhoto" component={InspirationPhotoScreen} />
        <Stack.Screen name="DesignStyle" component={DesignStyleScreen} />
        <Stack.Screen name="ExteriorOptions" component={ExteriorOptionsScreen} />
        <Stack.Screen name="Style" component={StyleScreen} />
        <Stack.Screen name="Design" component={DesignScreen} />
        <Stack.Screen 
          name="Result" 
          component={ResultScreen}
          options={{
            gestureEnabled: false, // Disable swipe back gesture
            headerLeft: () => null, // Remove back button
          }}
        />
        <Stack.Screen name="MoodBoard" component={MoodBoardScreen} />
        <Stack.Screen name="MoodDetail" component={MoodDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
