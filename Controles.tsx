import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
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
      <TouchableOpacity
        style={styles.button}
        onPress={moveLeft}
        activeOpacity={0.75}
      >
        <Text style={styles.buttonText}>←</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={moveRight}
        activeOpacity={0.75}
      >
        <Text style={styles.buttonText}>→</Text>
      </TouchableOpacity>
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
    backgroundColor: 'rgba(65, 49, 49, 0)',
  },
  button: {
    backgroundColor: '#FF00FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#FF00FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#FF1493',
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
});
