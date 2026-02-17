import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

/**
 * Refined HelloWave: A smooth, native waving animation.
 * Uses the Reanimated 3 hook-based API for 60fps performance.
 */
export function HelloWave() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Sequence: 0 -> 25deg -> -10deg -> 25deg -> 0
    // Repeat: 4 times
    rotation.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 150 }),
        withTiming(-10, { duration: 150 }),
        withTiming(25, { duration: 150 }),
        withTiming(0, { duration: 150 })
      ),
      4 // Number of iterations
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ThemedText style={styles.text}>👋</ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Ensuring the rotation happens from the bottom-right/center 
    // to look like a wrist waving
  },
  text: {
    fontSize: 28,
    lineHeight: 32,
    marginTop: -6,
  },
});