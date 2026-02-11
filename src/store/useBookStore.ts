import { create } from 'zustand';
import { Book } from '../data/models/Book';
import { BookRepository } from '../data/repositories/BookRepository';
import { ReadingInstanceRepository } from '../data/repositories/ReadingInstanceRepository';
import { AbandonmentRepository } from '../data/repositories/AbandonmentRepository';
import { CompletionRepository } from '../data/repositories/CompletionRepository';

interface BookStore {
  books: Book[];
  loading: boolean;
  loadBooks: () => Promise<void>;
  refreshBooks: () => Promise<void>;
  addBook: (data: {
    title: string;
    author: string | null;
    pageCount: number;
    genre: string;
  }) => Promise<void>;
  abandonBook: (data: {
    bookId: string;
    pageAbandoned: number;
    percentComplete: number;
    primaryReason: string;
    emotionalState: 'relieved' | 'guilty' | 'neutral';
    notes?: string | null;
  }) => Promise<void>;
  completeBook: (data: {
    bookId: string;
    completionFeeling: 'glad' | 'relieved' | 'disappointed' | 'neutral';
    almostQuit: boolean;
    almostQuitPage?: number | null;
  }) => Promise<void>;
}

export const useBookStore = create<BookStore>((set) => ({
  books: [],
  loading: false,

  loadBooks: async () => {
    set({ loading: true });
    try {
      const books = await BookRepository.getAll();
      set({ books, loading: false });
      console.log('[BookStore] Loaded', books.length, 'books');
    } catch (error) {
      console.error('[BookStore] Failed to load books:', error);
      set({ loading: false });
    }
  },

  refreshBooks: async () => {
    try {
      const books = await BookRepository.getAll();
      set({ books });
      console.log('[BookStore] Refreshed', books.length, 'books');
    } catch (error) {
      console.error('[BookStore] Failed to refresh books:', error);
    }
  },

  addBook: async (data) => {
    try {
      await BookRepository.create(data);
      console.log('[BookStore] Book added, reloading list');
      const books = await BookRepository.getAll();
      set({ books });
    } catch (error) {
      console.error('[BookStore] Failed to add book:', error);
      throw error;
    }
  },

  abandonBook: async (data) => {
    try {
      // Validate inputs
      if (!data.bookId || typeof data.bookId !== 'string') {
        console.error('[BookStore] ✗ Invalid bookId for abandonment:', data.bookId);
        throw new Error('Invalid book ID');
      }

      // 1. Get active reading instance
      const instances = await ReadingInstanceRepository.getByBookId(data.bookId);
      const activeInstance = instances.find(i => i.status === 'in_progress');

      if (!activeInstance) {
        console.error('[BookStore] ✗ No active reading instance found for book:', data.bookId);
        throw new Error('No active reading instance found for this book');
      }

      // 2. Create abandonment event
      await AbandonmentRepository.create({
        readingInstanceId: activeInstance.id,
        pageAbandoned: data.pageAbandoned,
        percentComplete: data.percentComplete,
        primaryReason: data.primaryReason,
        emotionalState: data.emotionalState,
        notes: data.notes,
      });

      // 3. Update active instance status
      await ReadingInstanceRepository.updateStatus(activeInstance.id, 'abandoned', data.pageAbandoned);

      console.log('[BookStore] Book abandoned, reloading list');

      // 4. Reload books
      const books = await BookRepository.getAll();
      set({ books });
    } catch (error) {
      console.error('[BookStore] ✗ Failed to abandon book:', error);
      throw error;
    }
  },

  completeBook: async (data) => {
    try {
      // Validate inputs
      if (!data.bookId || typeof data.bookId !== 'string') {
        console.error('[BookStore] ✗ Invalid bookId for completion:', data.bookId);
        throw new Error('Invalid book ID');
      }

      // 1. Get active reading instance
      const instances = await ReadingInstanceRepository.getByBookId(data.bookId);
      const activeInstance = instances.find(i => i.status === 'in_progress');

      if (!activeInstance) {
        console.error('[BookStore] ✗ No active reading instance found for book:', data.bookId);
        throw new Error('No active reading instance found for this book');
      }

      // 2. Create completion event
      await CompletionRepository.create({
        readingInstanceId: activeInstance.id,
        completionFeeling: data.completionFeeling,
        almostQuit: data.almostQuit,
        almostQuitPage: data.almostQuitPage,
      });

      // 3. Update active instance status
      const book = await BookRepository.getById(data.bookId);
      if (!book) {
        console.error('[BookStore] ✗ Book not found during completion:', data.bookId);
        throw new Error('Book not found');
      }
      const finalPage = book.pageCount;

      await ReadingInstanceRepository.updateStatus(activeInstance.id, 'completed', finalPage);

      console.log('[BookStore] Book completed, reloading list');

      // 4. Reload books
      const books = await BookRepository.getAll();
      set({ books });
    } catch (error) {
      console.error('[BookStore] ✗ Failed to complete book:', error);
      throw error;
    }
  },
}));
