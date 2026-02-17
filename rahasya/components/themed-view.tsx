import { View, type ViewProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'surface' | 'container';
};

/**
 * Refined ThemedView: The foundational layout building block.
 * Includes support for 'surface' types to create layered UI depth.
 */
export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  type = 'default', 
  ...otherProps 
}: ThemedViewProps) {
  // We can now choose between 'background' for the whole screen 
  // and 'surface' for cards/modals if defined in your theme constants.
  const themeKey = type === 'surface' ? 'background' : 'background'; 
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, themeKey);

  return (
    <View 
      style={[
        { backgroundColor }, 
        type === 'container' && styles.container,
        style
      ]} 
      {...otherProps} 
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});