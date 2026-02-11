import { Platform } from 'react-native';
import { SQLTransaction } from 'expo-sqlite';
import db from '../db/client';
import { AbandonmentEvent } from '../models/AbandonmentEvent';

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class AbandonmentRepository {
  static async create(data: {
    readingInstanceId: string;
    pageAbandoned: number;
    percentComplete: number;
    primaryReason: string;
    emotionalState: 'relieved' | 'guilty' | 'neutral';
    notes?: string | null;
  }): Promise<AbandonmentEvent> {
    const id = generateUUID();
    const abandonedAt = Date.now();

    if (Platform.OS === 'web') {
      console.log('[AbandonmentRepository] Web: Simulating create');
      return Promise.resolve({
        id,
        readingInstanceId: data.readingInstanceId,
        abandonedAt,
        pageAbandoned: data.pageAbandoned,
        percentComplete: data.percentComplete,
        primaryReason: data.primaryReason,
        emotionalState: data.emotionalState,
        notes: data.notes || null,
      });
    }

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: SQLTransaction) => {
          tx.executeSql(
            `INSERT INTO abandonment_events 
             (id, reading_instance_id, abandoned_at, page_abandoned, percent_complete, primary_reason, emotional_state, notes) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              id,
              data.readingInstanceId,
              abandonedAt,
              data.pageAbandoned,
              data.percentComplete,
              data.primaryReason,
              data.emotionalState,
              data.notes || null
            ],
            () => {
              const event: AbandonmentEvent = {
                id,
                readingInstanceId: data.readingInstanceId,
                abandonedAt,
                pageAbandoned: data.pageAbandoned,
                percentComplete: data.percentComplete,
                primaryReason: data.primaryReason,
                emotionalState: data.emotionalState,
                notes: data.notes || null,
              };
              console.log('[AbandonmentRepo] Created abandonment event for instance:', data.readingInstanceId);
              resolve(event);
            },
            (_: any, error: any) => {
              console.error('[AbandonmentRepo] Create failed:', error);
              reject(error);
              return false;
            }
          );
        },
        (error: any) => {
          console.error('[AbandonmentRepo] Transaction failed:', error);
          reject(error);
        }
      );
    });
  }

  static async getAll(): Promise<AbandonmentEvent[]> {
    if (Platform.OS === 'web') {
      console.log('[AbandonmentRepository] Web: Simulating getAll');
      return Promise.resolve([]);
    }

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: SQLTransaction) => {
          tx.executeSql(
            'SELECT * FROM abandonment_events ORDER BY abandoned_at DESC',
            [],
            (_: any, { rows }: any) => {
              const events: AbandonmentEvent[] = [];
              for (let i = 0; i < rows.length; i++) {
                const row = rows.item(i);
                // Defensive check for corrupted data
                if (!row || !row.id || !row.reading_instance_id) {
                  console.warn('[AbandonmentRepository] ⚠ Skipping corrupted event row:', row);
                  continue;
                }
                events.push({
                  id: row.id,
                  readingInstanceId: row.reading_instance_id,
                  abandonedAt: row.abandoned_at,
                  pageAbandoned: row.page_abandoned,
                  percentComplete: row.percent_complete,
                  primaryReason: row.primary_reason,
                  emotionalState: row.emotional_state,
                  notes: row.notes,
                });
              }
              console.log('[AbandonmentRepository] Found', events.length, 'abandonment events');
              resolve(events);
            },
            (_: any, error: any) => {
              console.error('[AbandonmentRepository] GetAll failed:', error);
              reject(error);
              return false;
            }
          );
        },
        (error: any) => {
          console.error('[AbandonmentRepository] Transaction failed:', error);
          reject(error);
        }
      );
    });
  }
}
