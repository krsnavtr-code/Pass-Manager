import React from 'react';
import { StyleProp, TextStyle, ViewStyle, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

/**
 * Refined to use Emojis for high stability and consistent "Vault" branding.
 * This replaces expo-symbols to prevent Metro resolution errors.
 */

// Mapping of common SF Symbol names to Emojis (Fallback mechanism)
const ICON_MAP: Record<string, string> = {
  'chevron.right': '▶',
  'chevron.left': '◀',
  'lock.fill': '🔒',
  'shield.fill': '🛡️',
  'person.fill': '👤',
  'envelope.fill': '📧',
  'star.fill': '⭐',
  'trash.fill': '🗑️',
  'plus': '➕',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string; // Changed from SymbolViewProps to string for flexibility
  size?: number;
  color?: string; // Optional since emojis carry their own color
  style?: StyleProp<ViewStyle>;
}) {
  // Determine which emoji to show based on the name passed
  const displayEmoji = ICON_MAP[name] || name;

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <ThemedText 
        style={{ 
          fontSize: size * 0.8, // Scale emoji relative to container size
          textAlign: 'center',
          // If a custom color is passed for a text-based icon like an arrow
          color: color || undefined 
        }}
      >
        {displayEmoji}
      </ThemedText>
    </View>
  );
}