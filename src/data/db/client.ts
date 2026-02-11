import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import {
  CREATE_BOOKS_TABLE,
  CREATE_READING_INSTANCES_TABLE,
  CREATE_ABANDONMENT_EVENTS_TABLE,
  CREATE_COMPLETION_EVENTS_TABLE,
  CREATE_CHALLENGES_TABLE,
} from './schema';

// Expo SQLite automatically uses a shim for web (WebSQL or IndexedDB based on version)
// We simply open the database without platform checks
const db = SQLite.openDatabase('reading_coach.db');

export const initDatabase = (): Promise<void> => {

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: any) => {
        console.log('[DB] Transaction started - Initializing database...');

        // Create books table
        tx.executeSql(CREATE_BOOKS_TABLE, [], () => {
          console.log('[DB] ✓ books table created');
        });

        // Create reading_instances table
        tx.executeSql(CREATE_READING_INSTANCES_TABLE, [], () => {
          console.log('[DB] ✓ reading_instances table created');
        });

        // Create abandonment_events table
        tx.executeSql(CREATE_ABANDONMENT_EVENTS_TABLE, [], () => {
          console.log('[DB] ✓ abandonment_events table created');
        });

        // Create completion_events table
        tx.executeSql(CREATE_COMPLETION_EVENTS_TABLE, [], () => {
          console.log('[DB] ✓ completion_events table created');
        });

        // Create challenges table
        tx.executeSql(CREATE_CHALLENGES_TABLE, [], () => {
          console.log('[DB] ✓ challenges table created');
        });
      },
      (error: any) => {
        console.error('[DB] ✗ Database initialization failed:', error);
        reject(error);
      },
      () => {
        console.log('[DB] ✓ Database initialization complete');
        resolve();
      }
    );
  });
};

export default db;
