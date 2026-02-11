import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Menu, Button, Text } from 'react-native-paper';
import { ABANDONMENT_REASONS, ABANDONMENT_REASON_LABELS } from '../constants/reasons';

type AbandonmentReasonPickerProps = {
  value: string;
  onSelect: (reason: string) => void;
  error?: string;
};

export const AbandonmentReasonPicker: React.FC<AbandonmentReasonPickerProps> = ({ value, onSelect, error }) => {
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const handleSelect = (reason: string) => {
    onSelect(reason);
    closeMenu();
  };

  const getLabel = (val: string) => {
    return ABANDONMENT_REASON_LABELS[val as keyof typeof ABANDONMENT_REASON_LABELS] || 'Select Reason';
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
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {value ? getLabel(value) : 'Why are you stopping?'}
          </Button>
        }
      >
        {ABANDONMENT_REASONS.map((reason) => (
          <Menu.Item
            key={reason}
            onPress={() => handleSelect(reason)}
            title={ABANDONMENT_REASON_LABELS[reason]}
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
  buttonContent: {
    justifyContent: 'flex-start',
  },
  buttonLabel: {
    textAlign: 'left',
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
