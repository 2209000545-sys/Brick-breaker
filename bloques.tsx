import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Bloques({ x, y, visible }: { x: number; y: number; visible: boolean }) {
  if (!visible) return null;

  return <View style={[styles.bloque, { left: x, top: y }]} />;
}

const styles = StyleSheet.create({
  bloque: {
    position: 'absolute',
    width: 50,
    height: 20,
    backgroundColor: 'rgba(255, 94, 0, 1)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#be2121ff',
  },
});
