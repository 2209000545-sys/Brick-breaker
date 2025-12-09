import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { getLayout } from './layout';

type PaletaProps = { x: number; width?: number; height?: number; bottomOffset?: number };

export default function Paleta({ x, width: w, height: hProp, bottomOffset }: PaletaProps) {
  const { width: lw, height: lh } = useWindowDimensions();
  const layout = getLayout(lw, lh);
  const palWidth = typeof w === 'number' ? w : layout.paddleWidth;
  const left = Math.max(0, Math.min(x, lw - palWidth));
  const palHeight = typeof hProp === 'number' ? hProp : layout.paddleHeight;
  const palBottom = typeof bottomOffset === 'number' ? bottomOffset : layout.paddleBottom;
  return <View style={[styles.paleta, { left, width: palWidth, bottom: palBottom, height: palHeight }]} />;
}

const styles = StyleSheet.create({
  paleta: {
    position: 'absolute',
    backgroundColor: '#09C2E3',
    borderColor: '#00FF88',
    borderWidth: 3,
    borderRadius: 8,
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 8,
  },
});


