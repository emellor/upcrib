import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Theme } from '../constants/theme';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface BottomNavigationProps {
  activeTab?: 'Home' | 'MoodBoard' | 'History';
}

interface NavItem {
  key: 'Home' | 'MoodBoard' | 'History';
  icon: string;
  label: string;
  route?: keyof RootStackParamList;
  action?: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab = 'Home' }) => {
  const navigation = useNavigation<NavigationProp>();

  const navItems: NavItem[] = [
    {
      key: 'Home',
      icon: '🏠',
      label: 'Home',
      route: 'Home',
    },
    {
      key: 'MoodBoard',
      icon: '🎨', // Changed from 🔍 to a more appropriate mood board icon
      label: 'Mood Board',
      route: 'MoodBoard',
    },
    {
      key: 'History',
      icon: '📋', // Changed from 👤 to a more appropriate history icon
      label: 'History',
      route: 'History',
    },
  ];

  const handleNavPress = (item: NavItem) => {
    if (item.key === activeTab) {
      return; // Don't navigate if already on active tab
    }

    if (item.route) {
      // TypeScript-safe navigation
      if (item.route === 'Home') {
        navigation.navigate('Home');
      } else if (item.route === 'MoodBoard') {
        navigation.navigate('MoodBoard');
      } else if (item.route === 'History') {
        navigation.navigate('History');
      }
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <View style={Theme.bottomNavigation.container}>
      {navItems.map((item) => {
        const isActive = item.key === activeTab;
        
        return (
          <TouchableOpacity
            key={item.key}
            style={isActive ? Theme.bottomNavigation.itemActive : Theme.bottomNavigation.item}
            onPress={() => handleNavPress(item)}
            activeOpacity={0.7}
          >
            <Text style={isActive ? Theme.bottomNavigation.iconActive : Theme.bottomNavigation.icon}>
              {item.icon}
            </Text>
            <Text style={isActive ? Theme.bottomNavigation.labelActive : Theme.bottomNavigation.label}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavigation;
