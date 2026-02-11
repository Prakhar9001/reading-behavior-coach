import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import {
  CREATE_BOOKS_TABLE,
  CREATE_READING_INSTANCES_TABLE,
  CREATE_ABANDONMENT_EVENTS_TABLE,
  CREATE_COMPLETION_EVENTS_TABLE,
  CREATE_CHALLENGES_TABLE,
} from './schema';

const isWeb = Platform.OS === 'web';

const db = !isWeb ? SQLite.openDatabase('reading_coach.db') : {
  transaction: () => { },
  readTransaction: () => { },
} as any;

export const initDatabase = (): Promise<void> => {
  if (isWeb) {
    console.log('[DB] Skipping database initialization on web');
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx: any) => {
        console.log('[DB] Initializing database...');

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
