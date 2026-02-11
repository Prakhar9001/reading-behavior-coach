import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { Insight } from '../logic/insights/types';

const THEME = {
  colors: {
    card: '#F5F2EA',
    text: '#1A1D21',
    textSecondary: '#666666',
    badge: {
      low: '#E0E0E0',
      medium: '#CFD8DC',
      high: '#B0BEC5',
    }
  }
};

interface Props {
  insight: Insight;
}

export const InsightCard = ({ insight }: Props) => {
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
        <Text variant="bodyLarge" style={styles.message}>
          {insight.text}
        </Text>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.sampleSize}>
            Based on {insight.sampleSize} {insight.unit || 'books'}
          </Text>

          <View style={[styles.badge, { backgroundColor: getBadgeColor(insight.confidence) }]}>
            <Text style={styles.badgeText}>{insight.confidence.toUpperCase()}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: THEME.colors.card,
    borderRadius: 12,
    elevation: 2,
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
    marginTop: 8,
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
});
