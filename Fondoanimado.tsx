import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Fondoanimado() {
  const colorAnim = useRef(new Animated.Value(0)).current;
  const lineMove1 = useRef(new Animated.Value(0)).current;
  const lineMove2 = useRef(new Animated.Value(0)).current;
  const objectMove1 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de color de fondo
    Animated.loop(
      Animated.timing(colorAnim, { toValue: 1, duration: 20000, useNativeDriver: false })
    ).start();

    // Animación de líneas horizontales
    Animated.loop(
      Animated.timing(lineMove1, { toValue: 1, duration: 10000, useNativeDriver: false })
    ).start();

    Animated.loop(
      Animated.timing(lineMove2, { toValue: 1, duration: 14000, useNativeDriver: false })
    ).start();

    // Animación de objeto flotante
    Animated.loop(
      Animated.sequence([
        Animated.timing(objectMove1, { toValue: 1, duration: 16000, useNativeDriver: false }),
        Animated.timing(objectMove1, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      'rgba(10, 14, 39, 1)',
      'rgba(20, 30, 70, 0.95)',
    ],
  });

  const line1TranslateY = lineMove1.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, height + 50],
  });

  const line2TranslateY = lineMove2.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, height + 100],
  });

  const objectTranslateX = objectMove1.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, width + 100],
  });

  const objectTranslateY = objectMove1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [height + 50, height / 2 - 150, -50],
  });

  return (
    <Animated.View style={[styles.background, { backgroundColor }]}>
      {/* Línea animada 1 */}
      <Animated.View
        style={[
          styles.animatedLine,
          styles.line1,
          { transform: [{ translateY: line1TranslateY }] },
        ]}
      />

      {/* Línea animada 2 */}
      <Animated.View
        style={[
          styles.animatedLine,
          styles.line2,
          { transform: [{ translateY: line2TranslateY }] },
        ]}
      />

      {/* Objeto flotante */}
      <Animated.View
        style={[
          styles.floatingObject,
          {
            transform: [
              { translateX: objectTranslateX },
              { translateY: objectTranslateY },
            ],
          },
        ]}
      >
        <View style={[styles.objectShape, styles.shapeRectangle]} />
      </Animated.View>

      {/* Puntos flotantes estáticos */}
      <View style={styles.floatingDotsContainer}>
        <View style={[styles.floatingDot, { top: '15%', left: '10%' }]} />
        <View style={[styles.floatingDot, { top: '40%', right: '12%' }]} />
        <View style={[styles.floatingDot, { bottom: '25%', left: '8%' }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  animatedLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
  },
  line1: {
    backgroundColor: 'rgba(0, 217, 255, 0.25)',
    width: '100%',
  },
  line2: {
    backgroundColor: 'rgba(255, 0, 136, 0.2)',
    width: '110%',
    left: '-5%',
  },
  floatingObject: {
    position: 'absolute',
  },
  objectShape: {
    borderColor: 'rgba(255, 0, 200, 0.5)',
    borderWidth: 2,
    shadowColor: 'rgba(255, 0, 200, 0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  shapeRectangle: {
    width: 50,
    height: 35,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 217, 255, 0.15)',
  },
  floatingDotsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  floatingDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 255, 136, 0.5)',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 2,
  },
});
