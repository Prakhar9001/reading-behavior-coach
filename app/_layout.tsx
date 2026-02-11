import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { initDatabase } from '../src/data/db/client';

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    console.log('[App] Starting database initialization...');
    initDatabase()
      .then(() => {
        console.log('[App] Database ready - Rendering UI');
        setDbReady(true);
      })
      .catch((error) => {
        console.error('[App] Database initialization failed:', error);
        // In a real app we might show an error screen, but for now we set ready
        // to true to allow UI to render (or we could keep it false to block)
        setDbReady(true);
      });
  }, []);


  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </PaperProvider>
  );
}
