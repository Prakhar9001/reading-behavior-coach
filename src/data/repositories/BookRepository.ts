import { Platform } from 'react-native';
import { SQLTransaction } from 'expo-sqlite';
import db from '../db/client';
import { Book } from '../models/Book';

// Generate UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export class BookRepository {
  static async create(data: {
    title: string;
    author: string | null;
    pageCount: number;
    genre: string;
  }): Promise<Book> {
    const id = generateUUID();
    const createdAt = Date.now();

    // For ReadingInstance
    const instanceId = generateUUID();
    const startedAt = createdAt;

    const book: Book = {
      id,
      title: data.title,
      author: data.author,
      pageCount: data.pageCount,
      genre: data.genre,
      createdAt,
    };

    // Web simulation removed to test actual persistence

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: SQLTransaction) => {
          // 1. Create Book
          console.log('[BookRepository] Inserting book:', id, data.title);
          tx.executeSql(
            'INSERT INTO books (id, title, author, page_count, genre, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [id, data.title, data.author, data.pageCount, data.genre, createdAt],
            () => {
              // 2. Create ReadingInstance (auto-start book)
              tx.executeSql(
                'INSERT INTO reading_instances (id, book_id, started_at, status, why_started, current_page) VALUES (?, ?, ?, ?, ?, ?)',
                [instanceId, id, startedAt, 'in_progress', null, 0],
                () => {
                  console.log('[BookRepository] Created book + instance:', book.title);
                  console.log('[BookRepository] Last inserted ID:', id);
                  resolve(book);
                },
                (_, error: unknown) => {
                  console.error('[BookRepository] Failed to create instance:', error);
                  reject(error);
                  return false;
                }
              );
            },
            (_, error: unknown) => {
              console.error('[BookRepository] Create failed:', error);
              reject(error);
              return false;
            }
          );
        },
        (error: unknown) => {
          console.error('[BookRepository] Transaction failed:', error);
          reject(error);
        }
      );
    });
  }

  static async getById(id: string): Promise<Book | null> {
    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: SQLTransaction) => {
          tx.executeSql(
            'SELECT * FROM books WHERE id = ?',
            [id],
            (_: any, { rows }: any) => {
              if (rows.length === 0) {
                console.log('[BookRepository] Book not found:', id);
                resolve(null);
              } else {
                const row = rows.item(0);
                const book: Book = {
                  id: row.id,
                  title: row.title,
                  author: row.author,
                  pageCount: row.page_count,
                  genre: row.genre,
                  createdAt: row.created_at,
                };
                console.log('[BookRepository] Found book:', book.title);
                resolve(book);
              }
            },
            (_, error: unknown) => {
              console.error('[BookRepository] GetById failed:', error);
              reject(error);
              return false;
            }
          );
        },
        (error: unknown) => {
          console.error('[BookRepository] Transaction failed:', error);
          reject(error);
        }
      );
    });
  }

  static async getAll(): Promise<Book[]> {
    // Web simulation removed to test actual persistence

    return new Promise((resolve, reject) => {
      db.transaction(
        (tx: SQLTransaction) => {
          tx.executeSql(
            'SELECT * FROM books ORDER BY created_at DESC',
            [],
            (_: any, { rows }: any) => {
              console.log('[BookRepository] getAll rows returned:', rows.length);
              console.log('[BookRepository] getAll raw results:', rows);
              const books: Book[] = [];
              for (let i = 0; i < rows.length; i++) {
                const row = rows.item(i);
                // Defensive check for corrupted data
                if (!row || !row.id || !row.title || row.page_count == null) {
                  console.warn('[BookRepository] ⚠ Skipping corrupted book row:', row);
                  continue;
                }
                books.push({
                  id: row.id,
                  title: row.title,
                  author: row.author,
                  pageCount: row.page_count,
                  genre: row.genre,
                  createdAt: row.created_at,
                });
              }
              console.log('[BookRepository] Found', books.length, 'books');
              resolve(books);
            },
            (_, error: unknown) => {
              console.error('[BookRepository] GetAll failed:', error);
              reject(error);
              return false;
            }
          );
        },
        (error: unknown) => {
          console.error('[BookRepository] Transaction failed:', error);
          reject(error);
        }
      );
    });
  }
}
