import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const DEFAULT_PALETA_ANCHO = width * 0.25;
const PALETA_ALTO = 20;
const PALETA_BOTTOM_OFFSET = 140;

type PaletaProps = { x: number; width?: number };

export default function Paleta({ x, width: w }: PaletaProps) {
  const palWidth = typeof w === 'number' ? w : DEFAULT_PALETA_ANCHO;
  const left = Math.max(0, Math.min(x, width - palWidth));
  return <View style={[styles.paleta, { left, width: palWidth }]} />;
}

const styles = StyleSheet.create({
  paleta: {
    position: 'absolute',
    bottom: PALETA_BOTTOM_OFFSET,
    height: PALETA_ALTO,
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


