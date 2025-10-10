import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useSession } from '../hooks/useSession';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { loading, error, createSession } = useSession();
  const [activeTab, setActiveTab] = useState<'interior' | 'exterior' | 'garden'>('exterior');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleTabPress = (tab: 'interior' | 'exterior' | 'garden') => {
    setActiveTab(tab);
    
    // Calculate scroll position based on card height and spacing
    const cardHeight = 220; // Approximate card height including margins
    let scrollToY = 0;
    
    switch (tab) {
      case 'exterior':
        scrollToY = 0;
        break;
      case 'interior':
        scrollToY = cardHeight;
        break;
      case 'garden':
        scrollToY = cardHeight * 2;
        break;
    }
    
    scrollViewRef.current?.scrollTo({
      y: scrollToY,
      animated: true,
    });
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const layoutHeight = event.nativeEvent.layoutMeasurement.height;
    const cardHeight = 220; // Same as above
    
    // Check if scrolled to bottom
    const isAtBottom = scrollY + layoutHeight >= contentHeight - 10; // 10px threshold
    
    // Determine which section is most in focus
    if (isAtBottom) {
      setActiveTab('garden');
    } else if (scrollY < cardHeight * 0.5) {
      setActiveTab('exterior');
    } else if (scrollY < cardHeight * 1.5) {
      setActiveTab('interior');
    } else {
      setActiveTab('garden');
    }
  };

  const handleStartDesigning = async () => {
    try {
      const session = await createSession();
      navigation.navigate('Upload', { sessionId: session.sessionId });
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.message || 'Failed to start renovation session. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleExteriorDesign = async () => {
    try {
      const session = await createSession();
      navigation.navigate('ColorPalette', { sessionId: session.sessionId });
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.message || 'Failed to start exterior design session. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
        <Text style={styles.logo}>upCrib</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryTabs}>
        <TouchableOpacity 
          style={activeTab === 'exterior' ? styles.activeTab : styles.inactiveTab}
          onPress={() => handleTabPress('exterior')}
        >
          <Text style={activeTab === 'exterior' ? styles.activeTabText : styles.inactiveTabText}>
            Exterior Design
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={activeTab === 'interior' ? styles.activeTab : styles.inactiveTab}
          onPress={() => handleTabPress('interior')}
        >
          <Text style={activeTab === 'interior' ? styles.activeTabText : styles.inactiveTabText}>
            Interior Design
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={activeTab === 'garden' ? styles.activeTab : styles.inactiveTab}
          onPress={() => handleTabPress('garden')}
        >
          <Text style={activeTab === 'garden' ? styles.activeTabText : styles.inactiveTabText}>
            Garden Design
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Exterior Design Card */}
        <TouchableOpacity 
          style={styles.designCard}
          onPress={handleExteriorDesign}
          disabled={loading}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Exterior Design</Text>
            <Text style={styles.cardArrow}>→</Text>
          </View>
          <Text style={styles.cardSubtitle}>Transform your exterior space</Text>
          <View style={styles.cardImages}>
            <View style={styles.fullWidthImage}>
              <Image 
                source={require('../assets/images/transform-exterior.png')}
                style={styles.exteriorImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Interior Design Card */}
        <TouchableOpacity style={styles.designCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Interior Design</Text>
            <Text style={styles.cardArrow}>→</Text>
          </View>
          <Text style={styles.cardSubtitle}>Transform your interior space</Text>
          <View style={styles.cardImages}>
            <Image 
              source={require('../assets/images/transform-interior.png')}
              style={styles.interiorImage}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>

        {/* Garden Design Card */}
        <TouchableOpacity style={styles.designCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Garden Design</Text>
            <Text style={styles.cardArrow}>→</Text>
          </View>
          <Text style={styles.cardSubtitle}>Transform your garden</Text>
          <View style={styles.cardImages}>
            <View style={styles.fullWidthImage}>
              <Image 
                source={require('../assets/images/transform-garden.png')}
                style={styles.gardenImage}
                resizeMode="cover"
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </View>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('MoodBoard')}
        >
          <Text style={styles.navIcon}>🔍</Text>
          <Text style={styles.navLabel}>Mood Board</Text>
        </TouchableOpacity>
        <View style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>History</Text>
        </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  logo: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activeTab: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  inactiveTabText: {
    color: '#999999',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  designCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  cardArrow: {
    fontSize: 18,
    color: '#000000',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
  },
  cardImages: {
    flexDirection: 'row',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
  },
  leftImage: {
    flex: 1,
    marginRight: 8,
  },
  rightImage: {
    flex: 1,
    marginLeft: 8,
  },
  fullWidthImage: {
    flex: 1,
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
  },
  exteriorImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  interiorImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  gardenImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  navLabel: {
    fontSize: 12,
    color: '#666666',
  },
});

export default HomeScreen;
