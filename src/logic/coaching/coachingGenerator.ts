import { ReadingInstance } from '../../data/models/ReadingInstance';
import { Book } from '../../data/models/Book';
import { CompletionEvent } from '../../data/models/CompletionEvent';
import { CoachingResponse, ConfidenceLevel } from './types';

// Debug logging flag
const DEBUG = true;

const log = (...args: any[]) => {
  if (DEBUG) console.log('[CoachingGenerator]', ...args);
};

/**
 * Calculate confidence level based on sample size
 * - Low: < 5 similar books
 * - Medium: 5-9 similar books
 * - High: 10+ similar books
 */
const calculateConfidence = (sampleSize: number): ConfidenceLevel => {
  if (sampleSize >= 10) return 'high';
  if (sampleSize >= 5) return 'medium';
  return 'low';
};

/**
 * Calculate range for abandonment/completion point
 */
const calculateRange = (percentage: number): string => {
  const lower = Math.floor(percentage / 10) * 10;
  const upper = lower + 10;
  return `${lower}–${upper}%`;
};

/**
 * Find similar books based on genre
 */
const findSimilarBooks = (
  currentBook: Book,
  allBooks: Book[],
  instances: ReadingInstance[]
): Array<{ book: Book; instance: ReadingInstance }> => {
  return instances
    .map(inst => {
      const book = allBooks.find(b => b.id === inst.bookId);
      return book ? { book, instance: inst } : null;
    })
    .filter((item): item is { book: Book; instance: ReadingInstance } =>
      item !== null &&
      item.book.genre === currentBook.genre &&
      item.book.id !== currentBook.id // Exclude current book
    );
};

/**
 * Generate coaching response for "Should I quit?" question
 * 
 * STRICT GUARDS:
 * - Minimum total books: 5
 * - Minimum similar books: 3
 * - quit_now: Similar books ≥ 3, abandonment rate ≥ 70%
 * - push_to_page: Similar books ≥ 3, successful push-throughs ≥ 2, user was "glad"
 */
export const generateCoaching = (
  currentBook: Book,
  currentPage: number,
  allBooks: Book[],
  allInstances: ReadingInstance[],
  completionEvents: CompletionEvent[]
): CoachingResponse => {
  log(`Generating coaching for: ${currentBook.title} at page ${currentPage}`);
  log(`Total books: ${allBooks.length}, Total instances: ${allInstances.length}`);

  // GLOBAL GUARD: Minimum 5 total books
  if (allBooks.length < 5) {
    log('✗ Insufficient total books (< 5)');
    return {
      type: 'insufficient_data',
      message: `You've only logged ${allBooks.length} books so far — not enough to spot a pattern yet. What does your gut say this time?`,
      confidence: 'low',
      sampleSize: allBooks.length,
      reasoning: 'Not enough reading history to provide meaningful guidance.',
    };
  }

  // Find similar books (same genre)
  const similarItems = findSimilarBooks(currentBook, allBooks, allInstances);
  log(`Found ${similarItems.length} similar books (genre: ${currentBook.genre})`);

  // GUARD: Minimum 3 similar books
  if (similarItems.length < 3) {
    log('✗ Insufficient similar books (< 3)');
    return {
      type: 'insufficient_data',
      message: `You've only read ${similarItems.length} ${currentBook.genre} books before. Not quite enough to see a pattern in this genre yet. Trust your instinct on this one.`,
      confidence: 'low',
      sampleSize: similarItems.length,
      reasoning: `Need at least 3 similar books, have ${similarItems.length}.`,
    };
  }

  // Analyze similar books
  const abandoned = similarItems.filter(item => item.instance.status === 'abandoned');
  const completed = similarItems.filter(item => item.instance.status === 'completed');
  const abandonmentRate = (abandoned.length / similarItems.length) * 100;

  log(`Similar books breakdown: ${abandoned.length} abandoned, ${completed.length} completed`);
  log(`Abandonment rate: ${abandonmentRate.toFixed(1)}%`);

  // ========================================
  // QUIT_NOW LOGIC
  // ========================================
  // Guards: Similar books ≥ 3, abandonment rate ≥ 70%
  if (abandonmentRate >= 70) {
    // Calculate typical abandonment range
    let totalPercent = 0;
    let validCount = 0;

    abandoned.forEach(item => {
      if (item.book.pageCount > 0) {
        totalPercent += (item.instance.currentPage / item.book.pageCount) * 100;
        validCount++;
      }
    });

    const avgAbandonmentPoint = validCount > 0 ? totalPercent / validCount : 0;
    const typicalRange = calculateRange(avgAbandonmentPoint);
    const currentProgress = Math.round((currentPage / currentBook.pageCount) * 100);

    log(`✓ QUIT_NOW triggered (abandonment rate: ${abandonmentRate.toFixed(1)}%)`);
    log(`Typical abandonment range: ${typicalRange}, Current progress: ${currentProgress}%`);

    return {
      type: 'quit_now',
      message: `In situations like this, you've stopped reading ${abandoned.length} out of ${similarItems.length} ${currentBook.genre} books. Your history with books like this shows you typically stop around the ${typicalRange} mark. You're currently at ${currentProgress}%.`,
      confidence: calculateConfidence(similarItems.length),
      sampleSize: similarItems.length,
      reasoning: `Based on ${similarItems.length} similar books, ${abandonmentRate.toFixed(0)}% were abandoned.`,
      abandonmentRate: Math.round(abandonmentRate),
      typicalRange,
    };
  }

  // ========================================
  // PUSH_TO_PAGE LOGIC
  // ========================================
  // Guards: Similar books ≥ 3, successful push-throughs ≥ 2, user was "glad"

  // Find books where user almost quit but finished and was glad
  const successfulPushThroughs = completed.filter(item => {
    const completionEvent = completionEvents.find(
      e => e.readingInstanceId === item.instance.id
    );
    return (
      completionEvent &&
      completionEvent.almostQuit &&
      completionEvent.completionFeeling === 'glad' &&
      completionEvent.almostQuitPage !== null
    );
  });

  log(`Successful push-throughs (almost quit but glad): ${successfulPushThroughs.length}`);

  if (successfulPushThroughs.length >= 2) {
    // Calculate average push-through point
    let totalPushPage = 0;
    let validPushCount = 0;

    successfulPushThroughs.forEach(item => {
      const completionEvent = completionEvents.find(
        e => e.readingInstanceId === item.instance.id
      );
      if (completionEvent && completionEvent.almostQuitPage) {
        const percentAtDoubt = (completionEvent.almostQuitPage / item.book.pageCount) * 100;
        totalPushPage += percentAtDoubt;
        validPushCount++;
      }
    });

    if (validPushCount >= 2) {
      const avgPushPercent = totalPushPage / validPushCount;
      const targetPercent = Math.min(avgPushPercent + 15, 100); // Push 15% further
      const targetPage = Math.min(
        Math.round((targetPercent / 100) * currentBook.pageCount),
        currentBook.pageCount
      );

      const currentProgress = Math.round((currentPage / currentBook.pageCount) * 100);
      const pushRange = calculateRange(avgPushPercent);

      log(`✓ PUSH_TO_PAGE triggered (${successfulPushThroughs.length} successful push-throughs)`);
      log(`Average doubt point: ${pushRange}, Target page: ${targetPage}`);

      return {
        type: 'push_to_page',
        message: `When you've been at this point before with ${currentBook.genre} books, you pushed through ${successfulPushThroughs.length} times and were glad you did. In your history, doubt usually hit around the ${pushRange} mark, but finishing felt worth it. You're at ${currentProgress}% now — maybe try page ${targetPage}?`,
        confidence: calculateConfidence(similarItems.length),
        sampleSize: similarItems.length,
        reasoning: `Based on ${successfulPushThroughs.length} similar books where pushing through led to satisfaction.`,
        targetPage,
      };
    }
  }

  // ========================================
  // INSUFFICIENT_DATA (Default)
  // ========================================
  // If we have similar books but no clear pattern
  log('✗ No clear pattern found, returning insufficient_data');

  return {
    type: 'insufficient_data',
    message: `You've read ${similarItems.length} ${currentBook.genre} books before, but the pattern isn't clear yet. ${abandoned.length} were stopped, ${completed.length} were finished. Your history doesn't lean strongly either way on this one.`,
    confidence: calculateConfidence(similarItems.length),
    sampleSize: similarItems.length,
    reasoning: `Abandonment rate (${abandonmentRate.toFixed(0)}%) doesn't meet threshold for clear recommendation.`,
  };
};
