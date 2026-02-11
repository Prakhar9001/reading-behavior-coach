import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import {
  CREATE_BOOKS_TABLE,
  CREATE_READING_INSTANCES_TABLE,
  CREATE_ABANDONMENT_EVENTS_TABLE,
  CREATE_COMPLETION_EVENTS_TABLE,
  CREATE_CHALLENGES_TABLE,
} from './schema';

let db: any;

if (Platform.OS === 'web') {
  // Mock DB for web to prevent crash (window.openDatabase is not available)
  db = {
    transaction: (
      callback: (tx: any) => void,
      errorCallback?: (error: any) => void,
      successCallback?: () => void
    ) => {
      const mockTx = {
        executeSql: (
          sql: string,
          args: any[] = [],
          success?: (tx: any, result: any) => void,
          error?: (tx: any, err: any) => void
        ) => {
          // Verify arguments and call success with empty result
          if (success) {
            success(mockTx, {
              rows: { _array: [], length: 0, item: (idx: number) => null },
              rowsAffected: 0,
              insertId: 0
            });
          }
        }
      };

      try {
        callback(mockTx);
        if (successCallback) successCallback();
      } catch (error) {
        if (errorCallback) errorCallback(error);
      }
    }
  };
} else {
  // Native: Use real SQLite
  db = SQLite.openDatabase('reading_coach.db');
}

export const initDatabase = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction(
        (tx: any) => {
          // Create tables sequentially
          tx.executeSql(CREATE_BOOKS_TABLE);
          tx.executeSql(CREATE_READING_INSTANCES_TABLE);
          tx.executeSql(CREATE_ABANDONMENT_EVENTS_TABLE);
          tx.executeSql(CREATE_COMPLETION_EVENTS_TABLE);
          tx.executeSql(CREATE_CHALLENGES_TABLE);
        },
        (error: any) => {
          console.error('[DB] Init error:', error);
          reject(error);
        },
        () => {
          console.log('[DB] Ready');
          resolve();
        }
      );
    } catch (e) {
      console.error('[DB] Crash during init:', e);
      reject(e);
    }
  });
};

export default db;
