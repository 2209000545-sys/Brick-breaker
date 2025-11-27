import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');


export default function Controles({
  moveLeft,
  moveRight,
}: {
  moveLeft: () => void;
  moveRight: () => void;
}) {
  return (
    <View style={styles.controls}>
      <Button title="←" onPress={moveLeft} />
      <Button title="→" onPress={moveRight} />
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0)',
  },
});
