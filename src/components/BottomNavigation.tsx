import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface BottomNavigationProps {
  activeTab?: 'home' | 'explore' | 'history';
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab = 'home' }) => {
  const navigation = useNavigation<NavigationProp>();

  const handleHomePress = () => {
    navigation.navigate('Home');
  };

  const handleExplorePress = () => {
    // For now, just show an alert since we don't have an Explore screen yet
    // You can implement this later
    console.log('Explore pressed');
  };

  const handleHistoryPress = () => {
    // For now, just show an alert since we don't have a History screen yet
    // You can implement this later
    console.log('History pressed');
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={handleHomePress}
      >
        <Text style={[styles.navIcon, activeTab === 'home' && styles.activeNavIcon]}>🏠</Text>
        <Text style={[styles.navLabel, activeTab === 'home' && styles.activeNavLabel]}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={handleExplorePress}
      >
        <Text style={[styles.navIcon, activeTab === 'explore' && styles.activeNavIcon]}>🔍</Text>
        <Text style={[styles.navLabel, activeTab === 'explore' && styles.activeNavLabel]}>Mood Board</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.navItem} 
        onPress={handleHistoryPress}
      >
        <Text style={[styles.navIcon, activeTab === 'history' && styles.activeNavIcon]}>👤</Text>
        <Text style={[styles.navLabel, activeTab === 'history' && styles.activeNavLabel]}>History</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  activeNavIcon: {
    // You can add different styling for active state if needed
  },
  navLabel: {
    fontSize: 12,
    color: '#666666',
  },
  activeNavLabel: {
    color: '#000000',
    fontWeight: '600',
  },
});

export default BottomNavigation;
