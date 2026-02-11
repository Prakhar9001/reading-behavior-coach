import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Library
      </Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        All your books (completed and abandoned) will appear here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
});
