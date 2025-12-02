import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');


export default function Paleta({ x }: { x: number }) {
  return <View style={[styles.paleta, { left: x }]} />;
}
const paletaancho = width * 0.25;
const paletaalto = 20;
const paletaBottomOffset = 140;

const styles = StyleSheet.create({
  paleta: {
    position: 'absolute',
    bottom: paletaBottomOffset,
    width: paletaancho,
    height: paletaalto,
    backgroundColor: '#09c2e3ff',
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


