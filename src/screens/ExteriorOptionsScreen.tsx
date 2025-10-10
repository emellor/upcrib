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
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type ExteriorOptionsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ExteriorOptions'
>;

type ExteriorOptionsScreenRouteProp = RouteProp<
  RootStackParamList,
  'ExteriorOptions'
>;

interface ExteriorOptionsScreenProps {
  navigation: ExteriorOptionsScreenNavigationProp;
  route: ExteriorOptionsScreenRouteProp;
}

const colorSwatches = [
  { id: 1, name: 'Classic White', color: '#FFFFFF', borderColor: '#E0E0E0' },
  { id: 2, name: 'Charcoal Gray', color: '#4A4A4A' },
  { id: 3, name: 'Navy Blue', color: '#1B365D' },
  { id: 4, name: 'Forest Green', color: '#2E5D31' },
  { id: 5, name: 'Warm Beige', color: '#D4B896' },
  { id: 6, name: 'Brick Red', color: '#A0522D' },
  { id: 7, name: 'Sage Green', color: '#9CAF88' },
  { id: 8, name: 'Cream', color: '#F5F5DC' },
];

const themes = [
  { id: 1, name: 'Coastal', emoji: '🏖️', description: 'Relaxed beachside vibes' },
  { id: 2, name: 'Mountain', emoji: '🏔️', description: 'Rustic cabin aesthetics' },
  { id: 3, name: 'Urban', emoji: '🏙️', description: 'Modern city living' },
  { id: 4, name: 'Countryside', emoji: '🌾', description: 'Traditional farmhouse' },
];

const designStyles = [
  { name: 'Modern', icon: '🏢', description: 'Clean lines and minimal design' },
  { name: 'Traditional', icon: '🏛️', description: 'Classic and timeless appeal' },
  { name: 'Contemporary', icon: '✨', description: 'Current trends and sleek style' },
  { name: 'Minimalist', icon: '⚪', description: 'Simple and uncluttered' },
  { name: 'Industrial', icon: '🏭', description: 'Raw materials and urban edge' },
  { name: 'Scandinavian', icon: '🌲', description: 'Light woods and cozy comfort' },
];

const ExteriorOptionsScreen: React.FC<ExteriorOptionsScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionId } = route.params;
  const [selectedColors, setSelectedColors] = useState<number[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<number[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern');
  const [hasInspirationPhoto, setHasInspirationPhoto] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleColorSelection = (colorId: number) => {
    setSelectedColors(prev =>
      prev.includes(colorId)
        ? prev.filter(id => id !== colorId)
        : [...prev, colorId]
    );
  };

  const toggleThemeSelection = (themeId: number) => {
    setSelectedThemes(prev =>
      prev.includes(themeId)
        ? prev.filter(id => id !== themeId)
        : [...prev, themeId]
    );
  };

  const handleAddInspirationPhoto = () => {
    // TODO: Implement image picker
    Alert.alert('Feature Coming Soon', 'Photo upload functionality will be added soon.');
    setHasInspirationPhoto(true);
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      Alert.alert(
        'Select Your Preferences',
        'Please choose at least one color, theme, or add an inspiration photo to generate your design.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Navigate to results screen with dummy data
      navigation.navigate('Result', {
        sessionId,
        results: [
          { id: 1, imageUrl: 'dummy-result-1.jpg' },
          { id: 2, imageUrl: 'dummy-result-2.jpg' },
          { id: 3, imageUrl: 'dummy-result-3.jpg' },
        ],
      });
    }, 2000);
  };

  const canGenerate = selectedColors.length > 0 || selectedThemes.length > 0 || hasInspirationPhoto;
  const selectionCount = selectedColors.length + selectedThemes.length + (hasInspirationPhoto ? 1 : 0);

  return (
    <SafeAreaView style={componentStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={componentStyles.header}>
        <TouchableOpacity 
          style={componentStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={componentStyles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={componentStyles.title}>Exterior Design Options</Text>
        <View style={componentStyles.headerSpacer} />
      </View>

      <ScrollView style={componentStyles.content} showsVerticalScrollIndicator={false}>
        {/* Color Swatches Section */}
        <View style={componentStyles.section}>
          <Text style={componentStyles.sectionTitle}>Color Palette</Text>
          <Text style={componentStyles.sectionSubtitle}>Choose colors that inspire your exterior design</Text>
          <View style={componentStyles.colorGrid}>
            {colorSwatches.map(swatch => (
              <View key={swatch.id} style={{ alignItems: 'center', marginBottom: 16 }}>
                <TouchableOpacity
                  style={[
                    componentStyles.colorSwatch,
                    { backgroundColor: swatch.color },
                    swatch.borderColor ? { borderColor: swatch.borderColor } : null,
                    selectedColors.includes(swatch.id) && componentStyles.selectedSwatch,
                  ]}
                  onPress={() => toggleColorSelection(swatch.id)}
                >
                  {selectedColors.includes(swatch.id) && (
                    <Text style={componentStyles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
                <Text style={componentStyles.colorLabel}>
                  {swatch.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Themes Section */}
        <View style={componentStyles.section}>
          <Text style={componentStyles.sectionTitle}>Environment Themes</Text>
          <Text style={componentStyles.sectionSubtitle}>Choose themes that inspire your design vision</Text>
          <View style={componentStyles.themeGrid}>
            {themes.map(theme => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  componentStyles.themeCard,
                  selectedThemes.includes(theme.id) && componentStyles.selectedTheme,
                ]}
                onPress={() => toggleThemeSelection(theme.id)}
              >
                <Text style={componentStyles.themeEmoji}>{theme.emoji}</Text>
                <Text style={componentStyles.themeName}>{theme.name}</Text>
                <Text style={componentStyles.themeDescription}>{theme.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Inspiration Photo Section */}
        <View style={componentStyles.section}>
          <Text style={componentStyles.sectionTitle}>Inspiration Photo</Text>
          <Text style={componentStyles.sectionSubtitle}>Upload a reference image to guide your design direction</Text>
          <TouchableOpacity
            style={[componentStyles.photoUpload, hasInspirationPhoto && componentStyles.photoUploaded]}
            onPress={handleAddInspirationPhoto}
          >
            {hasInspirationPhoto ? (
              <>
                <Text style={componentStyles.uploadIcon}>✅</Text>
                <Text style={componentStyles.uploadText}>Inspiration Photo Added</Text>
              </>
            ) : (
              <>
                <Text style={componentStyles.uploadIcon}>📸</Text>
                <Text style={componentStyles.uploadText}>Add Inspiration Photo</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Style Section */}
        <View style={componentStyles.section}>
          <Text style={componentStyles.sectionTitle}>Design Style</Text>
          <Text style={componentStyles.sectionSubtitle}>Select your preferred architectural style</Text>
          <View style={componentStyles.styleGrid}>
            {designStyles.map(style => (
              <TouchableOpacity
                key={style.name}
                style={[
                  componentStyles.styleCard,
                  selectedStyle === style.name && componentStyles.selectedStyle,
                ]}
                onPress={() => setSelectedStyle(style.name)}
              >
                <Text style={componentStyles.styleIcon}>{style.icon}</Text>
                <Text style={[
                  componentStyles.styleText,
                  selectedStyle === style.name && componentStyles.selectedStyleText,
                ]}>
                  {style.name}
                </Text>
                <Text style={[
                  componentStyles.styleDescription,
                  selectedStyle === style.name && componentStyles.selectedStyleDescription,
                ]}>
                  {style.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Generate Button */}
      <View style={componentStyles.bottomContainer}>
        {selectionCount > 0 && (
          <Text style={componentStyles.selectionSummary}>
            {selectionCount} preference{selectionCount !== 1 ? 's' : ''} selected
          </Text>
        )}
        <TouchableOpacity
          style={[componentStyles.generateButton, !canGenerate && componentStyles.generateButtonDisabled]}
          onPress={handleGenerate}
          disabled={loading}
        >
          <Text style={[componentStyles.generateButtonText, !canGenerate && componentStyles.generateButtonTextDisabled]}>
            {loading ? 'Creating Your Design...' : canGenerate ? 'Generate Design' : 'Select Preferences to Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const componentStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
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
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  section: {
    marginBottom: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'transparent',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedSwatch: {
    borderColor: '#007AFF',
    transform: [{ scale: 1.1 }],
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorLabels: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  colorLabel: {
    width: 60,
    fontSize: 11,
    textAlign: 'center',
    color: '#666666',
    fontWeight: '500',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  themeCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 120,
  },
  selectedTheme: {
    backgroundColor: '#E8F4FD',
    borderColor: '#007AFF',
  },
  themeEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  themeDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
  photoUpload: {
    height: 120,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoUploaded: {
    backgroundColor: '#E8F4FD',
    borderColor: '#007AFF',
    borderStyle: 'solid',
  },
  uploadIcon: {
    fontSize: 32,
    color: '#666666',
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  styleCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 100,
    alignItems: 'center',
  },
  selectedStyle: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  styleIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  styleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  selectedStyleText: {
    color: '#FFFFFF',
  },
  styleDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
    textAlign: 'center',
  },
  selectedStyleDescription: {
    color: '#CCCCCC',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  selectionSummary: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  generateButton: {
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
  generateButtonDisabled: {
    backgroundColor: '#E0E0E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  generateButtonTextDisabled: {
    color: '#A0A0A0',
  },
});

export default ExteriorOptionsScreen;
