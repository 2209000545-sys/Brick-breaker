import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PALETA_ANCHO = width * 0.25;
const PALETA_ALTO = 20;
const PALETA_BOTTOM_OFFSET = 140;

type PaletaProps = { x: number };

export default function Paleta({ x }: PaletaProps) {
  const left = Math.max(0, Math.min(x, width - PALETA_ANCHO));
  return <View style={[styles.paleta, { left }]} />;
}

const styles = StyleSheet.create({
  paleta: {
    position: 'absolute',
    bottom: PALETA_BOTTOM_OFFSET,
    width: PALETA_ANCHO,
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


