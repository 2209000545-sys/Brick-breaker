import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GameScreen from './Pantallazo';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar hidden />
      <GameScreen />
    </SafeAreaView>
    
  );
}