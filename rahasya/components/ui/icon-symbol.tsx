import React from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

/**
 * MAPPING: Translates old SF Symbol names to our new Emoji-based branding.
 * This ensures that existing code calling 'house.fill' still works but
 * renders our new aesthetic.
 */
const MAPPING = {
  'house.fill': '🏠',
  'paperplane.fill': '🚀',
  'chevron.left.forwardslash.chevron.right': '🛠️',
  'chevron.right': '▶',
  'lock.fill': '🔒',
  'shield.fill': '🛡️',
  'star.fill': '⭐',
  'plus': '➕',
  'person.fill': '👤',
} as const;

type IconSymbolName = keyof typeof MAPPING;

/**
 * Refined IconSymbol: A lightweight, zero-dependency icon component.
 * Uses Emojis to ensure 100% stability across Android, iOS, and Web
 * without triggering Metro bundler resolution errors.
 */
export function IconSymbol({
  name,
  size = 24,
  color, // Kept for API compatibility, though emojis have native colors
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color?: string | any;
  style?: StyleProp<TextStyle>;
}) {
  const emoji = MAPPING[name];

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
      <ThemedText
        style={[
          {
            fontSize: size * 0.8, // Scales emoji to fit container
            textAlign: 'center',
            // For monochrome emojis like '▶', color can still be applied
            color: typeof color === 'string' ? color : undefined,
          },
          style,
        ]}>
        {emoji || '❓'}
      </ThemedText>
    </View>
  );
}