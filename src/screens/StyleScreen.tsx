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
import { RootStackParamList } from '../navigation/AppNavigator';

type StyleScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Style'>;

interface StyleScreenProps {
  navigation: StyleScreenNavigationProp;
}

const styles_data = [
  { id: 1, name: 'Modern', color: '#7FB3D3', image: 'https://via.placeholder.com/150x150/7FB3D3/FFFFFF?text=Modern' },
  { id: 2, name: 'Minimalist', color: '#E8E8E8', image: 'https://via.placeholder.com/150x150/E8E8E8/333333?text=Minimal' },
  { id: 3, name: 'Scandinavian', color: '#F5F5DC', image: 'https://via.placeholder.com/150x150/F5F5DC/333333?text=Scandi' },
  { id: 4, name: 'Industrial', color: '#8B4513', image: 'https://via.placeholder.com/150x150/8B4513/FFFFFF?text=Industrial' },
  { id: 5, name: 'Bohemian', color: '#DDA0DD', image: 'https://via.placeholder.com/150x150/DDA0DD/333333?text=Boho' },
  { id: 6, name: 'Traditional', color: '#8B0000', image: 'https://via.placeholder.com/150x150/8B0000/FFFFFF?text=Traditional' },
];

const StyleScreen: React.FC<StyleScreenProps> = ({ navigation }) => {
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);

  const handleStyleSelect = (styleId: number) => {
    setSelectedStyle(styleId);
  };

  const handleContinue = () => {
    navigation.navigate('Result');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerLogoContainer}>
          <Image 
            source={require('../images/logo.png')} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Style Selection Grid */}
        <View style={styles.styleGrid}>
          {styles_data.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleItem,
                selectedStyle === style.id && styles.selectedStyleItem
              ]}
              onPress={() => handleStyleSelect(style.id)}
            >
              <Image source={{ uri: style.image }} style={styles.styleImage} />
              <Text style={styles.styleName}>{style.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Style Selection Label */}
        <Text style={styles.sectionTitle}>Style Selection</Text>
        
        {/* Additional Style Options */}
        <View style={styles.additionalStyles}>
          <TouchableOpacity style={styles.additionalStyleItem}>
            <Text style={styles.additionalStyleText}>Boho-chic Decor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.additionalStyleItem}>
            <Text style={styles.additionalStyleText}>AI Modern</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.additionalStyleItem}>
            <Text style={styles.additionalStyleText}>Neon Classic</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedStyle && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedStyle}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  headerLogoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerLogo: {
    width: 80,
    height: 30,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 20,
    color: '#333333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  styleItem: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 15,
    backgroundColor: '#F8F8F8',
    padding: 15,
    alignItems: 'center',
  },
  selectedStyleItem: {
    borderWidth: 2,
    borderColor: '#D4A574',
  },
  styleImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginBottom: 10,
  },
  styleName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 20,
  },
  additionalStyles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  additionalStyleItem: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  additionalStyleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  continueButton: {
    backgroundColor: '#D4A574',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default StyleScreen;
