import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useBookStore } from '../../src/store/useBookStore';
import { GenrePicker } from '../../src/components/GenrePicker';

export default function AddBookScreen() {
  const router = useRouter();
  const { addBook, refreshBooks } = useBookStore();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [genre, setGenre] = useState('');

  const [errors, setErrors] = useState({
    title: '',
    pageCount: '',
    genre: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors = {
      title: '',
      pageCount: '',
      genre: '',
    };

    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!pageCount.trim()) {
      newErrors.pageCount = 'Page count is required';
      isValid = false;
    } else {
      const pageCountNum = parseInt(pageCount, 10);
      if (isNaN(pageCountNum) || pageCountNum <= 0) {
        newErrors.pageCount = 'Page count must be greater than 0';
        isValid = false;
      }
    }

    if (!genre) {
      newErrors.genre = 'Genre is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      await addBook({
        title: title.trim(),
        author: author.trim() || null,
        pageCount: parseInt(pageCount, 10),
        genre,
      });

      // Explicitly refresh to ensure homepage has latest data before nav
      await refreshBooks();

      console.log('[AddBook] Book added and list refreshed');
      router.back();
    } catch (error) {
      console.error('[AddBook] Failed to add book:', error);
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Add Book" />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          <TextInput
            label="Title *"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            error={!!errors.title}
            style={styles.input}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          <TextInput
            label="Author"
            value={author}
            onChangeText={setAuthor}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Page Count *"
            value={pageCount}
            onChangeText={setPageCount}
            mode="outlined"
            keyboardType="numeric"
            error={!!errors.pageCount}
            style={styles.input}
          />
          {errors.pageCount && <Text style={styles.errorText}>{errors.pageCount}</Text>}

          <GenrePicker value={genre} onSelect={setGenre} error={errors.genre} />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
          >
            Add Book
          </Button>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 12,
  },
  submitButton: {
    marginTop: 8,
  },
});
