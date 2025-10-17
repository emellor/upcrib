# Global Styles Guide

## Overview
The `globalStyles.ts` file contains reusable styles for consistent screen layouts across the upCrib app. These styles are based on the design pattern from `InspirationPhotoScreen.tsx` and should be used in all screens for consistency.

## Usage

### Import
```typescript
import GlobalStyles from '../constants/globalStyles';
// or
import { GlobalStyles } from '../constants';
```

### Basic Screen Structure
```typescript
return (
  <SafeAreaView style={GlobalStyles.screenContainer}>
    <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
    
    {/* Header */}
    <View style={GlobalStyles.header}>
      <TouchableOpacity style={GlobalStyles.backButton} onPress={() => navigation.goBack()}>
        <Text style={GlobalStyles.backIcon}>←</Text>
      </TouchableOpacity>
      <View style={GlobalStyles.headerContent}>
        <Text style={GlobalStyles.stepIndicator}>Step 1 of 3</Text>
        <Text style={GlobalStyles.headerTitle}>Screen Title</Text>
      </View>
      <TouchableOpacity onPress={handleSkip}>
        <Text style={GlobalStyles.skipButton}>Skip</Text>
      </TouchableOpacity>
    </View>

    {/* Progress Bar */}
    <View style={GlobalStyles.progressContainer}>
      <View style={GlobalStyles.progressBar}>
        <View style={[GlobalStyles.progressFill, { width: '33%' }]} />
      </View>
    </View>

    {/* Content */}
    <ScrollView style={GlobalStyles.scrollContainer}>
      <View style={GlobalStyles.content}>
        <Text style={GlobalStyles.mainTitle}>Main Title</Text>
        <Text style={GlobalStyles.subtitle}>Subtitle text</Text>
        
        {/* Your content here */}
      </View>
    </ScrollView>

    {/* Bottom Navigation */}
    <View style={GlobalStyles.bottomContainer}>
      <TouchableOpacity style={GlobalStyles.nextButton} onPress={handleNext}>
        <Text style={GlobalStyles.nextButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);
```

## Available Global Styles

### Layout Containers
- `screenContainer` - Main screen container with background
- `header` - Header bar with padding and borders
- `headerContent` - Centered header content area
- `progressContainer` - Progress bar container
- `progressBar` - Progress bar track
- `progressFill` - Progress bar fill (use with width style)
- `scrollContainer` - Scrollable content area
- `content` - Content wrapper with padding
- `bottomContainer` - Bottom navigation container

### Text Styles
- `headerTitle` - Main header title (20px, bold)
- `stepIndicator` - Step indicator text (14px, secondary color)
- `mainTitle` - Large page title (28px, bold, centered)
- `subtitle` - Subtitle text (16px, secondary color, centered)
- `sectionTitle` - Section titles (18px, bold, centered)

### Buttons
- `backButton` - Circular back button
- `backIcon` - Back arrow icon
- `skipButton` - Skip button in header
- `nextButton` - Primary action button
- `nextButtonText` - Next button text
- `nextButtonDisabled` - Disabled button style
- `nextButtonTextDisabled` - Disabled button text

### Cards & Containers
- `card` - Standard white card with shadow (20px radius)
- `cardLarge` - Large card (24px radius, more padding)
- `infoContainer` - Info box with left border accent
- `infoTitle` - Info box title
- `infoText` - Info box text

### Lists & Tips
- `listItem` - List item row with icon
- `listItemIcon` - List item icon (emoji)
- `listItemText` - List item text
- `tipsList` - Container for tips
- `tipItem` - Individual tip row
- `tipBullet` - Tip bullet point
- `tipText` - Tip text content

### Loading States
- `loadingContainer` - Centered loading spinner container
- `loadingText` - Loading text below spinner

### Other
- `descriptionContainer` - Container for title + subtitle section

## Screen-Specific Styles
Keep screen-specific styles in the local StyleSheet.create({}) at the bottom of your screen file:

```typescript
// Screen-specific styles only - common styles are in GlobalStyles
const styles = StyleSheet.create({
  customComponent: {
    // Your custom styles here
  },
  specialLayout: {
    // Screen-specific layout
  },
});
```

## Examples

### Using Cards
```typescript
<View style={GlobalStyles.card}>
  <Text style={GlobalStyles.sectionTitle}>Section Title</Text>
  <View style={GlobalStyles.listItem}>
    <Text style={GlobalStyles.listItemIcon}>🎯</Text>
    <Text style={GlobalStyles.listItemText}>List item text</Text>
  </View>
</View>
```

### Info Box
```typescript
<View style={GlobalStyles.infoContainer}>
  <Text style={GlobalStyles.infoTitle}>Important Info</Text>
  <Text style={GlobalStyles.infoText}>Description text goes here</Text>
</View>
```

### Loading State
```typescript
{loading && (
  <View style={GlobalStyles.loadingContainer}>
    <ActivityIndicator size="large" color={Theme.colors.primary} />
    <Text style={GlobalStyles.loadingText}>Loading...</Text>
  </View>
)}
```

### Disabled Button
```typescript
<TouchableOpacity
  style={[GlobalStyles.nextButton, !isValid && GlobalStyles.nextButtonDisabled]}
  onPress={handleNext}
>
  <Text style={[GlobalStyles.nextButtonText, !isValid && GlobalStyles.nextButtonTextDisabled]}>
    Continue
  </Text>
</TouchableOpacity>
```

## Best Practices

1. **Always use GlobalStyles first** - Check if a style exists in GlobalStyles before creating a custom one
2. **Keep local styles minimal** - Only add screen-specific styles to your local StyleSheet
3. **Use Theme colors** - Reference Theme.colors for consistency
4. **Combine styles** - Use array syntax to combine global and local styles: `style={[GlobalStyles.card, styles.customCard]}`
5. **Don't modify GlobalStyles** - If you need variations, create local styles that extend global ones

## Migration Guide

To migrate an existing screen:

1. Import GlobalStyles
2. Replace common container styles (`container`, `header`, `content`, etc.) with GlobalStyles
3. Replace button styles with GlobalStyles equivalents
4. Replace text styles with GlobalStyles equivalents
5. Keep only screen-specific styles in local StyleSheet
6. Test the screen to ensure layout is correct

## Related Files
- `/src/constants/globalStyles.ts` - Global styles definition
- `/src/constants/theme.ts` - Theme colors, spacing, typography
- `/src/screens/InspirationPhotoScreen.tsx` - Reference implementation
- `/src/screens/ColorPaletteScreen.tsx` - Reference implementation
