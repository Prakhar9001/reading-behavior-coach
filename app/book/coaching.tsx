import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Appbar, ActivityIndicator } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBookStore } from '../../src/store/useBookStore';
import { BookRepository } from '../../src/data/repositories/BookRepository';
import { ReadingInstanceRepository } from '../../src/data/repositories/ReadingInstanceRepository';
import { CompletionRepository } from '../../src/data/repositories/CompletionRepository';
import { generateCoaching } from '../../src/logic/coaching/coachingGenerator';
import { CoachingCard } from '../../src/components/CoachingCard';
import { Book } from '../../src/data/models/Book';
import { ReadingInstance } from '../../src/data/models/ReadingInstance';
import { CoachingResponse } from '../../src/logic/coaching/types';

const THEME = {
  colors: {
    background: '#FFFFFF',
    text: '#1A1D21',
  }
};

export default function CoachingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookId = params.id as string;
  const currentPage = parseInt(params.page as string, 10) || 0;

  const { books } = useBookStore();
  const [book, setBook] = useState<Book | null>(null);
  const [coaching, setCoaching] = useState<CoachingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCoaching();
  }, [bookId]);

  const loadCoaching = async () => {
    try {
      setLoading(true);

      // Validate bookId
      if (!bookId || typeof bookId !== 'string') {
        console.error('[Coaching] ✗ Invalid bookId:', bookId);
        router.back();
        return;
      }

      const foundBook = books.find(b => b.id === bookId);
      if (!foundBook) {
        console.error('[Coaching] ✗ Book not found:', bookId);
        router.back();
        return;
      }

      setBook(foundBook);

      // Fetch all data needed for coaching
      const [allBooks, allInstances, completionEvents] = await Promise.all([
        BookRepository.getAll(),
        ReadingInstanceRepository.getAll(),
        CompletionRepository.getAll(),
      ]);

      // Generate coaching
      const coachingResponse = generateCoaching(
        foundBook,
        currentPage,
        allBooks,
        allInstances,
        completionEvents
      );

      setCoaching(coachingResponse);
    } catch (error) {
      console.error('[Coaching] Failed to load coaching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    console.log('[Coaching] User chose to continue reading');
    router.back();
  };

  const handleQuit = () => {
    console.log('[Coaching] User chose to quit');
    // Navigate to abandon flow
    router.push(`/book/abandon?id=${bookId}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Coaching" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (!book || !coaching) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Coaching" />
        </Appbar.Header>
        <View style={styles.errorContainer}>
          <Text variant="bodyLarge">Unable to load coaching.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Coaching" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text variant="titleLarge" style={styles.bookTitle}>{book.title}</Text>
        <Text variant="bodyMedium" style={styles.author}>by {book.author || 'Unknown'}</Text>
        <Text variant="bodySmall" style={styles.progress}>
          Currently on page {currentPage} of {book.pageCount}
        </Text>

        <CoachingCard
          coaching={coaching}
          onContinue={handleContinue}
          onQuit={handleQuit}
        />

        {coaching.reasoning && (
          <Text variant="bodySmall" style={styles.reasoning}>
            {coaching.reasoning}
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  bookTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: THEME.colors.text,
  },
  author: {
    color: '#666',
    marginBottom: 4,
  },
  progress: {
    color: '#999',
    marginBottom: 24,
  },
  reasoning: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
});
