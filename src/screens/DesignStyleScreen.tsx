import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type DesignStyleScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'DesignStyle'
>;

type DesignStyleScreenRouteProp = RouteProp<
  RootStackParamList,
  'DesignStyle'
>;

interface DesignStyleScreenProps {
  navigation: DesignStyleScreenNavigationProp;
  route: DesignStyleScreenRouteProp;
}

const designStyles = [
  { name: 'Modern', description: 'Clean lines and minimal design', emoji: '🏢' },
  { name: 'Traditional', description: 'Classic and timeless appeal', emoji: '🏛️' },
  { name: 'Contemporary', description: 'Current trends and sleek style', emoji: '✨' },
  { name: 'Minimalist', description: 'Simple and uncluttered', emoji: '⚪' },
  { name: 'Industrial', description: 'Raw materials and urban edge', emoji: '🏭' },
  { name: 'Scandinavian', description: 'Light woods and cozy comfort', emoji: '🌲' },
];

const DesignStyleScreen: React.FC<DesignStyleScreenProps> = ({
  navigation,
  route,
}) => {
  const { sessionId, selectedColors, selectedThemes, hasInspirationPhoto } = route.params;
  const [selectedStyle, setSelectedStyle] = useState<string>('Modern');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
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
    }, 3000);
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
          <Text style={styles.stepIndicator}>Step 4 of 4</Text>
          <Text style={styles.title}>Design Style</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Select your preferred architectural style
        </Text>
        
        <View style={styles.styleGrid}>
          {designStyles.map(style => (
            <TouchableOpacity
              key={style.name}
              style={[
                styles.styleCard,
                selectedStyle === style.name && styles.selectedStyle,
              ]}
              onPress={() => setSelectedStyle(style.name)}
            >
              <Text style={styles.styleEmoji}>{style.emoji}</Text>
              <Text style={[
                styles.styleText,
                selectedStyle === style.name && styles.selectedStyleText,
              ]}>
                {style.name}
              </Text>
              <Text style={[
                styles.styleDescription,
                selectedStyle === style.name && styles.selectedStyleDescription,
              ]}>
                {style.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Design Preferences:</Text>
          <Text style={styles.summaryText}>
            • {selectedColors?.length || 0} colors • {selectedThemes?.length || 0} themes • {selectedStyle} style
            {hasInspirationPhoto ? ' • Inspiration photo' : ''}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.generateButton}
          onPress={handleGenerate}
          disabled={loading}
        >
          <Text style={styles.generateButtonText}>
            {loading ? 'Creating Your Design...' : 'Generate Design'}
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
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  styleCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    alignItems: 'center',
    minHeight: 140,
  },
  selectedStyle: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  styleEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  styleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
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
  },
  summaryContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
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
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default DesignStyleScreen;
