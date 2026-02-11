import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { BookRepository } from '../../src/data/repositories/BookRepository';
import { ReadingInstanceRepository } from '../../src/data/repositories/ReadingInstanceRepository';
import { AbandonmentRepository } from '../../src/data/repositories/AbandonmentRepository';
import { generateInsights } from '../../src/logic/insights/insightGenerator';
import { Insight } from '../../src/logic/insights/types';
import { InsightCard } from '../../src/components/InsightCard';

const THEME = {
  colors: {
    background: '#1A1D21',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    primary: '#8DA399',
  }
};

export default function InsightsScreen() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);

      const [books, instances, abandonmentEvents] = await Promise.all([
        BookRepository.getAll(),
        ReadingInstanceRepository.getAll(),
        AbandonmentRepository.getAll(),
      ]);

      const generated = generateInsights(instances, books, abandonmentEvents);
      setInsights(generated);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Directly run logic for refresh
    Promise.all([
      BookRepository.getAll(),
      ReadingInstanceRepository.getAll(),
      AbandonmentRepository.getAll(),
    ]).then(([books, instances, abandonmentEvents]) => {
      const generated = generateInsights(instances, books, abandonmentEvents);
      setInsights(generated);
      setRefreshing(false);
    }).catch(e => {
      console.error(e);
      setRefreshing(false);
    });
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.text}
          />
        }
      >
        <Text variant="headlineMedium" style={styles.title}>
          Insights
        </Text>

        {insights.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Your reading patterns will appear here as more history is recorded.
            </Text>
          </View>
        ) : (
          insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  title: {
    marginBottom: 24,
    marginTop: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'serif' }),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  subtitle: {
    color: THEME.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 300,
  },
});
