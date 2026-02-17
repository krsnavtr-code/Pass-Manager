import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  return (
    <ThemedView style={styles.wrapper}>
      <TouchableOpacity
        style={[
          styles.heading,
          isOpen && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }
        ]}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.7}>
        
        {/* Emoji Arrow for consistency and zero dependencies */}
        <ThemedText 
          style={[
            styles.arrow, 
            { transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }
          ]}
        >
          ▶
        </ThemedText>

        <ThemedText type="defaultSemiBold" style={styles.titleText}>
          {title}
        </ThemedText>
      </TouchableOpacity>

      {isOpen && (
        <ThemedView style={styles.content}>
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 10,
  },
  arrow: {
    fontSize: 12,
    opacity: 0.5,
  },
  titleText: {
    fontSize: 15,
  },
  content: {
    paddingTop: 4,
    paddingBottom: 12,
    paddingLeft: 32,
    paddingRight: 12,
  },
});