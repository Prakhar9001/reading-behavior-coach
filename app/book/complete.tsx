import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { Text, Button, TextInput, RadioButton, ProgressBar, IconButton, Surface } from 'react-native-paper';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useBookStore } from '../../src/store/useBookStore';

const THEME = {
  colors: {
    background: '#1A1D21',
    card: '#F5F2EA',
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    primary: '#8DA399', // Muted moss/teal
    error: '#CF6679',
  }
};

export default function CompleteBookScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { books, completeBook } = useBookStore();

  const book = books.find(b => b.id === id);

  const [step, setStep] = useState(1);
  const [reachedEnd, setReachedEnd] = useState<boolean | null>(null);
  const [feeling, setFeeling] = useState<'glad' | 'relieved' | 'disappointed' | 'neutral' | null>(null);
  const [almostQuit, setAlmostQuit] = useState<boolean | null>(null);
  const [almostQuitPage, setAlmostQuitPage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Validation state
  const [pageError, setPageError] = useState('');

  const totalSteps = 3;
  const progress = step / totalSteps;

  // Validate bookId exists
  useEffect(() => {
    if (!id || typeof id !== 'string') {
      console.error('[CompleteBook] ✗ Invalid bookId:', id);
      router.back();
    }
  }, [id]);

  if (!book) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Text variant="headlineSmall" style={styles.errorTitle}>
            Book Not Found
          </Text>
          <Text variant="bodyMedium" style={styles.errorMessage}>
            The book you're trying to complete could not be found.
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
  }

  const handleNext = () => {
    if (step === 1 && reachedEnd === null) return;
    if (step === 2 && feeling === null) return;
    if (step === 3) {
      if (almostQuit === null) return;
      if (almostQuit && !almostQuitPage) {
        setPageError('Please enter a page number');
        return;
      }
      // Validate page number
      if (almostQuit && almostQuitPage) {
        const page = parseInt(almostQuitPage);
        if (isNaN(page) || page <= 0 || page > book.pageCount) {
          setPageError(`Page must be between 1 and ${book.pageCount}`);
          return;
        }
      }
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      // Safely parse almostQuitPage, default to null if invalid
      let parsedAlmostQuitPage: number | null = null;
      if (almostQuit && almostQuitPage.trim()) {
        const parsed = parseInt(almostQuitPage, 10);
        parsedAlmostQuitPage = isNaN(parsed) ? null : parsed;
      }

      await completeBook({
        bookId: book.id,
        completionFeeling: feeling!,
        almostQuit: almostQuit!,
        almostQuitPage: parsedAlmostQuitPage,
      });
      router.dismissAll();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('[CompleteBook] ✗ Failed to complete book:', error);
      setSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text variant="labelMedium" style={styles.stepLabel}>STEP 1 OF 3</Text>

      <Text variant="bodyLarge" style={styles.questionText}>You're finishing</Text>
      <Text variant="headlineMedium" style={styles.bookTitle}>{book.title}</Text>

      <View style={styles.spacer} />

      <Text variant="titleMedium" style={styles.question}>
        Did you reach the final page?
      </Text>

      <View style={styles.optionsRow}>
        <Button
          mode={reachedEnd === true ? "contained" : "outlined"}
          onPress={() => setReachedEnd(true)}
          style={[styles.optionButton, reachedEnd === true && styles.selectedButton]}
          labelStyle={[styles.buttonLabel, reachedEnd === true && styles.selectedButtonLabel]}
        >
          Yes
        </Button>
        <Button
          mode={reachedEnd === false ? "contained" : "outlined"}
          onPress={() => setReachedEnd(false)}
          style={[styles.optionButton, reachedEnd === false && styles.selectedButton]}
          labelStyle={[styles.buttonLabel, reachedEnd === false && styles.selectedButtonLabel]}
        >
          No
        </Button>
      </View>

      {reachedEnd === false && (
        <Text style={styles.infoText}>
          Consider "Stop Reading" instead if you didn't finish.
        </Text>
      )}
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text variant="labelMedium" style={styles.stepLabel}>STEP 2 OF 3</Text>

      <Text variant="headlineSmall" style={styles.question}>
        How does finishing this book feel?
      </Text>

      <View style={styles.verticalOptions}>
        {[
          { value: 'glad', label: 'Glad I finished' },
          { value: 'relieved', label: "Relieved it's over" },
          { value: 'disappointed', label: 'Disappointed' },
          { value: 'neutral', label: 'Neutral' },
        ].map((option) => (
          <Surface
            key={option.value}
            style={[
              styles.choiceCard,
              feeling === option.value && styles.selectedChoiceCard
            ]}
          >
            <RadioButton.Item
              label={option.label}
              value={option.value}
              status={feeling === option.value ? 'checked' : 'unchecked'}
              onPress={() => setFeeling(option.value as any)}
              color={THEME.colors.primary}
              labelStyle={styles.choiceLabel}
              style={styles.radioItem}
            />
          </Surface>
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text variant="labelMedium" style={styles.stepLabel}>STEP 3 OF 3</Text>

      <Text variant="headlineSmall" style={styles.question}>
        Were there any points where you almost stopped reading?
      </Text>

      <View style={styles.optionsRow}>
        <Button
          mode={almostQuit === true ? "contained" : "outlined"}
          onPress={() => setAlmostQuit(true)}
          style={[styles.optionButton, almostQuit === true && styles.selectedButton]}
          labelStyle={[styles.buttonLabel, almostQuit === true && styles.selectedButtonLabel]}
        >
          Yes
        </Button>
        <Button
          mode={almostQuit === false ? "contained" : "outlined"}
          onPress={() => {
            setAlmostQuit(false);
            setAlmostQuitPage('');
            setPageError('');
          }}
          style={[styles.optionButton, almostQuit === false && styles.selectedButton]}
          labelStyle={[styles.buttonLabel, almostQuit === false && styles.selectedButtonLabel]}
        >
          No
        </Button>
      </View>

      {almostQuit === true && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Around which page?</Text>
          <TextInput
            mode="outlined"
            value={almostQuitPage}
            onChangeText={(text) => {
              setAlmostQuitPage(text);
              setPageError('');
            }}
            keyboardType="number-pad"
            style={styles.input}
            textColor="white"
            activeOutlineColor={THEME.colors.primary}
            theme={{ colors: { background: THEME.colors.background } }}
          />
          {pageError ? <Text style={styles.errorText}>{pageError}</Text> : null}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor="white" onPress={handleBack} />
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} color={THEME.colors.primary} style={styles.progressBar} />
        </View>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.maxWidthContainer}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>
      </ScrollView>

      {/* Footer Action */}
      <View style={styles.footer}>
        <View style={styles.maxWidthContainer}>
          <Button
            mode="contained"
            onPress={handleNext}
            loading={submitting}
            disabled={
              (step === 1 && reachedEnd === null) ||
              (step === 2 && feeling === null) ||
              (step === 3 && almostQuit === null) ||
              submitting
            }
            style={styles.mainButton}
            buttonColor={THEME.colors.card}
            textColor="#000"
          >
            {step === 3 ? "Mark as Finished" : "Continue"}
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: THEME.colors.text,
    marginBottom: 16,
  },
  errorMessage: {
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: THEME.colors.card,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    alignItems: 'center',
  },
  maxWidthContainer: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingHorizontal: 8,
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
  },
  stepContainer: {
    width: '100%',
    paddingVertical: 20,
  },
  stepLabel: {
    color: THEME.colors.textSecondary,
    marginBottom: 16,
    letterSpacing: 1,
  },
  questionText: {
    color: THEME.colors.textSecondary,
    marginBottom: 8,
  },
  bookTitle: {
    color: THEME.colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'serif' }),
    fontWeight: 'bold',
    marginBottom: 32,
  },
  question: {
    color: THEME.colors.text,
    marginBottom: 24,
    fontWeight: '500',
  },
  spacer: {
    height: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  optionButton: {
    flex: 1,
    borderColor: '#444',
  },
  selectedButton: {
    backgroundColor: THEME.colors.card,
    borderColor: THEME.colors.card,
  },
  buttonLabel: {
    color: 'white',
    fontSize: 16,
    paddingVertical: 4,
  },
  selectedButtonLabel: {
    color: 'black',
  },
  infoText: {
    color: THEME.colors.textSecondary,
    marginTop: 16,
    fontStyle: 'italic',
  },
  verticalOptions: {
    gap: 12,
  },
  choiceCard: {
    backgroundColor: '#2A2D32',
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedChoiceCard: {
    backgroundColor: '#3A3D42',
    borderColor: THEME.colors.primary,
    borderWidth: 1,
  },
  choiceLabel: {
    color: 'white',
    fontSize: 16,
  },
  radioItem: {
    paddingVertical: 8,
  },
  inputContainer: {
    marginTop: 24,
  },
  inputLabel: {
    color: THEME.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.colors.background,
  },
  errorText: {
    color: THEME.colors.error,
    marginTop: 8,
    fontSize: 12,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  mainButton: {
    paddingVertical: 6,
    borderRadius: 8,
  },
});
