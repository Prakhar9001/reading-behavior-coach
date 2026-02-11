import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Platform } from 'react-native';
import { Text, Card, FAB, Button } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { useBookStore } from '../../src/store/useBookStore';
import { Book } from '../../src/data/models/Book';

const THEME = {
  colors: {
    background: '#1A1D21',
    card: '#F5F2EA',
    text: '#FFFFFF',
    textDark: '#1A1D21',
    textSecondary: '#666666',
    primary: '#8DA399', // Muted moss/teal
    error: '#CF6679',
    stop: '#B00020',
  }
};

export default function CurrentlyReadingScreen() {
  const router = useRouter();
  const { books, loading, loadBooks } = useBookStore();

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  const renderBook = ({ item }: { item: Book }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          {item.title}
        </Text>
        {item.author && (
          <Text variant="bodyMedium" style={styles.author}>
            {item.author}
          </Text>
        )}
        <View style={styles.metadata}>
          <Text variant="bodySmall" style={styles.metadataText}>
            {item.pageCount} pages
          </Text>
          <Text variant="bodySmall" style={styles.metadataText}>
            •
          </Text>
          <Text variant="bodySmall" style={styles.metadataText}>
            {item.genre}
          </Text>
        </View>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <View style={styles.actionGroup}>
          <Button
            onPress={() => router.push({ pathname: '/book/abandon', params: { id: item.id } })}
            textColor={THEME.colors.stop}
            mode="text"
            compact
            style={styles.actionButton}
            labelStyle={styles.actionLabel}
          >
            Stop Reading
          </Button>
          <Button
            onPress={() => router.push({ pathname: '/book/complete', params: { id: item.id } })}
            textColor={THEME.colors.textDark}
            mode="contained"
            buttonColor="rgba(0,0,0,0.05)"
            compact
            style={styles.actionButton}
            labelStyle={styles.actionLabel}
            elevation={0}
          >
            Finish
          </Button>
        </View>
        <Button
          onPress={() => { }} // "Should I quit?" logic not implemented yet
          textColor="#999"
          mode="text"
          compact
          style={styles.quitButton}
          labelStyle={styles.quitLabel}
        >
          Should I quit?
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text variant="headlineMedium" style={styles.emptyTitle}>
          No books yet
        </Text>
        <Text variant="bodyLarge" style={styles.emptySubtitle}>
          Add your first book to get started.
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text variant="headlineMedium" style={styles.headerTitle}>Currently Reading</Text>
      <Text variant="bodyMedium" style={styles.headerSubtitle}>
        {books.length} {books.length === 1 ? 'book' : 'books'} in progress
      </Text>
    </View>
  );

  if (loading && books.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        contentContainerStyle={books.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={books.length > 0 ? renderHeader : undefined}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/book/add')}
        label="Add Book"
        color="black"
        theme={{ colors: { accent: THEME.colors.card } }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  },
  emptyList: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  headerTitle: {
    color: THEME.colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'serif' }),
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#888',
    marginTop: 4,
  },
  card: {
    marginBottom: 16,
    backgroundColor: THEME.colors.card,
    borderRadius: 12,
  },
  title: {
    marginBottom: 4,
    color: THEME.colors.textDark,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'serif' }),
    fontWeight: 'bold',
  },
  author: {
    color: THEME.colors.textSecondary,
    marginBottom: 8,
  },
  metadata: {
    flexDirection: 'row',
    gap: 8,
  },
  metadataText: {
    color: '#999',
    fontSize: 12,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    margin: 0,
    marginLeft: 0,
    marginRight: 0,
  },
  actionLabel: {
    fontWeight: '600',
  },
  quitButton: {
    margin: 0,
  },
  quitLabel: {
    fontSize: 12,
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    color: THEME.colors.text,
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'serif' }),
    fontWeight: 'bold',
  },
  emptySubtitle: {
    color: '#888',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: THEME.colors.card,
  },
});
