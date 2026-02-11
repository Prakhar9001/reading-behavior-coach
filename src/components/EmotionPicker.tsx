import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EMOTIONAL_STATES, EMOTIONAL_STATE_LABELS } from '../constants/emotions';

type EmotionPickerProps = {
  value: string;
  onSelect: (emotion: string) => void;
  error?: string;
};

const EMOTION_ICONS: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  relieved: 'emoticon-happy-outline',
  guilty: 'emoticon-sad-outline',
  neutral: 'emoticon-neutral-outline',
};

export const EmotionPicker: React.FC<EmotionPickerProps> = ({ value, onSelect, error }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        How does stopping make you feel?
      </Text>

      <View style={styles.optionsContainer}>
        {EMOTIONAL_STATES.map((emotion) => {
          const isSelected = value === emotion;
          return (
            <TouchableOpacity
              key={emotion}
              style={[
                styles.option,
                isSelected && { backgroundColor: theme.colors.primaryContainer },
                error && !value ? { borderColor: '#B00020', borderWidth: 1 } : null
              ]}
              onPress={() => onSelect(emotion)}
            >
              <MaterialCommunityIcons
                name={EMOTION_ICONS[emotion]}
                size={32}
                color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <Text
                variant="bodySmall"
                style={[
                  styles.optionLabel,
                  isSelected && { color: theme.colors.primary, fontWeight: 'bold' }
                ]}
              >
                {EMOTIONAL_STATE_LABELS[emotion]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionLabel: {
    marginTop: 8,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 12,
  },
});
