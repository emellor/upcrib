import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../src/screens/HomeScreen';

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );
    
    expect(getByText('upCrib')).toBeTruthy();
    expect(getByText('Design Your Perfect Space')).toBeTruthy();
    expect(getByText('Start Designing')).toBeTruthy();
  });
  
  it('handles button press', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );
    
    const button = getByText('Start Designing');
    button.props.onPress();
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Design');
  });
});
