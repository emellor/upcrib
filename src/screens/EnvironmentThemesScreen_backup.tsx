import React, { useState } froconst themes = [
  { id: 1, name: 'Mediterranean', image: require('../assets/images/Mediterranean_Icon.png'), description: 'Coastal elegance' },
  { id: 2, name: 'Alpine', image: require('../assets/images/Alpine_Icon.png'), description: 'Mountain charm' },
  { id: 3, name: 'Nordic', image: require('../assets/images/Nordic_Icon.png'), description: 'Scandinavian style' },
  { id: 4, name: 'Tuscan', image: require('../assets/images/Tuscan_Icon.png'), description: 'Italian countryside' },
  { id: 5, name: 'French Riviera', image: require('../assets/images/French_Riviera_Icon.png'), description: 'Côte d\'Azur luxury' },
  { id: 6, name: 'English Garden', image: require('../assets/images/English_Garden_Icon.png'), description: 'Classic British' },
  { id: 7, name: 'Dutch Colonial', image: require('../assets/images/Dutch_Colonial_Icon.png'), description: 'Netherlands style' },
  { id: 8, name: 'German Forest', image: require('../assets/images/German_Forest_Icon.png'), description: 'Black Forest feel' },
  { id: 9, name: 'Spanish Villa', image: require('../assets/images/Spanish_Villa_Icon .png'), description: 'Iberian elegance' },
];import {
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
  { id: 1, name: 'Mediterranean', emoji: '🏖️', description: 'Coastal elegance' },
  { id: 2, name: 'Alpine', emoji: '🏔️', description: 'Mountain charm' },
  { id: 3, name: 'Nordic', emoji: '❄️', description: 'Scandinavian style' },
  { id: 4, name: 'Tuscan', emoji: '�', description: 'Italian countryside' },
  { id: 5, name: 'French Riviera', emoji: '�', description: 'Côte d\'Azur luxury' },
  { id: 6, name: 'English Garden', emoji: '�', description: 'Classic British' },
  { id: 7, name: 'Dutch Colonial', emoji: '�', description: 'Netherlands style' },
  { id: 8, name: 'German Forest', emoji: '🌲', description: 'Black Forest feel' },
  { id: 9, name: 'Spanish Villa', emoji: '�️', description: 'Iberian elegance' },
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
              <Text style={styles.themeEmoji}>{theme.emoji}</Text>
              <Text 
                style={styles.themeName}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.8}
              >
                {theme.name}
              </Text>
              <Text 
                style={styles.themeDescription}
                numberOfLines={2}
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
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
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
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  themeCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
    alignItems: 'center',
    minHeight: 140,
  },
  selectedTheme: {
    backgroundColor: '#E8F4FD',
    borderColor: '#007AFF',
  },
  themeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 12,
  },
  selectionSummary: {
    marginTop: 32,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
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
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default EnvironmentThemesScreen;
