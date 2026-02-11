import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, Text } from 'react-native-paper';
import { GENRES } from '../constants/genres';

type GenrePickerProps = {
  value: string;
  onSelect: (genre: string) => void;
  error?: string;
};

export const GenrePicker: React.FC<GenrePickerProps> = ({ value, onSelect, error }) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (genre: string) => {
    onSelect(genre);
    closeMenu();
  };

  return (
    <View style={styles.container}>
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
            style={[styles.button, error ? styles.buttonError : null]}
          >
            {value || 'Select Genre'}
          </Button>
        }
      >
        {GENRES.map((genre) => (
          <Menu.Item
            key={genre}
            onPress={() => handleSelect(genre)}
            title={genre}
          />
        ))}
      </Menu>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  button: {
    justifyContent: 'flex-start',
  },
  buttonError: {
    borderColor: '#B00020',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
});
