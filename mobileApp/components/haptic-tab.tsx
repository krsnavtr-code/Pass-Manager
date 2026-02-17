import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Refined HapticTab: Provides tactile feedback for tab navigation.
 * Uses a "Light" impact to simulate a physical button press.
 */
export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev) => {
        // Trigger haptics on both iOS and Android for a premium feel
        // Light impact is preferred for frequent actions like tab switching
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        
        // Ensure the original onPressIn logic still executes
        props.onPressIn?.(ev);
      }}
      // Optional: Add a subtle opacity change on press
      pressOpacity={0.7}
      // Ensures the hit target is ergonomically sound for mobile
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    />
  );
}