import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet } from 'react-native';

export default function Fondoanimado() {
  const colorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnim, { toValue: 5, duration: 10000, useNativeDriver: false }),
        Animated.timing(colorAnim, { toValue: 4, duration: 10000, useNativeDriver: false }),
        Animated.timing(colorAnim, { toValue: 3, duration: 10000, useNativeDriver: false }),
        Animated.timing(colorAnim, { toValue: 2, duration: 10000, useNativeDriver: false }),
        Animated.timing(colorAnim, { toValue: 1, duration: 10000, useNativeDriver: false }),
        Animated.timing(colorAnim, { toValue: 0, duration: 10000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1, 2, 3, 4, 5],
    outputRange: ['rgba(102, 255, 204)', 'rgba(135, 206, 250)', 'rgba(240, 240, 240)','rgba(210, 125, 90)','rgba(34, 139, 34)','rgba(255, 255, 255)'], 
  });

  return <Animated.View style={[styles.background, { backgroundColor }]} />;
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject, 
  },
});
