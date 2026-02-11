import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { CoachingResponse } from '../logic/coaching/types';

interface Props {
  coaching: CoachingResponse;
  onContinue: () => void;
  onQuit: () => void;
}

const THEME = {
  colors: {
    card: '#F5F2EA',
    text: '#1A1D21',
    textSecondary: '#666666',
    badge: {
      low: '#E0E0E0',
      medium: '#CFD8DC',
      high: '#B0BEC5',
    },
    quit: '#B00020',
    continue: '#2E7D32',
  }
};

export const CoachingCard = ({ coaching, onContinue, onQuit }: Props) => {
  const getBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return THEME.colors.badge.high;
      case 'medium': return THEME.colors.badge.medium;
      case 'low': return THEME.colors.badge.low;
      default: return THEME.colors.badge.low;
    }
  };

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          Should I quit?
        </Text>

        <Text variant="bodyLarge" style={styles.message}>
          {coaching.message}
        </Text>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.sampleSize}>
            Based on {coaching.sampleSize} books
          </Text>

          <View style={[styles.badge, { backgroundColor: getBadgeColor(coaching.confidence) }]}>
            <Text style={styles.badgeText}>{coaching.confidence.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onContinue}
            style={styles.continueButton}
            textColor={THEME.colors.continue}
          >
            Continue Reading
          </Button>

          <Button
            mode="contained"
            onPress={onQuit}
            style={styles.quitButton}
            buttonColor={THEME.colors.quit}
          >
            Stop Reading
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 24,
    backgroundColor: THEME.colors.card,
    borderRadius: 12,
    elevation: 3,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: THEME.colors.text,
  },
  message: {
    color: THEME.colors.text,
    marginBottom: 16,
    lineHeight: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sampleSize: {
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#37474F',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  continueButton: {
    flex: 1,
    borderColor: THEME.colors.continue,
  },
  quitButton: {
    flex: 1,
  },
});
