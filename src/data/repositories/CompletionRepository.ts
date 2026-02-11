import { Platform } from 'react-native';
import { SQLTransaction } from 'expo-sqlite';
import db from '../db/client';
import { CompletionEvent } from '../models/CompletionEvent';

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class CompletionRepository {
  static async create(data: {
    readingInstanceId: string;
    completionFeeling: 'glad' | 'relieved' | 'disappointed' | 'neutral';
    almostQuit: boolean;
    almostQuitPage?: number | null;
  }): Promise<CompletionEvent> {
    const id = generateUUID();
    const completedAt = Date.now();
    const almostQuitPage = data.almostQuitPage || null;

    if (Platform.OS === 'web') {
      console.log('[CompletionRepository] Web: Simulating create');
      return {
        id,
        readingInstanceId: data.readingInstanceId,
        completedAt,
        completionFeeling: data.completionFeeling,
        almostQuit: data.almostQuit,
        almostQuitPage,
      };
    }

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: SQLTransaction) => {
          tx.executeSql(
            'INSERT INTO completion_events (id, reading_instance_id, completed_at, completion_feeling, almost_quit, almost_quit_page) VALUES (?, ?, ?, ?, ?, ?)',
            [
              id,
              data.readingInstanceId,
              completedAt,
              data.completionFeeling,
              data.almostQuit ? 1 : 0,
              almostQuitPage,
            ],
            () => {
              const event: CompletionEvent = {
                id,
                readingInstanceId: data.readingInstanceId,
                completedAt,
                completionFeeling: data.completionFeeling,
                almostQuit: data.almostQuit,
                almostQuitPage,
              };
              console.log('[CompletionRepository] Created completion event for instance:', data.readingInstanceId);
              resolve(event);
            },
            (_: any, error: any) => {
              console.error('[CompletionRepository] Create failed:', error);
              reject(error);
              return false;
            }
          );
        },
        (error: any) => {
          console.error('[CompletionRepository] Transaction failed:', error);
          reject(error);
        }
      );
    });
  }

  static async getAll(): Promise<CompletionEvent[]> {
    if (Platform.OS === 'web') {
      console.log('[CompletionRepository] Web: Simulating getAll');
      return Promise.resolve([]);
    }

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: SQLTransaction) => {
          tx.executeSql(
            'SELECT * FROM completion_events ORDER BY completed_at DESC',
            [],
            (_: any, { rows }: any) => {
              const events: CompletionEvent[] = [];
              for (let i = 0; i < rows.length; i++) {
                const row = rows.item(i);
                if (!row || !row.id || !row.reading_instance_id) {
                  console.warn('[CompletionRepository] ⚠ Skipping corrupted event row:', row);
                  continue;
                }
                events.push({
                  id: row.id,
                  readingInstanceId: row.reading_instance_id,
                  completedAt: row.completed_at,
                  completionFeeling: row.completion_feeling,
                  almostQuit: row.almost_quit === 1,
                  almostQuitPage: row.almost_quit_page,
                });
              }
              console.log('[CompletionRepository] Found', events.length, 'completion events');
              resolve(events);
            },
            (_: any, error: any) => {
              console.error('[CompletionRepository] GetAll failed:', error);
              reject(error);
              return false;
            }
          );
        },
        (error: any) => {
          console.error('[CompletionRepository] Transaction failed:', error);
          reject(error);
        }
      );
    });
  }
}
