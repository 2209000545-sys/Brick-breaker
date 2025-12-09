import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { getLayout } from './layout';

export default function Bola({ x, y, size }: { x: number; y: number; size?: number }) {
  const { width, height } = useWindowDimensions();
  const layout = getLayout(width, height);
  const s = typeof size === 'number' ? size : layout.ballSize;
  return <View style={[styles.bola, { left: x, top: y, width: s, height: s, borderRadius: s / 2 }]} />;
}

const styles = StyleSheet.create({
  bola: {
    position: 'absolute',
    backgroundColor: '#FFD700',
    borderColor: '#FF1493',
    borderWidth: 3,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
});

