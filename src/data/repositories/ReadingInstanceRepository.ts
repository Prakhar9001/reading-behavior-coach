import { Platform } from 'react-native';
import db from '../db/client';
import { ReadingInstance } from '../models/ReadingInstance';

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class ReadingInstanceRepository {
  static async create(data: {
    bookId: string;
    whyStarted?: string | null;
  }): Promise<ReadingInstance> {
    const id = generateUUID();
    const startedAt = Date.now();
    const status = 'in_progress';
    const currentPage = 0;

    if (Platform.OS === 'web') {
      console.log('[ReadingInstanceRepo] Web: Simulating create');
      return {
        id,
        bookId: data.bookId,
        startedAt,
        endedAt: null,
        status,
        whyStarted: data.whyStarted || null,
        currentPage
      };
    }

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'INSERT INTO reading_instances (id, book_id, started_at, status, why_started, current_page) VALUES (?, ?, ?, ?, ?, ?)',
            [id, data.bookId, startedAt, status, data.whyStarted || null, currentPage],
            () => {
              const instance: ReadingInstance = {
                id,
                bookId: data.bookId,
                startedAt,
                endedAt: null,
                status,
                whyStarted: data.whyStarted || null,
                currentPage,
              };
              console.log('[ReadingInstanceRepo] Created instance for book:', data.bookId);
              resolve(instance);
            },
            (_: any, error: any) => {
              console.error('[ReadingInstanceRepo] Create failed:', error);
              reject(error);
              return false;
            }
          );
        },
        (error: any) => {
          console.error('[ReadingInstanceRepo] Transaction failed:', error);
          reject(error);
        }
      );
    });
  }

  static async getByBookId(bookId: string): Promise<ReadingInstance[]> {
    if (Platform.OS === 'web') {
      return Promise.resolve([]);
    }

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'SELECT * FROM reading_instances WHERE book_id = ? ORDER BY started_at DESC',
            [bookId],
            (_: any, { rows }: { rows: any }) => {
              const instances: ReadingInstance[] = [];
              for (let i = 0; i < rows.length; i++) {
                const row = rows.item(i);
                instances.push({
                  id: row.id,
                  bookId: row.book_id,
                  startedAt: row.started_at,
                  endedAt: row.ended_at,
                  status: row.status,
                  whyStarted: row.why_started,
                  currentPage: row.current_page,
                });
              }
              resolve(instances);
            },
            (_: any, error: any) => {
              console.error('[ReadingInstanceRepo] GetByBookId failed:', error);
              reject(error);
              return false;
            }
          );
        }
      );
    });
  }

  static async getAll(): Promise<ReadingInstance[]> {
    if (Platform.OS === 'web') {
      return Promise.resolve([]);
    }

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'SELECT * FROM reading_instances ORDER BY started_at DESC',
            [],
            (_: any, { rows }: { rows: any }) => {
              const instances: ReadingInstance[] = [];
              for (let i = 0; i < rows.length; i++) {
                const row = rows.item(i);
                instances.push({
                  id: row.id,
                  bookId: row.book_id,
                  startedAt: row.started_at,
                  endedAt: row.ended_at,
                  status: row.status,
                  whyStarted: row.why_started,
                  currentPage: row.current_page,
                });
              }
              resolve(instances);
            },
            (_: any, error: any) => {
              console.error('[ReadingInstanceRepo] GetAll failed:', error);
              reject(error);
              return false;
            }
          );
        }
      );
    });
  }

  static async updateStatus(
    id: string,
    status: 'completed' | 'abandoned',
    currentPage: number
  ): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('[ReadingInstanceRepo] Web: Simulating updateStatus:', status);
      return Promise.resolve();
    }

    const endedAt = Date.now();
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: any) => {
          tx.executeSql(
            'UPDATE reading_instances SET status = ?, ended_at = ?, current_page = ? WHERE id = ?',
            [status, endedAt, currentPage, id],
            () => {
              console.log('[ReadingInstanceRepo] Updated status:', status, id);
              resolve();
            },
            (_: any, error: any) => {
              console.error('[ReadingInstanceRepo] Update status failed:', error);
              reject(error);
              return false;
            }
          );
        }
      );
    });
  }
}
