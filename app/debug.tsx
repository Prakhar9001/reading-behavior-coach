import { View, Text, StyleSheet } from 'react-native';

export default function DebugScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>DEBUG SCREEN LOADED</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffcc00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
});
