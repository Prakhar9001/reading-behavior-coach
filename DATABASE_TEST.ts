/**
 * MANUAL TEST SNIPPET FOR DATABASE
 * 
 * Add this code to app/(tabs)/index.tsx temporarily to test the database.
 * This will insert a book, read it back, and log the results.
 */

import { useEffect } from 'react';
import { BookRepository } from '@/data/repositories/BookRepository';

// Add this inside the CurrentlyReadingScreen component:

useEffect(() => {
  // Test database operations
  const testDatabase = async () => {
    try {
      console.log('=== DATABASE TEST START ===');

      // 1. Insert a book
      console.log('\n1. Creating a book...');
      const newBook = await BookRepository.create({
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        pageCount: 180,
        genre: 'Literary Fiction',
      });
      console.log('✓ Book created:', newBook);

      // 2. Read it back by ID
      console.log('\n2. Reading book by ID...');
      const foundBook = await BookRepository.getById(newBook.id);
      console.log('✓ Book found:', foundBook);

      // 3. Get all books
      console.log('\n3. Getting all books...');
      const allBooks = await BookRepository.getAll();
      console.log('✓ Total books:', allBooks.length);
      allBooks.forEach((book, index) => {
        console.log(`  ${index + 1}. ${book.title} by ${book.author}`);
      });

      console.log('\n=== DATABASE TEST COMPLETE ===');
    } catch (error) {
      console.error('✗ Database test failed:', error);
    }
  };

  // Run test after a short delay to ensure DB is initialized
  const timer = setTimeout(testDatabase, 1000);
  return () => clearTimeout(timer);
}, []);

/**
 * EXPECTED CONSOLE OUTPUT:
 * 
 * [DB] Initializing database...
 * [DB] ✓ books table created
 * [DB] ✓ reading_instances table created
 * [DB] ✓ abandonment_events table created
 * [DB] ✓ completion_events table created
 * [DB] ✓ challenges table created
 * [DB] ✓ Database initialization complete
 * [App] Database ready
 * === DATABASE TEST START ===
 * 
 * 1. Creating a book...
 * [BookRepository] Created book: The Great Gatsby
 * ✓ Book created: {
 *   id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
 *   title: 'The Great Gatsby',
 *   author: 'F. Scott Fitzgerald',
 *   pageCount: 180,
 *   genre: 'Literary Fiction',
 *   createdAt: 1707516082000
 * }
 * 
 * 2. Reading book by ID...
 * [BookRepository] Found book: The Great Gatsby
 * ✓ Book found: {
 *   id: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
 *   title: 'The Great Gatsby',
 *   author: 'F. Scott Fitzgerald',
 *   pageCount: 180,
 *   genre: 'Literary Fiction',
 *   createdAt: 1707516082000
 * }
 * 
 * 3. Getting all books...
 * [BookRepository] Found 1 books
 * ✓ Total books: 1
 *   1. The Great Gatsby by F. Scott Fitzgerald
 * 
 * === DATABASE TEST COMPLETE ===
 */

/**
 * TO TEST DATA PERSISTENCE:
 * 
 * 1. Run the app with the test code above
 * 2. Check console - you should see 1 book
 * 3. Restart the app (close and reopen)
 * 4. Check console again - you should see the same book
 * 5. If you see the book after restart, persistence works! ✓
 */
