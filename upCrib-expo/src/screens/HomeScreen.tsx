import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Theme } from '../constants/theme';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HomeStyle AI</Text>
        <Text style={styles.subtitle}>Transform Your Space with AI</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcomeText}>
          Welcome to your new Expo-powered HomeStyle AI app!
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Upload', { sessionId: Date.now().toString() })}
        >
          <Text style={styles.buttonText}>Start Designing</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    ...Theme.buttons.primary,
    width: '100%',
  },
  buttonText: {
    ...Theme.buttons.primaryText,
  },
});

export default HomeScreen;
