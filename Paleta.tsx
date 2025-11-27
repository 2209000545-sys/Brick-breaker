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
    backgroundColor: '#67666dff',
    borderColor: 'white',
    borderWidth: 2,
  },
});


