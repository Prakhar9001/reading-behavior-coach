import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Appbar, ProgressBar } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBookStore } from '../../src/store/useBookStore';
import { AbandonmentReasonPicker } from '../../src/components/AbandonmentReasonPicker';
import { EmotionPicker } from '../../src/components/EmotionPicker';
import { Book } from '../../src/data/models/Book';

export default function AbandonBookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const bookId = params.id as string;

  const { books, abandonBook } = useBookStore();
  const [book, setBook] = useState<Book | null>(null);

  const [pageAbandoned, setPageAbandoned] = useState('');
  const [reason, setReason] = useState('');
  const [emotion, setEmotion] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({
    pageAbandoned: '',
    reason: '',
    emotion: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Validate bookId
    if (!bookId || typeof bookId !== 'string') {
      console.error('[AbandonBook] ✗ Invalid bookId:', bookId);
      router.back();
      return;
    }

    const foundBook = books.find(b => b.id === bookId);
    if (foundBook) {
      setBook(foundBook);
    } else {
      console.error('[AbandonBook] ✗ Book not found:', bookId);
      // Don't navigate back immediately, show error screen
    }
  }, [bookId, books]);

  const validate = (): boolean => {
    const newErrors = {
      pageAbandoned: '',
      reason: '',
      emotion: '',
    };

    let isValid = true;

    if (!pageAbandoned.trim()) {
      newErrors.pageAbandoned = 'Page is required';
      isValid = false;
    } else {
      const pageNum = parseInt(pageAbandoned, 10);
      if (isNaN(pageNum) || pageNum <= 0) {
        newErrors.pageAbandoned = 'Must be > 0';
        isValid = false;
      } else if (book && pageNum > book.pageCount) {
        newErrors.pageAbandoned = `Cannot exceed total pages (${book.pageCount})`;
        isValid = false;
      }
    }

    if (!reason) {
      newErrors.reason = 'Reason is required';
      isValid = false;
    }

    if (!emotion) {
      newErrors.emotion = 'Emotion is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const calculatePercent = (): number => {
    if (!book || !pageAbandoned) return 0;
    const pageNum = parseInt(pageAbandoned, 10);
    if (isNaN(pageNum)) return 0;
    return Math.min(100, (pageNum / book.pageCount) * 100);
  };

  const handleSubmit = async () => {
    if (!validate() || !book) return;

    setSubmitting(true);

    try {
      await abandonBook({
        bookId: book.id,
        pageAbandoned: parseInt(pageAbandoned, 10),
        percentComplete: calculatePercent(), // Keep as 0-100 float
        primaryReason: reason,
        emotionalState: emotion as 'relieved' | 'guilty' | 'neutral',
        notes: notes.trim() || null,
      });

      console.log('[AbandonBook] Book abandoned successfully');
      router.back();
    } catch (error) {
      console.error('[AbandonBook] Failed to abandon book:', error);
      setSubmitting(false);
    }
  };

  if (!book) return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Stop Reading" />
      </Appbar.Header>
      <View style={styles.errorContainer}>
        <Text variant="headlineSmall" style={styles.errorTitle}>
          Book Not Found
        </Text>
        <Text variant="bodyMedium" style={styles.errorMessage}>
          The book you're trying to abandon could not be found.
        </Text>
        <Button
          mode="contained"
          onPress={() => router.back()}
          style={styles.errorButton}
        >
          Go Back
        </Button>
      </View>
    </View>
  );

  const progress = calculatePercent() / 100;

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Stop Reading" />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <Text variant="titleLarge" style={styles.bookTitle}>{book.title}</Text>
          <Text variant="bodyMedium" style={styles.author}>by {book.author || 'Unknown'}</Text>

          <View style={styles.progressContainer}>
            <ProgressBar progress={progress} color="#6200ee" style={styles.progressBar} />
            <Text variant="bodySmall" style={styles.progressText}>
              {Math.round(progress * 100)}% Complete
            </Text>
          </View>

          <View style={styles.formSection}>
            <TextInput
              label="What page are you on? *"
              value={pageAbandoned}
              onChangeText={setPageAbandoned}
              mode="outlined"
              keyboardType="numeric"
              error={!!errors.pageAbandoned}
              style={styles.input}
            />
            {errors.pageAbandoned && <Text style={styles.errorText}>{errors.pageAbandoned}</Text>}

            <AbandonmentReasonPicker
              value={reason}
              onSelect={setReason}
              error={errors.reason}
            />

            <EmotionPicker
              value={emotion}
              onSelect={setEmotion}
              error={errors.emotion}
            />

            <TextInput
              label="Any detail you want to remember? (Optional)"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="e.g. The protagonist was annoying..."
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              buttonColor="#B00020" // Red for abandon action
              style={styles.submitButton}
            >
              Stop Reading
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    marginBottom: 16,
    color: '#B00020',
  },
  errorMessage: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: '#6200ee',
  },
  keyboardView: {
    flex: 1,
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
  },
  author: {
    color: '#666',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'right',
    color: '#666',
  },
  formSection: {
    gap: 16,
  },
  input: {
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -12,
    marginLeft: 12,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 32,
  },
});
