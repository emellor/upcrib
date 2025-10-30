import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type EnvironmentThemesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EnvironmentThemes'
>;

type EnvironmentThemesScreenRouteProp = RouteProp<
  RootStackParamList,
  'EnvironmentThemes'
>;

interface EnvironmentThemesScreenProps {
  navigation: EnvironmentThemesScreenNavigationProp;
  route: EnvironmentThemesScreenRouteProp;
}

const themes = [
  { id: 1, name: 'Med', image: require('../assets/images/Mediterranean_Icon.png'), description: 'Coastal elegance' },
  { id: 2, name: 'Alpine', image: require('../assets/images/Alpine_Icon.png'), description: 'Mountain charm' },
  { id: 3, name: 'Nordic', image: require('../assets/images/Nordic_Icon.png'), description: 'Scandinavian style' },
  { id: 4, name: 'Tuscan', image: require('../assets/images/Tuscan_Icon.png'), description: 'Italian countryside' },
  { id: 5, name: 'Riviera', image: require('../assets/images/French_Riviera_Icon.png'), description: 'Côte d\'Azur luxury' },
  { id: 6, name: 'English', image: require('../assets/images/English_Garden_Icon.png'), description: 'Classic British' },
  { id: 7, name: 'Colonial', image: require('../assets/images/Dutch_Colonial_Icon.png'), description: 'Netherlands style' },
  { id: 8, name: 'Forest', image: require('../assets/images/German_Forest_Icon.png'), description: 'Black Forest feel' },
  { id: 9, name: 'Villa', image: require('../assets/images/Spanish_Villa_Icon.png'), description: 'Iberian elegance' },
];

const EnvironmentThemesScreen: React.FC<EnvironmentThemesScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionId, selectedColors } = route.params;
  const [selectedThemes, setSelectedThemes] = useState<number[]>([]);

  const toggleThemeSelection = (themeId: number) => {
    setSelectedThemes(prev =>
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleNext = () => {
    navigation.navigate('InspirationPhoto', { 
      sessionId,
      selectedColors,
      selectedThemes
    });
  };

  const handleSkip = () => {
    navigation.navigate('InspirationPhoto', { 
      sessionId,
      selectedColors,
      selectedThemes: []
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.stepIndicator}>Step 2 of 4</Text>
          <Text style={styles.title}>Environment Themes</Text>
        </View>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '50%' }]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>
          Choose themes that inspire your design direction
        </Text>
        
        <View style={styles.themeGrid}>
          {themes.map(theme => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                selectedThemes.includes(theme.id) && styles.selectedTheme,
              ]}
              onPress={() => toggleThemeSelection(theme.id)}
            >
              <Image 
                source={theme.image} 
                style={styles.themeImage}
                resizeMode="contain"
              />
              <Text 
                style={styles.themeName}
                //numberOfLines={1}
                // adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {theme.name}
              </Text>
              <Text 
                style={styles.themeDescription}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.9}
              >
                {theme.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedThemes.length > 0 && (
          <View style={styles.selectionSummary}>
            <Text style={styles.selectionText}>
              {selectedThemes.length} theme{selectedThemes.length !== 1 ? 's' : ''} selected
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.nextButton, selectedThemes.length === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
        >
          <Text style={[styles.nextButtonText, selectedThemes.length === 0 && styles.nextButtonTextDisabled]}>
            {selectedThemes.length > 0 ? 'Continue' : 'Skip for now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#F8F8F8',
  },
  backIcon: {
    fontSize: 20,
    color: '#000000',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  skipButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  themeCard: {
    width: '30%',
    aspectRatio: 0.85,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedTheme: {
    backgroundColor: '#E8F4FD',
    borderColor: '#007AFF',
    transform: [{ scale: 1.02 }],
  },
  themeImage: {
    width: 70,
    height: 70,
    marginBottom: 0,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 12,
  },
  selectionSummary: {
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
  },
  selectionText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nextButtonTextDisabled: {
    color: '#A0A0A0',
  },
});

export default EnvironmentThemesScreen;
