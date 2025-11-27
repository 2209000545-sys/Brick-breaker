import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');


export default function Bola({ x, y }: { x: number; y: number }) {
  return <View style={[styles.bola, { left: x, top: y }]} />;
}

const tamanobola = Math.min(width, height) * 0.03;

const styles = StyleSheet.create({
  bola: {
    position: 'absolute',
    width: tamanobola,
    height: tamanobola,
    borderRadius: tamanobola / 2,
    backgroundColor: 'black',
    borderColor: 'white',
    borderWidth: 2,
    
  },
});

