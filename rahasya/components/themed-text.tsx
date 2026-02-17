import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'small' | 'label';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Mapping types to styles for cleaner rendering
  const typeStyles = {
    default: styles.default,
    title: styles.title,
    defaultSemiBold: styles.defaultSemiBold,
    subtitle: styles.subtitle,
    link: styles.link,
    small: styles.small,
    label: styles.label,
  };

  return (
    <Text
      style={[
        { color },
        typeStyles[type],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800', // Extra bold for the "Vault" look
    lineHeight: 34,
    fontFamily: Fonts.rounded, // Applying your rounded font preference
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Fonts.rounded,
    lineHeight: 28,
  },
  link: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF', // Aligned with your brand blue
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.6,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.5,
  },
});